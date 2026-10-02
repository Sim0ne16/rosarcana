import {BYID, CARDS, RARITY} from '../engine/cards';
import type {Faction} from '../engine/types';
import type {CustodeId} from '../engine/mechanics';
import {dataLang} from '../i18n/langState';

export interface Deck {
    id: string;
    name: string;
    fac: Faction[];
    cards: string[];
    custode?: import('../engine/mechanics').CustodeId | null;
    back?: string | null
}

export const countMap = (a: string[]) => a.reduce<Record<string, number>>((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});

export function starterOwned() {
    const o: Record<string, number> = {};
    CARDS.forEach(c => {
        if (c.r === 'c') o[c.id] = 2;
        if (c.r === 'u') o[c.id] = 1;
    });
    return o;
}

export function autoDeck(fac: Faction[], owned: Record<string, number>, base: string[] = []) {
    const cards = [...base], cnt = countMap(cards), copies: typeof CARDS = [];
    CARDS.filter(c => fac.includes(c.f)).forEach(c => {
        const lim = Math.min(owned[c.id] || 0, RARITY[c.r].max);
        for (let i = cnt[c.id] || 0; i < lim; i++) copies.push(c);
    });
    const sc = (c: (typeof CARDS)[number]) => ({
        c: 1,
        u: 2,
        r: 3,
        l: 4
    }[c.r]) * 10 - Math.abs(c.c - 3) * 2 + Math.random();
    copies.sort((a, b) => sc(b) - sc(a));
    for (const c of copies) {
        if (cards.length >= 30) break;
        cards.push(c.id);
    }
    return cards;
}

/** Mazzi preimpostati: tutte le comuni delle due fazioni (×2) più 2 non comuni, con un Custode. Giocabili con la collezione iniziale. */
export interface Preset extends Deck {
    blurb: string
}

const commons = (f: Faction) => CARDS.filter(c => c.f === f && c.r === 'c').slice(0, 7).flatMap(c => [c.id, c.id]);
const preset = (id: string, name: string, fac: Faction[], unc: string[], custode: CustodeId, blurb: string): Preset =>
    ({id, name, fac, custode, blurb, cards: [...commons(fac[0]), ...commons(fac[1]), ...unc]});
export const PRESETS: Preset[] = [
    preset('p-fiamma-radice', 'Fiamma e Radice', ['brace', 'radice'], ['brace-u0', 'radice-u3'], 'vesta',
        "Aggressivo: unità rapide di Brace davanti, radici tenaci a proteggere. Vesta rende più forte la prima unità di ogni turno."),
    preset('p-maree-vuoto', 'Maree del Vuoto', ['marea', 'vuoto'], ['marea-u0', 'vuoto-u3'], 'traghettatore',
        "Controllo: rimanda indietro gli avversari e trasforma le morti in danni ai Sigilli con il Traghettatore."),
    preset('p-bosco-sommerso', 'Bosco Sommerso', ['radice', 'marea'], ['radice-u0', 'marea-u3'], 'guardaboschi',
        "Difensivo: Guardiani e salute alta nella corsia centrale, protetta dall'Uomo Verde, mentre la Marea sposta le minacce."),
    preset('p-ceneri-notte', 'Ceneri della Notte', ['brace', 'vuoto'], ['brace-u1', 'vuoto-u0'], 'ecate',
        "Sacrifici e fuoco: si parte con un Cristallo in più grazie a Ecate e si brucia tutto ciò che resta sul tavolo."),
];

/** Mazzi d'esempio per ogni archetipo: modelli da aggiungere e completare con le carte che mancano. */
export interface Archetype extends Preset {
    archetype: string
}

