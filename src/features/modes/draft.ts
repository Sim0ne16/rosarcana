// Arena delle Rose (Draft), sul modello dell'Arena di Hearthstone: scegli un Custode (l'eroe), poi 30 volte una
// carta fra tre della stessa rarità, quasi tutte della sua Casata; gioca finché arrivi a 12 vittorie o 3 sconfitte.
// Gli avversari sono altri "giocatori di Arena" che fanno la loro bozza con le stesse regole.
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {BYID, type CardDef, CARDS, type Rarity} from '../../engine';
import {type CustodeId, CUSTODI, type Faction, OPP_NAMES_SAFE} from './deps';
import {shuffled} from './pool';
import type {Reward} from '../../economy/constants';

/** Partite da giocare prima che l'Arena si sblocchi. */
export const DRAFT_MIN_GAMES = 3;
export const DRAFT_COST = 150, DRAFT_COST_GEMS = 150, DRAFT_PICKS = 30, DRAFT_MAX_W = 12, DRAFT_MAX_L = 3;
/** Scelte speciali (indici 0-based): la rarità offerta è almeno Rara. */
export const SPECIAL_PICKS: readonly number[] = [0, 9, 19, 29];
/** Quota delle carte offerte che vengono dalla Casata del Custode; il resto dalle altre tre. */
export const MAIN_FAC_SHARE = 0.65;

const PICK_RARITY: Record<Rarity, number> = {c: 70, u: 22, r: 7, l: 1};
const SPECIAL_RARITY: Partial<Record<Rarity, number>> = {r: 85, l: 15};
/** Rarità più alta, poi più bassa: se una rarità è esaurita si ripiega sulla vicina. */
const RARITY_ORDER: readonly Rarity[] = ['l', 'r', 'u', 'c'];

/** Copie massime di una carta nel mazzo d'Arena. */
export const copyLimit = (c: CardDef) => (c.r === 'l' ? 1 : 2);

export interface DraftOffer {
    rar: Rarity;
    ids: string[]
}

export interface DraftRun {
    custodeChoices: CustodeId[];
    custode: CustodeId | null;
    /** Casata del Custode: la maggior parte delle carte offerte viene da qui. */
    fac: Faction | null;
    picks: string[];
    offer: DraftOffer | null;
    wins: number;
    losses: number;
    /** Ritirato prima della fine: la corsa si chiude con le ricompense delle vittorie ottenute. */
    retired: boolean;
    claimed: boolean
}

/* ---------------- Regole della bozza (pure, senza stato) ---------------- */

function weightedKey<K extends string>(w: Partial<Record<K, number>>): K {
    const e = Object.entries(w) as [K, number][];
    let x = Math.random() * e.reduce((a, [, v]) => a + v, 0);
    for (const [k, v] of e) if ((x -= v) <= 0) return k;
    return e[e.length - 1][0];
}

export const rollRarity = (pick: number): Rarity => weightedKey(SPECIAL_PICKS.includes(pick) ? SPECIAL_RARITY : PICK_RARITY);

const counts = (ids: readonly string[]) => ids.reduce<Record<string, number>>((m, id) => ((m[id] = (m[id] ?? 0) + 1), m), {});

/** Tre carte diverse della stessa rarità, ancora sotto il limite di copie; di solito della Casata `fac`. */
export function draftOffer(fac: Faction, picks: readonly string[], pick: number): DraftOffer {
    const have = counts(picks);
    const free = (c: CardDef) => (have[c.id] ?? 0) < copyLimit(c);
    const want = rollRarity(pick);
    // La rarità estratta, o la più vicina che ha ancora almeno tre carte disponibili.
    const rar = [want, ...RARITY_ORDER.filter(r => r !== want)].find(r => CARDS.filter(c => c.r === r && free(c)).length >= 3) ?? want;
    const pool = CARDS.filter(c => c.r === rar && free(c));
    const ids: string[] = [];
    for (let slot = 0; slot < 3 && ids.length < pool.length; slot++) {
        const left = pool.filter(c => !ids.includes(c.id));
        const home = left.filter(c => c.f === fac), away = left.filter(c => c.f !== fac);
        const preferred = Math.random() < MAIN_FAC_SHARE ? home : away;
        const src = preferred.length ? preferred : left;
        ids.push(src[Math.floor(Math.random() * src.length)].id);
    }
    return {rar, ids};
}

/** Curva di riferimento per 30 carte (costi 0..7+), usata dalla bozza dell'avversario. */
const TARGET_CURVE = [1, 4, 6, 6, 5, 4, 2, 2];
const RARITY_VALUE: Record<Rarity, number> = {c: 0, u: 0.6, r: 1.2, l: 2};

/** Valore di una carta per chi la sceglie: rarità, bisogno sulla curva e appartenenza alla Casata. */
function pickScore(c: CardDef, picks: readonly string[], fac: Faction) {
    const b = Math.min(7, c.c), onCurve = picks.filter(id => Math.min(7, BYID[id].c) === b).length;
    return RARITY_VALUE[c.r] + Math.max(0, TARGET_CURVE[b] - onCurve) * 0.6 + (c.f === fac ? 0.5 : 0);
}

