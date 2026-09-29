import { useEffect, useState } from 'react';
import s from './tooltip.module.css';

/** Tooltip globale: qualsiasi elemento con data-tip mostra il testo al passaggio del mouse. Usato per parole chiave e sincronie. */
export function TooltipHost() {
  const [tip, setTip] = useState<{ text: string; title?: string; x: number; y: number } | null>(null);
  useEffect(() => {
    const over = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.('[data-tip]') as HTMLElement | null;
      if (!el) { setTip(null); return; }
      const r = el.getBoundingClientRect();
      setTip({ text: el.dataset.tip ?? '', title: el.dataset.tipTitle, x: r.left + r.width / 2, y: r.top });
    };
    const hide = () => setTip(null);
    document.addEventListener('pointerover', over); document.addEventListener('pointerdown', hide); window.addEventListener('scroll', hide, true);
    return () => { document.removeEventListener('pointerover', over); document.removeEventListener('pointerdown', hide); window.removeEventListener('scroll', hide, true); };
  }, []);
  if (!tip || !tip.text) return null;
  const left = Math.max(150, Math.min(window.innerWidth - 150, tip.x)), above = tip.y > 140;
  return (
    <div className={s.tip} role="tooltip" style={{ left, top: above ? tip.y - 8 : tip.y + 28, transform: above ? 'translate(-50%, -100%)' : 'translate(-50%, 0)' }}>
      {tip.title && <b>{tip.title}</b>}<span>{tip.text}</span>
    </div>
  );
}
