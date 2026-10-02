import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import {BYID, type CardType, CUSTODI, FACTIONS, RARITY} from '../../engine';
import {Card} from '../../cards/Card';
import {FACTION_GLYPH, Glyph, TYPE_GLYPH} from '../../cards/glyphs';
import {rewardLabel} from '../../economy/constants';
import {countMap} from '../../economy/decks';
import {useLang, useT} from '../../i18n/lang';
import {cardName, custodeName, factionName, rarityName, typeName} from '../../i18n/names';
import {W} from '../../i18n/words';
import {lookOf, useProfile} from '../../profile/store';
import {Confirm} from '../../ui/Confirm';
import {askBuy} from '../../ui/confirmBuy';
import {ManaCurve} from '../../ui/ManaCurve';
import {PageHeader} from '../../ui/PageHeader';
import {toast} from '../../ui/toast';
import {useBattle} from '../battle/store';
import {CardDetail} from '../collection/CardDetail';
import {CustodeCard, CustodePortrait} from '../custodi/CustodeCard';
import {
    DRAFT_COST,
    DRAFT_COST_GEMS,
    DRAFT_MAX_L,
    DRAFT_MAX_W,
    DRAFT_PICKS,
    DRAFT_REWARDS,
    draftOpponent,
    draftOver,
    draftReward,
    type DraftOffer,
    type DraftRun,
    MAIN_FAC_SHARE,
    SPECIAL_PICKS,
    useDraft
} from './draft';
import u from '../../ui/ui.module.css';
import m from './modes.module.css';
import s from './arena.module.css';

const TYPES_ORDER: readonly CardType[] = ['U', 'I', 'R'];

/** Arena delle Rose, sul modello dell'Arena di Hearthstone: ingresso, scelta del Custode, bozza e corsa. */
export function ArenaScreen({back}: { back: () => void }) {
    const r = useDraft(st => st.run);
    const t = useT();
    return (
        <section className={u.page}>
            <PageHeader title={t(W.arena)}
                        sub={t(`Scegli un Custode, costruisci un mazzo scegliendo 30 volte una carta su tre e gioca finché arrivi a ${DRAFT_MAX_W} vittorie o ${DRAFT_MAX_L} sconfitte. Tutte le carte del Set Base sono disponibili, anche quelle che non possiedi.`,
                            `Pick a Custodian, build a deck by choosing one card out of three 30 times, and play until you reach ${DRAFT_MAX_W} wins or ${DRAFT_MAX_L} losses. Every Base Set card is available, even the ones you don't own.`)}>
                <button className={u.btn} onClick={back}>← {t(W.play)}</button>
            </PageHeader>
            {!r ? <Lobby/> : !r.custode ? <HeroPick run={r}/> : r.offer ? <Drafting run={r} offer={r.offer}/> : <RunHub run={r}/>}
        </section>
    );
}

