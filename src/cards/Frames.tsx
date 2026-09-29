// Cornici: "vive" (animate, elementali) e di maestria (miniature da codice medievale che si arricchiscono a ogni grado).
import { memo } from 'react';
import s from './frames.module.css';


/** Cornice di maestria provvisoria (sobria) finché non arrivano le illustrazioni dedicate. */
export const Miniature = memo(function Miniature({ level }: { level: number }) {
  const col = ['#c9b48a', '#9fc4e6', '#e0b04a', '#6fd6b8', '#b48cff', '#ff8fb8'][level - 1];
  return (
    <svg className={s.mini} viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
      <rect x="1.2" y="1.2" width="97.6" height="137.6" rx="4.6" fill="none" stroke={col} strokeWidth="1.1" opacity=".9" />
      <g transform="translate(50 136.6)">{Array.from({ length: level }, (_, i) => <circle key={i} cx={(i - (level - 1) / 2) * 3.2} cy="0" r="1" fill={col} stroke="#0d0b11" strokeWidth=".3" />)}</g>
    </svg>
  );
});
/** Cornice da immagine (generata): centro trasparente, appoggiata sopra la carta. */
export const ImageFrame = memo(function ImageFrame({ src, hole }: { src: string; hole?: [number, number, number, number] }) {
  if (!hole) return <img className={s.imgFrame} src={src} alt="" draggable={false} />;
  // la carta occupa il foro della cornice (con un filo di sovrapposizione): la cornice resta tutta all'esterno
  const e = 0.006, [x0, y0, x1, y1] = hole, W = x1 - x0 - 2 * e, H = y1 - y0 - 2 * e;
  return <img className={s.imgFrameOut} src={src} alt="" draggable={false}
    style={{ width: `${100 / W}%`, height: `${100 / H}%`, left: `${(-(x0 + e) / W) * 100}%`, top: `${(-(y0 + e) / H) * 100}%` }} />;
});
