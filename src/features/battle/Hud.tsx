import {motion, useAnimationControls} from 'framer-motion';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Confirm} from '../../ui/Confirm';
import {Modal} from '../../ui/Modal';
import {type Game} from '../../engine';
import {useLang, useT} from '../../i18n/lang';
import {custodeName} from '../../i18n/names';
import {playerName} from '../../i18n/log';
import {W} from '../../i18n/words';
import {CustodeCard, CustodePortrait} from '../custodi/CustodeCard';
import {Avatar} from '../info/Avatar';
import {useProfile} from '../../profile/store';
import {CardBack} from './CardBack';
import {EmoteBubble, EmotePicker} from './Emotes';
import {GraveView} from './GraveView';
import {Rose} from '../../cards/art/CardArt';
import {rose} from '../../cards/art/rose';
import {SEAL_PAL} from '../../cards/art/palettes';
import {myBack, reserveMs, turnMs, useBattle} from './store';
import s from './battle.module.css';

const CRYSTAL = 'M6 0 12 4.5v9L6 18 0 13.5v-9Z';

export function Crystals({cur, max, big}: { cur: number; max: number; big?: boolean }) {
    const t = useT();
    return (
        <span className={`${s.crystals} ${big ? s.crystalsBig : ''}`}
              aria-label={t(`${cur} Cristalli su ${max}`, `${cur} Crystals of ${max}`)}>
      {Array.from({length: max}, (_, i) => (
          <motion.svg key={i} viewBox="-1 -1 14 20" className={i < cur ? s.cOn : s.cOff} initial={false}
                      animate={i < cur ? {scale: [1.35, 1], opacity: 1} : {scale: 1, opacity: 0.8}}
                      transition={{duration: 0.35}}>
              <path d={CRYSTAL}/>
              <path d="M6 0v18M0 4.5l6 3 6-3" className={s.cFacet}/>
          </motion.svg>
      ))}
    </span>
    );
}

/** Riserva di Cristalli del giocatore: grande e ben visibile accanto al pulsante di fine turno. */
export function CrystalPool({cur, max}: { cur: number; max: number }) {
    const t = useT();
    return (
        <div className={s.pool} aria-label={t(`Cristalli: ${cur} disponibili su ${max}`, `Crystals: ${cur} of ${max} available`)}>
            <motion.div key={cur + '/' + max} className={s.poolGem} initial={{scale: 1.25}} animate={{scale: 1}}
                        transition={{type: 'spring', stiffness: 400, damping: 14}}>
                <svg viewBox="-1 -1 14 20" aria-hidden="true">
                    <path d={CRYSTAL}/>
                    <path d="M6 0v18M0 4.5l6 3 6-3" className={s.cFacet}/>
                </svg>
                <b>{cur}<small>/{max}</small></b>
            </motion.div>
            <div className={s.poolInfo}><span>{t('Cristalli', 'Crystals')}</span><Crystals cur={cur} max={max}/></div>
        </div>
    );
}