/* ---------- Ingresso: come funziona, costo e tabella delle ricompense ---------- */
function Lobby() {
    const D = useDraft(), p = useProfile();
    const t = useT();
    const pay = (cur: 'oro' | 'gemme', cost: number) => askBuy({
        title: t('Entrare nell\'Arena?', 'Enter the Arena?'),
        text: cur === 'oro'
            ? t(`L'ingresso costa ${cost} oro (ne hai ${p.oro}).`, `Entry costs ${cost} gold (you have ${p.oro}).`)
            : t(`L'ingresso costa ${cost} gemme (ne hai ${p.gemme}).`, `Entry costs ${cost} gems (you have ${p.gemme}).`),
        label: t(`Entra per ${cost}`, `Enter for ${cost}`),
        onConfirm: () => {
            p.grant({[cur]: -cost}, t('Ingresso Arena', 'Arena entry'));
            D.start();
        }
    });
    const steps: [string, string][] = [
        [t('Scegli il Custode', 'Pick your Custodian'), t('Tre Custodi di Case diverse: il Custode è il tuo eroe e decide quasi tutte le carte che ti verranno offerte.', 'Three Custodians from different Houses: the Custodian is your hero and decides most of the cards you will be offered.')],
        [t('Costruisci il mazzo', 'Build your deck'), t(`30 scelte, ognuna fra tre carte della stessa rarità. Le scelte 1, 10, 20 e 30 offrono carte Rare o Leggendarie.`, `30 picks, each between three cards of the same rarity. Picks 1, 10, 20 and 30 offer Rare or Legendary cards.`)],
        [t('Scala la classifica', 'Climb the ladder'), t(`Gioca fino a ${DRAFT_MAX_W} vittorie o ${DRAFT_MAX_L} sconfitte. Ogni vittoria alza la ricompensa, e puoi ritirarti quando vuoi tenendo quella raggiunta.`, `Play until ${DRAFT_MAX_W} wins or ${DRAFT_MAX_L} losses. Every win raises the reward, and you can retire at any time keeping what you have reached.`)],
    ];
    return (
        <div className={s.lobby}>
            <div>
                <ol className={s.steps}>{steps.map(([h, d], i) => <li key={h}><b>{i + 1}</b>
                    <div><h3>{h}</h3><p>{d}</p></div>
                </li>)}</ol>
                <div className={s.entry}>
                    {!D.freeUsed
                        ? <button className={`${u.btn} ${u.primary} ${m.big}`} onClick={D.start}>{t('Entra gratis (prima volta)', 'Enter for free (first time)')}</button>
                        : <>
                            <button className={`${u.btn} ${u.primary} ${m.big}`} disabled={p.oro < DRAFT_COST}
                                    onClick={() => pay('oro', DRAFT_COST)}>{t(`Entra · ${DRAFT_COST} oro`, `Enter · ${DRAFT_COST} gold`)}</button>
                            <button className={`${u.btn} ${m.big}`} disabled={p.gemme < DRAFT_COST_GEMS}
                                    onClick={() => pay('gemme', DRAFT_COST_GEMS)}>{t(`Entra · ${DRAFT_COST_GEMS} gemme`, `Enter · ${DRAFT_COST_GEMS} gems`)}</button>
                        </>}
                </div>
            </div>
            <aside className={s.rewards}>
                <h3>{t('Ricompense', 'Rewards')}</h3>
                <p className={u.muted}>{t(`Record personale: ${D.best} vittorie`, `Personal best: ${D.best} wins`)}</p>
                <ol>{DRAFT_REWARDS.map((rw, w) => <li key={w} className={w === D.best && w > 0 ? s.best : ''}>
                    <b>{w}</b><span>{rewardLabel(rw)}</span></li>)}</ol>
            </aside>
        </div>
    );
}

/* ---------- Scelta dell'eroe ---------- */
function HeroPick({run}: { run: DraftRun }) {
    const choose = useDraft(st => st.chooseCustode);
    const t = useT(), lang = useLang();
    const share = Math.round(MAIN_FAC_SHARE * 100);
    return <div>
        <h2 className={m.h2}>{t('Scegli il tuo Custode', 'Choose your Custodian')}</h2>
        <div className={m.custs}>{run.custodeChoices.map(id => {
            const f = CUSTODI[id].f;
            return <button key={id} className={m.custPick} onClick={() => choose(id)}>
                <CustodeCard id={id} compact/>
                <span className={s.house} style={{['--fc' as string]: FACTIONS[f].col}}><Glyph>{FACTION_GLYPH[f]}</Glyph>
                    {t(`Casata ${factionName(f, lang)}: circa il ${share}% delle carte offerte`, `House of ${factionName(f, lang)}: about ${share}% of the cards offered`)}</span>
            </button>;
        })}</div>
    </div>;
}

