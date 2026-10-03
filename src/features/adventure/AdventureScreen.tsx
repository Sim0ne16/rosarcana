import {useState} from 'react';
import {CARDS, type CustodeId, CUSTODI, type Faction, FACTIONS} from '../../engine';
import {CardArt} from '../../cards/art/CardArt';
import {siteImg} from '../../cards/art/site';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {defaultArt} from '../../cards/styles';
import {rewardLabel} from '../../economy/constants';
import {deckIssues} from '../../economy/decks';
import {useProfile} from '../../profile/store';
import {Confirm} from '../../ui/Confirm';
import {Modal} from '../../ui/Modal';
import {PageHeader} from '../../ui/PageHeader';
import {toast} from '../../ui/toast';
import {useBattle} from '../battle/store';
import {DeckSelect} from '../decks/DeckSelect';
import {
    type Adventure,
    type AdvStage,
    CHAPTER_1,
    type Difficulty,
    DIFFS,
    emptyStage,
    newAdventure,
    OFFICIAL_EXTRA,
    stageReward
} from './model';
import {useAdventures} from './store';
import {tr, useLang, useT} from '../../i18n/lang';
import {cardName, factionName} from '../../i18n/names';
import {W} from '../../i18n/words';
import {EN_FACTION_NAMES} from '../../i18n/en/mechanics';
import {chapterText, EN_DIFFS, stageText} from '../../i18n/en/ui';
import {CommunityStories} from './CommunityStories';
import u from '../../ui/ui.module.css';
import s from './adventure.module.css';

type Tab = 'rosa' | 'community';
const copy = async (text: string, ok: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast(ok);
    } catch {
        window.prompt(tr('Copia questo codice:', 'Copy this code:'), text);
    }
};

export function AdventureScreen() {
    const [tab, setTab] = useState<Tab>('rosa');
    const A = useAdventures();
    const [edit, setEdit] = useState<Adventure | null>(null), [del, setDel] = useState<Adventure | null>(null);
    const official = [CHAPTER_1, ...OFFICIAL_EXTRA, ...(A.authorMode ? A.drafts : [])];
    const t = useT();
    return (
        <section className={u.page}>
            <PageHeader title={t('Avventure', 'Adventures')}
                        sub={t('Due modi di viaggiare: la campagna della Rosa, scritta dall\'autore del gioco, e i racconti della community, in cui i giocatori votano come prosegue la storia.', 'Two ways to travel: the Rose campaign, written by the game\'s author, and community tales, where players vote on how the story continues.')}/>
            <div className={s.tabs} role="tablist">
                <button role="tab" aria-selected={tab === 'rosa'} onClick={() => setTab('rosa')}>{t('Avventura della Rosa', 'The Rose Adventure')}
                </button>
                <button role="tab" aria-selected={tab === 'community'} onClick={() => setTab('community')}>{t('Racconti della community', 'Community tales')}
                </button>
            </div>
            <div style={{maxWidth: 420}}><DeckSelect/></div>

            {tab === 'rosa' && <>
                {official.map(a => <Chapter key={a.id} a={a} onEdit={a.draft ? () => setEdit(a) : undefined}
                                            onExport={a.draft ? () => copy(JSON.stringify(a, null, 1), t('Capitolo copiato: incollalo a chi pubblica il gioco', 'Chapter copied: paste it to whoever publishes the game')) : undefined}/>)}
                <div className={s.author}>
                    <label><input type="checkbox" checked={A.authorMode}
                                  onChange={e => A.setAuthor(e.target.checked)}/> {t('Modalità autore', 'Author mode')}</label>
                    <span>{t('Scrivi nuovi capitoli ufficiali. Le bozze restano sul tuo dispositivo finché non le esporti per la pubblicazione.', 'Write new official chapters. Drafts stay on your device until you export them for publication.')}</span>
                    {A.authorMode && <button className={`${u.btn} ${u.sm} ${u.primary}`}
                                             onClick={() => setEdit(newAdventure(true))}>{t('Nuovo capitolo', 'New chapter')}</button>}
                </div>
            </>}

            {tab === 'community' && <CommunityStories/>}

            {edit && <Editor initial={edit} onClose={() => setEdit(null)}/>}
            <Confirm open={!!del} title={t('Eliminare l\'avventura?', 'Delete the adventure?')}
                     text={t(`"${del?.title ?? ''}" verrà rimossa da questo dispositivo.`, `"${del?.title ?? ''}" will be removed from this device.`)} confirmLabel={t(W.delete)}
                     onConfirm={() => del && A.remove(del.id)} onClose={() => setDel(null)}/>
        </section>
    );
}

