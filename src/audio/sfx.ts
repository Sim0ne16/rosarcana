// Suoni "materici" sintetizzati con la Web Audio API: carta, legno, vetro, campane di cattedrale.
// Niente file da scaricare e niente timbri da sintetizzatore: rumore filtrato, parziali di campana e un riverbero da navata.
import {useProfile} from '../profile/store';

export type Sfx =
    'tick'
    | 'click'
    | 'forge'
    | 'claim'
    | 'lens'
    | 'crystal'
    | 'error'
    | 'toll'
    | 'ascend'
    | 'play'
    | 'move'
    | 'draw'
    | 'hit'
    | 'death'
    | 'seal'
    | 'crack'
    | 'turn'
    | 'win'
    | 'lose'
    | 'flipC'
    | 'flipU'
    | 'flipR'
    | 'flipL'
    | 'tear'
    | 'coin'
    | 'hover';

let lastHover = 0;
let ctx: AudioContext | null = null, out!: GainNode, verb!: GainNode, noiseBuf!: AudioBuffer;

function init() {
    if (ctx) {
        if (ctx.state === 'suspended') void ctx.resume();
        return ctx;
    }
    try {
        ctx = new AudioContext();
        out = ctx.createGain();
        out.gain.value = 0.8;
        out.connect(ctx.destination);
        // riverbero di navata: risposta all'impulso generata (rumore che decade in 3 secondi)
        const len = ctx.sampleRate * 3, ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = ir.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
        }
        const conv = ctx.createConvolver();
        conv.buffer = ir;
        verb = ctx.createGain();
        verb.gain.value = 0.32;
        verb.connect(conv);
        conv.connect(out);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const nd = noiseBuf.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    } catch {
        ctx = null;
    }
    return ctx;
}

function envGain(c: AudioContext, t: number, peak: number, attack: number, decay: number, wet = 0) {
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(out);
    if (wet) {
        const w = c.createGain();
        w.gain.value = wet;
        g.connect(w);
        w.connect(verb);
    }
    return g;
}

/** Rumore filtrato: carta, fruscii, polvere. */
function noise(t: number, dur: number, f0: number, f1: number, q: number, peak: number, wet = 0.1, type: BiquadFilterType = 'bandpass') {
    const c = ctx!, src = c.createBufferSource();
    src.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    src.connect(f);
    f.connect(envGain(c, t, peak, Math.min(0.02, dur / 4), dur, wet));
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.1);
}

function tone(t: number, freq: number, dur: number, peak: number, wet = 0.2, type: OscillatorType = 'sine', drop = 1) {
    const c = ctx!, o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (drop !== 1) o.frequency.exponentialRampToValueAtTime(freq * drop, t + dur);
    o.connect(envGain(c, t, peak, 0.004, dur, wet));
    o.start(t);
    o.stop(t + dur + 0.1);
}

/** Campana: parziali inarmoniche di una campana di bronzo (hum, prime, terza minore, quinta, nominale...). */
const BELL = [[0.5, 0.5, 3.2], [1, 1, 2.4], [1.19, 0.55, 1.8], [1.5, 0.35, 1.4], [2, 0.5, 1.2], [2.51, 0.22, 0.8], [2.66, 0.2, 0.7], [3.01, 0.14, 0.55], [4.17, 0.1, 0.4]];

function bell(t: number, f: number, peak: number, wet = 0.55) {
    for (const [r, a, d] of BELL) tone(t, f * r, d * (1 + 220 / f) * 0.5, peak * a, wet);
}

/** Legno: tonfo breve di una carta sul tavolo. */
function wood(t: number, peak = 0.35) {
    noise(t, 0.07, 900, 500, 4, peak, 0.12);
    tone(t, 190, 0.09, peak * 0.6, 0.1, 'sine', 0.7);
}

function thump(t: number, f: number, peak: number) {
    tone(t, f * 2.2, 0.35, peak, 0.25, 'sine', 0.45);
    noise(t, 0.2, 400, 120, 1, peak * 0.5, 0.2, 'lowpass');
}

