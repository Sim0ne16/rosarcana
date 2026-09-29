// Stima del tempo per completare il Set Base senza pagare: simula un giocatore giorno per giorno.
import { BY_RARITY, CARDS, RARITY } from '../engine/cards';
import { FIRST_WIN_ORO, LOSS_ORO, PACK_ORO, PASS_FREE, QUEST_POOL, WIN_ORO, XP_LVL } from './constants';
import { starterOwned } from './decks';
import { openPack, type PackState } from './packs';

export interface EconomyInput { gamesPerDay: number; winRate: number; questShare: number; maxDays?: number }
export interface EconomyResult { days: number | null; oroPerDay: number; packsFirst30: number; half: number | null; complete: boolean }

export function simulateEconomy(inp: EconomyInput, runs = 20): EconomyResult {
  const all: number[] = [], halves: number[] = []; let oroSum = 0, packs30 = 0;
  const avgQuest = QUEST_POOL.reduce((a, q) => a + q.oro, 0) / QUEST_POOL.length;
  for (let r = 0; r < runs; r++) {
    const s: PackState = { owned: starterOwned(), foil: {}, polvere: 0, pity: 0, opened: 0, everLeg: false };
    let oro = 300, packs = 3, xp = 0, claimed = 0, half: number | null = null, done: number | null = null;
    const total = CARDS.reduce((a, c) => a + RARITY[c.r].max, 0);
    for (let day = 1; day <= (inp.maxDays ?? 365); day++) {
      const wins = Math.round(inp.gamesPerDay * inp.winRate), losses = inp.gamesPerDay - wins;
      const dayOro = wins * WIN_ORO + losses * LOSS_ORO + (wins > 0 ? FIRST_WIN_ORO : 0) + Math.round(3 * avgQuest * inp.questShare);
      oro += dayOro; if (r === 0) oroSum += dayOro;
      xp += wins * 120 + losses * 70;
      // pass gratuito (stagione di 8 settimane: il pass ricomincia)
      const lvl = Math.min(PASS_FREE.length, Math.floor(xp / XP_LVL));
      while (claimed < lvl) { const rw = PASS_FREE[claimed++]; oro += rw.oro ?? 0; s.polvere += rw.polvere ?? 0; packs += rw.pack ?? 0; if (rw.legChoice) { const miss = BY_RARITY.l.find(c => !s.owned[c.id]); if (miss) s.owned[miss.id] = 1; else s.polvere += 1600; } }
      if (day % 56 === 0) { xp = 0; claimed = 0; }
      packs += Math.floor(oro / PACK_ORO); oro %= PACK_ORO;
      while (packs > 0) { openPack(s); packs--; if (day <= 30 && r === 0) packs30++; }
      // crea le carte mancanti con la polvere, dalle più economiche
      for (const c of [...CARDS].sort((a, b) => RARITY[a.r].craft - RARITY[b.r].craft)) while ((s.owned[c.id] || 0) < RARITY[c.r].max && s.polvere >= RARITY[c.r].craft) { s.polvere -= RARITY[c.r].craft; s.owned[c.id] = (s.owned[c.id] || 0) + 1; }
      const have = CARDS.reduce((a, c) => a + Math.min(s.owned[c.id] || 0, RARITY[c.r].max), 0);
      if (half == null && have >= total * 0.75) half = day;
      if (have >= total) { done = day; break; }
    }
    if (done != null) all.push(done); if (half != null) halves.push(half);
  }
  const med = (a: number[]) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
  return { days: med(all), half: med(halves), oroPerDay: Math.round(oroSum / (inp.maxDays ?? 365)), packsFirst30: packs30, complete: all.length === runs };
}
