// Maestria delle carte: ogni carta sale di grado quando la giochi e completi le sue sfide.
import {cardInfo} from '../engine/cards';
import {dataLang, tr} from '../i18n/langState';
import {masteryName} from '../i18n/names';
import type {Pair} from '../i18n/words';

export interface CardMastery {
    xp: number;
    plays: number;
    wins: number;
    games: number;
    seal: number;
    kills: number;
    relic: number;
    done: string[]
}

export type MatchStats = Record<string, { plays: number; seal: number; kills: number; relic: number }>;
export const emptyMastery = (): CardMastery => ({
    xp: 0,
    plays: 0,
    wins: 0,
    games: 0,
    seal: 0,
    kills: 0,
    relic: 0,
    done: []
});

/** XP necessari per ogni grado: Bronzo, Argento, Oro, Platino, Diamante, Maestro. */
export const LEVEL_XP = [40, 120, 260, 450, 700, 1000];
export const levelOf = (xp: number) => LEVEL_XP.filter(t => xp >= t).length;
export const levelName = (lvl: number) => (lvl ? masteryName(lvl - 1, dataLang()) : tr('Nessun grado', 'No grade'));

export interface Challenge {
    id: string;
    txt: Pair;
    goal: number;
    stat: keyof Omit<CardMastery, 'xp' | 'done'>;
    xp: number;
    polvere: number
}

export function challengesFor(id: string): Challenge[] {
    const c = cardInfo(id), out: Challenge[] = [
        {id: 'gioca', txt: ['Gioca questa carta 15 volte', 'Play this card 15 times'], goal: 15, stat: 'plays', xp: 120, polvere: 40},
        {id: 'vinci', txt: ['Vinci 5 partite in cui l\'hai giocata', 'Win 5 matches in which you played it'], goal: 5, stat: 'wins', xp: 150, polvere: 60},
    ];
    if (c.t === 'U') out.push(
        {
            id: 'sigilli',
            txt: ['Infliggi 20 danni ai Sigilli con questa unità', 'Deal 20 damage to Seals with this unit'],
            goal: 20,
            stat: 'seal',
            xp: 150,
            polvere: 60
        },
        {
            id: 'uccisioni',
            txt: ['Elimina 8 unità nemiche in combattimento', 'Destroy 8 enemy units in combat'],
            goal: 8,
            stat: 'kills',
            xp: 150,
            polvere: 60
        });
    if (c.t === 'I') out.push({
        id: 'partite',
        txt: ['Giocala in 8 partite diverse', 'Play it in 8 different matches'],
        goal: 8,
        stat: 'games',
        xp: 150,
        polvere: 60
    });
    if (c.t === 'R') out.push({
        id: 'turni',
        txt: ['Tieni questa reliquia attiva per 15 turni', 'Keep this relic active for 15 turns'],
        goal: 15,
        stat: 'relic',
        xp: 150,
        polvere: 60
    });
    return out;
}

/** XP guadagnati in una partita, per una carta. */
export const matchXp = (st: MatchStats[string], win: boolean) => Math.min(3, st.plays) * 10 + (win && st.plays ? 15 : 0) + st.seal * 2 + st.kills * 6 + st.relic * 3;
