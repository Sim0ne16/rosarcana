// Stile "Incisione": inchiostro su pergamena, raggiera, cartiglio e tratteggio.
import { cardInfo } from '../../engine/cards';
import { ICONS } from './icons.generated';
import { INK, PAPER } from './palettes';
import { hash, seeded } from './rng';

const cache: Record<string, string> = {};
export function engraving(id: string): string {
  if (cache[id]) return cache[id];
  const c = cardInfo(id), r = seeded(hash(id + 'ink'));
  let rays = ''; const n = 28 + Math.floor(r() * 20);
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r() * 0.05, r1 = 30 + r() * 3, r2 = 60;
    rays += `<line x1="${(50 + Math.cos(a) * r1).toFixed(1)}" y1="${(42 + Math.sin(a) * r1 * 0.9).toFixed(1)}" x2="${(50 + Math.cos(a) * r2).toFixed(1)}" y2="${(42 + Math.sin(a) * r2).toFixed(1)}"/>`; }
  let ground = ''; for (let i = 0; i < 7; i++) { const y = 68 + i * 1.6; ground += `<path d="M${(8 + r() * 6).toFixed(1)} ${y} Q50 ${(y - 2 + r() * 2).toFixed(1)} ${(92 - r() * 6).toFixed(1)} ${y}"/>`; }
  const s = 44 / 512, d = ICONS[id];
  const fig = d ? `<g transform="translate(${(50 - 256 * s).toFixed(2)} ${(43 - 256 * s).toFixed(2)}) scale(${s.toFixed(4)})"><path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="26" stroke-linejoin="round"/><path d="${d}" fill="${PAPER}"/><path d="${d}" fill="url(#hatchIcon)"/></g>` : '';
  const shape = c.t === 'I' ? `<circle cx="50" cy="42" r="28" fill="url(#hatchFine)" stroke="${INK}" stroke-width=".9"/><circle cx="50" cy="42" r="30.5" fill="none" stroke="${INK}" stroke-width=".4"/>`
    : c.t === 'R' ? `<path d="M50 11 L80 42 L50 73 L20 42Z" fill="url(#hatchFine)" stroke="${INK}" stroke-width=".9"/><path d="M50 7.5 L83.5 42 L50 76.5 L16.5 42Z" fill="none" stroke="${INK}" stroke-width=".4"/>`
    : `<ellipse cx="50" cy="42" rx="31" ry="29" fill="url(#hatchFine)" stroke="${INK}" stroke-width=".9"/><ellipse cx="50" cy="42" rx="33.5" ry="31.5" fill="none" stroke="${INK}" stroke-width=".4"/>`;
  return (cache[id] = `<rect width="100" height="80" fill="${PAPER}"/><rect width="100" height="80" fill="url(#paperTone)"/><g stroke="${INK}" stroke-width=".35" opacity=".55">${rays}</g><g fill="none" stroke="${INK}" stroke-width=".45" opacity=".7">${ground}</g>${shape}${fig}<rect x="2" y="2" width="96" height="76" fill="none" stroke="${INK}" stroke-width="1.2"/><rect x="3.8" y="3.8" width="92.4" height="72.4" fill="none" stroke="${INK}" stroke-width=".4"/>`);
}
