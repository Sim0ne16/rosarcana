// Stile "Vetrata": tessere di Voronoi (d3-delaunay), piombature, figura dall'icona, arco gotico.
import { Delaunay } from 'd3-delaunay';
import { cardInfo, RARITY } from '../../engine/cards';
import { ICONS } from './icons.generated';
import { FRAME, GLASS, LEAD } from './palettes';
import { hash, seeded } from './rng';

export const ARCH = 'M5 80 V38 A58 58 0 0 1 50 3 A58 58 0 0 1 95 38 V80 Z';
const polyD = (poly: ArrayLike<[number, number]> & Iterable<[number, number]>) => 'M' + Array.from(poly, p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
const cache: Record<string, string> = {};

export function stainedGlass(id: string, opts: { arch?: boolean } = {}): string {
  const key = id + (opts.arch === false ? ':full' : '');
  if (cache[key]) return cache[key];
  const c = cardInfo(id), P = GLASS[c.f], r = seeded(hash(id + 'glass'));
  const pts: [number, number][] = [];
  for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) pts.push([(i + 0.15 + r() * 0.7) * 100 / 7, (j + 0.15 + r() * 0.7) * 80 / 6]);
  const v = Delaunay.from(pts).voronoi([0, 0, 100, 80]);
  let g = '';
  pts.forEach((p, i) => {
    const poly = v.cellPolygon(i); if (!poly) return;
    const dist = Math.hypot((p[0] - 50) / 50, (p[1] - 10) / 70);
    const k = Math.max(0, Math.min(P.g.length - 1, Math.round((1 - Math.min(1, dist)) * 4.2 + r() * 1.8)));
    g += `<path d="${polyD(poly as unknown as [number, number][])}" fill="${P.g[k]}"/>`;
  });
  let deco = '';
  if (c.t === 'I') deco = `<circle cx="50" cy="44" r="29" fill="none" stroke="${LEAD}" stroke-width="2.2"/><circle cx="50" cy="44" r="29" fill="none" stroke="${P.g[5]}" stroke-width="1" stroke-dasharray="3 2.2"/>`;
  if (c.t === 'R') deco = `<path d="M50 12 L80 44 L50 76 L20 44Z" fill="none" stroke="${LEAD}" stroke-width="2.2"/><path d="M50 12 L80 44 L50 76 L20 44Z" fill="none" stroke="${P.g[5]}" stroke-width=".9"/>`;
  const s = (c.r === 'l' ? 50 : 46) / 512, d = ICONS[id];
  const fig = d ? `<g transform="translate(${(50 - 256 * s).toFixed(2)} ${(45 - 256 * s).toFixed(2)}) scale(${s.toFixed(4)})"><path d="${d}" fill="${LEAD}" stroke="${LEAD}" stroke-width="30" stroke-linejoin="round"/><path d="${d}" fill="${P.fig}"/><path d="${d}" fill="url(#vgShade)"/></g>` : '';
  const arch = opts.arch === false ? '' : `<path d="M-1 -1H101V81H-1Z ${ARCH}" fill="${FRAME}" fill-rule="evenodd"/><path d="${ARCH}" fill="none" stroke="${LEAD}" stroke-width="2.4"/><path d="${ARCH}" fill="none" stroke="${RARITY[c.r].color}" stroke-width="1"/>`;
  return (cache[key] = `<g stroke="${LEAD}" stroke-width="1.15" stroke-linejoin="round">${g}</g>${deco}${fig}<rect width="100" height="80" fill="url(#vgLight)"/>${arch}`);
}
