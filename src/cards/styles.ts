import { hasIllustration } from './art/illustrations';
import { RARITY } from '../engine/cards';
import type { Rarity } from '../engine/types';

export type ArtStyle = 'vetrata' | 'dipinta' | 'incisione' | 'illustrata';
/** Stili che usano l'illustrazione AI quando esiste (altrimenti la pittura procedurale). */
export const AI_FRAMED: ArtStyle[] = ['illustrata'];
export const ART_STYLES: Record<ArtStyle, { name: string; desc: string; cost: number }> = {
  dipinta:    { name: 'Dipinta',    desc: 'Pittura a olio: pennellate, controluce e trama della tela. Sempre disponibile.', cost: 0 },
  vetrata:    { name: 'Vetrata',    desc: 'Vetro colorato e piombature in un arco gotico. Sempre disponibile.', cost: 0 },
  incisione:  { name: 'Incisione',  desc: 'Inchiostro su pergamena, tratteggio da xilografia.', cost: 150 },
  illustrata: { name: 'Illustrata', desc: 'Illustrazione generata con AI, a tutta carta. Gratuita quando è disponibile.', cost: 0 },
};
/* ---------- Effetti: animazioni sovrapposte alla carta (reagiscono al puntatore) ---------- */
export type EffectId = 'orofuso' | 'alone' | 'luce';
export const FX: Record<EffectId, { name: string; desc: string; cost: (r: Rarity) => number }> = {
  orofuso: { name: 'Oro fuso', desc: "Una colata d'oro scorre sulla carta con bagliori caldi. Gratis al grado di maestria Leggenda.", cost: () => 500 },
  alone:   { name: 'Alone',    desc: 'Un alone del colore della fazione pulsa lentamente attorno alla carta. Gratis al grado Custode.', cost: () => 250 },
  luce:    { name: 'Luce radente', desc: "Ogni tanto un filo di luce attraversa la carta, come un riflesso su una vetrata. Esce anche nelle bustine.", cost: r => RARITY[r].craft * 2 },
};
/** Livelli di maestria che regalano un effetto sulla carta. */
export const FX_BY_MASTERY: Partial<Record<EffectId, number>> = { alone: 3, orofuso: 6 };
/* ---------- Cornici ---------- */
export const MASTERY_NAMES = ['Apprendista', 'Adepto', 'Custode', 'Maestro', 'Gran Maestro', 'Leggenda'];
export type MasteryFrame = `maestria-${1 | 2 | 3 | 4 | 5 | 6}`;
/** Cornici acquistabili: compaiono nel gioco quando esiste la loro illustrazione (frame-<id>). */
export type LivingFrame = 'rosone' | 'fornace' | 'corallo' | 'radici' | 'notte' | 'reliquia';
export type FrameId = LivingFrame | MasteryFrame;
export const FRAMES: Record<FrameId, { name: string; desc: string; cost?: number; level?: number }> = {
  rosone:   { name: 'Rosone',            desc: 'Vetrate della Cattedrale legate a piombo, nei colori delle quattro Casate.', cost: 500 },
  fornace:  { name: 'Fornace',           desc: 'Ferro battuto e braci che ardono tra le giunture.', cost: 500 },
  corallo:  { name: 'Corallo e perle',   desc: 'Corallo delle rovine di Atlantide con perle incastonate.', cost: 500 },
  radici:   { name: 'Legno vivo',        desc: 'Radici intrecciate, muschio e piccoli fiori luminosi.', cost: 500 },
  notte:    { name: 'Ossidiana stellata', desc: 'Vetro vulcanico nero punteggiato di stelle.', cost: 500 },
  reliquia: { name: 'Reliquiario',       desc: "Oro lavorato e gemme, come il reliquiario dell'altare maggiore.", cost: 800 },
  ...(Object.fromEntries(MASTERY_NAMES.map((n, i) => [`maestria-${i + 1}`, { name: `Maestria ${n}`, desc: `Cornice di maestria del grado ${n}: si ottiene giocando questa carta e completando le sue sfide.`, level: i + 1 }])) as Record<MasteryFrame, { name: string; desc: string; level: number }>),
};
export const CRAFT_FRAMES: FrameId[] = ['rosone', 'fornace', 'corallo', 'radici', 'notte', 'reliquia'];
/** Cornici ritirate: chi le possedeva riceve indietro la polvere. */
export const RETIRED_FRAMES: Record<string, number> = { argento: 150, oro: 300, diamante: 800, gotica: 450, nouveau: 450, ossidiana: 500, vetrata: 600, fiamme: 400, aurea: 600, maree: 400, rovi: 400, nebbia: 400, brina: 500 };
export const MASTERY_FRAMES = MASTERY_NAMES.map((_, i) => `maestria-${i + 1}` as FrameId);
export interface CardLook { art: ArtStyle; effect: EffectId | null; frame: FrameId | null }
export const FREE_STYLES: ArtStyle[] = ['dipinta', 'vetrata'];
export const DEFAULT_ART: ArtStyle = 'dipinta';
/** Stile predefinito della singola carta: l'illustrazione AI se esiste, altrimenti la pittura procedurale. */
export const defaultArt = (id: string): ArtStyle => (hasIllustration(id) ? 'illustrata' : DEFAULT_ART);
/** Stili sempre disponibili per una carta. */
export const freeStyles = (id: string): ArtStyle[] => (hasIllustration(id) ? ['illustrata', ...FREE_STYLES] : FREE_STYLES);
