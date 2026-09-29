import type { Faction } from '../../engine/types';
export const LEAD = '#17141c', FRAME = '#1b1920', INK = '#2a2118', PAPER = '#efe2c4';
export const GLASS: Record<Faction, { g: string[]; fig: string }> = {
  brace:  { g: ['#5a0f12', '#7a1a0c', '#a8321a', '#d0561f', '#e98a2a', '#f3b640'], fig: '#ffe6b0' },
  marea:  { g: ['#0a2a44', '#0d3a52', '#12587a', '#1d7f99', '#3aa3b0', '#86d0cf'], fig: '#e2fbf8' },
  radice: { g: ['#26200f', '#1f3d14', '#2f5e1f', '#4d8030', '#7aa33d', '#b7c95a'], fig: '#f1f7d2' },
  vuoto:  { g: ['#12101f', '#1e1236', '#3a2466', '#5a3a8f', '#8a5bb8', '#c29be0'], fig: '#f0e6ff' },
};
export const BACK_PAL: Record<string, string[]> = {
  cera: ['#4b0f12', '#8e2226', '#c8413c', '#f08a6a'], brace: ['#5a3306', '#a86a12', '#e0a032', '#ffe39a'],
  abisso: ['#082432', '#0f4e62', '#2f8595', '#9fe3ea'], aurora: ['#1e1236', '#5a3a8f', '#2f8595', '#e2c9ff'],
};
export const SEAL_PAL = [['#0f2a5a', '#1d4f9e', '#3f7ed6', '#bfe6ff'], ['#4b0f12', '#8e2226', '#c8413c', '#ffc2a8']];
