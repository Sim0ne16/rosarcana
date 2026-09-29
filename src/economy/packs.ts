import {BY_RARITY, RARITY} from '../engine/cards';
import type {Rarity} from '../engine/types';
import {FIRST_LEG_BY, FOIL_CHANCE, ODDS, PITY_MAX} from './constants';

export interface PackCard {
    id: string;
    rar: Rarity;
    dust: number;
    isNew: boolean;
    foil: boolean;
    pity: boolean
}

export interface PackState {
    owned: Record<string, number>;
    foil: Record<string, boolean>;
    polvere: number;
    pity: number;
    opened: number;
    everLeg: boolean
}

function rollRarity(slot: number, forceLeg: boolean): Rarity {
    const x = Math.random();
    if (slot === 4) return forceLeg ? 'l' : x < ODDS.slot5.l ? 'l' : 'r';
    const o = ODDS.std;
    return x < o.l ? 'l' : x < o.l + o.r ? 'r' : x < o.l + o.r + o.u ? 'u' : 'c';
}

/** Apre una bustina modificando lo stato passato. In produzione gira sul server. */
export function openPack(s: PackState): PackCard[] {
    const forceLeg = s.pity >= PITY_MAX - 1 || (!s.everLeg && s.opened >= FIRST_LEG_BY - 1);
    const res: PackCard[] = [];
    let gotLeg = false;
    for (let i = 0; i < 5; i++) {
        let rar = rollRarity(i, forceLeg);
        // protezione doppioni: se hai già tutte le Comuni, lo slot diventa una Non comune
        const missing = (r: Rarity) => BY_RARITY[r].some(c => (s.owned[c.id] || 0) < RARITY[r].max);
        // solo uno scalino: una Comune già completa diventa Non comune; Rare e Leggendarie restano rare
        if (rar === 'c' && !missing('c') && missing('u')) rar = 'u';
        const avail = BY_RARITY[rar].filter(c => (s.owned[c.id] || 0) < RARITY[rar].max);
        const pool = avail.length ? avail : BY_RARITY[rar];
        const c = pool[Math.floor(Math.random() * pool.length)];
        const dust = avail.length ? 0 : RARITY[rar].dis, isNew = !dust && !s.owned[c.id];
        const foil = Math.random() < FOIL_CHANCE && !s.foil[c.id];
        if (dust) s.polvere += dust; else s.owned[c.id] = (s.owned[c.id] || 0) + 1;
        if (foil) s.foil[c.id] = true;
        if (rar === 'l') gotLeg = true;
        res.push({id: c.id, rar, dust, isNew, foil, pity: forceLeg && i === 4});
    }
    s.opened++;
    if (gotLeg) {
        s.pity = 0;
        s.everLeg = true;
    } else s.pity++;
    return res;
}

export const packsToGuarantee = (s: Pick<PackState, 'pity' | 'everLeg' | 'opened'>) => {
    const b = PITY_MAX - s.pity;
    return s.everLeg ? b : Math.min(b, FIRST_LEG_BY - s.opened);
};
