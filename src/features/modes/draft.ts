// Arena delle Rose (Draft): scegli 1 carta su 3 per 30 volte, poi gioca finché non arrivi a 7 vittorie o 3 sconfitte.
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {aiDeck, type CustodeId, CUSTODI, type Faction, OPP_NAMES_SAFE} from './deps';
import {pickOptions, shuffled} from './pool';
import type {Reward} from '../../economy/constants';

export const DRAFT_COST = 150, DRAFT_PICKS = 30, DRAFT_MAX_W = 7, DRAFT_MAX_L = 3;

export interface DraftRun {
    custodeChoices: CustodeId[];
    custode: CustodeId | null;
    picks: string[];
    options: string[];
    wins: number;
    losses: number;
    claimed: boolean
}

interface DraftState {
    run: DraftRun | null;
    freeUsed: boolean;
    best: number;
    start: () => void;
    chooseCustode: (id: CustodeId) => void;
    pick: (id: string) => void;
    result: (win: boolean) => void;
    clear: () => void
}

export const useDraft = create<DraftState>()(persist((set, get) => ({
    run: null, freeUsed: false, best: 0,
    start: () => set({
        run: {
            custodeChoices: shuffled(Object.keys(CUSTODI) as CustodeId[]).slice(0, 3),
            custode: null,
            picks: [],
            options: [],
            wins: 0,
            losses: 0,
            claimed: false
        }, freeUsed: true
    }),
    chooseCustode: id => set(s => (s.run ? {run: {...s.run, custode: id, options: pickOptions(3)}} : s)),
    pick: id => set(s => {
        if (!s.run) return s;
        const picks = [...s.run.picks, id];
        return {run: {...s.run, picks, options: picks.length >= DRAFT_PICKS ? [] : pickOptions(3, picks.length / 60)}};
    }),
    result: win => set(s => {
        if (!s.run) return s;
        const r = {...s.run, wins: s.run.wins + (win ? 1 : 0), losses: s.run.losses + (win ? 0 : 1)};
        return {run: r, best: Math.max(get().best, r.wins)};
    }),
    clear: () => set({run: null}),
}), {name: 'rosarcana-draft'}));

export const draftOver = (r: DraftRun) => r.wins >= DRAFT_MAX_W || r.losses >= DRAFT_MAX_L;

export function draftReward(wins: number): Reward {
    const rw: Reward = {oro: 25 * wins};
    if (wins >= 3) rw.pack = 1;
    if (wins >= 5) {
        rw.pack = 2;
        rw.gettoni = 1;
    }
    if (wins >= 7) {
        rw.pack = 3;
        rw.polvere = 300;
        rw.gettoni = 2;
    }
    return rw;
}

/** Avversario del Draft: più forte a ogni vittoria. */
export function draftOpponent(wins: number) {
    const facs = shuffled(['brace', 'marea', 'radice', 'vuoto'] as Faction[]).slice(0, 2);
    return {
        name: OPP_NAMES_SAFE[Math.floor(Math.random() * OPP_NAMES_SAFE.length)],
        deck: aiDeck(facs, Math.min(3, 1 + Math.floor(wins / 2))),
        noise: [5, 4, 3.2, 2.6, 2, 1.5, 1][Math.min(6, wins)]
    };
}
