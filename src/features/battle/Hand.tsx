import {AnimatePresence, motion} from 'framer-motion';
import {useState} from 'react';
import {BYID, costOf, type Game, playOptions} from '../../engine';
import {Card} from '../../cards/Card';
import {lookOf, useProfile} from '../../profile/store';
import {dropAt, pointOf} from './dnd';
import {useBattle} from './store';
import {CardBack} from './CardBack';
import {sfx} from '../../audio/sfx';
import s from './battle.module.css';

/** Mano del giocatore a ventaglio: passa sopra per ingrandire, trascina per giocare o tocca per selezionare. */
export function Hand({G}: { G: Game }) {
    const pending = useBattle(st => st.pending), sel = useBattle(st => st.sel), busy = useBattle(st => st.busy),
        lens = useBattle(st => st.lens);
    const profile = useProfile();
    const [hover, setHover] = useState<number | null>(null);
    const b = useBattle.getState;
    const cards = G.p[0].hand.map((h, hi) => ({h, hi})).filter(x => x.h.hid !== pending);
    const n = cards.length, my = G.active === 0 && G.phase === 'main' && !busy && G.winner == null;
    const hv = hover != null ? G.p[0].hand.find(x => x.hid === hover) : undefined;
    return (
        <div className={s.hand} data-tut="hand">
            {hv && pending == null &&
                <div className={s.handZoom} aria-hidden="true"><Card card={BYID[hv.id]} cost={costOf(G, 0, hv)}
                                                                     look={lookOf(profile, hv.id)}/></div>}
            <AnimatePresence>
                {cards.map(({h, hi}, i) => {
                    const off = i - (n - 1) / 2, c = BYID[h.id], ok = my && playOptions(G, 0, hi).length > 0;
                    const isSel = sel?.kind === 'hand' && sel.hid === h.hid, up = hover === h.hid || isSel;
                    return (
                        <motion.div key={h.hid} layoutId={`card-${h.hid}`}
                                    className={`${s.handCard} ${ok ? s.playable : ''}`} data-tut={`hand:${h.id}`}
                                    style={{zIndex: up ? 50 : 10 + i}}
                                    initial={{opacity: 0, y: 120, x: 300, rotate: 20}}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        y: up ? -14 : Math.abs(off) * Math.abs(off) * 2,
                                        rotate: up ? 0 : off * 2.5,
                                        scale: up ? 1.04 : 1
                                    }}
                                    exit={{opacity: 0, y: -80, transition: {duration: 0.25}}}
                                    transition={{type: 'spring', stiffness: 380, damping: 30}}
                                    drag={ok && !lens} dragSnapToOrigin dragElastic={0.9}
                                    whileDrag={{scale: 1.1, rotate: 0, zIndex: 100}}
                                    onHoverStart={() => {
                                        setHover(h.hid);
                                        sfx('hover');
                                    }} onHoverEnd={() => setHover(x => (x === h.hid ? null : x))}
                                    onDragStart={() => {
                                        setHover(null);
                                        b().setDragging(h.hid);
                                    }}
                                    onDragEnd={e => {
                                        const [x, y] = pointOf(e as PointerEvent);
                                        const d = dropAt(x, y);
                                        const above = y < window.innerHeight - 190;
                                        b().dropHand(hi, d ?? (above ? 'field:0' : null));
                                    }}
                                    onClick={() => (b().lens ? b().inspect({
                                        id: h.id,
                                        cost: costOf(G, 0, h),
                                        p: 0
                                    }) : b().selectHand(hi))}
                                    onContextMenu={e => {
                                        e.preventDefault();
                                        b().inspect({id: h.id, cost: costOf(G, 0, h), p: 0});
                                    }}
                                    role="button" tabIndex={0} aria-label={`${c.n}, costo ${costOf(G, 0, h)}`}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') b().selectHand(hi);
                                    }}>
                            <Card card={c} cost={costOf(G, 0, h)} look={lookOf(profile, h.id)}/>
                            {h.known && <span className={s.eyeMine} title="L'avversario conosce questa carta">👁</span>}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

export function OppHand({G}: { G: Game }) {
    const pending = useBattle(st => st.pending);
    const cards = G.p[1].hand.filter(h => h.hid !== pending), n = cards.length;
    return (
        <div className={s.oppHand} style={{['--ov' as string]: Math.min(0.78, 0.42 + Math.max(0, n - 5) * 0.07)}}
             aria-label={`L'avversario ha ${G.p[1].hand.length} carte in mano`}>
            <AnimatePresence>
                {cards.map((h, i) => {
                    const off = i - (n - 1) / 2;
                    return (
                        <motion.div key={h.hid} layoutId={`card-${h.hid}`}
                                    className={`${s.oppCard} ${h.known ? s.known : ''}`} initial={{opacity: 0, y: -60}}
                                    animate={{
                                        opacity: 1,
                                        y: (h.known ? 26 : 0) - Math.abs(off) * Math.abs(off) * 2,
                                        rotate: -off * 4
                                    }} exit={{opacity: 0}}
                                    onMouseEnter={h.known ? e => {
                                        const r = e.currentTarget.getBoundingClientRect();
                                        useBattle.getState().setPreview({
                                            id: h.id,
                                            rect: {x: r.left, y: r.top + 40, w: r.width, h: r.height}
                                        });
                                    } : undefined}
                                    onMouseLeave={h.known ? () => useBattle.getState().setPreview(null) : undefined}
                                    onClick={h.known ? () => useBattle.getState().inspect({id: h.id, p: 1}) : undefined}
                                    title={h.known ? `${BYID[h.id].n} (rivelata)` : undefined}>
                            {h.known ? <><Card card={BYID[h.id]} cost={costOf(G, 1, h)}/><span className={s.eye}
                                                                                               aria-hidden="true">👁</span></> :
                                <CardBack back="cera"/>}
                        </motion.div>);
                })}
            </AnimatePresence>
            <span
                className={s.oppCount}>{G.p[1].hand.length === 1 ? '1 carta' : `${G.p[1].hand.length} carte`}{cards.some(x => x.known) ? `, ${cards.filter(x => x.known).length} rivelate` : ''}</span>
        </div>
    );
}
