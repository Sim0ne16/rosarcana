// Icone disegnate a mano per fazioni, tipi, statistiche e rarità (viewBox 24×24).
import type { CardType, Faction, Rarity } from '../engine/types';

export const FACTION_GLYPH: Record<Faction, JSX.Element> = {
  brace: <path fillRule="evenodd" d="M12 1.8c1.2 3.6 5.9 6.2 5.9 11.6a5.9 5.9 0 0 1-11.8 0c0-2.8 1.5-4.4 2.3-6.4.9 1.2 1.3 2.5 1.4 3.9 1.3-2.2 2.4-5.2 2.2-9.1Zm0 19.6c1.8 0 3.1-1.3 3.1-3.1 0-1.7-.8-2.8-1.6-3.9-.3 1.1-.8 1.9-1.5 2.5-.1-.9-.5-1.7-1.1-2.5-.7 1-2 2-2 3.9 0 1.8 1.3 3.1 3.1 3.1Z" />,
  marea: <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M2.5 8.5c2.4-2.6 4.8-2.6 7.2 0s4.8 2.6 7.2 0 3.6-2 4.6-1.2" /><path d="M2.5 13.5c2.4-2.6 4.8-2.6 7.2 0s4.8 2.6 7.2 0 3.6-2 4.6-1.2" /><path d="M2.5 18.5c2.4-2.6 4.8-2.6 7.2 0s4.8 2.6 7.2 0 3.6-2 4.6-1.2" /></g>,
  radice: <path d="M12 2.3a4.1 4.1 0 0 1 3.9 2.9 4 4 0 0 1 2.4 6.3 3.6 3.6 0 0 1-3.2 2H13v2.9l3.6 4.1h-2.8L12 18.4l-1.8 2.1H7.4l3.6-4.1v-2.9H8.9a3.6 3.6 0 0 1-3.2-2 4 4 0 0 1 2.4-6.3A4.1 4.1 0 0 1 12 2.3Z" />,
  vuoto: <><path fillRule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Zm1.6 2.3a7.6 7.6 0 1 1-8.2 11.1 8.1 8.1 0 0 0 8.2-11.1Z" /><path d="m17.6 5.2.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z" /></>,
};
export const TYPE_GLYPH: Record<CardType, JSX.Element> = {
  U: <path d="M12 2.2 20 5v6.3c0 5.1-3.4 8.9-8 10.5-4.6-1.6-8-5.4-8-10.5V5Zm0 3.1-4.8 1.7v4.3c0 3.2 1.9 5.9 4.8 7.3Z" fillRule="evenodd" />,
  I: <><path d="M11 2c.8 4.9 3.1 7.6 8.5 8.5-5.4.9-7.7 3.6-8.5 8.5-.8-4.9-3.1-7.6-8.5-8.5C7.9 9.6 10.2 6.9 11 2Z" /><path d="M18.5 14.5c.4 2 1.3 3.1 3.3 3.5-2 .4-2.9 1.5-3.3 3.5-.4-2-1.3-3.1-3.3-3.5 2-.4 2.9-1.5 3.3-3.5Z" /></>,
  R: <path d="M6.5 2.5h11c0 5-2.3 8.2-4.4 9.1v5l3.4 1.7v3.2h-9v-3.2l3.4-1.7v-5C8.8 10.7 6.5 7.5 6.5 2.5Zm2.3 1.9c.4 2.6 1.6 4.4 3.2 5.1 1.6-.7 2.8-2.5 3.2-5.1Z" fillRule="evenodd" />,
};
export const SWORD = <path d="M20.5 2.5 21.5 3.5 21 7 11.5 16.5 13 18l-1.5 1.5-2.2-2.2-3 3 .3 1.3-1.2 1.2-2.7-2.7 1.2-1.2 1.3.3 3-3-2.2-2.2L7.5 11l1.5 1.5L18.5 3Z" />;
export const HEART = <path d="M12 21S2.5 15.3 2.5 8.7A5 5 0 0 1 12 6a5 5 0 0 1 9.5 2.7C21.5 15.3 12 21 12 21Z" />;

export function Glyph({ children, className, title }: { children: JSX.Element; className?: string; title?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>{title && <title>{title}</title>}{children}</svg>;
}

/** Gemma di rarità: forma e colore diversi per ogni rarità, così si distingue anche senza colori. */
export function RarityGem({ r, className }: { r: Rarity; className?: string }) {
  const shape = r === 'c' ? <circle cx="12" cy="12" r="7.5" />
    : r === 'u' ? <path d="M12 3.5 20.5 12 12 20.5 3.5 12Z" />
    : r === 'r' ? <path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4Z" />
    : <path d="m12 2 2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.3l-5.8 3.5 1.6-6.6-5.2-4.4 6.8-.5Z" />;
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><g fill={`url(#rar-${r})`} stroke="#0d0b11" strokeWidth="1.6" strokeLinejoin="round">{shape}</g><g fill="none" stroke="rgba(255,255,255,.7)" strokeWidth=".9">{shape}</g></svg>;
}

/** Statistiche: cristallo (costo), spada (attacco), cuore (salute). */
export function StatGem({ kind, value, delta, className }: { kind: 'cost' | 'atk' | 'hp'; value: number; delta?: number; className?: string }) {
  const body = kind === 'cost'
    ? <><path d="M20 1.5 37 11v24L20 44.5 3 35V11Z" fill="url(#gemCost)" stroke="#07122e" strokeWidth="2.2" /><path d="M20 1.5v11M3 11l17 1.5L37 11M20 12.5 11 44M20 12.5 29 44" stroke="rgba(255,255,255,.28)" strokeWidth="1" fill="none" /><path d="M20 5 33 12.5v4L20 9Z" fill="rgba(255,255,255,.35)" /></>
    : kind === 'atk'
    ? <><circle cx="20" cy="23" r="18" fill="url(#gemAtk)" stroke="#2a1402" strokeWidth="2.2" /><g transform="translate(6 9) scale(1.15)" fill="rgba(60,25,0,.35)">{SWORD}</g><circle cx="20" cy="23" r="15" fill="none" stroke="rgba(255,240,200,.45)" strokeWidth="1" /></>
    : <><path d="M20 42S2.5 31.5 2.5 17.5A9.5 9.5 0 0 1 20 12a9.5 9.5 0 0 1 17.5 5.5C37.5 31.5 20 42 20 42Z" fill="url(#gemHp)" stroke="#3a0508" strokeWidth="2.2" /><path d="M9 14.5a6 6 0 0 1 7-.5" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" fill="none" strokeLinecap="round" /></>;
  return (
    <span className={className} data-delta={delta ? (delta > 0 ? 'up' : 'down') : undefined}>
      <svg viewBox="0 0 40 46" aria-hidden="true">{body}</svg>
      <b>{value}</b>
    </span>
  );
}
