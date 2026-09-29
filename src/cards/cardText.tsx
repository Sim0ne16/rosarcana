// Presentazione del testo delle carte: parole chiave separate, inneschi evidenziati, icone di fazione e tipo.
import type { CardType, Faction, Keyword } from '../engine/types';
import { ICONS } from './art/icons.generated';

export const KW_SHORT: Record<Keyword, string> = {
  Rapido: 'attacca nel turno in cui entra', Guardiano: 'protegge le tue corsie accanto', Scossa: '+1 danno a un Sigillo accanto', Radicato: 'non può cambiare corsia',
  Eco: 'se muore torna in mano, costa +1', Assedio: 'danni doppi ai Sigilli', Cresce: '+1/+1 a ogni tuo turno',
  Aggirare: 'colpisce un Sigillo vicino scoperto', Veleno: 'distrugge ciò che ferisce', 'Linfa vitale': 'i suoi danni curano il Sigillo',
  Offerta: 'si paga con i punti vita dei Sigilli', Auspicio: '+1/+1 in una corsia con presagio',
};
export const TYPE_NOTE: Record<CardType, string> = {
  U: '', I: 'Effetto immediato, poi va nel cimitero.', R: 'Si posa su un tuo Sigillo e agisce finché resiste.',
};
const KW_RE = /\b(Rapido|Guardiano|Scossa|Radicato|Eco|Assedio|Cresce|Aggirare|Veleno|Linfa vitale|Offerta|Auspicio)\b/g;
const LEAD_KW = /^((Rapido|Guardiano|Scossa|Radicato|Eco|Assedio|Cresce|Aggirare|Veleno|Linfa vitale|Offerta \d|Auspicio)\.\s*)+/;
const TRIGGER = /(Rintocco:|Quando entra:|Quando muore:|Se muore in combattimento,|All'inizio del tuo turno, finché questo Sigillo è intatto:|All'inizio del tuo turno:|Alla fine del tuo turno:|Quando un'altra unità muore, tua o nemica:|Quando sacrifichi un'unità, finché questo Sigillo è intatto:|Finché questo Sigillo è intatto,|Finché è in gioco,)/;

/** Parole chiave della carta e testo restante (senza l'elenco iniziale di parole chiave). */
export function splitText(tx: string, kw: Keyword[]) { return { kws: kw, rest: tx.replace(LEAD_KW, '').trim() }; }
export function RichText({ text }: { text: string }) {
  return <>{text.split(TRIGGER).map((part, i) => i % 2
    ? <em key={i} className="trigger">{part}</em>
    : part.split(KW_RE).map((p, j) => (j % 2 ? <b key={i + '-' + j}>{p}</b> : p)))}</>;
}
export function Icon({ k, className, title }: { k: string; className?: string; title?: string }) {
  const d = ICONS[k]; if (!d) return null;
  return <svg viewBox="0 0 512 512" className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>{title && <title>{title}</title>}<path d={d} fill="currentColor" /></svg>;
}
export const facIcon = (f: Faction) => `fac-${f}`;
export const typeIcon = (t: CardType) => `type-${t}`;
export const kwIcon = (k: Keyword) => `kw-${k}`;