function glass(t: number, n: number, peak: number) {
    for (let i = 0; i < n; i++) tone(t + Math.random() * 0.12, 1800 + Math.random() * 4200, 0.18 + Math.random() * 0.35, peak * (0.4 + Math.random() * 0.6), 0.45);
    noise(t, 0.25, 6000, 3000, 0.7, peak * 0.6, 0.3, 'highpass');
}

const scale = (base: number, semis: number) => base * Math.pow(2, semis / 12);

export function sfx(kind: Sfx) {
    if (!useProfile.getState().sound) return;
    if (kind === 'hover') {
        const n = performance.now();
        if (n - lastHover < 90) return;
        lastHover = n;
    }
    const c = init();
    if (!c) return;
    out.gain.value = useProfile.getState().settings?.volume ?? 0.8;
    const t = c.currentTime + 0.01;
    try {
        switch (kind) {
            case 'play':
                noise(t, 0.16, 1200, 3800, 1.2, 0.22, 0.08);
                wood(t + 0.13, 0.3);
                break;
            case 'move':
                noise(t, 0.12, 1500, 3000, 1.4, 0.16, 0.05);
                wood(t + 0.1, 0.18);
                break;
            case 'draw':
                noise(t, 0.16, 1400, 5200, 1.4, 0.16, 0.02);
                noise(t + 0.11, 0.05, 3600, 3000, 3, 0.09, 0.01);
                tone(t + 0.12, 660, 0.06, 0.03, 0.03, 'triangle', 1.2);
                break;
            case 'hit':
                thump(t, 60, 0.5);
                wood(t, 0.25);
                break;
            case 'death':
                thump(t, 48, 0.45);
                noise(t + 0.05, 0.7, 2500, 300, 0.8, 0.18, 0.3);
                break;
            case 'crack':
                glass(t, 3, 0.07);
                break;
            case 'seal':
                thump(t, 40, 0.7);
                glass(t + 0.02, 14, 0.09);
                bell(t + 0.05, 98, 0.12);
                break;
            case 'turn':
                bell(t, 523.25, 0.07, 0.5);
                bell(t + 0.18, 659.25, 0.05, 0.5);
                break;
            case 'flipC':
                noise(t, 0.12, 1800, 4000, 1.4, 0.12, 0.05);
                bell(t + 0.05, 1046.5, 0.035);
                break;
            case 'flipU':
                noise(t, 0.12, 1800, 4000, 1.4, 0.12, 0.05);
                bell(t + 0.05, 783.99, 0.05);
                bell(t + 0.15, 1174.66, 0.04);
                break;
            case 'flipR':
                noise(t, 0.12, 1800, 4000, 1.4, 0.12, 0.05);
                [0, 4, 7, 12].forEach((s, i) => bell(t + 0.05 + i * 0.09, scale(523.25, s), 0.05));
                break;
            case 'flipL':
                noise(t, 0.12, 1800, 4000, 1.4, 0.14, 0.05);
                thump(t, 45, 0.4);
                [0, 7, 12, 16, 19, 24].forEach((s, i) => bell(t + 0.08 + i * 0.12, scale(261.63, s), 0.07));
                glass(t + 0.7, 10, 0.04);
                break;
            case 'win':
                [0, 4, 7, 12, 16].forEach((s, i) => bell(t + i * 0.16, scale(392, s), 0.08));
                bell(t + 0.9, 196, 0.1);
                break;
            case 'lose':
                bell(t, 146.83, 0.12, 0.7);
                bell(t + 1.1, 130.81, 0.12, 0.7);
                break;
            case 'tick':
                tone(t, 1320, 0.06, 0.05, 0.05, 'square', 0.9);
                noise(t, 0.03, 4000, 3000, 4, 0.05, 0.02);
                break;
            case 'click':
                noise(t, 0.035, 2600, 1800, 3, 0.07, 0.02);
                tone(t, 520, 0.05, 0.025, 0.02, 'triangle');
                break;
            case 'hover':
                noise(t, 0.05, 3200, 4200, 2, 0.035, 0.02);
                break;
            case 'forge':
                tone(t, 880, 0.5, 0.07, 0.3, 'triangle', 0.98);
                tone(t, 1320, 0.35, 0.04, 0.3, 'sine');
                thump(t, 90, 0.2);
                glass(t + 0.02, 4, 0.03);
                break;
            case 'claim':
                [0, 7, 12].forEach((s, i) => bell(t + i * 0.08, scale(784, s), 0.04));
                tone(t + 0.1, 2637, 0.4, 0.03, 0.3);
                break;
            case 'lens':
                tone(t, 1760, 0.25, 0.035, 0.4);
                tone(t + 0.06, 2349, 0.3, 0.025, 0.4);
                break;
            case 'crystal':
                tone(t, 1568, 0.6, 0.04, 0.5);
                tone(t + 0.07, 2093, 0.7, 0.035, 0.5);
                tone(t + 0.14, 3136, 0.5, 0.02, 0.5);
                break;
            case 'error':
                tone(t, 220, 0.12, 0.06, 0.05, 'triangle', 0.8);
                tone(t + 0.1, 185, 0.14, 0.05, 0.05, 'triangle', 0.8);
                break;
            case 'toll':
                bell(t, 65.41, 0.22, 0.8);
                bell(t + 0.02, 130.81, 0.08, 0.8);
                noise(t, 1.2, 300, 80, 0.8, 0.08, 0.5, 'lowpass');
                break;
            case 'ascend':
                [0, 4, 7, 11, 14].forEach((s, i) => bell(t + i * 0.07, scale(659.25, s), 0.045));
                glass(t + 0.3, 8, 0.03);
                break;
            case 'tear':
                noise(t, 0.45, 700, 5000, 0.9, 0.3, 0.1);
                for (let i = 0; i < 6; i++) noise(t + i * 0.06, 0.03, 3000, 2500, 3, 0.18, 0.05);
                break;
            case 'coin':
                tone(t, 2093, 0.4, 0.06, 0.3);
                tone(t + 0.05, 2637, 0.5, 0.05, 0.3);
                tone(t + 0.02, 3520, 0.25, 0.02, 0.3);
                break;
        }
    } catch { /* audio non disponibile */
    }
}

