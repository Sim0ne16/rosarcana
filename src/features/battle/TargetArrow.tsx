import {useEffect, useState} from 'react';
import {useBattle} from './store';
import s from './battle.module.css';

/** Freccia di mira dalla carta sulla pila al puntatore. */
export function TargetArrow() {
    const active = useBattle(st => st.sel?.kind === 'hand' && st.sel.step === 'target' && !!st.stack?.targeting);
    const [pt, setPt] = useState<[number, number] | null>(null);
    const [from, setFrom] = useState<[number, number] | null>(null);
    useEffect(() => {
        if (!active) {
            setPt(null);
            return;
        }
        let raf = 0;
        const move = (e: PointerEvent) => setPt([e.clientX, e.clientY]);
        const tick = () => {
            const el = document.getElementById('stack-card');
            if (el) {
                const r = el.getBoundingClientRect();
                setFrom([r.left + r.width / 2, r.top + r.height * 0.3]);
            }
            raf = requestAnimationFrame(tick);
        };
        window.addEventListener('pointermove', move);
        tick();
        return () => {
            window.removeEventListener('pointermove', move);
            cancelAnimationFrame(raf);
        };
    }, [active]);
    if (!active || !pt || !from) return null;
    const [x1, y1] = from, [x2, y2] = pt, mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 120;
    const ang = Math.atan2(y2 - my, x2 - mx);
    const head = [[x2, y2], [x2 - 22 * Math.cos(ang - 0.45), y2 - 22 * Math.sin(ang - 0.45)], [x2 - 22 * Math.cos(ang + 0.45), y2 - 22 * Math.sin(ang + 0.45)]].map(p => p.join(',')).join(' ');
    return (
        <svg className={s.arrow} aria-hidden="true">
            <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} className={s.arrowGlow}/>
            <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} className={s.arrowLine}/>
            <polygon points={head} className={s.arrowHead}/>
        </svg>
    );
}
