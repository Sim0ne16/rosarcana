// Spedizione: una corsa roguelike. Parti con un mazzo piccolo di una fazione e lo fai crescere tra uno scontro e l'altro.
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {CARDS} from '../../engine';
import {aiDeck, type CustodeId, custodiOf, type Faction} from './deps';
import {pickOptions, shuffled} from './pool';
import type {Reward} from '../../economy/constants';

export interface ExpStage {
    foe: string;
    facs: Faction[];
    tier: number;
    noise: number;
    seal: number;
    boss?: boolean
}

export interface ExpRun {
    fac: Faction;
    custode: CustodeId;
    deck: string[];
    stages: ExpStage[];
    at: number;
    sealBonus: number;
    offer: string[] | null;
    dead: boolean;
    claimed: boolean
}

const FOES = ['Predone delle Ceneri', 'Sirena delle Secche', 'Custode dei Rovi', 'Monaca del Silenzio', 'Mercenario del Faro', 'Strega della Palude', 'Cavaliere Cavo'];

function makeStages(fac: Faction): ExpStage[] {
    const others = shuffled((['brace', 'marea', 'radice', 'vuoto'] as Faction[]).filter(f => f !== fac));
    const tiers = [0, 0, 1, 1, 2, 2], noise = [8, 6, 5, 4, 3, 2.5];
    const stages: ExpStage[] = tiers.map((t, i) => ({
        foe: FOES[i],
        facs: [others[i % 3], others[(i + 1) % 3]],
        tier: t,
        noise: noise[i],
        seal: 8 + Math.floor(i / 2)
    }));
    stages.push({foe: 'Nyxa, Regina del Nulla', facs: ['vuoto', 'marea'], tier: 3, noise: 1.2, seal: 12, boss: true});
    return stages;
}

/** Partite da giocare prima che la Spedizione si sblocchi. */
export const EXP_MIN_GAMES = 5;
export const EXP_BLESSING = 2;

interface ExpState {
    run: ExpRun | null;
    best: number;
    start: (fac: Faction) => void;
    win: () => void;
    lose: () => void;
    take: (id: string | 'bless') => void;
    remove: (idx: number) => void;
    clear: () => void
}

export const useExpedition = create<ExpState>()(persist((set, get) => ({
    run: null, best: 0,
    start: fac => {
        const commons = CARDS.filter(c => c.f === fac && c.r === 'c').map(c => c.id),
            unc = shuffled(CARDS.filter(c => c.f === fac && c.r === 'u').map(c => c.id)).slice(0, 2);
        set({
            run: {
                fac,
                custode: shuffled(custodiOf(fac))[0].id,
                deck: [...commons, ...commons, ...unc],
                stages: makeStages(fac),
                at: 0,
                sealBonus: 0,
                offer: null,
                dead: false,
                claimed: false
            }
        });
    },
    win: () => set(s => {
        if (!s.run) return s;
        const at = s.run.at + 1, done = at >= s.run.stages.length;
        return {run: {...s.run, at, offer: done ? null : pickOptions(2, at / 6)}, best: Math.max(get().best, at)};
    }),
    lose: () => set(s => (s.run ? {run: {...s.run, dead: true}} : s)),
    take: id => set(s => {
        if (!s.run) return s;
        return {
            run: {
                ...s.run,
                offer: null,
                deck: id === 'bless' ? s.run.deck : [...s.run.deck, id],
                sealBonus: s.run.sealBonus + (id === 'bless' ? EXP_BLESSING : 0)
            }
        };
    }),
    remove: idx => set(s => (s.run && s.run.deck.length > 10 ? {
        run: {
            ...s.run,
            offer: null,
            deck: s.run.deck.filter((_, i) => i !== idx)
        }
    } : s)),
    clear: () => set({run: null}),
}), {name: 'rosarcana-expedition'}));
export const expOver = (r: ExpRun) => r.dead || r.at >= r.stages.length;

export function expReward(r: ExpRun): Reward {
    const rw: Reward = {oro: 30 * r.at};
    if (r.at >= r.stages.length) {
        rw.pack = 1;
        rw.gettoni = 1;
        rw.polvere = 200;
    }
    return rw;
}

export const expOpponent = (st: ExpStage) => ({
    name: st.foe,
    deck: aiDeck(st.facs, st.tier, st.boss ? ['vuoto-l0', 'marea-l0'] : []),
    noise: st.noise,
    seal: st.seal
});
