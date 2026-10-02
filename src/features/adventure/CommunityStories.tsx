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
import {type Lang, useLang, useT} from '../../i18n/lang';
import {cardName, factionName, omenName} from '../../i18n/names';
import {type CardVariant, originalName, VARIANTS} from '../../cards/variants';
import {W} from '../../i18n/words';
import {EN_FACTION_NAMES} from '../../i18n/en/mechanics';
import {EN_DIFFS} from '../../i18n/en/ui';
import u from '../../ui/ui.module.css';
import s from './adventure.module.css';

/** "Fabbro di Tizzoni diventa Fabbro del Monte": cosa cambia se vince un'opzione con una carta viva. */
const liveLabel = (v: CardVariant, lang: Lang) => {
    const from = originalName(v.card, lang) ?? cardName(v.card, lang), to = lang === 'en' ? v.en.n : v.n;
    return lang === 'en' ? `Living card: ${from} becomes ${to}` : `Carta viva: ${from} diventa ${to}`;
};

/** Racconti a bivi: i moderatori scrivono, la community vota il seguito. */
export function CommunityStories() {
    const api = useStories();
    const [edit, setEdit] = useState<Story | null>(null);
    const t = useT();
    return (
        <div>
            <div className={s.storyInfo}>
                <p>{t('I moderatori scrivono il racconto un capitolo alla volta. Alla fine di ogni capitolo la community vota come prosegue: l\'opzione più votata diventa il capitolo successivo. Ogni capitolo è anche uno scontro da giocare.',
                    'Moderators write the tale one chapter at a time. At the end of each chapter the community votes on how it continues: the most voted option becomes the next chapter. Every chapter is also a battle to play.')}</p>
                <span
                    className={api.online ? s.online : s.offline}>{api.online ? t('Voti condivisi con tutti i giocatori', 'Votes shared with all players') : t('Anteprima locale: i voti restano su questo dispositivo', 'Local preview: votes stay on this device')}</span>
                {api.isMod && <button className={`${u.btn} ${u.sm} ${u.primary}`} onClick={() => setEdit({
                    id: 'r' + Date.now().toString(36),
                    title: t(W.newTale),
                    hero: '',
                    intro: '',
                    chapters: [newChapter()],
                    updatedAt: Date.now()
                })}>{t(W.newTale)}</button>}
            </div>
            {api.error && <p className={s.err}>{api.error}</p>}
            {api.ready && !api.stories.length && <p className={u.muted}>{t('Nessun racconto per ora.', 'No tales yet.')} {api.isMod ? t('Crea il primo con "Nuovo racconto".', 'Create the first one with "New tale".') : t('I moderatori lo pubblicheranno presto.', 'The moderators will publish one soon.')}</p>}
            {api.stories.map(st => <StoryView key={st.id} st={st} api={api} onEdit={() => setEdit(st)}/>)}
            {edit && <StoryEditor initial={edit} onClose={() => setEdit(null)} onSave={async x => {
                await api.save({...x, updatedAt: Date.now()});
                toast(t('Racconto salvato', 'Tale saved'));
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
    const t = useT(), lang = useLang(), en = lang === 'en';
    const play = (i: number) => {
        const d = p.decks.find(x => x.id === p.activeDeck);
        if (!d || deckIssues(d, p.owned).length) {
            toast(t(W.chooseDeck));
            return;
        }
        registerRuntime(adv);
        useBattle.getState().start('adv', i, adv.id);
    };
    const close = async (c: StoryChapter, open: boolean) => {
        const tal = api.tallies[voteKey(st.id, c.id)] ?? {},
            winner = open ? undefined : [...(c.options ?? [])].sort((a, b) => (tal[b.id] ?? 0) - (tal[a.id] ?? 0))[0]?.id;
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
                <div><h2>{st.title}</h2>{st.hero && <p><b>{t('Protagonista:', 'Protagonist:')}</b> {st.hero}</p>}<p>{st.intro}</p></div>
                {api.isMod && <div className={s.chActions}>
                    <button className={`${u.btn} ${u.sm}`} onClick={onEdit}>{t(W.edit)}</button>
                </div>}
            </header>
            {st.chapters.map((c, i) => {
                const k = voteKey(st.id, c.id), tal = api.tallies[k] ?? {},
                    tot = Object.values(tal).reduce((a, b) => a + b, 0), my = api.mine[k];
                const unlocked = i === 0 || prog.includes(i - 1), done = prog.includes(i);
                return (
                    <section key={c.id} className={s.storyCh}>
                        <div className={s.storyTop}>
                            <span className={s.num}><CardArt id={c.stage.art} style={defaultArt(c.stage.art)}
                                                             arch={false}/><i>{i + 1}</i></span>
                            <div><h3>{c.title}</h3><p className={s.storyText}>{c.text}</p>
                                <p className={u.muted}><strong>{c.stage.foe}</strong>,
                                    {en ? `${c.stage.facs.map(f => EN_FACTION_NAMES[f]).join(' and ')} deck` : `mazzo ${c.stage.facs.map(f => FACTIONS[f].name).join(' e ')}`} · {en ? EN_DIFFS[c.stage.diff] : DIFFS[c.stage.diff].name} · {done ? t('Completato', 'Completed') : `${t(W.reward)}: ${rewardLabel(stageReward(adv, adv.stages[i]))}`}
                                </p></div>
                            <div>{unlocked ? <button className={`${u.btn} ${done ? '' : u.primary}`}
                                                     onClick={() => play(i)}>{done ? t(W.replay) : t(W.face)}</button> :
                                <span className={u.muted}>{t(`Prima il capitolo ${i}`, `Chapter ${i} first`)}</span>}</div>
                        </div>
                        {c.question && c.options && c.options.length >= 2 && (
                            <div className={s.vote}>
                                <h4>{c.question}</h4>
                                {c.options.map(o => {
                                    const n = tal[o.id] ?? 0, pc = tot ? Math.round((n / tot) * 100) : 0,
                                        win = c.status === 'closed' && c.winner === o.id;
                                    return (
                                        <button key={o.id}
                                                className={`${s.opt} ${my === o.id ? s.myVote : ''} ${win ? s.winner : ''}`}
                                                disabled={c.status === 'closed'}
                                                onClick={() => void api.vote(st.id, c.id, o.id)} data-sfx="claim">
                                            <i style={{width: `${pc}%`}}/>
                                            <span><b>{o.label}{win ? t(' · scelta dalla community', ' · chosen by the community') : ''}</b><small>{o.desc}{o.event ? t(` Se vince: ${o.event.title}.`, ` If it wins: ${o.event.title}.`) : ''}{o.variant && VARIANTS[o.variant] ? ` ✦ ${liveLabel(VARIANTS[o.variant], lang)}` : ''}</small></span>
                                            <em>{pc}% · {n} {n === 1 ? t('voto', 'vote') : t('voti', 'votes')}</em>
                                        </button>);
                                })}
                                <div className={s.voteFoot}>
                                    <span>{c.status === 'closed' ? (i === st.chapters.length - 1 ? t('Votazione chiusa: il prossimo capitolo è in scrittura.', 'Voting closed: the next chapter is being written.') : t('Votazione chiusa.', 'Voting closed.')) : my ? t('Hai votato: puoi cambiare scelta finché la votazione è aperta.', 'You voted: you can change your choice while voting is open.') : t('Vota per decidere il seguito.', 'Vote to decide what happens next.')}</span>
                                    {api.isMod && <button className={`${u.btn} ${u.sm}`}
                                                          onClick={() => void close(c, c.status === 'closed')}>{c.status === 'closed' ? t('Riapri votazione', 'Reopen voting') : t('Chiudi e proclama la scelta', 'Close and announce the choice')}</button>}
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
    const t = useT(), lang = useLang(), en = lang === 'en';
    return (
        <Modal open onClose={onClose}>
            <div className={s.editor}>
                <h2 className={u.title} style={{fontSize: 34}}>{t('Racconto della community', 'Community tale')}</h2>
                <label className={s.field}><span>{t(W.title)}</span><input value={st.title} maxLength={60}
                                                                     onChange={e => setSt({
                                                                         ...st,
                                                                         title: e.target.value
                                                                     })}/></label>
                <label className={s.field}><span>{t('Protagonista', 'Protagonist')}</span><input value={st.hero} maxLength={60}
                                                                           onChange={e => setSt({
                                                                               ...st,
                                                                               hero: e.target.value
                                                                           })}
                                                                           placeholder={t('Chi è l\'esploratore?', 'Who is the explorer?')}/></label>
                <label className={s.field}><span>{t(W.intro)}</span><textarea rows={3} maxLength={500} value={st.intro}
                                                                              onChange={e => setSt({
                                                                                  ...st,
                                                                                  intro: e.target.value
                                                                              })}/></label>
                {st.chapters.map((c, i) => (
                    <fieldset key={c.id} className={s.stage}>
                        <legend>{t('Capitolo', 'Chapter')} {i + 1}</legend>
                        <label className={s.field}><span>{t(W.title)}</span><input value={c.title} maxLength={60}
                                                                             onChange={e => setCh(i, {title: e.target.value})}/></label>
                        <label className={s.field}><span>{t('Racconto', 'Tale')}</span><textarea rows={4} maxLength={900}
                                                                                  value={c.text}
                                                                                  onChange={e => setCh(i, {text: e.target.value})}/></label>
                        <div className={s.grid2}>
                            <label className={s.field}><span>{t(W.opponent)}</span><input value={c.stage.foe} maxLength={40}
                                                                                     onChange={e => setStage(i, {foe: e.target.value})}/></label>
                            <label className={s.field}><span>{t(W.portraitCard)}</span><select value={c.stage.art}
                                                                                            onChange={e => setStage(i, {art: e.target.value})}>{CARDS.map(x =>
                                <option key={x.id} value={x.id}>{cardName(x.id, lang)}</option>)}</select></label>
                            <label className={s.field}><span>{t(W.difficulty)}</span><select value={c.stage.diff}
                                                                                      onChange={e => setStage(i, {diff: Number(e.target.value) as Difficulty})}>{([1, 2, 3, 4] as Difficulty[]).map(d =>
                                <option key={d} value={d}>{en ? EN_DIFFS[d] : DIFFS[d].name}</option>)}</select></label>
                            <label className={s.field}><span>{t(W.enemySealHp)}</span><input type="number"
                                                                                                           min={6}
                                                                                                           max={16}
                                                                                                           value={c.stage.seal}
                                                                                                           onChange={e => setStage(i, {seal: Math.min(16, Math.max(6, Number(e.target.value) || 10))})}/></label>
                        </div>
                        <div className={s.facRow}>
                            <span>{t('Fazioni avversarie', 'Enemy factions')}</span>{(Object.keys(FACTIONS) as Faction[]).map(f => <button
                            key={f} className={u.chip} aria-pressed={c.stage.facs.includes(f)} onClick={() => {
                            const has = c.stage.facs.includes(f);
                            if (has && c.stage.facs.length === 1) return;
                            setStage(i, {facs: has ? c.stage.facs.filter(x => x !== f) : c.stage.facs.length >= 2 ? [c.stage.facs[1], f] : [...c.stage.facs, f]});
                        }}><Glyph>{FACTION_GLYPH[f]}</Glyph>{factionName(f, lang)}</button>)}</div>
                        <label className={s.field}><span>{t('Domanda per la community (lascia vuoto se il capitolo non ha una scelta)', 'Question for the community (leave empty if the chapter has no choice)')}</span><input
                            value={c.question ?? ''} maxLength={140}
                            onChange={e => setCh(i, {question: e.target.value})}/></label>
                        {(c.options ?? []).map((o, j) => (
                            <div key={o.id} className={s.grid2}>
                                <label className={s.field}><span>{t('Opzione', 'Option')} {j + 1}</span><input value={o.label}
                                                                                              maxLength={50}
                                                                                              onChange={e => setCh(i, {
                                                                                                  options: c.options!.map((x, k) => (k === j ? {
                                                                                                      ...x,
                                                                                                      label: e.target.value
                                                                                                  } : x))
                                                                                              })}/></label>
                                <label className={s.field}><span>{t(W.description)}</span><input value={o.desc} maxLength={140}
                                                                                          onChange={e => setCh(i, {
                                                                                              options: c.options!.map((x, k) => (k === j ? {
                                                                                                  ...x,
                                                                                                  desc: e.target.value
                                                                                              } : x))
                                                                                          })}/></label>
                                <label className={s.field}><span>{t('Evento se vince (facoltativo)', 'Event if it wins (optional)')}</span><input
                                    value={o.event?.title ?? ''} maxLength={50} placeholder={t('es. Settimana del Fuoco', 'e.g. Week of Fire')}
                                    onChange={e => setCh(i, {
                                        options: c.options!.map((x, k) => (k === j ? {
                                            ...x,
                                            event: e.target.value ? {...x.event, title: e.target.value} : undefined
                                        } : x))
                                    })}/></label>
                                <div className={s.grid2}>
                                    <label className={s.field}><span>{t('Fazione favorita', 'Favoured faction')}</span><select
                                        value={o.event?.faction ?? ''} disabled={!o.event} onChange={e => setCh(i, {
                                        options: c.options!.map((x, k) => (k === j && x.event ? {
                                            ...x,
                                            event: {...x.event, faction: (e.target.value || null) as Faction | null}
                                        } : x))
                                    })}>
                                        <option value="">{t(W.noneFem)}</option>
                                        {(Object.keys(FACTIONS) as Faction[]).map(f => <option key={f}
                                                                                               value={f}>{factionName(f, lang)}</option>)}
                                    </select></label>
                                    <label className={s.field}><span>{t('Presagio della corsia centrale', 'Center lane omen')}</span><select
                                        value={o.event?.omen ?? ''} disabled={!o.event} onChange={e => setCh(i, {
                                        options: c.options!.map((x, k) => (k === j && x.event ? {
                                            ...x,
                                            event: {...x.event, omen: (e.target.value || null) as OmenId | null}
                                        } : x))
                                    })}>
                                        <option value="">{t(W.noneMasc)}</option>
                                        {(Object.keys(OMENS) as OmenId[]).map(om => <option key={om}
                                                                                            value={om}>{omenName(om, lang)}</option>)}
                                    </select></label>
                                </div>
                                <label className={s.field}><span>{t('Carta viva se vince (facoltativa)', 'Living card if it wins (optional)')}</span><select
                                    value={o.variant ?? ''} onChange={e => setCh(i, {
                                    options: c.options!.map((x, k) => (k === j ? {...x, variant: e.target.value || undefined} : x))
                                })}>
                                    <option value="">{t(W.noneFem)}</option>
                                    {Object.values(VARIANTS).map(v => <option key={v.id} value={v.id}>{liveLabel(v, lang)}</option>)}
                                </select></label>
                            </div>))}
                        <div className={u.row}>
                            <button className={`${u.btn} ${u.sm}`} disabled={(c.options ?? []).length >= 4}
                                    onClick={() => setCh(i, {
                                        options: [...(c.options ?? []), {
                                            id: 'o' + Date.now().toString(36),
                                            label: '',
                                            desc: ''
                                        }]
                                    })}>{t('Aggiungi opzione', 'Add option')}
                            </button>
                            <button className={`${u.btn} ${u.sm}`} disabled={(c.options ?? []).length <= 2}
                                    onClick={() => setCh(i, {options: (c.options ?? []).slice(0, -1)})}>{t('Togli ultima opzione', 'Remove last option')}
                            </button>
                            <button className={`${u.btn} ${u.sm}`} disabled={st.chapters.length <= 1}
                                    onClick={() => setSt({
                                        ...st,
                                        chapters: st.chapters.filter((_, j) => j !== i)
                                    })}>{t('Togli capitolo', 'Remove chapter')}
                            </button>
                        </div>
                    </fieldset>
                ))}
                <div className={u.row} style={{justifyContent: 'space-between'}}>
                    <button className={u.btn}
                            onClick={() => setSt({...st, chapters: [...st.chapters, newChapter()]})}>{t('Aggiungi capitolo', 'Add chapter')}
                    </button>
                    <div className={u.row}>
                        <button className={u.btn} onClick={onClose}>{t(W.cancel)}</button>
                        <button className={`${u.btn} ${u.primary}`} onClick={() => onSave(st)}>{t(W.save)}</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