const archetype = (id: string, name: string, archetype: string, fac: Faction[], custode: CustodeId, blurb: string, cards: string[]): Archetype => ({
    id,
    name,
    archetype,
    fac,
    custode,
    blurb,
    cards
});
export const ARCHETYPES: Archetype[] = [
    archetype('a-aggro', 'Rogo Rapido', 'Aggro', ['brace'], 'vesta', "Unità economiche e Rapido: colpisci i Sigilli prima che l'avversario si organizzi.", ['brace-c0', 'brace-c0', 'brace-c7', 'brace-c7', 'brace-c9', 'brace-c9', 'brace-c6', 'brace-c6', 'brace-c1', 'brace-c1', 'brace-c2', 'brace-c2', 'brace-c5', 'brace-c5', 'brace-c8', 'brace-c8', 'brace-c3', 'brace-c3', 'brace-u5', 'brace-u5', 'brace-u3', 'brace-u3', 'brace-u2', 'brace-u2', 'brace-r2', 'brace-r2', 'brace-r6', 'brace-r6', 'brace-l2', 'brace-u7']),
    archetype('a-burn', 'Cenere e Fumo', 'Burn', ['brace'], 'ladro', 'Danni diretti ai Sigilli da ogni direzione: incantesimi, reliquie e morti che bruciano.', ['brace-c3', 'brace-c3', 'brace-c8', 'brace-c8', 'brace-u1', 'brace-u1', 'brace-r1', 'brace-r1', 'brace-r5', 'brace-r5', 'brace-u4', 'brace-u4', 'brace-c10', 'brace-c10', 'brace-c0', 'brace-c0', 'brace-c4', 'brace-c4', 'brace-c2', 'brace-c2', 'brace-c6', 'brace-c6', 'brace-u0', 'brace-u0', 'brace-u7', 'brace-u7', 'brace-r4', 'brace-r4', 'brace-l1', 'brace-l0']),
    archetype('a-tribale', 'Legione delle Braci', 'Tribale', ['brace'], 'vesta', "Tutto Brace: il Signore e l'Araldo potenziano ogni altra unità della Casata.", ['brace-c7', 'brace-c7', 'brace-c0', 'brace-c0', 'brace-c1', 'brace-c1', 'brace-c2', 'brace-c2', 'brace-c4', 'brace-c4', 'brace-c5', 'brace-c5', 'brace-c6', 'brace-c6', 'brace-c9', 'brace-c9', 'brace-u3', 'brace-u3', 'brace-u5', 'brace-u5', 'brace-u7', 'brace-u7', 'brace-r3', 'brace-r3', 'brace-r6', 'brace-r6', 'brace-l3', 'brace-r2', 'brace-r2', 'brace-l2']),
    archetype('a-tempo', 'Correnti Nascoste', 'Tempo', ['marea'], 'nocchiero', 'Una minaccia presto, poi rimandi in mano e fai saltare gli attacchi finché non vinci.', ['marea-c2', 'marea-c2', 'marea-c6', 'marea-c6', 'marea-c10', 'marea-c10', 'marea-c7', 'marea-c7', 'marea-c8', 'marea-c8', 'marea-c9', 'marea-c9', 'marea-u5', 'marea-u5', 'marea-u0', 'marea-u0', 'marea-u7', 'marea-u7', 'marea-r3', 'marea-r3', 'marea-r5', 'marea-r5', 'marea-r6', 'marea-r6', 'marea-c5', 'marea-c5', 'marea-u3', 'marea-u3', 'marea-l0', 'marea-r1']),
    archetype('a-prison', 'Morsa di Sale', 'Prison', ['marea', 'vuoto'], 'veggente', "Rendi tutto più caro e più lento per l'avversario, poi chiudi con il Kraken.", ['marea-u4', 'marea-u4', 'marea-u6', 'marea-u6', 'marea-u2', 'marea-u2', 'marea-c8', 'marea-c8', 'marea-c3', 'marea-c3', 'marea-u3', 'marea-u3', 'marea-r4', 'marea-r4', 'marea-l3', 'marea-c10', 'marea-c10', 'marea-c4', 'marea-c4', 'marea-r6', 'marea-r6', 'marea-l0', 'vuoto-c5', 'vuoto-c5', 'vuoto-r1', 'vuoto-r1', 'vuoto-c0', 'vuoto-c0', 'vuoto-u0', 'vuoto-u0']),
    archetype('a-control', 'Silenzio del Faro', 'Control', ['marea', 'vuoto'], 'ecate', 'Sopravvivi, pesca e distruggi: vinci tardi con le carte migliori.', ['marea-l3', 'marea-u0', 'marea-u0', 'marea-c4', 'marea-c4', 'marea-u1', 'marea-u1', 'marea-r0', 'marea-r0', 'marea-l1', 'marea-c3', 'marea-c3', 'marea-u3', 'vuoto-r3', 'vuoto-r3', 'vuoto-r1', 'vuoto-r1', 'vuoto-r5', 'vuoto-r5', 'vuoto-c5', 'vuoto-c5', 'vuoto-c6', 'vuoto-c6', 'vuoto-u1', 'vuoto-u1', 'vuoto-l1', 'vuoto-c4', 'vuoto-c4', 'vuoto-u3', 'vuoto-u3']),
    archetype('a-ramp', 'Radici Profonde', 'Ramp', ['radice'], 'madre', 'Accumula Cristalli in fretta e gioca Titani e Yggrin prima del tempo.', ['radice-c6', 'radice-c6', 'radice-c8', 'radice-c8', 'radice-r4', 'radice-r4', 'radice-c10', 'radice-c10', 'radice-c7', 'radice-c7', 'radice-u5', 'radice-u5', 'radice-u0', 'radice-u0', 'radice-r0', 'radice-r0', 'radice-r3', 'radice-r3', 'radice-r2', 'radice-r2', 'radice-l0', 'radice-l2', 'radice-c1', 'radice-c1', 'radice-c3', 'radice-c3', 'radice-u4', 'radice-u4', 'radice-l1', 'radice-r5']),
    archetype('a-midrange', 'Branco del Bosco', 'Midrange', ['radice', 'brace'], 'guardaboschi', 'Unità solide ed efficienti che si adattano a ogni partita.', ['radice-c9', 'radice-c9', 'radice-c4', 'radice-c4', 'radice-u3', 'radice-u3', 'radice-r2', 'radice-r2', 'radice-r6', 'radice-r6', 'radice-u5', 'radice-u5', 'radice-c2', 'radice-c2', 'radice-u7', 'radice-u7', 'radice-r3', 'radice-r3', 'radice-c5', 'radice-c5', 'radice-l0', 'brace-c1', 'brace-c1', 'brace-u3', 'brace-u3', 'brace-r0', 'brace-r0', 'brace-u0', 'brace-u0', 'brace-r2']),
    archetype('a-combo', 'Patto del Nulla', 'Combo', ['vuoto'], 'traghettatore', 'Sacrifica, rialza, ripeti: ogni morte ti porta più vicino al colpo finale.', ['vuoto-c0', 'vuoto-c0', 'vuoto-c7', 'vuoto-c7', 'vuoto-c9', 'vuoto-c9', 'vuoto-c8', 'vuoto-c8', 'vuoto-c2', 'vuoto-c2', 'vuoto-c10', 'vuoto-c10', 'vuoto-u0', 'vuoto-u0', 'vuoto-u2', 'vuoto-u2', 'vuoto-u3', 'vuoto-u3', 'vuoto-u5', 'vuoto-u5', 'vuoto-u6', 'vuoto-u6', 'vuoto-r4', 'vuoto-r4', 'vuoto-r6', 'vuoto-r6', 'vuoto-l2', 'vuoto-l0', 'vuoto-r0', 'vuoto-r0']),
    archetype('a-rintocco', 'Ultimo Rintocco', 'Rintocco', ['radice', 'vuoto'], 'guardaboschi', 'Lascia cadere un Sigillo al momento giusto: le tue carte rispondono tutte insieme.', ['radice-u7', 'radice-u7', 'radice-c7', 'radice-c7', 'radice-u5', 'radice-u5', 'radice-c10', 'radice-c10', 'radice-u0', 'radice-u0', 'radice-c1', 'radice-c1', 'radice-r1', 'radice-r1', 'radice-r0', 'radice-r0', 'radice-l0', 'vuoto-u7', 'vuoto-u7', 'vuoto-c7', 'vuoto-c7', 'vuoto-c0', 'vuoto-c0', 'vuoto-u1', 'vuoto-u1', 'vuoto-u0', 'vuoto-u0', 'vuoto-r2', 'vuoto-r2', 'vuoto-l0']),
];
export const starterDecks = (_owned?: Record<string, number>): Deck[] => PRESETS.map(({blurb: _b, ...d}) => ({
    ...d,
    cards: [...d.cards]
}));

export function deckIssues(d: Deck, owned: Record<string, number>) {
    const out: string[] = [], en = dataLang() === 'en';
    if (d.cards.length !== 30) out.push(en ? `${d.cards.length} cards out of 30` : `${d.cards.length} carte su 30`);
    if (new Set(d.cards.map(id => BYID[id].f)).size > 2) out.push(en ? 'more than two factions' : 'più di due fazioni');
    const cnt = countMap(d.cards);
    for (const id in cnt) if (cnt[id] > (owned[id] || 0)) {
        out.push(en ? 'contains cards you no longer own' : 'contiene carte che non possiedi più');
        break;
    }
    return out;
}