/** Bozza automatica: con `skill` 1 sceglie sempre la carta migliore, con 0 a caso. */
export function botDraft(fac: Faction, skill: number): string[] {
    const picks: string[] = [];
    for (let i = 0; i < DRAFT_PICKS; i++) {
        const {ids} = draftOffer(fac, picks, i);
        const best = [...ids].sort((a, b) => pickScore(BYID[b], picks, fac) - pickScore(BYID[a], picks, fac))[0];
        picks.push(Math.random() < skill ? best : ids[Math.floor(Math.random() * ids.length)]);
    }
    return picks;
}

/** Avversario d'Arena con lo stesso record circa: bozza migliore e gioco più preciso a ogni vittoria. */
export function draftOpponent(wins: number) {
    const custode = shuffled(Object.keys(CUSTODI) as CustodeId[])[0];
    return {
        name: OPP_NAMES_SAFE[Math.floor(Math.random() * OPP_NAMES_SAFE.length)],
        custode,
        deck: botDraft(CUSTODI[custode].f, Math.min(1, 0.35 + wins * 0.055)),
        noise: Math.max(0.8, 5 - wins * 0.35)
    };
}

/* ---------------- Ricompense ---------------- */

/** Ricompense per numero di vittorie (0..12): almeno una bustina sempre, come nell'Arena di Hearthstone. */
export const DRAFT_REWARDS: readonly Reward[] = [
    {pack: 1},
    {pack: 1, oro: 20},
    {pack: 1, oro: 40},
    {pack: 1, oro: 60, polvere: 30},
    {pack: 1, oro: 80, polvere: 50},
    {pack: 2, oro: 90, polvere: 50},
    {pack: 2, oro: 110, polvere: 80},
    {pack: 2, oro: 130, polvere: 100, gettoni: 1},
    {pack: 2, oro: 160, polvere: 120, gettoni: 1},
    {pack: 3, oro: 190, polvere: 150, gettoni: 1},
    {pack: 3, oro: 220, polvere: 200, gettoni: 2},
    {pack: 3, oro: 260, polvere: 250, gettoni: 2},
    {pack: 4, oro: 320, polvere: 300, gettoni: 3, gemme: 100},
];
export const draftReward = (wins: number) => DRAFT_REWARDS[Math.min(wins, DRAFT_MAX_W)];
export const draftOver = (r: DraftRun) => r.retired || r.wins >= DRAFT_MAX_W || r.losses >= DRAFT_MAX_L;

/* ---------------- Stato della corsa ---------------- */

interface DraftState {
    run: DraftRun | null;
    freeUsed: boolean;
    best: number;
    start: () => void;
    chooseCustode: (id: CustodeId) => void;
    pick: (id: string) => void;
    result: (win: boolean) => void;
    retire: () => void;
    clear: () => void
}

const patchRun = (s: DraftState, f: (r: DraftRun) => Partial<DraftRun>) => (s.run ? {run: {...s.run, ...f(s.run)}} : s);

export const useDraft = create<DraftState>()(persist((set, get) => ({
    run: null, freeUsed: false, best: 0,
    start: () => set({
        run: {
            // Tre Custodi di Case diverse, così la scelta dell'eroe decide davvero lo stile del mazzo.
            custodeChoices: [...new Map(shuffled(Object.values(CUSTODI)).map(c => [c.f, c.id])).values()].slice(0, 3),
            custode: null, fac: null, picks: [], offer: null, wins: 0, losses: 0, retired: false, claimed: false
        }, freeUsed: true
    }),
    chooseCustode: id => set(s => patchRun(s, () => ({custode: id, fac: CUSTODI[id].f, offer: draftOffer(CUSTODI[id].f, [], 0)}))),
    pick: id => set(s => patchRun(s, r => {
        if (!r.fac || !r.offer?.ids.includes(id)) return {};
        const picks = [...r.picks, id];
        return {picks, offer: picks.length >= DRAFT_PICKS ? null : draftOffer(r.fac, picks, picks.length)};
    })),
    result: win => {
        set(s => patchRun(s, r => ({wins: r.wins + (win ? 1 : 0), losses: r.losses + (win ? 0 : 1)})));
        set({best: Math.max(get().best, get().run?.wins ?? 0)});
    },
    retire: () => set(s => patchRun(s, () => ({retired: true}))),
    clear: () => set({run: null}),
}), {
    name: 'rosarcana-draft',
    version: 2,
    // v1: corse da 7 vittorie senza Casata né rarità per scelta. Le si adatta invece di buttarle, così chi
    // aveva una corsa aperta non perde l'ingresso già pagato.
    migrate: (state, version) => {
        const s = state as { run: (DraftRun & { options?: string[] }) | null };
        if (version < 2 && s.run) {
            const r = s.run, fac = r.custode ? CUSTODI[r.custode].f : null;
            s.run = {
                custodeChoices: r.custodeChoices, custode: r.custode, fac, picks: r.picks,
                offer: fac && r.picks.length < DRAFT_PICKS ? draftOffer(fac, r.picks, r.picks.length) : null,
                wins: r.wins, losses: r.losses, retired: false, claimed: r.claimed
            };
        }
        return state as DraftState;
    },
}));
