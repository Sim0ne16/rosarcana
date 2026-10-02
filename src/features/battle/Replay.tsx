import {useEffect, useMemo, useState} from 'react';
import {useLang, useT} from '../../i18n/lang';
import {logTexts} from '../../i18n/log';
import {useBattle} from './store';
import s from './battle.module.css';

/** Barra del replay: scorri la partita mossa per mossa. */
export function ReplayBar() {
    const r = useBattle(st => st.replay), G = useBattle(st => st.G);
    const lang = useLang();
    const fmt = useMemo(() => (G ? logTexts(G, lang) : null), [G, lang]);
    const last = G?.log[G.log.length - 1];
    const b = useBattle.getState;
    const [play, setPlay] = useState(false);
    const t = useT();
    useEffect(() => {
        if (!play || !r) return;
        if (r.i >= r.n - 1) {
            setPlay(false);
            return;
        }
        const tm = setTimeout(() => b().replayGo(r.i + 1), 700);
        return () => clearTimeout(tm);
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
                className={s.replayStep}>{t('Mossa', 'Move')} {r.i + 1} {t('di', 'of')} {r.n}</span></div>
            <p className={s.replayNote}>{last && fmt ? fmt(last) : '…'}</p>
            <div className={s.replayCtrl}>
                <button onClick={() => b().replayGo(0)} aria-label={t('Inizio', 'Start')}>⏮</button>
                <button onClick={() => b().replayGo(r.i - 1)} aria-label={t('Indietro', 'Back')}>◀</button>
                <button onClick={() => setPlay(p => !p)}
                        aria-label={play ? t('Pausa', 'Pause') : t('Riproduci', 'Play')}>{play ? '⏸' : '▶'}</button>
                <button onClick={() => b().replayGo(r.i + 1)} aria-label={t('Avanti', 'Forward')}>▶▶</button>
                <input type="range" min={0} max={r.n - 1} value={r.i}
                       onChange={e => b().replayGo(Number(e.target.value))}
                       aria-label={t('Posizione nel replay', 'Position in the replay')}/>
                <button className={s.replayExit} onClick={() => b().exit()}>{t('Esci', 'Exit')}</button>
            </div>
        </div>
    );
}
