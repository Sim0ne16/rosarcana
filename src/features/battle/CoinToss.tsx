import {animate, AnimatePresence, motion, useMotionValue, useTransform} from 'framer-motion';
import {type ReactNode, useEffect, useState} from 'react';
import {useT} from '../../i18n/lang';
import {type CoinFace, useBattle} from './store';
import s from './battle.module.css';

/** Bordo battuto a mano: un cerchio appena irregolare, sempre uguale (niente casualità a ogni render). */
const EDGE = Array.from({length: 56}, (_, i) => {
    const a = (i / 56) * Math.PI * 2, r = 95 + Math.sin(i * 2.3) * 1.6 + Math.cos(i * 5.1) * 1.1;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
}).join(' ');
const BEADS = Array.from({length: 44}, (_, i) => {
    const a = (i / 44) * Math.PI * 2;
    return [Math.cos(a) * 70, Math.sin(a) * 70];
});

/** Croce lunga patente, come sui denari medievali. */
const CROSS = 'M-5,-52 L-11,-64 L11,-64 L5,-52 L5,-5 L52,-5 L64,-11 L64,11 L52,5 L5,5 L5,52 L11,64 L-11,64 L-5,52 L-5,5 L-52,5 L-64,11 L-64,-11 L-52,-5 L-5,-5 Z';
const PELLETS = [[1, 1], [1, -1], [-1, 1], [-1, -1]].flatMap(([x, y]) => [[x * 22, y * 22], [x * 36, y * 18], [x * 18, y * 36]]);
/** Corona a tre punte sopra la rosa. */
const CROWN = 'M-22,-30 L-22,-46 L-12,-38 L0,-52 L12,-38 L22,-46 L22,-30 Z';

/** Rilievo: la stessa forma due volte, un'ombra spostata in basso a destra e la parte in luce sopra. */
function Relief({children}: { children: ReactNode }) {
    return <>
        <g transform="translate(1.4 1.8)" fill="#5a3a0c" opacity=".75">{children}</g>
        <g fill="url(#coinRelief)" stroke="#7a5216" strokeWidth=".9">{children}</g>
    </>;
}

