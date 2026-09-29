import {useMemo} from 'react';
import s from './ambient.module.css';

/** Navata: fasci di luce dalle vetrate e pulviscolo sospeso. Solo decorativo. */
export function Ambient() {
    const motes = useMemo(() => Array.from({length: 26}, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        size: 1.5 + ((i * 7) % 5) * 0.6,
        dur: 14 + ((i * 13) % 17),
        delay: -((i * 5) % 20),
        drift: ((i * 11) % 40) - 20,
    })), []);
    return (
        <div className={s.ambient} aria-hidden="true">
            <div className={s.shafts}><i/><i/><i/></div>
            {motes.map((m, i) => <span key={i} className={s.mote} style={{
                left: m.left,
                width: m.size,
                height: m.size,
                animationDuration: `${m.dur}s`,
                animationDelay: `${m.delay}s`,
                ['--dx' as string]: `${m.drift}px`
            }}/>)}
        </div>
    );
}
