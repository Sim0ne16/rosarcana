// Rosone: dorsi delle carte, Sigilli sul tavolo, logo.
import {LEAD} from './palettes';

export interface RoseOpts {
    n?: number;
    lit?: number;
    dead?: boolean;
    label?: string;
    core?: number;
    fs?: number;
    ly?: number
}

export function rose(pal: string[], o: RoseOpts = {}): string {
    const n = o.n ?? 12, lit = o.lit ?? n, out: string[] = [];
    const seg = (r1: number, r2: number, a1: number, a2: number) => {
        const p = (r: number, a: number) => [50 + r * Math.cos(a), 50 + r * Math.sin(a)].map(v => v.toFixed(2));
        const [x1, y1] = p(r2, a1), [x2, y2] = p(r2, a2), [x3, y3] = p(r1, a2), [x4, y4] = p(r1, a1);
        return `M${x1} ${y1}A${r2} ${r2} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 0 0 ${x4} ${y4}Z`;
    };
    for (let i = 0; i < n; i++) {
        const a1 = -Math.PI / 2 + (i * 2 * Math.PI) / n, a2 = a1 + (2 * Math.PI) / n, on = i < lit;
        out.push(`<path d="${seg(30, 47, a1, a2)}" fill="${on ? pal[i % 2 ? 1 : 2] : '#1d1b26'}"/>`, `<path d="${seg(18, 30, a1, a2)}" fill="${on ? pal[i % 2 ? 2 : 3] : '#24212e'}"/>`);
    }
    const petals = Array.from({length: 6}, (_, i) => {
        const a = (i * Math.PI) / 3, cx = (50 + 9 * Math.cos(a)).toFixed(2), cy = (50 + 9 * Math.sin(a)).toFixed(2);
        return `<ellipse cx="${cx}" cy="${cy}" rx="8" ry="4.5" transform="rotate(${i * 60} ${cx} ${cy})" fill="${o.dead ? '#24212e' : pal[3]}"/>`;
    }).join('');
    const cracks = o.dead ? `<path d="M50 3 L44 28 L56 45 L40 62 L47 97 M56 45 L82 40 L96 55 M44 28 L20 22" fill="none" stroke="#8d8fa8" stroke-width="1.6" opacity=".8"/>` : '';
    const label = o.label ? `<text x="50" y="${o.ly ?? 58}" text-anchor="middle" font-family="Grenze Gotisch, Georgia, serif" font-weight="700" font-size="${o.fs ?? 24}" fill="${pal[3]}">${o.label}</text>` : '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" fill="${LEAD}"/><g stroke="${LEAD}" stroke-width="1.6" stroke-linejoin="round">${out.join('')}${petals}</g><circle cx="50" cy="50" r="${o.core ?? 11}" fill="${o.dead ? '#24212e' : pal[0]}" stroke="${LEAD}" stroke-width="2"/>${label}<circle cx="50" cy="50" r="48" fill="url(#vgLightR)"/>${cracks}<circle cx="50" cy="50" r="48" fill="none" stroke="#caa15a" stroke-width="1.2" opacity=".7"/></svg>`;
}