export const flipSfx = (r: string) => sfx(({
    c: 'flipC',
    u: 'flipU',
    r: 'flipR',
    l: 'flipL'
} as const)[r as 'c'] ?? 'flipC');

/** Voci delle leggendarie: ogni personaggio ha un suo motivo sonoro quando entra in gioco. */
const LEGEND_VOICE: Record<string, (t: number) => void> = {
    // Brace: rombi, fuoco e metallo
    'brace-l0': t => {
        thump(t, 40, 0.5);
        noise(t, 1.6, 900, 80, 0.8, 0.35, 0.3, 'lowpass');
        for (let i = 0; i < 6; i++) noise(t + 0.2 + i * 0.13, 0.06, 3000, 2000, 4, 0.12, 0.05);
        tone(t + 0.1, 55, 1.4, 0.18, 0.3, 'sawtooth', 0.6);
    },
    'brace-l1': t => {
        tone(t, 220, 0.2, 0.08, 0.2, 'triangle', 2);
        for (let i = 0; i < 8; i++) noise(t + i * 0.09, 0.05, 2500 + i * 200, 1500, 5, 0.1, 0.05);
        bell(t + 0.5, 392, 0.12);
    },
    'brace-l2': t => {
        tone(t, 90, 1.3, 0.3, 0.35, 'sawtooth', 0.35);
        tone(t, 45, 1.5, 0.25, 0.35, 'square', 0.5);
        noise(t, 1.4, 600, 60, 0.7, 0.35, 0.3, 'lowpass');
        thump(t + 0.9, 35, 0.5);
    },
    'brace-l3': t => {
        [0, 0.28, 0.56].forEach((d, i) => {
            noise(t + d, 0.05, 5000, 4000, 6, 0.2, 0.2);
            tone(t + d, 1760 - i * 120, 0.5, 0.08, 0.4, 'triangle');
        });
        noise(t, 1.2, 300, 900, 1, 0.12, 0.3, 'lowpass');
    },
    // Marea: canto, onde e campane marine
    'marea-l0': t => {
        [0, 3, 7, 12, 7].forEach((s, i) => tone(t + i * 0.22, scale(523, s), 0.6, 0.09, 0.6));
        noise(t, 1.8, 400, 1200, 0.6, 0.12, 0.5, 'lowpass');
    },
    'marea-l1': t => {
        noise(t, 2, 200, 2200, 0.5, 0.35, 0.5, 'lowpass');
        noise(t + 0.9, 1.2, 2400, 300, 0.6, 0.25, 0.5, 'lowpass');
        thump(t + 0.8, 50, 0.3);
    },
    'marea-l2': t => {
        [0, 0.15, 0.3].forEach(d => tone(t + d, 110 + d * 60, 0.7, 0.18, 0.35, 'sawtooth', 0.5));
        noise(t, 1.2, 500, 150, 0.8, 0.3, 0.4, 'lowpass');
    },
    'marea-l3': t => {
        [0, 4, 7, 12].forEach((s, i) => bell(t + i * 0.18, scale(440, s), 0.08));
        tone(t + 0.7, 880, 1.2, 0.06, 0.6);
    },
    // Radice: legno, passi, canti d'uccelli
    'radice-l0': t => {
        tone(t, 70, 1.4, 0.25, 0.3, 'triangle', 0.7);
        wood(t + 0.1, 0.4);
        wood(t + 0.5, 0.35);
        [0, 0.12, 0.2].forEach(d => tone(t + 0.9 + d, 2800 + d * 2000, 0.08, 0.05, 0.3, 'sine', 1.3));
    },
    'radice-l1': t => {
        [0, 4, 7, 11, 14].forEach((s, i) => tone(t + i * 0.12, scale(659, s), 0.5, 0.07, 0.5));
        glass(t + 0.5, 3, 0.06);
    },
    'radice-l2': t => {
        [0, 0.45, 0.9].forEach(d => {
            thump(t + d, 36, 0.55);
            wood(t + d + 0.03, 0.3);
        });
    },
    'radice-l3': t => {
        [0, 2, 4, 7, 9, 12].forEach((s, i) => tone(t + i * 0.1, scale(587, s), 0.45, 0.07, 0.5, 'triangle'));
        [0, 0.1].forEach(d => tone(t + 0.8 + d, 3200, 0.07, 0.05, 0.3, 'sine', 1.2));
    },
    // Vuoto: cori dissonanti, sussurri, rintocchi
    'vuoto-l0': t => {
        [0, 1, 6].forEach(s => tone(t, scale(110, s), 1.8, 0.1, 0.6, 'sawtooth', 0.9));
        noise(t, 1.5, 200, 3000, 0.6, 0.15, 0.6);
    },
    'vuoto-l1': t => {
        noise(t, 0.4, 3000, 200, 0.6, 0.2, 0.5);
        tone(t + 0.6, 40, 1.8, 0.35, 0.5, 'sine', 0.8);
    },
    'vuoto-l2': t => {
        bell(t, 98, 0.25);
        noise(t + 0.2, 1.4, 1800, 2400, 3, 0.08, 0.6);
        tone(t + 0.3, scale(196, 1), 1.2, 0.07, 0.6, 'sawtooth');
    },
    'vuoto-l3': t => {
        [0, 0.24, 0.9, 1.14].forEach(d => thump(t + d, 42, 0.45));
        [0, 3, 6].forEach(s => tone(t + 0.4, scale(147, s), 1.2, 0.07, 0.5, 'sawtooth'));
    },
};

export function legendSfx(id: string) {
    if (!useProfile.getState().sound) return;
    const c = init();
    if (!c) return;
    const v = LEGEND_VOICE[id];
    if (!v) return;
    const t = c.currentTime + 0.02;
    v(t);
    bell(t + 0.05, 262, 0.05);
}
