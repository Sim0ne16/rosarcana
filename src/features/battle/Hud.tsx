import {motion, useAnimationControls} from 'framer-motion';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Confirm} from '../../ui/Confirm';
import {Modal} from '../../ui/Modal';
import {canOffer, costOf, type Game, playOptions, readyToAttack} from '../../engine';
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
import {sfx} from '../../audio/sfx';
import {SWORD} from '../../cards/glyphs';
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

/** Cristalli del giocatore, accanto al pulsante di fine turno: "rimasti / totale" e una gemma per Cristallo.
 * Passando su una carta le gemme che spenderebbe si accendono d'arancio (o di rosso quelle che mancano);
 * quando giochi, quelle spese fanno un lampo e si spengono. */
export function CrystalPool({cur, max, hint, offer}: { cur: number; max: number; hint?: number | null; offer?: boolean }) {
    const t = useT();
    // consumo: quando i Cristalli scendono (non al ricarico di inizio turno) le gemme spese lampeggiano
    const prev = useRef(cur);
    const [spent, setSpent] = useState<{ from: number; to: number } | null>(null);
    useEffect(() => {
        if (cur < prev.current) {
            setSpent({from: prev.current, to: cur});
            sfx('spend');
            const tm = setTimeout(() => setSpent(null), 900);
            prev.current = cur;
            return () => clearTimeout(tm);
        }
        prev.current = cur;
    }, [cur]);
    const cost = hint ?? null, short = cost != null && cost > cur ? cost - cur : 0;
    // la riga sotto le gemme compare solo mentre guardi una carta
    const note = cost == null ? ''
        : short && offer ? t('Si paga con il Sigillo (Offerta)', 'Paid with a Seal (Offering)')
            : short ? (short === 1 ? t('Ti manca 1 Cristallo', '1 Crystal short') : t(`Ti mancano ${short} Cristalli`, `${short} Crystals short`))
                : t(`Costa ${cost} · ne resteranno ${cur - cost}`, `Costs ${cost} · ${cur - cost} left`);
    // stato di ogni gemma: piena, da spendere (anteprima), mancante, appena spesa, vuota
    const gems = Array.from({length: Math.max(max, cost ?? 0)}, (_, i) => {
        if (spent && i >= spent.to && i < spent.from) return 'spent';
        if (i < cur) return cost != null && !short && i >= cur - cost ? 'pending' : cost != null && short && !offer ? 'pending' : 'on';
        if (cost != null && short && !offer && i < cost) return 'missing';
        return i < max ? 'off' : 'none';
    });
    return (
        <div className={s.pool} aria-label={t(`Cristalli: ${cur} disponibili su ${max}`, `Crystals: ${cur} of ${max} available`)}>
            <div className={s.poolCount} aria-hidden="true">
                <b>{cur}</b><span>/ {max}</span><em>{t('Cristalli', 'Crystals')}</em>
            </div>
            <div className={s.poolGems}>
                {gems.map((g, i) => g === 'none' ? null : (
                    <motion.svg key={i} viewBox="-1 -1 14 20" className={s['g-' + g]} aria-hidden="true"
                                style={{['--d' as string]: `${i * 0.18}s`}} initial={false}
                                animate={g === 'spent' ? {scale: [1, 1.35, 0.9], opacity: [1, 1, 0.55]} : g === 'pending' ? {y: [0, -4, 0]} : {scale: 1, opacity: 1, y: 0}}
                                transition={g === 'spent' ? {duration: 0.55, delay: (spent!.from - 1 - i) * 0.07} : g === 'pending' ? {duration: 0.9, repeat: Infinity} : {duration: 0.2}}>
                        <path d={CRYSTAL}/>
                        <path d="M6 0v18M0 4.5l6 3 6-3" className={s.cFacet}/>
                    </motion.svg>
                ))}
            </div>
            <span className={`${s.poolNote} ${short && !offer ? s.noteShort : ''}`}>{note}</span>
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

/** Suggerimento su cosa fare ora: sta nella colonna di destra. */
export function TurnHint({G}: { G: Game }) {
    const busy = useBattle(st => st.busy), hint = useBattle(st => st.hint), sel = useBattle(st => st.sel);
    const t = useT();
    const text = G.active !== 0 ? t(`Turno di ${G.p[1].name}…`, `${G.p[1].name}'s turn…`) : busy ? ''
        : hint || (sel?.kind === 'unit' ? t('Trascina o tocca una corsia adiacente per spostarla.', 'Drag or tap a nearby lane to move it there.') : sel?.kind === 'hand' && sel.step === 'lane' ? t('Scegli una corsia evidenziata.', 'Choose a highlighted lane.') : sel?.kind === 'hand' && sel.step === 'dest' ? t('Scegli la corsia in cui spostarla.', 'Choose the lane to move it to.') : sel?.kind === 'hand' && sel.step === 'confirm' ? t('Premi Gioca sulla carta per lanciarla.', 'Press Play on the card to cast it.') : t('Trascina una carta sul campo, o un\'unità in una corsia vicina. Tocca la spada di un\'unità per tenerla in guardia.', 'Drag a card onto the field, or a unit into a nearby lane. Tap a unit\'s sword to keep it on guard.'));
    return <p className={`${s.hint} ${hint ? s.hintOn : ""}`} aria-live="polite">{text}</p>;
}

/** Angolo in basso a destra: Cristalli, contatore del turno e pulsante Fine turno, sempre a portata di mano. */
export function TurnControls({G}: { G: Game }) {
    const busy = useBattle(st => st.busy), hoverHid = useBattle(st => st.hoverHid), sel = useBattle(st => st.sel);
    const t = useT();
    const b = useBattle.getState;
    const my = G.active === 0 && G.winner == null && !busy, me = G.p[0];
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
    // niente più da giocare: il pulsante si accende per suggerire di chiudere il turno
    const stuck = my && G.phase === 'main' && !me.hand.some((_, hi) => playOptions(G, 0, hi).length > 0);
    // anteprima: la carta sotto il mouse, o quella selezionata per giocarla
    const hov = me.hand.find(x => x.hid === hoverHid) ?? (sel?.kind === 'hand' ? me.hand[sel.hi] : undefined);
    return (
        <div className={s.dock}>
            <CrystalPool cur={me.crystals} max={me.maxC} hint={G.active === 0 && hov ? costOf(G, 0, hov) : null}
                         offer={!!hov && canOffer(G, 0, hov.id)}/>
            {/* lastra: oro pieno quando tocca a te, pietra spenta nel turno avversario; sotto, il tempo che scorre */}
            <div className={s.endWrap}>
                {(() => {
                    // con due o più unità pronte: un tocco solo per mandarle tutte in guardia o tutte all'attacco
                    const ready = my && G.phase === 'main' ? me.board.flatMap((B, l) => B.filter(u => readyToAttack(G, 0, l, u))) : [];
                    if (ready.length < 2) return <span className={s.guardAllSpace} aria-hidden="true"/>;
                    const anyAttacking = ready.some(u => !u.guard);
                    return <button className={`${s.guardAll} ${anyAttacking ? '' : s.guardAllOn}`} onClick={() => b().guardAll(anyAttacking)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">{anyAttacking
                            ? <path d="M12 2.5 4.5 5.5v5.8c0 4.7 3.2 8.7 7.5 10.2 4.3-1.5 7.5-5.5 7.5-10.2V5.5Z"/>
                            : SWORD}</svg>
                        {anyAttacking ? t('Tutti in guardia', 'All on guard') : t("Tutti all'attacco", 'All attack')}
                    </button>;
                })()}
                <motion.button className={`${s.endTurn} ${stuck ? s.endReady : ''}`} data-tut="end" disabled={!my || G.phase !== 'main'}
                               onClick={() => b().endTurn()} animate={endCtl}
                               whileHover={{y: -2}} whileTap={{y: 1, scale: 0.98}}>
                    <b>{G.active === 0 ? t('Fine turno', 'End turn') : t('Attendi', 'Wait')}</b>
                    <small>{G.active !== 0 ? t('Turno avversario', "Opponent's turn") : stuck ? t('Nessuna mossa', 'No moves left') : (me.crystals === 1 ? t('1 Cristallo', '1 Crystal') : t(`${me.crystals} Cristalli`, `${me.crystals} Crystals`))}</small>
                </motion.button>
                <TurnClock G={G}/>
            </div>
        </div>
    );
}

const fmt = (ms: number) => {
    const t = Math.ceil(ms / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

/** Barra sotto Fine turno: blu per il tempo del turno, arancione quando si usa la riserva, rosso negli ultimi 10 secondi.
 * Nel turno avversario resta lo spazio vuoto, così il pulsante non si sposta. */
function TurnClock({G}: { G: Game }) {
    const timed = useBattle(st => st.timed), tl = useBattle(st => st.turnLeft), rl = useBattle(st => st.reserveLeft);
    const on = timed && G.active === 0 && G.winner == null;
    const inRes = tl <= 0, frac = inRes ? rl / reserveMs() : tl / turnMs(), left = inRes ? rl : tl;
    return (
        <div className={`${s.endBar} ${!on ? s.endBarOff : left <= 10000 ? s.clockLow : inRes ? s.clockRes : ''}`} aria-hidden="true">
            <i style={{transform: `scaleX(${on ? Math.max(0, frac) : 0})`}}/>
        </div>
    );
}

/** Barra del tempo: lunga e colorata (blu il turno, arancio la riserva, rosso negli ultimi 10 secondi). */
function TurnTimer({G}: { G: Game }) {
    const timed = useBattle(st => st.timed), tl = useBattle(st => st.turnLeft), rl = useBattle(st => st.reserveLeft);
    const t = useT();
    if (!timed) return null;
    const my = G.active === 0 && G.winner == null, inRes = tl <= 0, left = inRes ? rl : tl;
    const frac = my ? Math.max(0, inRes ? rl / reserveMs() : tl / turnMs()) : 1;
    const cls = !my ? s.tOpp : left <= 10000 ? s.tLow : inRes ? s.tRes : '';
    return (
        <div className={`${s.timer} ${cls}`} aria-live="off">
            <div className={s.timerTop}>
                <b>{my ? fmt(left) : t('Turno avversario', "Opponent's turn")}</b>
                {my && <span>{inRes ? t('riserva', 'reserve') : t('tempo del turno', 'turn time')}</span>}
                <em title={t('Tempo extra unico per tutta la partita: si consuma quando finisce il tempo del turno e non si ricarica', 'One-time extra time for the whole match: it is used up when the turn timer runs out and never recharges')}>
                    {t('Riserva partita', 'Match reserve')} {fmt(rl)}</em>
            </div>
            <div className={s.timerBar}><i style={{transform: `scaleX(${frac})`}}/></div>
        </div>
    );
}

/** Striscia del turno, sotto il tavolo a sinistra: numero del turno e tempo. */
export function TurnBand({G}: { G: Game }) {
    const t = useT();
    // un round = un turno a testa: il contatore conta i round, come lo pensa il giocatore
    const round = Math.max(1, Math.ceil(G.turn / 2));
    return (
        <div className={s.band}>
            <div className={s.turnBadge} aria-label={t(`Turno ${round}`, `Turn ${round}`)}>
                <span>{t('Turno', 'Turn')}</span><motion.b key={round} initial={{scale: 1.6, opacity: 0}} animate={{scale: 1, opacity: 1}}>{round}</motion.b>
            </div>
            <TurnTimer G={G}/>
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
