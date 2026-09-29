import {useEffect, useState} from 'react';
import {useBattle} from './store';
import s from './battle.module.css';

/** Barra del replay: scorri la partita mossa per mossa. */
export function ReplayBar() {
    const r = useBattle(st => st.replay);
    const b = useBattle.getState;
    const [play, setPlay] = useState(false);
    useEffect(() => {
        if (!play || !r) return;
        if (r.i >= r.n - 1) {
            setPlay(false);
            return;
        }
        const t = setTimeout(() => b().replayGo(r.i + 1), 700);
        return () => clearTimeout(t);
    }, [play, r, b]);
    useEffect(() => {
        const k = (e: KeyboardEvent) => {
            const x = b().replay;
            if (!x) return;
            if (e.key === 'ArrowRight') b().replayGo(x.i + 1);
            if (e.key === 'ArrowLeft') b().replayGo(x.i - 1);
            if (e.key === ' ') {
                e.preventDefault();
                setPlay(p => !p);
            }
        };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [b]);
    if (!r) return null;
    return (
        <div className={s.replay} role="region" aria-label="Replay">
            <div className={s.replayTop}><b>Replay</b><span>{r.title}</span><span
                className={s.replayStep}>Mossa {r.i + 1} di {r.n}</span></div>
            <p className={s.replayNote}>{r.note || '…'}</p>
            <div className={s.replayCtrl}>
                <button onClick={() => b().replayGo(0)} aria-label="Inizio">⏮</button>
                <button onClick={() => b().replayGo(r.i - 1)} aria-label="Indietro">◀</button>
                <button onClick={() => setPlay(p => !p)}
                        aria-label={play ? 'Pausa' : 'Riproduci'}>{play ? '⏸' : '▶'}</button>
                <button onClick={() => b().replayGo(r.i + 1)} aria-label="Avanti">▶▶</button>
                <input type="range" min={0} max={r.n - 1} value={r.i}
                       onChange={e => b().replayGo(Number(e.target.value))} aria-label="Posizione nel replay"/>
                <button className={s.replayExit} onClick={() => b().exit()}>Esci</button>
            </div>
        </div>
    );
}
