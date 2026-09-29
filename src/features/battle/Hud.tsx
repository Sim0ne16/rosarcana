import {motion} from 'framer-motion';
import {useMemo, useState} from 'react';
import {Confirm} from '../../ui/Confirm';
import {Modal} from '../../ui/Modal';
import {CUSTODI, type Game} from '../../engine';
import {CustodeCard, CustodePortrait} from '../custodi/CustodeCard';
import {Avatar} from '../info/Avatar';
import {useProfile} from '../../profile/store';
import {CardBack} from './CardBack';
import {GraveView} from './GraveView';
import {Rose} from '../../cards/art/CardArt';
import {rose} from '../../cards/art/rose';
import {SEAL_PAL} from '../../cards/art/palettes';
import {myBack, reserveMs, turnMs, useBattle} from './store';
import s from './battle.module.css';

const CRYSTAL = 'M6 0 12 4.5v9L6 18 0 13.5v-9Z';

export function Crystals({cur, max, big}: { cur: number; max: number; big?: boolean }) {
    return (
        <span className={`${s.crystals} ${big ? s.crystalsBig : ''}`} aria-label={`${cur} Cristalli su ${max}`}>
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
    return (
        <div className={s.pool} aria-label={`Cristalli: ${cur} disponibili su ${max}`}>
            <motion.div key={cur + '/' + max} className={s.poolGem} initial={{scale: 1.25}} animate={{scale: 1}}
                        transition={{type: 'spring', stiffness: 400, damping: 14}}>
                <svg viewBox="-1 -1 14 20" aria-hidden="true">
                    <path d={CRYSTAL}/>
                    <path d="M6 0v18M0 4.5l6 3 6-3" className={s.cFacet}/>
                </svg>
                <b>{cur}<small>/{max}</small></b>
            </motion.div>
            <div className={s.poolInfo}><span>Cristalli</span><Crystals cur={cur} max={max}/></div>
        </div>
    );
}

export function PlayerBar({G, p}: { G: Game; p: number }) {
    const P = G.p[p];
    const svg = useMemo(() => rose(SEAL_PAL[p], {n: 12, core: 14}), [p]);
    const b = useBattle.getState;
    const [ask, setAsk] = useState(false), [grave, setGrave] = useState(false), [cust, setCust] = useState(false);
    return (
        <div className={`${s.pbar} ${p === 0 ? s.pbarMe : s.pbarOp}`}>
            {p === 0 ?
                <button className={s.custBtn} onClick={() => P.custode && setCust(true)} aria-label="Il tuo profilo">
                    <Avatar width={38}/></button> : P.custode ?
                    <button className={s.custBtn} onClick={() => setCust(true)}
                            aria-label={`Custode: ${CUSTODI[P.custode].name}, tocca per i dettagli`}><CustodePortrait
                        id={P.custode}/></button> : <Rose svg={svg} className={s.avatar}/>}
            <div className={s.pInfo}>
                <div className={s.pName}><strong>{P.name}</strong>{P.custode &&
                    <button className={s.custName} onClick={() => setCust(true)}>{CUSTODI[P.custode].name}</button>}
                </div>
                <div className={s.pStats}>
                    {p === 1 && <span className={s.pCrys}><Crystals cur={P.crystals} max={P.maxC}/><span
                        className={s.cText}>{P.crystals}/{P.maxC}</span></span>}
                    {p === 0 && P.custode && <button className={s.custChip} onClick={() => setCust(true)}
                                                     aria-label={`Il tuo Custode: ${CUSTODI[P.custode].name}`}>
                        <CustodePortrait id={P.custode}/>{CUSTODI[P.custode].name}</button>}
                    <span className={s.deckChip} title="Carte nel mazzo"><span className={s.miniBack}><CardBack
                        back={p === 0 ? myBack : 'cera'}/></span>Mazzo <b>{P.deck.length}</b></span>
                    <button className={s.graveBtn} onClick={() => setGrave(true)}
                            title="Guarda il cimitero">Cimitero <b>{P.grave.length}</b></button>
                </div>
            </div>
            <GraveView G={G} p={grave ? p : null} onClose={() => setGrave(false)}/>
            {P.custode && <Modal open={cust} onClose={() => setCust(false)}><CustodeCard id={P.custode}/>
                <div style={{marginTop: 14}}>
                    <button className={s.btn} onClick={() => setCust(false)}>Chiudi</button>
                </div>
            </Modal>}
        </div>
    );
}

/** Scelta a inizio turno, pulsante Fine turno e suggerimenti. */
export function TurnControls({G}: { G: Game }) {
    const busy = useBattle(st => st.busy), hint = useBattle(st => st.hint), sel = useBattle(st => st.sel);
    const b = useBattle.getState;
    const my = G.active === 0 && G.winner == null && !busy, me = G.p[0];
    const text = G.active !== 0 ? `Turno di ${G.p[1].name}…` : busy ? ''
        : hint || (sel?.kind === 'unit' ? 'Trascina o tocca una corsia adiacente per spostarla.' : sel?.kind === 'hand' && sel.step === 'lane' ? 'Scegli una corsia evidenziata.' : sel?.kind === 'hand' && sel.step === 'confirm' ? 'Premi Gioca sulla carta per lanciarla.' : 'Trascina una carta sul campo, o un\'unità in una corsia vicina.');
    return (
        <div className={s.controls}>
            <p className={`${s.hint} ${hint ? s.hintOn : ""}`} aria-live="polite">{text}</p>
            <CrystalPool cur={me.crystals} max={me.maxC}/>
            <div className={s.endWrap}>
                <TurnClock G={G}/>
                <motion.button className={s.endTurn} data-tut="end" disabled={!my || G.phase !== 'main'}
                               onClick={() => b().endTurn()}
                               whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    {G.active === 0 ? 'Fine turno' : 'Attendi'}
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
    if (!timed) return null;
    const my = G.active === 0 && G.winner == null;
    return (
        <div className={s.clockText} aria-live="off">
            {my ? <span className={tl <= 0 ? s.resOn : ''}>{tl > 0 ? `Turno ${fmt(tl)}` : `Riserva ${fmt(rl)}`}</span> :
                <span>Turno avversario</span>}
            {(tl > 0 || !my) &&
                <em title="Tempo extra unico per tutta la partita: si consuma quando finisce il tempo del turno e non si ricarica">Riserva
                    partita {fmt(rl)}</em>}
        </div>
    );
}

/** Abbandona: lontano dalla mano avversaria, accanto agli strumenti della partita. */
export function QuitButton() {
    const [ask, setAsk] = useState(false);
    const b = useBattle.getState;
    const noTimer = useProfile(p => p.settings?.noTimer);
    return (<>
        <button className={s.timerBtn} aria-pressed={!!noTimer} onClick={() => b().toggleTimer()}
                title="Per i test: turni senza limite di tempo">{noTimer ? 'Tempo: spento' : 'Tempo: attivo'}</button>
        <button className={s.quit} onClick={() => setAsk(true)}>Abbandona</button>
        <Confirm open={ask} title="Abbandonare la partita?" text="La partita conterà come sconfitta."
                 confirmLabel="Abbandona" onConfirm={() => b().quit()} onClose={() => setAsk(false)}/>
    </>);
}
