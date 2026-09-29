// Stile "Dipinta": pittura a olio procedurale. Fondo sfumato, pennellate orientate verso la luce,
// paesaggio in silhouette per fazione, figura in controluce con alone, particelle e trama della tela.
import {cardInfo} from '../../engine/cards';
import type {Faction} from '../../engine/types';
import {ICONS} from './icons.generated';
import {hash, seeded} from './rng';

interface Pal {
    sky: [string, string, string];
    light: string;
    glow: string;
    dark: string;
    mid: string;
    strokes: string[];
    spark: string
}

export const PAINT: Record<Faction, Pal> = {
    brace: {
        sky: ['#1f0907', '#6e1f10', '#c4502a'],
        light: '#ffe2a0',
        glow: '#ff8a3a',
        dark: '#140605',
        mid: '#3a120a',
        strokes: ['#5a1a0c', '#8e2a14', '#c4502a', '#e98a2a', '#f3b640', '#ffd27a'],
        spark: '#ffb347'
    },
    marea: {
        sky: ['#041019', '#10384a', '#2f8595'],
        light: '#e4fffa',
        glow: '#7fe0e0',
        dark: '#030c14',
        mid: '#0b2a3a',
        strokes: ['#0b2a3a', '#0d3a52', '#12587a', '#1d7f99', '#3aa3b0', '#9fe3e0'],
        spark: '#c8fff8'
    },
    radice: {
        sky: ['#0a1206', '#223d14', '#5f8f3a'],
        light: '#fff4b8',
        glow: '#e0d86a',
        dark: '#070d04',
        mid: '#16290d',
        strokes: ['#16290d', '#1f3d14', '#2f5e1f', '#4d8030', '#7aa33d', '#c9d46a'],
        spark: '#f4f0a0'
    },
    vuoto: {
        sky: ['#05040b', '#241638', '#5a3a8f'],
        light: '#f3eaff',
        glow: '#b08ae0',
        dark: '#040309',
        mid: '#170e28',
        strokes: ['#170e28', '#241638', '#3a2466', '#5a3a8f', '#8a5bb8', '#d2b4f0'],
        spark: '#e8d8ff'
    },
};
const f1 = (n: number) => n.toFixed(1);
const cache: Record<string, string> = {};

function horizon(f: Faction, r: () => number, P: Pal): string {
    let d = '', extra = '';
    if (f === 'brace') {
        d = 'M0 80 L0 64';
        for (let x = 0; x <= 100; x += 5 + r() * 5) d += ` L${f1(x)} ${f1(56 + r() * 12 - (Math.abs(x - 50) < 18 ? 0 : 3))}`;
        d += ' L100 80Z';
        for (let i = 0; i < 4; i++) {
            const x = 8 + r() * 84, y = 70 + r() * 8;
            extra += `<path d="M${f1(x)} ${f1(y)} q${f1(3 + r() * 5)} ${f1(-1 - r() * 2)} ${f1(7 + r() * 8)} ${f1(r() * 3)}" stroke="${P.glow}" stroke-width=".7" fill="none" opacity=".8"/>`;
        }
    } else if (f === 'marea') {
        for (let k = 0; k < 3; k++) {
            const y0 = 62 + k * 6;
            let p = `M0 80 L0 ${y0}`;
            for (let x = 0; x <= 100; x += 4) p += ` L${x} ${f1(y0 + Math.sin(x / (6 + k * 2) + r() * 0.3 + k) * (1.6 - k * 0.3))}`;
            d += `<path d="${p} L100 80Z" fill="${k === 2 ? P.dark : P.mid}" opacity="${0.75 + k * 0.1}"/>`;
            extra += `<path d="M0 ${y0} ${Array.from({length: 26}, (_, i) => `L${i * 4} ${f1(y0 + Math.sin(i * 4 / (6 + k * 2) + k) * (1.6 - k * 0.3) - 0.4)}`).join(' ')}" stroke="${P.spark}" stroke-width=".35" fill="none" opacity="${0.5 - k * 0.12}"/>`;
        }
        return `<g filter="url(#pBrush)">${d}${extra}</g>`;
    } else if (f === 'radice') {
        d = 'M0 80 L0 68 Q50 62 100 68 L100 80Z';
        for (let i = 0; i < 9; i++) {
            const x = r() * 100;
            if (Math.abs(x - 50) < 16) continue;
            const h = 14 + r() * 16, w = 5 + r() * 5, b = 70;
            extra += `<path d="M${f1(x - w)} ${b} L${f1(x)} ${f1(b - h)} L${f1(x + w)} ${b}Z M${f1(x - 0.6)} ${b} h1.2 v4 h-1.2Z" fill="${P.dark}" opacity="${0.8 + r() * 0.2}"/>`;
        }
    } else {
        d = 'M0 80 L0 70 L100 70 L100 80Z';
        for (let i = 0; i < 7; i++) {
            const x = r() * 100;
            if (Math.abs(x - 50) < 15) continue;
            const h = 12 + r() * 22, w = 1.4 + r() * 2.6;
            extra += `<path d="M${f1(x - w)} 71 V${f1(71 - h)} L${f1(x)} ${f1(71 - h - 5 - r() * 5)} L${f1(x + w)} ${f1(71 - h)} V71Z" fill="${P.dark}"/>`;
        }
        extra += `<path d="M20 71 v-8 a6 6 0 0 1 12 0 v8 h-2 v-7 a4 4 0 0 0 -8 0 v7Z" fill="${P.dark}" opacity=".9"/>`;
    }
    return `<g filter="url(#pBrush)"><path d="${d}" fill="${P.dark}"/>${extra}</g>`;
}

