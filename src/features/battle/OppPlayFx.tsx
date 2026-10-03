import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import {readyToAttack} from '../../engine';
import {useT} from '../../i18n/lang';
import {useBattle} from './store';
import s from './battle.module.css';

type Rect = { x: number; y: number; w: number; h: number };
const rectOf = (sel?: string): Rect | null => {
    const r = sel ? document.querySelector(sel)?.getBoundingClientRect() : undefined;
    return r ? {x: r.left, y: r.top, w: r.width, h: r.height} : null;
};

/** Cosa ha fatto l'avversario, letto dai lettori di schermo: a video parlano la freccia e l'impatto. */
export function OppAnnouncer() {
    const opp = useBattle(st => st.opp), name = useBattle(st => st.G?.p[1].name ?? '');
    const t = useT();
    const text = !opp ? '' : opp.phase === 'reveal' ? t(`${name} gioca una carta`, `${name} plays a card`)
        : opp.phase === 'aim' ? `→ ${opp.aimLabel}` : (opp.lines ?? []).join('. ');
    return <div className={s.srOnly} aria-live="polite">{text}</div>;
}

/** Freccia dalla carta al bersaglio durante la mira, con il bersaglio che pulsa; all'esito, l'impatto sul bersaglio. */
export function OppAim() {
    const opp = useBattle(st => st.opp);
    const [pts, setPts] = useState<{ from: [number, number]; to: Rect } | null>(null);
    const [hit, setHit] = useState<{ r: Rect; tone: string; k: number } | null>(null);
    const aiming = opp?.phase === 'aim' && !!opp.aim;

    // la mira segue gli elementi anche se il tavolo si muove (animazioni, ridimensionamento)
    useEffect(() => {
        if (!aiming || !opp?.aim) {
            setPts(null);
            return;
        }
        const el = document.querySelector(opp.aim);
        el?.setAttribute('data-aim', opp.tone);
        let raf = 0;
        const tick = () => {
            const to = rectOf(opp.aim), card = document.getElementById('stack-card')?.getBoundingClientRect();
            // per gli spostamenti non c'è carta sulla pila: la freccia parte dall'alto del tavolo
            const from: [number, number] = card ? [card.left + card.width / 2, card.top + card.height * 0.35] : [window.innerWidth / 2, 80];
            if (to) setPts({from, to});
            raf = requestAnimationFrame(tick);
        };
        tick();
        return () => {
            cancelAnimationFrame(raf);
            el?.removeAttribute('data-aim');
        };
    }, [aiming, opp?.aim, opp?.tone]);

    // impatto: quando la giocata si risolve, un lampo sul punto colpito nel colore dell'effetto
    useEffect(() => {
        if (opp?.phase !== 'resolve' || !opp.aim) return;
        const r = rectOf(opp.aim);
        if (r) setHit({r, tone: opp.tone, k: Date.now()});
        const tm = setTimeout(() => setHit(null), 1100);
        return () => clearTimeout(tm);
    }, [opp?.phase, opp?.aim, opp?.tone]);

    const arrow = (() => {
        if (!pts || !opp) return null;
        const [x1, y1] = pts.from, x2 = pts.to.x + pts.to.w / 2, y2 = pts.to.y + pts.to.h / 2;
        const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 100, ang = Math.atan2(y2 - my, x2 - mx);
        const head = [[x2, y2], [x2 - 20 * Math.cos(ang - 0.45), y2 - 20 * Math.sin(ang - 0.45)], [x2 - 20 * Math.cos(ang + 0.45), y2 - 20 * Math.sin(ang + 0.45)]].map(p => p.join(',')).join(' ');
        // la linea finisce sotto la base della punta, così non sporge oltre il triangolo
        const d = `M${x1} ${y1} Q${mx} ${my} ${x2 - 16 * Math.cos(ang)} ${y2 - 16 * Math.sin(ang)}`;
        return (
            <svg className={`${s.arrow} ${s['oa-' + opp.tone]}`} aria-hidden="true">
                <motion.path d={d} className={s.arrowGlow} initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 0.45, ease: 'easeOut'}}/>
                <motion.path d={d} className={s.oppArrowLine} initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 0.45, ease: 'easeOut'}}/>
                <motion.polygon points={head} className={s.oppArrowHead} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.4}}/>
            </svg>
        );
    })();

    return <>
        {arrow}
        <AnimatePresence>
            {hit && <span key={hit.k} className={`${s.impact} ${s['im-' + hit.tone]}`} aria-hidden="true"
                          style={{left: hit.r.x + hit.r.w / 2, top: hit.r.y + hit.r.h / 2}}/>}
        </AnimatePresence>
    </>;
}

/** Nel tuo turno, una freccia tratteggiata da ogni tua unità al bersaglio che hai scelto per il suo attacco. */
export function MyAims() {
    const G = useBattle(st => st.G), busy = useBattle(st => st.busy);
    const [lines, setLines] = useState<{ k: string; d: string; head: string }[]>([]);
    useEffect(() => {
        const pairs = !G || G.active !== 0 || G.phase !== 'main' || busy ? [] : G.p[0].board.flatMap((B, l) =>
            B.filter(u => u.aim != null && !u.guard && readyToAttack(G, 0, l, u)).map(u => [u.uid, u.aim!] as const));
        const draw = () => setLines(pairs.flatMap(([a, b]) => {
            const ra = rectOf(`[data-drop="unit:${a}"]`), rb = rectOf(`[data-drop="unit:${b}"]`);
            if (!ra || !rb) return [];
            const x1 = ra.x + ra.w / 2, y1 = ra.y + ra.h * 0.25, x2 = rb.x + rb.w / 2, y2 = rb.y + rb.h * 0.75;
            const mx = (x1 + x2) / 2 + (x1 === x2 ? 40 : 0), my = (y1 + y2) / 2;
            const ang = Math.atan2(y2 - my, x2 - mx);
            const head = [[x2, y2], [x2 - 14 * Math.cos(ang - 0.5), y2 - 14 * Math.sin(ang - 0.5)], [x2 - 14 * Math.cos(ang + 0.5), y2 - 14 * Math.sin(ang + 0.5)]].map(q => q.join(',')).join(' ');
            return [{k: `${a}-${b}`, d: `M${x1} ${y1} Q${mx} ${my} ${x2 - 11 * Math.cos(ang)} ${y2 - 11 * Math.sin(ang)}`, head}];
        }));
        draw();
        if (!pairs.length) return;
        // le carte si muovono (animazioni, ridimensionamento): le frecce le seguono
        const iv = setInterval(draw, 300);
        return () => clearInterval(iv);
    }, [G, busy]);
    if (!lines.length) return null;
    return (
        <svg className={s.arrow} aria-hidden="true">
            {lines.map(l => <g key={l.k} className={s.myAim}>
                <path d={l.d}/>
                <polygon points={l.head}/>
            </g>)}
        </svg>
    );
}