/* ---------- Bozza: tre carte della stessa rarità ---------- */
function Drafting({run, offer}: { run: DraftRun; offer: DraftOffer }) {
    const pick = useDraft(st => st.pick);
    const p = useProfile(), t = useT(), lang = useLang();
    const [inspect, setInspect] = useState<string | null>(null);
    const n = run.picks.length, special = SPECIAL_PICKS.includes(n), {rar, ids} = offer;
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (inspect || (e.target as HTMLElement).closest('input,textarea')) return;
            const i = Number(e.key) - 1;
            if (i >= 0 && i < ids.length) pick(ids[i]);
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
    }, [ids, inspect, pick]);
    return <div className={m.drafting}>
        <div>
            <div className={s.pickHead}>
                <h2 className={m.h2}>{t(`Scelta ${n + 1} di ${DRAFT_PICKS}`, `Pick ${n + 1} of ${DRAFT_PICKS}`)}</h2>
                <span className={s.rar} style={{['--rc' as string]: RARITY[rar].color}}>{rarityName(rar, lang)}</span>
                {special && <span className={s.special}>★ {t('Scelta speciale', 'Special pick')}</span>}
            </div>
            <div className={m.options}>
                <AnimatePresence mode="popLayout">{ids.map((id, i) => (
                    <motion.button key={`${n}-${id}`} className={m.opt} onClick={() => pick(id)}
                                   onContextMenu={e => {
                                       e.preventDefault();
                                       setInspect(id);
                                   }}
                                   aria-label={t(`Scegli ${cardName(id, lang)} (tasto ${i + 1})`, `Pick ${cardName(id, lang)} (key ${i + 1})`)}
                                   initial={{opacity: 0, y: 30, rotate: (i - 1) * 4}} animate={{opacity: 1, y: 0, rotate: 0}}
                                   exit={{opacity: 0, scale: 0.9}} transition={{delay: i * 0.06}} whileHover={{y: -8}}>
                        <Card card={BYID[id]} look={lookOf(p, id)}/>
                        <kbd className={s.key}>{i + 1}</kbd>
                    </motion.button>))}
                </AnimatePresence>
            </div>
            <p className={`${u.small} ${u.muted} ${s.hint}`}>{t('Tasti 1-3 per scegliere, clic destro su una carta per il dettaglio.', 'Keys 1-3 to pick, right-click a card for details.')}</p>
        </div>
        <DeckSide run={run}/>
        <CardDetail id={inspect} onClose={() => setInspect(null)} onOpen={setInspect}/>
    </div>;
}