/** Una faccia della moneta: campo, perlinatura, iscrizione sul bordo e figura centrale. */
function CoinSide({side}: { side: CoinFace }) {
    const id = `coinText-${side}`;
    const legend = side === 'testa' ? '✠ ROSARCANA · REX · ROSARUM ✠' : '✠ TRIA · SIGILLA · FRANGE ✠';
    return (
        <svg viewBox="-100 -100 200 200" className={s.coinSvg}>
            <defs>
                <radialGradient id="coinGold" cx="38%" cy="32%" r="75%">
                    <stop offset="0" stopColor="#fbe7aa"/>
                    <stop offset=".45" stopColor="#dcae55"/>
                    <stop offset=".8" stopColor="#a8741f"/>
                    <stop offset="1" stopColor="#6b4612"/>
                </radialGradient>
                <linearGradient id="coinRelief" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff0bf"/>
                    <stop offset="1" stopColor="#c08a2c"/>
                </linearGradient>
                <path id={id} d="M0,-81 A81,81 0 1 1 -0.1,-81"/>
            </defs>
            {/* tondello battuto, con il bordo appena irregolare e un orlo più scuro */}
            <polygon points={EDGE} fill="url(#coinGold)" stroke="#5a3a0c" strokeWidth="2.4"/>
            <circle r="89" fill="none" stroke="#7a5216" strokeWidth="1.1" opacity=".7"/>
            <text fontSize="12.5" fontFamily="Cinzel, Georgia, serif" fontWeight="700" letterSpacing="2.2" fill="#5a3a0c">
                <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{legend}</textPath>
            </text>
            {BEADS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.3" fill="#6b4612"/>)}
            <circle r="65" fill="none" stroke="#7a5216" strokeWidth="1" opacity=".6"/>
            {side === 'testa' ? (
                <Relief>
                    <path d={CROWN}/>
                    {/* rosa a cinque petali */}
                    {[0, 1, 2, 3, 4].map(k => {
                        const a = -Math.PI / 2 + (k * Math.PI * 2) / 5;
                        return <circle key={k} cx={Math.cos(a) * 15} cy={8 + Math.sin(a) * 15} r="13"/>;
                    })}
                    <circle cy="8" r="8"/>
                </Relief>
            ) : (
                <Relief>
                    <path d={CROSS}/>
                    {PELLETS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5"/>)}
                </Relief>
            )}
            {/* usura: un velo più chiaro sul rilievo in alto a sinistra */}
            <ellipse cx="-30" cy="-34" rx="48" ry="30" fill="#fff6d8" opacity=".12"/>
        </svg>
    );
}

/** Testa o croce a inizio partita: un giocatore a caso chiama (tu hai 5 secondi), la moneta salta e gira, chi indovina inizia. */
export function CoinToss() {
    const toss = useBattle(st => st.toss), opp = useBattle(st => st.G?.p[1].name ?? '');
    const t = useT();
    const b = useBattle.getState;
    // rotazione della moneta: la faccia visibile si decide dall'angolo, senza dipendere dal 3D del CSS
    const rot = useMotionValue(0);
    const norm = (v: number) => ((v % 360) + 360) % 360;
    const headsOp = useTransform(rot, v => (norm(v) < 90 || norm(v) > 270 ? 1 : 0));
    const tailsOp = useTransform(rot, v => (norm(v) < 90 || norm(v) > 270 ? 0 : 1));
    // secondi rimasti per chiamare
    const [left, setLeft] = useState(5);
    const waiting = toss?.phase === 'call' && toss.caller === 0 && !toss.call && toss.until != null;
    const until = toss?.until;
    useEffect(() => {
        if (!waiting || until == null) return;
        const tick = () => setLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
        tick();
        const iv = setInterval(tick, 200);
        return () => clearInterval(iv);
    }, [waiting, until]);

    useEffect(() => {
        if (toss?.phase !== 'flip') return;
        rot.set(0);
        // cinque giri e mezzo (o cinque) per atterrare sulla faccia uscita
        const c = animate(rot, 360 * 5 + (toss.result === 'croce' ? 180 : 0), {duration: 1.9, ease: [0.15, 0.6, 0.3, 1]});
        return () => c.stop();
    }, [toss?.phase, toss?.result, rot]);

    const face = (f: CoinFace | null) => (f === 'testa' ? t('Testa', 'Heads') : t('Croce', 'Tails'));
    const winner = toss?.first === 0;
    return (
        <AnimatePresence>
            {toss && (
                <motion.div className={s.toss} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0, transition: {duration: 0.35}}}
                            role="dialog" aria-label={t('Testa o croce', 'Heads or tails')}>
                    <div className={s.tossBox}>
                        <h2>{t('Testa o croce', 'Heads or tails')}</h2>
                        <p>{toss.caller === 0
                            ? (toss.call ? <>{t('Hai chiamato', 'You called')} <b>{face(toss.call)}</b></> : t('Il sorteggio ha scelto te: chiama la moneta.', 'The draw picked you: call the coin.'))
                            : (toss.call ? <>{opp} {t('chiama', 'calls')} <b>{face(toss.call)}</b></> : t(`Il sorteggio ha scelto ${opp}: sta chiamando…`, `The draw picked ${opp}: calling…`))}</p>
                        <div className={s.coinStage} aria-hidden="true">
                            <motion.div animate={toss.phase === 'flip' ? {y: [0, -95, -95, 0], scale: [1, 1.12, 1.12, 1]} : {y: 0}}
                                        transition={{duration: 1.9, times: [0, 0.35, 0.6, 1], ease: 'easeInOut'}}>
                                <motion.div className={s.coin} style={{rotateX: rot}}>
                                    <motion.div className={s.coinFace} style={{opacity: headsOp}}><CoinSide side="testa"/></motion.div>
                                    <motion.div className={`${s.coinFace} ${s.coinTails}`} style={{opacity: tailsOp}}><CoinSide side="croce"/></motion.div>
                                </motion.div>
                            </motion.div>
                        </div>
                        <motion.div className={s.coinShadow} aria-hidden="true"
                                    animate={toss.phase === 'flip' ? {scale: [1, 0.55, 0.55, 1], opacity: [1, 0.4, 0.4, 1]} : {scale: 1}}
                                    transition={{duration: 1.9, times: [0, 0.35, 0.6, 1]}}/>
                        {/* sotto la moneta: la faccia uscita, incisa su una targhetta */}
                        <div className={s.coinLabel}>
                            {toss.phase === 'done' &&
                                <motion.span initial={{opacity: 0, y: -6}} animate={{opacity: 1, y: 0}}>{face(toss.result)}</motion.span>}
                        </div>
                        {waiting && (
                            <>
                                <div className={s.tossBtns}>
                                    <button onClick={() => b().chooseToss('testa')}>{t('Testa', 'Heads')}</button>
                                    <button onClick={() => b().chooseToss('croce')}>{t('Croce', 'Tails')}</button>
                                </div>
                                <div className={s.tossTimer} aria-live="off">
                                    <motion.i initial={{scaleX: 1}} animate={{scaleX: 0}}
                                              transition={{duration: Math.max(0, ((until ?? 0) - Date.now()) / 1000), ease: 'linear'}}/>
                                    <span>{t(`${left} s, poi sceglie la sorte`, `${left} s, then fate decides`)}</span>
                                </div>
                            </>
                        )}
                        {toss.phase === 'done' && (
                            <motion.div initial={{scale: 0.6, opacity: 0}} animate={{scale: 1, opacity: 1}} aria-live="polite"
                                        className={winner ? s.tossWin : s.tossLose}>
                                {winner ? t('Inizi tu.', 'You go first.') : t(`Inizia ${opp}.`, `${opp} goes first.`)}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