export function PlayerBar({G, p}: { G: Game; p: number }) {
    const P = G.p[p];
    const lang = useLang(), t = useT();
    const svg = useMemo(() => rose(SEAL_PAL[p], {n: 12, core: 14}), [p]);
    const [grave, setGrave] = useState(false), [cust, setCust] = useState(false);
    return (
        <div className={`${s.pbar} ${p === 0 ? s.pbarMe : s.pbarOp}`}>
            {p === 0 ?
                <button className={s.custBtn} onClick={() => P.custode && setCust(true)}
                        aria-label={t('Il tuo profilo', 'Your profile')}>
                    <Avatar width={38} border={false}/></button> : P.custode ?
                    <button className={s.custBtn} onClick={() => setCust(true)}
                            aria-label={t(`Custode: ${custodeName(P.custode, lang)}, tocca per i dettagli`, `Custodian: ${custodeName(P.custode, lang)}, tap for details`)}><CustodePortrait
                        id={P.custode}/></button> : <Rose svg={svg} className={s.avatar}/>}
            <div className={s.pInfo}>
                <div className={s.pName}><strong>{playerName(G, p, lang)}</strong>{P.custode &&
                    <button className={s.custName} onClick={() => setCust(true)}>{custodeName(P.custode, lang)}</button>}
                </div>
                <div className={s.pStats}>
                    {p === 1 && <span className={s.pCrys}><Crystals cur={P.crystals} max={P.maxC}/><span
                        className={s.cText}>{P.crystals}/{P.maxC}</span></span>}
                    {p === 0 && P.custode && <button className={s.custChip} onClick={() => setCust(true)}
                                                     aria-label={t(`Il tuo Custode: ${custodeName(P.custode, lang)}`, `Your Custodian: ${custodeName(P.custode, lang)}`)}>
                        <CustodePortrait id={P.custode}/>{custodeName(P.custode, lang)}</button>}
                    <span className={`${s.deckChip} ${P.deck.length <= 5 ? s.deckLow : ''}`}
                          title={P.deck.length <= 5
                              ? t('Mazzo quasi vuoto: appena finisce, ogni pescata infligge 2 danni a un Sigillo', 'Deck almost empty: once it runs out, every draw deals 2 damage to a Seal')
                              : t('Carte nel mazzo', 'Cards in deck')}>
                        <span className={s.miniBack}><CardBack
                            back={p === 0 ? myBack : 'cera'}/></span>{t(W.deck)} <b>{P.deck.length}</b></span>
                    <button className={s.graveBtn} onClick={() => setGrave(true)}
                            title={t('Guarda il cimitero', 'View the graveyard')}>{t('Cimitero', 'Graveyard')} <b>{P.grave.length}</b>
                    </button>
                </div>
            </div>
            {p === 0 && <EmotePicker/>}
            <EmoteBubble p={p === 0 ? 0 : 1}/>
            <GraveView G={G} p={grave ? p : null} onClose={() => setGrave(false)}/>
            {P.custode && <Modal open={cust} onClose={() => setCust(false)}><CustodeCard id={P.custode}/>
                <div style={{marginTop: 14}}>
                    <button className={s.btn} onClick={() => setCust(false)}>{t(W.close)}</button>
                </div>
            </Modal>}
        </div>
    );
}

/** Scelta a inizio turno, pulsante Fine turno e suggerimenti. */
export function TurnControls({G}: { G: Game }) {
    const busy = useBattle(st => st.busy), hint = useBattle(st => st.hint), sel = useBattle(st => st.sel);
    const t = useT();
    const b = useBattle.getState;
    const my = G.active === 0 && G.winner == null && !busy, me = G.p[0];
    const text = G.active !== 0 ? t(`Turno di ${G.p[1].name}…`, `${G.p[1].name}'s turn…`) : busy ? ''
        : hint || (sel?.kind === 'unit' ? t('Trascina o tocca una corsia adiacente per spostarla.', 'Drag or tap a nearby lane to move it there.') : sel?.kind === 'hand' && sel.step === 'lane' ? t('Scegli una corsia evidenziata.', 'Choose a highlighted lane.') : sel?.kind === 'hand' && sel.step === 'dest' ? t('Scegli la corsia in cui spostarla.', 'Choose the lane to move it to.') : sel?.kind === 'hand' && sel.step === 'confirm' ? t('Premi Gioca sulla carta per lanciarla.', 'Press Play on the card to cast it.') : t('Trascina una carta sul campo, o un\'unità in una corsia vicina.', 'Drag a card onto the field, or a unit into a nearby lane.'));
    // Un lampo dorato sul pulsante appena il turno torna al giocatore, così "posso agire di nuovo" si vede subito.
    const endCtl = useAnimationControls();
    const prevMy = useRef(my);
    useEffect(() => {
        if (my && !prevMy.current) void endCtl.start({
            scale: [1, 1.15, 1],
            boxShadow: ['0 0 0 0 rgba(240,195,90,0)', '0 0 22px 8px rgba(240,195,90,.65)', '0 0 0 0 rgba(240,195,90,0)']
        }, {duration: 0.7});
        prevMy.current = my;
    }, [my, endCtl]);
    return (
        <div className={s.controls}>
            <p className={`${s.hint} ${hint ? s.hintOn : ""}`} aria-live="polite">{text}</p>
            <CrystalPool cur={me.crystals} max={me.maxC}/>
            <div className={s.endWrap}>
                <TurnClock G={G}/>
                <motion.button className={s.endTurn} data-tut="end" disabled={!my || G.phase !== 'main'}
                               onClick={() => b().endTurn()} animate={endCtl}
                               whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    {G.active === 0 ? t('Fine turno', 'End turn') : t('Attendi', 'Wait')}
                </motion.button>
            </div>
            <TurnClockText G={G}/>
        </div>
    );
}