/* ---------- Corsa: record, ricompense, partite, ritiro ---------- */
function RunHub({run}: { run: DraftRun }) {
    const D = useDraft(), p = useProfile();
    const t = useT();
    const [askRetire, setAskRetire] = useState(false);
    const over = draftOver(run), w = run.wins;
    const play = () => {
        if (!run.custode) return;
        useBattle.getState().startCustom({
            label: t(`Arena ${run.wins}-${run.losses}`, `Arena ${run.wins}-${run.losses}`),
            me: {deck: run.picks, custode: run.custode},
            op: draftOpponent(run.wins),
            onEnd: win => {
                useDraft.getState().result(win);
                const n = useDraft.getState().run!;
                const line = win ? t(`Arena: ${n.wins}ª vittoria`, `Arena: win number ${n.wins}`) : t(`Arena: ${n.losses}ª sconfitta`, `Arena: loss number ${n.losses}`);
                return draftOver(n) ? [line, t('La corsa è finita: torna all\'Arena per riscuotere.', 'The run is over: go back to the Arena to claim your rewards.')] : [line];
            }
        });
    };
    const claim = () => {
        if (!run.claimed) p.grant(draftReward(w), t(`Arena delle Rose (${w} vittorie)`, `Arena of Roses (${w} wins)`));
        D.clear();
        toast(t(W.rewardsClaimed));
    };
    const title = !over ? t('Il tuo mazzo è pronto', 'Your deck is ready')
        : w >= DRAFT_MAX_W ? t('Arena perfetta!', 'Perfect run!') : t('Arena conclusa', 'Run complete');
    return <div className={m.drafting}>
        <div className={m.runBox}>
            <h2 className={m.h2}>{title}</h2>
            <div className={s.record} aria-label={t(`${w} vittorie, ${run.losses} sconfitte`, `${w} wins, ${run.losses} losses`)}>
                <div className={s.keys}>{Array.from({length: DRAFT_MAX_W}, (_, i) => <i key={i} className={i < w ? s.keyOn : ''}>{i + 1}</i>)}</div>
                <div className={s.losses}>{Array.from({length: DRAFT_MAX_L}, (_, i) => <i key={i} className={i < run.losses ? s.lossOn : ''}>✕</i>)}</div>
            </div>
            {over ? <>
                <p className={s.reward}>{t(W.reward)}: <b>{rewardLabel(draftReward(w))}</b></p>
                <button className={`${u.btn} ${u.primary} ${m.big}`} data-sfx="claim" onClick={claim}>{t(W.claimClose)}</button>
            </> : <>
                <p className={s.reward}>{t('Se ti fermi ora', 'If you stop now')}: <b>{rewardLabel(draftReward(w))}</b></p>
                <p className={`${s.reward} ${u.muted}`}>{t('Con un\'altra vittoria', 'With one more win')}: {rewardLabel(draftReward(w + 1))}</p>
                <div className={u.row}>
                    <button className={`${u.btn} ${u.primary} ${m.big}`} onClick={play}>{t('Affronta il prossimo avversario', 'Face the next opponent')}</button>
                    <button className={u.btn} onClick={() => setAskRetire(true)}>{t('Ritirati', 'Retire')}</button>
                </div>
                <Confirm open={askRetire} title={t('Ritirarsi dall\'Arena?', 'Retire from the Arena?')}
                         text={t(`La corsa finisce qui e ricevi le ricompense per ${w} vittorie: ${rewardLabel(draftReward(w))}.`, `The run ends here and you get the rewards for ${w} wins: ${rewardLabel(draftReward(w))}.`)}
                         confirmLabel={t('Ritirati', 'Retire')} onConfirm={D.retire} onClose={() => setAskRetire(false)}/>
            </>}
        </div>
        <DeckSide run={run}/>
    </div>;
}

/* ---------- Mazzo in costruzione: Custode, curva, tipi, lista ---------- */
function DeckSide({run}: { run: DraftRun }) {
    const t = useT(), lang = useLang();
    if (!run.custode) return null;
    const byType = countMap(run.picks.map(id => BYID[id].t));
    return <aside className={m.side}>
        <div className={m.sideHead}><CustodePortrait id={run.custode}/>
            <div><b>{custodeName(run.custode, lang)}</b><span>{run.picks.length}/{DRAFT_PICKS} {t(W.cards)}</span></div>
        </div>
        <ManaCurve cards={run.picks} big/>
        <div className={s.types}>{TYPES_ORDER.map(ty => <span key={ty}><Glyph>{TYPE_GLYPH[ty]}</Glyph>{typeName(ty, lang)} <b>{byType[ty] ?? 0}</b></span>)}</div>
        <DeckList ids={run.picks}/>
    </aside>;
}

function DeckList({ids}: { ids: string[] }) {
    const lang = useLang(), nm = (id: string) => cardName(id, lang);
    const cnt = countMap(ids),
        rows = Object.keys(cnt).sort((a, b) => BYID[a].c - BYID[b].c || nm(a).localeCompare(nm(b)));
    return <div className={m.list}>{rows.map(id => <div key={id} className={m.row}
                                                        style={{['--fc' as string]: FACTIONS[BYID[id].f].col}}>
        <b>{BYID[id].c}</b><span>{nm(id)}</span><em
        style={{color: RARITY[BYID[id].r].color}}>{cnt[id] > 1 ? `×${cnt[id]}` : ''}</em></div>)}</div>;
}