export function painting(id: string): string {
    if (cache[id]) return cache[id];
    const c = cardInfo(id), P = PAINT[c.f], r = seeded(hash(id + 'paint'));
    const lx = 50 + (r() - 0.5) * 24, ly = 26 + (r() - 0.5) * 12;
    // fondo e luce
    let s = `<defs><linearGradient id="sk-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset=".55" stop-color="${P.sky[1]}"/><stop offset="1" stop-color="${P.sky[0]}"/></linearGradient>
    <radialGradient id="lt-${id}" cx="${lx}%" cy="${(ly / 80) * 100}%" r="55%"><stop offset="0" stop-color="${P.light}" stop-opacity=".95"/><stop offset=".22" stop-color="${P.glow}" stop-opacity=".7"/><stop offset=".6" stop-color="${P.sky[2]}" stop-opacity=".25"/><stop offset="1" stop-color="${P.sky[2]}" stop-opacity="0"/></radialGradient></defs>
    <rect width="100" height="80" fill="url(#sk-${id})"/><rect width="100" height="80" fill="url(#lt-${id})"/>`;
    // pennellate orientate attorno alla luce
    let strokes = '';
    for (let i = 0; i < 90; i++) {
        const x = r() * 104 - 2, y = r() * 70 - 2, dx = x - lx, dy = y - ly, dist = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx) + Math.PI / 2 + (r() - 0.5) * 0.7, len = 5 + r() * 12, w = 1.2 + r() * 3.4;
        const k = Math.max(0, Math.min(P.strokes.length - 1, Math.round((1 - Math.min(1, dist / 60)) * (P.strokes.length - 1) + (r() - 0.5) * 1.6)));
        const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, cx = (x + x2) / 2 + (r() - 0.5) * 4,
            cy = (y + y2) / 2 + (r() - 0.5) * 4;
        strokes += `<path d="M${f1(x)} ${f1(y)} Q${f1(cx)} ${f1(cy)} ${f1(x2)} ${f1(y2)}" stroke="${P.strokes[k]}" stroke-width="${f1(w)}" stroke-opacity="${(0.28 + r() * 0.4).toFixed(2)}"/>`;
    }
    s += `<g filter="url(#pBrush)" fill="none" stroke-linecap="round">${strokes}</g>`;
    // cerchi magici per gli incantesimi, altare per le reliquie
    if (c.t === 'I') {
        let rings = '';
        for (let i = 0; i < 26; i++) {
            const a = r() * Math.PI * 2, a2 = a + 0.3 + r() * 0.6, R = 24 + r() * 7;
            rings += `<path d="M${f1(50 + Math.cos(a) * R)} ${f1(42 + Math.sin(a) * R * 0.9)} A${f1(R)} ${f1(R * 0.9)} 0 0 1 ${f1(50 + Math.cos(a2) * R)} ${f1(42 + Math.sin(a2) * R * 0.9)}" stroke="${i % 3 ? P.glow : P.light}" stroke-width="${f1(0.4 + r() * 1.2)}" opacity="${(0.35 + r() * 0.5).toFixed(2)}"/>`;
        }
        s += `<g fill="none" stroke-linecap="round" filter="url(#pBrush)">${rings}</g>`;
    }
    // raggi di luce per rare e leggendarie
    if (c.r === 'r' || c.r === 'l') {
        let rays = '';
        const n = c.r === 'l' ? 9 : 5;
        for (let i = 0; i < n; i++) {
            const a = Math.PI * (0.15 + 0.7 * (i + r() * 0.6) / n), w = 0.05 + r() * 0.07;
            const p1 = [lx + Math.cos(a - w) * 120, ly + Math.sin(a - w) * 120],
                p2 = [lx + Math.cos(a + w) * 120, ly + Math.sin(a + w) * 120];
            rays += `<path d="M${f1(lx)} ${f1(ly)} L${f1(p1[0])} ${f1(p1[1])} L${f1(p2[0])} ${f1(p2[1])}Z" fill="${P.light}" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`;
        }
        s += `<g style="mix-blend-mode:screen">${rays}</g>`;
    }
    s += horizon(c.f, r, P);
    if (c.t === 'R') s += `<g filter="url(#pBrush)"><path d="M36 72 L40 62 L60 62 L64 72Z" fill="${P.mid}"/><path d="M39 62 h22 v-2.4 h-22Z" fill="${P.dark}"/><path d="M40 62 L60 62" stroke="${P.glow}" stroke-width=".5" opacity=".8"/></g>`;
    // figura in controluce
    const d = ICONS[id];
    if (d) {
        const sc = (c.r === 'l' ? 50 : 45) / 512, tx = f1(50 - 256 * sc), ty = f1((c.t === 'R' ? 36 : 42) - 256 * sc);
        const g = (body: string) => `<g transform="translate(${tx} ${ty}) scale(${sc.toFixed(4)})">${body}</g>`;
        s += `<g filter="url(#pGlow)" opacity=".85">${g(`<path d="${d}" fill="${P.light}" stroke="${P.glow}" stroke-width="40"/>`)}</g>`;
        // corpo dipinto: base scura + pennellate interne ritagliate sulla figura + luce dal lato della sorgente
        let inner = '';
        for (let i = 0; i < 26; i++) {
            const x = 30 + r() * 40, y = 20 + r() * 44, a = r() * Math.PI, l = 4 + r() * 8;
            inner += `<path d="M${f1(x)} ${f1(y)} l${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l)}" stroke="${P.strokes[1 + Math.floor(r() * 3)]}" stroke-width="${f1(1.5 + r() * 2.5)}" stroke-opacity=".55"/>`;
        }
        const side = lx < 50 ? 0 : 1;
        s += `<defs><clipPath id="cf-${id}"><path transform="translate(${tx} ${ty}) scale(${sc.toFixed(4)})" d="${d}"/></clipPath><linearGradient id="fl-${id}" x1="${side}" y1="0" x2="${1 - side}" y2="1"><stop offset="0" stop-color="${P.light}" stop-opacity=".75"/><stop offset=".35" stop-color="${P.glow}" stop-opacity=".25"/><stop offset=".7" stop-color="${P.dark}" stop-opacity="0"/></linearGradient></defs>`;
        s += `<g filter="url(#pBrush)">${g(`<path d="${d}" fill="${P.dark}" stroke="${P.dark}" stroke-width="16" stroke-linejoin="round"/>`)}<g clip-path="url(#cf-${id})" fill="none" stroke-linecap="round"><rect width="100" height="80" fill="${P.dark}"/>${inner}<rect width="100" height="80" fill="url(#fl-${id})"/></g></g>`;
        s += `<g opacity=".55">${g(`<path d="${d}" fill="none" stroke="${P.light}" stroke-width="5"/>`)}</g>`;
    }
    // particelle: braci, spuma, polline, stelle
    let parts = '';
    for (let i = 0; i < 22; i++) {
        const x = r() * 100, y = r() * 70, rr = 0.25 + r() * (c.f === 'vuoto' ? 0.5 : 0.8);
        parts += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${rr.toFixed(2)}" fill="${P.spark}" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`;
    }
    s += `<g>${parts}</g>`;
    // vignettatura e tela
    s += `<rect width="100" height="80" fill="url(#pVignette)"/><rect width="100" height="80" filter="url(#pCanvas)" opacity=".5"/>`;
    return (cache[id] = s);
}