const fmt = (ms: number) => {
    const t = Math.ceil(ms / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

/** Anello attorno a Fine turno: blu per il tempo del turno, arancione quando si usa la riserva, rosso negli ultimi 10 secondi. */
function TurnClock({G}: { G: Game }) {
    const timed = useBattle(st => st.timed), tl = useBattle(st => st.turnLeft), rl = useBattle(st => st.reserveLeft);
    if (!timed || G.active !== 0 || G.winner != null) return null;
    const inRes = tl <= 0, frac = inRes ? rl / reserveMs() : tl / turnMs(), left = inRes ? rl : tl;
    return (
        <svg className={`${s.clock} ${left <= 10000 ? s.clockLow : inRes ? s.clockRes : ''}`} viewBox="0 0 100 100"
             aria-hidden="true">
            <circle cx="50" cy="50" r="46" className={s.clockTrack}/>
            <circle cx="50" cy="50" r="46" className={s.clockFill}
                    style={{strokeDasharray: `${Math.max(0, frac) * 289} 289`}}/>
        </svg>
    );
}

function TurnClockText({G}: { G: Game }) {
    const timed = useBattle(st => st.timed), tl = useBattle(st => st.turnLeft), rl = useBattle(st => st.reserveLeft);
    const t = useT();
    if (!timed) return null;
    const my = G.active === 0 && G.winner == null;
    return (
        <div className={s.clockText} aria-live="off">
            {my ? <span
                className={tl <= 0 ? s.resOn : ''}>{tl > 0 ? t(`Turno ${fmt(tl)}`, `Turn ${fmt(tl)}`) : t(`Riserva ${fmt(rl)}`, `Reserve ${fmt(rl)}`)}</span> :
                <span>{t('Turno avversario', "Opponent's turn")}</span>}
            {(tl > 0 || !my) &&
                <em title={t('Tempo extra unico per tutta la partita: si consuma quando finisce il tempo del turno e non si ricarica', 'One-time extra time for the whole match: it is used up when the turn timer runs out and never recharges')}>{t('Riserva partita', 'Match reserve')} {fmt(rl)}</em>}
        </div>
    );
}

/** Abbandona: lontano dalla mano avversaria, accanto agli strumenti della partita. */
export function QuitButton() {
    const [ask, setAsk] = useState(false);
    const b = useBattle.getState;
    const t = useT();
    const noTimer = useProfile(p => p.settings?.noTimer);
    return (<>
        <button className={s.timerBtn} aria-pressed={!!noTimer} onClick={() => b().toggleTimer()}
                title={t('Per i test: turni senza limite di tempo', 'For testing: turns with no time limit')}>{noTimer ? t('Tempo: spento', 'Timer: off') : t('Tempo: attivo', 'Timer: on')}</button>
        <button className={s.quit} onClick={() => setAsk(true)}>{t(W.forfeit)}</button>
        <Confirm open={ask} title={t('Abbandonare la partita?', 'Forfeit the match?')}
                 text={t('La partita conterà come sconfitta.', 'The match will count as a loss.')}
                 confirmLabel={t(W.forfeit)} onConfirm={() => b().quit()} onClose={() => setAsk(false)}/>
    </>);
}
