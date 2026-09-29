import {useState} from 'react';
import {CARDS, type Faction, FACTIONS, type OmenId, OMENS} from '../../engine';
import {CardArt} from '../../cards/art/CardArt';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {defaultArt} from '../../cards/styles';
import {rewardLabel} from '../../economy/constants';
import {deckIssues} from '../../economy/decks';
import {useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import {toast} from '../../ui/toast';
import {useBattle} from '../battle/store';
import {type Difficulty, DIFFS, emptyStage, stageReward} from './model';
import {registerRuntime, useAdventures} from './store';
import {type Story, storyAdventure, type StoryChapter, useStories, voteKey} from './stories';
import u from '../../ui/ui.module.css';
import s from './adventure.module.css';

/** Racconti a bivi: i moderatori scrivono, la community vota il seguito. */
export function CommunityStories() {
    const api = useStories();
    const [edit, setEdit] = useState<Story | null>(null);
    return (
        <div>
            <div className={s.storyInfo}>
                <p>I moderatori scrivono il racconto un capitolo alla volta. Alla fine di ogni capitolo la community
                    vota come prosegue: l'opzione più votata diventa il capitolo successivo. Ogni capitolo è anche uno
                    scontro da giocare.</p>
                <span
                    className={api.online ? s.online : s.offline}>{api.online ? 'Voti condivisi con tutti i giocatori' : 'Anteprima locale: i voti restano su questo dispositivo'}</span>
                {api.isMod && <button className={`${u.btn} ${u.sm} ${u.primary}`} onClick={() => setEdit({
                    id: 'r' + Date.now().toString(36),
                    title: 'Nuovo racconto',
                    hero: '',
                    intro: '',
                    chapters: [newChapter()],
                    updatedAt: Date.now()
                })}>Nuovo racconto</button>}
            </div>
            {api.error && <p className={s.err}>{api.error}</p>}
            {api.ready && !api.stories.length && <p className={u.muted}>Nessun racconto per
                ora. {api.isMod ? 'Crea il primo con "Nuovo racconto".' : 'I moderatori lo pubblicheranno presto.'}</p>}
            {api.stories.map(st => <StoryView key={st.id} st={st} api={api} onEdit={() => setEdit(st)}/>)}
            {edit && <StoryEditor initial={edit} onClose={() => setEdit(null)} onSave={async x => {
                await api.save({...x, updatedAt: Date.now()});
                toast('Racconto salvato');
                setEdit(null);
            }}/>}
        </div>
    );
}

const newChapter = (): StoryChapter => ({
    id: 'c' + Date.now().toString(36),
    title: 'Nuovo capitolo',
    text: '',
    stage: emptyStage(),
    question: '',
    options: [{id: 'a', label: '', desc: ''}, {id: 'b', label: '', desc: ''}],
    status: 'open'
});

function StoryView({st, api, onEdit}: { st: Story; api: ReturnType<typeof useStories>; onEdit: () => void }) {
    const p = useProfile();
    const adv = storyAdventure(st);
    const prog = useAdventures(x => x.progress[adv.id]) ?? [];
    const play = (i: number) => {
        const d = p.decks.find(x => x.id === p.activeDeck);
        if (!d || deckIssues(d, p.owned).length) {
            toast('Scegli un mazzo completo');
            return;
        }
        registerRuntime(adv);
        useBattle.getState().start('adv', i, adv.id);
    };
    const close = async (c: StoryChapter, open: boolean) => {
        const t = api.tallies[voteKey(st.id, c.id)] ?? {},
            winner = open ? undefined : [...(c.options ?? [])].sort((a, b) => (t[b.id] ?? 0) - (t[a.id] ?? 0))[0]?.id;
        await api.save({
            ...st,
            updatedAt: Date.now(),
            chapters: st.chapters.map(x => (x.id === c.id ? {
                ...x,
                status: open ? 'open' : 'closed',
                winner,
                closedAt: open ? undefined : Date.now()
            } : x))
        });
    };
    return (
        <article className={s.chapter}>
            <header className={s.chHead}>
                <div><h2>{st.title}</h2>{st.hero && <p><b>Protagonista:</b> {st.hero}</p>}<p>{st.intro}</p></div>
                {api.isMod && <div className={s.chActions}>
                    <button className={`${u.btn} ${u.sm}`} onClick={onEdit}>Modifica</button>
                </div>}
            </header>
            {st.chapters.map((c, i) => {
                const k = voteKey(st.id, c.id), t = api.tallies[k] ?? {},
                    tot = Object.values(t).reduce((a, b) => a + b, 0), my = api.mine[k];
                const unlocked = i === 0 || prog.includes(i - 1), done = prog.includes(i);
                return (
                    <section key={c.id} className={s.storyCh}>
                        <div className={s.storyTop}>
                            <span className={s.num}><CardArt id={c.stage.art} style={defaultArt(c.stage.art)}
                                                             arch={false}/><i>{i + 1}</i></span>
                            <div><h3>{c.title}</h3><p className={s.storyText}>{c.text}</p>
                                <p className={u.muted}><strong>{c.stage.foe}</strong>,
                                    mazzo {c.stage.facs.map(f => FACTIONS[f].name).join(' e ')} · {DIFFS[c.stage.diff].name} · {done ? 'Completato' : `Ricompensa: ${rewardLabel(stageReward(adv, adv.stages[i]))}`}
                                </p></div>
                            <div>{unlocked ? <button className={`${u.btn} ${done ? '' : u.primary}`}
                                                     onClick={() => play(i)}>{done ? 'Rigioca' : 'Affronta'}</button> :
                                <span className={u.muted}>Prima il capitolo {i}</span>}</div>
                        </div>
                        {c.question && c.options && c.options.length >= 2 && (
                            <div className={s.vote}>
                                <h4>{c.question}</h4>
                                {c.options.map(o => {
                                    const n = t[o.id] ?? 0, pc = tot ? Math.round((n / tot) * 100) : 0,
                                        win = c.status === 'closed' && c.winner === o.id;
                                    return (
                                        <button key={o.id}
                                                className={`${s.opt} ${my === o.id ? s.myVote : ''} ${win ? s.winner : ''}`}
                                                disabled={c.status === 'closed'}
                                                onClick={() => void api.vote(st.id, c.id, o.id)} data-sfx="claim">
                                            <i style={{width: `${pc}%`}}/>
                                            <span><b>{o.label}{win ? ' · scelta dalla community' : ''}</b><small>{o.desc}{o.event ? ` Se vince: ${o.event.title}.` : ''}</small></span>
                                            <em>{pc}% · {n} {n === 1 ? 'voto' : 'voti'}</em>
                                        </button>);
                                })}
                                <div className={s.voteFoot}>
                                    <span>{c.status === 'closed' ? (i === st.chapters.length - 1 ? 'Votazione chiusa: il prossimo capitolo è in scrittura.' : 'Votazione chiusa.') : my ? 'Hai votato: puoi cambiare scelta finché la votazione è aperta.' : 'Vota per decidere il seguito.'}</span>
                                    {api.isMod && <button className={`${u.btn} ${u.sm}`}
                                                          onClick={() => void close(c, c.status === 'closed')}>{c.status === 'closed' ? 'Riapri votazione' : 'Chiudi e proclama la scelta'}</button>}
                                </div>
                            </div>)}
                    </section>);
            })}
        </article>
    );
}

function StoryEditor({initial, onClose, onSave}: { initial: Story; onClose: () => void; onSave: (s: Story) => void }) {
    const [st, setSt] = useState<Story>(() => JSON.parse(JSON.stringify(initial)));
    const setCh = (i: number, patch: Partial<StoryChapter>) => setSt(x => ({
        ...x,
        chapters: x.chapters.map((c, j) => (j === i ? {...c, ...patch} : c))
    }));
    const setStage = (i: number, patch: Partial<StoryChapter['stage']>) => setCh(i, {stage: {...st.chapters[i].stage, ...patch}});
    return (
        <Modal open onClose={onClose}>
            <div className={s.editor}>
                <h2 className={u.title} style={{fontSize: 34}}>Racconto della community</h2>
                <label className={s.field}><span>Titolo</span><input value={st.title} maxLength={60}
                                                                     onChange={e => setSt({
                                                                         ...st,
                                                                         title: e.target.value
                                                                     })}/></label>
                <label className={s.field}><span>Protagonista</span><input value={st.hero} maxLength={60}
                                                                           onChange={e => setSt({
                                                                               ...st,
                                                                               hero: e.target.value
                                                                           })}
                                                                           placeholder="Chi è l'esploratore?"/></label>
                <label className={s.field}><span>Introduzione</span><textarea rows={3} maxLength={500} value={st.intro}
                                                                              onChange={e => setSt({
                                                                                  ...st,
                                                                                  intro: e.target.value
                                                                              })}/></label>
                {st.chapters.map((c, i) => (
                    <fieldset key={c.id} className={s.stage}>
                        <legend>Capitolo {i + 1}</legend>
                        <label className={s.field}><span>Titolo</span><input value={c.title} maxLength={60}
                                                                             onChange={e => setCh(i, {title: e.target.value})}/></label>
                        <label className={s.field}><span>Racconto</span><textarea rows={4} maxLength={900}
                                                                                  value={c.text}
                                                                                  onChange={e => setCh(i, {text: e.target.value})}/></label>
                        <div className={s.grid2}>
                            <label className={s.field}><span>Avversario</span><input value={c.stage.foe} maxLength={40}
                                                                                     onChange={e => setStage(i, {foe: e.target.value})}/></label>
                            <label className={s.field}><span>Ritratto (carta)</span><select value={c.stage.art}
                                                                                            onChange={e => setStage(i, {art: e.target.value})}>{CARDS.map(x =>
                                <option key={x.id} value={x.id}>{x.n}</option>)}</select></label>
                            <label className={s.field}><span>Difficoltà</span><select value={c.stage.diff}
                                                                                      onChange={e => setStage(i, {diff: Number(e.target.value) as Difficulty})}>{([1, 2, 3, 4] as Difficulty[]).map(d =>
                                <option key={d} value={d}>{DIFFS[d].name}</option>)}</select></label>
                            <label className={s.field}><span>Punti vita dei Sigilli avversari</span><input type="number"
                                                                                                           min={6}
                                                                                                           max={16}
                                                                                                           value={c.stage.seal}
                                                                                                           onChange={e => setStage(i, {seal: Math.min(16, Math.max(6, Number(e.target.value) || 10))})}/></label>
                        </div>
                        <div className={s.facRow}>
                            <span>Fazioni avversarie</span>{(Object.keys(FACTIONS) as Faction[]).map(f => <button
                            key={f} className={u.chip} aria-pressed={c.stage.facs.includes(f)} onClick={() => {
                            const has = c.stage.facs.includes(f);
                            if (has && c.stage.facs.length === 1) return;
                            setStage(i, {facs: has ? c.stage.facs.filter(x => x !== f) : c.stage.facs.length >= 2 ? [c.stage.facs[1], f] : [...c.stage.facs, f]});
                        }}><Glyph>{FACTION_GLYPH[f]}</Glyph>{FACTIONS[f].name}</button>)}</div>
                        <label className={s.field}><span>Domanda per la community (lascia vuoto se il capitolo non ha una scelta)</span><input
                            value={c.question ?? ''} maxLength={140}
                            onChange={e => setCh(i, {question: e.target.value})}/></label>
                        {(c.options ?? []).map((o, j) => (
                            <div key={o.id} className={s.grid2}>
                                <label className={s.field}><span>Opzione {j + 1}</span><input value={o.label}
                                                                                              maxLength={50}
                                                                                              onChange={e => setCh(i, {
                                                                                                  options: c.options!.map((x, k) => (k === j ? {
                                                                                                      ...x,
                                                                                                      label: e.target.value
                                                                                                  } : x))
                                                                                              })}/></label>
                                <label className={s.field}><span>Descrizione</span><input value={o.desc} maxLength={140}
                                                                                          onChange={e => setCh(i, {
                                                                                              options: c.options!.map((x, k) => (k === j ? {
                                                                                                  ...x,
                                                                                                  desc: e.target.value
                                                                                              } : x))
                                                                                          })}/></label>
                                <label className={s.field}><span>Evento se vince (facoltativo)</span><input
                                    value={o.event?.title ?? ''} maxLength={50} placeholder="es. Settimana del Fuoco"
                                    onChange={e => setCh(i, {
                                        options: c.options!.map((x, k) => (k === j ? {
                                            ...x,
                                            event: e.target.value ? {...x.event, title: e.target.value} : undefined
                                        } : x))
                                    })}/></label>
                                <div className={s.grid2}>
                                    <label className={s.field}><span>Fazione favorita</span><select
                                        value={o.event?.faction ?? ''} disabled={!o.event} onChange={e => setCh(i, {
                                        options: c.options!.map((x, k) => (k === j && x.event ? {
                                            ...x,
                                            event: {...x.event, faction: (e.target.value || null) as Faction | null}
                                        } : x))
                                    })}>
                                        <option value="">Nessuna</option>
                                        {(Object.keys(FACTIONS) as Faction[]).map(f => <option key={f}
                                                                                               value={f}>{FACTIONS[f].name}</option>)}
                                    </select></label>
                                    <label className={s.field}><span>Presagio della corsia centrale</span><select
                                        value={o.event?.omen ?? ''} disabled={!o.event} onChange={e => setCh(i, {
                                        options: c.options!.map((x, k) => (k === j && x.event ? {
                                            ...x,
                                            event: {...x.event, omen: (e.target.value || null) as OmenId | null}
                                        } : x))
                                    })}>
                                        <option value="">Nessuno</option>
                                        {(Object.keys(OMENS) as OmenId[]).map(om => <option key={om}
                                                                                            value={om}>{OMENS[om].name}</option>)}
                                    </select></label>
                                </div>
                            </div>))}
                        <div className={u.row}>
                            <button className={`${u.btn} ${u.sm}`} disabled={(c.options ?? []).length >= 4}
                                    onClick={() => setCh(i, {
                                        options: [...(c.options ?? []), {
                                            id: 'o' + Date.now().toString(36),
                                            label: '',
                                            desc: ''
                                        }]
                                    })}>Aggiungi opzione
                            </button>
                            <button className={`${u.btn} ${u.sm}`} disabled={(c.options ?? []).length <= 2}
                                    onClick={() => setCh(i, {options: (c.options ?? []).slice(0, -1)})}>Togli ultima
                                opzione
                            </button>
                            <button className={`${u.btn} ${u.sm}`} disabled={st.chapters.length <= 1}
                                    onClick={() => setSt({
                                        ...st,
                                        chapters: st.chapters.filter((_, j) => j !== i)
                                    })}>Togli capitolo
                            </button>
                        </div>
                    </fieldset>
                ))}
                <div className={u.row} style={{justifyContent: 'space-between'}}>
                    <button className={u.btn}
                            onClick={() => setSt({...st, chapters: [...st.chapters, newChapter()]})}>Aggiungi capitolo
                    </button>
                    <div className={u.row}>
                        <button className={u.btn} onClick={onClose}>Annulla</button>
                        <button className={`${u.btn} ${u.primary}`} onClick={() => onSave(st)}>Salva</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
