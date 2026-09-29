// Estrazioni casuali dal Set Base per Draft e Spedizione.
import { CARDS, type CardDef, type Faction, type Rarity } from '../../engine';

const W: Record<Rarity, number> = { c: 58, u: 29, r: 11, l: 2 };
function weighted(pool: CardDef[], bias = 0) {
  const w = pool.map(c => W[c.r] * (c.r === 'r' || c.r === 'l' ? 1 + bias : 1));
  let x = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
/** n carte diverse, pesate per rarità; `bias` aumenta rare e leggendarie; `facs` limita le fazioni. */
export function pickOptions(n = 3, bias = 0, facs?: Faction[]) {
  const pool = CARDS.filter(c => !facs || facs.includes(c.f)), out: CardDef[] = [];
  while (out.length < n && out.length < pool.length) { const c = weighted(pool.filter(x => !out.includes(x)), bias); out.push(c); }
  return out.map(c => c.id);
}
export const shuffled = <T,>(a: T[]) => a.map(x => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(p => p[1]);
