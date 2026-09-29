// Codici mazzo: un mazzo intero in una riga di testo da copiare e incollare.
import { BYID, FACTIONS } from '../engine/cards';
import { CUSTODI, type CustodeId } from '../engine/mechanics';
import type { Faction } from '../engine/types';
import type { Deck } from './decks';

export function encodeDeck(d: Deck) {
  const counts: Record<string, number> = {}; d.cards.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const body = { n: d.name, f: d.fac, c: d.custode ?? null, d: counts };
  return 'RDECK1:' + btoa(unescape(encodeURIComponent(JSON.stringify(body))));
}
export function decodeDeck(code: string): Omit<Deck, 'id'> | null {
  try {
    const t = code.trim(); if (!t.startsWith('RDECK1:')) return null;
    const b = JSON.parse(decodeURIComponent(escape(atob(t.slice(7))))) as { n?: string; f?: string[]; c?: string | null; d?: Record<string, number> };
    const cards: string[] = [];
    for (const [id, n] of Object.entries(b.d ?? {})) if (BYID[id]) for (let i = 0; i < Math.min(2, Math.max(0, Number(n) || 0)); i++) cards.push(id);
    if (!cards.length) return null;
    const fac = (b.f ?? []).filter((f): f is Faction => f in FACTIONS).slice(0, 2);
    return { name: String(b.n ?? 'Mazzo importato').slice(0, 32), fac, custode: b.c && b.c in CUSTODI ? (b.c as CustodeId) : null, cards: cards.slice(0, 30) };
  } catch { return null; }
}