/** Un capitolo: intestazione e percorso di tappe da sbloccare in ordine. */
function Chapter({a, onEdit, onShare, onDelete, onExport}: {
    a: Adventure;
    onEdit?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onExport?: () => void
}) {
    const p = useProfile(), prog = useAdventures(st => st.progress[a.id]) ?? [];
    const t = useT(), lang = useLang(), en = lang === 'en';
    const head = chapterText(a, lang);
    const done = (i: number) => (a.id === 'cap1' ? p.adv.includes(i) : prog.includes(i));
    const go = (i: number) => {
        const d = p.decks.find(x => x.id === p.activeDeck);
        if (!d || deckIssues(d, p.owned).length) {
            toast(t(W.chooseDeck));
            return;
        }
        useBattle.getState().start('adv', i, a.id);
    };
    const n = a.stages.filter((_, i) => done(i)).length;
    return (
        <article className={s.chapter}>
            <header className={s.chHead}>
                <div><h2>{head.title}{a.draft && <span className={s.badge}>{t('Bozza', 'Draft')}</span>}{!a.official &&
                    <span className={s.badgeC}>Community</span>}</h2><p>{head.intro}</p></div>
                <div className={s.chActions}>
                    <span className={s.prog}>{n}/{a.stages.length}</span>
                    {onEdit && <button className={`${u.btn} ${u.sm}`} onClick={onEdit}>{t(W.edit)}</button>}
                    {onShare && <button className={`${u.btn} ${u.sm}`} onClick={onShare}>{t('Condividi', 'Share')}</button>}
                    {onExport &&
                        <button className={`${u.btn} ${u.sm}`} onClick={onExport}>{t('Esporta per la pubblicazione', 'Export for publication')}</button>}
                    {onDelete && <button className={`${u.btn} ${u.sm}`} onClick={onDelete}>{t(W.delete)}</button>}
                </div>
            </header>
            {a.id === 'cap1' && siteImg('avventura-mappa') &&
                <div className={s.map} style={{backgroundImage: `url(${siteImg('avventura-mappa')})`}} role="img"
                     aria-label={t('Mappa del capitolo', 'Chapter map')}/>}
            <ol className={s.path}>
                {a.stages.map((st, i) => {
                    const ok = done(i), open = i === 0 || done(i - 1);
                    const tx = stageText(a.id, i, st, lang);
                    return (
                        <li key={i} className={`${s.node} ${ok ? s.done : open ? s.open : s.lock}`}>
                            <span className={s.num}><span className={s.numArt}>{st.portrait && siteImg(st.portrait) ?
                                <img src={siteImg(st.portrait)} alt=""/> :
                                <CardArt id={st.art} style={defaultArt(st.art)} arch={false}/>}</span><i>{i + 1}</i></span>
                            <div><h3>{tx.n}</h3><p><strong>{tx.foe}</strong>,
                                {en ? `${st.facs.map(f => EN_FACTION_NAMES[f]).join(' and ')} deck` : `mazzo ${st.facs.map(f => FACTIONS[f].name).join(' e ')}`} · {en ? EN_DIFFS[st.diff] : DIFFS[st.diff].name}{st.seal !== 10 ? t(` · Sigilli da ${st.seal}`, ` · ${st.seal}-health Seals`) : ''}
                            </p>
                                {tx.txt && <p className={u.muted}>{tx.txt}</p>}<p
                                    className={u.muted}>{ok ? t(W.completed) : `${t(W.reward)}: ${rewardLabel(stageReward(a, st))}`}</p>
                            </div>
                            <div>{open ? <button className={`${u.btn} ${ok ? '' : u.primary}`}
                                                 onClick={() => go(i)}>{ok ? t(W.replay) : t(W.face)}</button> :
                                <span className={u.muted}>{t(W.locked)}</span>}</div>
                        </li>);
                })}
            </ol>
        </article>
    );
}

const UNITS = CARDS.filter(c => c.t === 'U').sort((x, y) => x.n.localeCompare(y.n));

