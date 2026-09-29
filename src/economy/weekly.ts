// Sfide della settimana: tre partite a regole speciali che cambiano ogni lunedì.
import type { CustodeId, OmenId } from '../engine';
export interface WeeklyRules { mySeal?: number; opSeal?: number; custodi?: [CustodeId, CustodeId]; omens?: OmenId[]; commonsOnly?: boolean; startC?: number }
export interface WeeklyChallenge { id: string; title: string; desc: string; rules: WeeklyRules }
export const WEEKLY_WINS = 3;
export const WEEKLY_REWARD = { oro: 100, gettoni: 1 };
const POOL: WeeklyChallenge[] = [
  { id: 'fragili', title: 'Sigilli fragili', desc: 'Tutti i Sigilli hanno solo 6 punti vita: vince chi colpisce per primo.', rules: { mySeal: 6, opSeal: 6 } },
  { id: 'ecate', title: 'Notte di Ecate', desc: 'Entrambi i giocatori hanno Ecate dei Crocevia come Custode.', rules: { custodi: ['ecate', 'ecate'] } },
  { id: 'comuni', title: 'Solo comuni', desc: 'Si gioca con le sole carte comuni delle fazioni del tuo mazzo.', rules: { commonsOnly: true } },
  { id: 'nebbia', title: 'Nebbia ovunque', desc: 'Tutte e tre le corsie hanno il presagio Nebbia: niente bersagli.', rules: { omens: ['nebbia', 'nebbia', 'nebbia'] } },
  { id: 'cristalli', title: 'Tempesta di Cristalli', desc: 'Si parte con 5 Cristalli: le carte grandi arrivano subito.', rules: { startC: 5 } },
  { id: 'eclissi', title: 'Eclissi totale', desc: 'Tutte le corsie hanno il presagio Eclissi: ogni colpo ai Sigilli fa 1 danno in più.', rules: { omens: ['eclissi', 'eclissi', 'eclissi'] } },
  { id: 'fortezze', title: 'Fortezze', desc: 'Sigilli da 14 punti vita e presagio Terra consacrata ovunque: partite lunghe.', rules: { mySeal: 14, opSeal: 14, omens: ['consacrata', 'consacrata', 'consacrata'] } },
];
/** Numero della settimana (cambia il lunedì). */
export const weekIndex = (now = Date.now()) => Math.floor((now - Date.UTC(2026, 0, 5)) / 604800000);
export const weeklyChallenges = (w = weekIndex()) => [0, 1, 2].map(k => POOL[(w * 3 + k) % POOL.length]);
export const daysToReset = (now = Date.now()) => { const next = Date.UTC(2026, 0, 5) + (weekIndex(now) + 1) * 604800000; return Math.max(1, Math.ceil((next - now) / 86400000)); };