/** Editor di avventure: titolo, introduzione e fino a 8 tappe. */
function Editor({initial, onClose}: { initial: Adventure; onClose: () => void }) {
    const [a, setA] = useState<Adventure>(() => JSON.parse(JSON.stringify(initial)));
    const save = useAdventures(st => st.save);
    const t = useT(), lang = useLang(), en = lang === 'en';
    const setSt = (i: number, patch: Partial<AdvStage>) => setA(x => ({
        ...x,
        stages: x.stages.map((st, j) => (j === i ? {...st, ...patch} : st))
    }));
    const move = (i: number, d: number) => setA(x => {
        const st = [...x.stages];
        const j = i + d;
        if (j < 0 || j >= st.length) return x;
        [st[i], st[j]] = [st[j], st[i]];
        return {...x, stages: st};
    });
    const toggleFac = (i: number, f: Faction) => {
        const st = a.stages[i];
        const has = st.facs.includes(f);
        if (has && st.facs.length === 1) return;
        setSt(i, {facs: has ? st.facs.filter(x => x !== f) : st.facs.length >= 2 ? [st.facs[1], f] : [...st.facs, f]});
    };
    return (
        <Modal open onClose={onClose}>
            <div className={s.editor}>
                <h2 className={u.title}
                    style={{fontSize: 36}}>{a.official ? t('Capitolo ufficiale', 'Official chapter') : t('La tua avventura', 'Your adventure')}</h2>
                <label className={s.field}><span>{t(W.title)}</span><input value={a.title} maxLength={60}
                                                                     onChange={e => setA({
                                                                         ...a,
                                                                         title: e.target.value
                                                                     })}/></label>
                <label className={s.field}><span>{t(W.intro)}</span><textarea value={a.intro} maxLength={400} rows={3}
                                                                              onChange={e => setA({
                                                                                  ...a,
                                                                                  intro: e.target.value
                                                                              })}/></label>
                {a.stages.map((st, i) => (
                    <fieldset key={i} className={s.stage}>
                        <legend>{t(W.stage)} {i + 1}</legend>
                        <div className={s.stageTop}>
                            <span className={s.stageArt}><CardArt id={st.art} style={defaultArt(st.art)} arch={false}/></span>
                            <div className={s.grid2}>
                                <label className={s.field}><span>{t('Nome della tappa', 'Stage name')}</span><input value={st.n}
                                                                                               maxLength={50}
                                                                                               onChange={e => setSt(i, {n: e.target.value})}/></label>
                                <label className={s.field}><span>{t(W.opponent)}</span><input value={st.foe} maxLength={40}
                                                                                         onChange={e => setSt(i, {foe: e.target.value})}/></label>
                                <label className={s.field}><span>{t(W.portraitCard)}</span><select value={st.art}
                                                                                                onChange={e => setSt(i, {art: e.target.value})}>{CARDS.map(c =>
                                    <option key={c.id} value={c.id}>{cardName(c.id, lang)}</option>)}</select></label>
                                <label className={s.field}><span>{t(W.difficulty)}</span><select value={st.diff}
                                                                                          onChange={e => setSt(i, {diff: Number(e.target.value) as Difficulty})}>{([1, 2, 3, 4] as Difficulty[]).map(d =>
                                    <option key={d} value={d}>{en ? EN_DIFFS[d] : DIFFS[d].name}</option>)}</select></label>
                                <label className={s.field}><span>{t(W.enemySealHp)}</span><input
                                    type="number" min={6} max={16} value={st.seal}
                                    onChange={e => setSt(i, {seal: Math.min(16, Math.max(6, Number(e.target.value) || 10))})}/></label>
                                <label className={s.field}><span>{t('Custode avversario', 'Enemy Custodian')}</span><select
                                    value={st.custode ?? ''}
                                    onChange={e => setSt(i, {custode: (e.target.value || null) as CustodeId | null})}>
                                    <option value="">{t('Casuale', 'Random')}</option>
                                    {Object.values(CUSTODI).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select></label>
                            </div>
                        </div>
                        <div className={s.facRow}>
                            <span>{t('Fazioni del mazzo avversario', 'Enemy deck factions')}</span>{(Object.keys(FACTIONS) as Faction[]).map(f =>
                            <button key={f} className={u.chip} aria-pressed={st.facs.includes(f)}
                                    onClick={() => toggleFac(i, f)}><Glyph>{FACTION_GLYPH[f]}</Glyph>{factionName(f, lang)}
                            </button>)}</div>
                        <label className={s.field}><span>{t('Carta garantita nel mazzo avversario (facoltativa)', 'Guaranteed card in the enemy deck (optional)')}</span>
                            <select value={st.force?.[0] ?? ''}
                                    onChange={e => setSt(i, {force: e.target.value ? [e.target.value] : []})}>
                                <option value="">{t(W.noneFem)}</option>
                                {UNITS.filter(c => st.facs.includes(c.f)).map(c => <option key={c.id}
                                                                                           value={c.id}>{cardName(c.id, lang)}</option>)}
                            </select></label>
                        <label className={s.field}><span>{t(W.description)}</span><textarea value={st.txt} maxLength={240}
                                                                                     rows={2}
                                                                                     onChange={e => setSt(i, {txt: e.target.value})}
                                                                                     placeholder={t('Cosa aspetta il giocatore in questa tappa?', 'What awaits the player at this stage?')}/></label>
                        <div className={u.row}>
                            <button className={`${u.btn} ${u.sm}`} disabled={i === 0} onClick={() => move(i, -1)}>{t('Su', 'Up')}
                            </button>
                            <button className={`${u.btn} ${u.sm}`} disabled={i === a.stages.length - 1}
                                    onClick={() => move(i, 1)}>{t('Giù', 'Down')}
                            </button>
                            <button className={`${u.btn} ${u.sm}`} disabled={a.stages.length <= 1}
                                    onClick={() => setA({...a, stages: a.stages.filter((_, j) => j !== i)})}>{t('Togli tappa', 'Remove stage')}
                            </button>
                        </div>
                    </fieldset>
                ))}
                <div className={u.row} style={{justifyContent: 'space-between'}}>
                    <button className={u.btn} disabled={a.stages.length >= 8}
                            onClick={() => setA({...a, stages: [...a.stages, emptyStage()]})}>{t('Aggiungi tappa', 'Add stage')} ({a.stages.length}/8)
                    </button>
                    <div className={u.row}>
                        <button className={u.btn} onClick={onClose}>{t(W.cancel)}</button>
                        <button className={`${u.btn} ${u.primary}`} disabled={!a.title.trim()} onClick={() => {
                            save(a);
                            toast(t('Avventura salvata', 'Adventure saved'));
                            onClose();
                        }}>{t(W.save)}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
