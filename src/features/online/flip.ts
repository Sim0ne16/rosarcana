// Prospettiva dell'ospite in una sfida tra amici. La partita vive su chi l'ha creata (giocatore 0 per lui);
// l'interfaccia invece dà sempre per scontato che "tu" sia il giocatore 0. L'ospite riceve quindi ogni stato
// capovolto: giocatori scambiati, indici di giocatore negli eventi e nel registro rimappati, testi rifatti.
import {formatLog, IT_LOG, type LogKey} from '../../engine/log';
import {clone, type Game, LANE_NAME, nm, type PlayOpt, type Target} from '../../engine';
import {bellInfo} from '../../i18n/names';

/** Posizione dell'argomento "giocatore" nei messaggi del registro che ne hanno uno (vedi engine/log.ts). */
const PLAYER_ARG: Partial<Record<LogKey, number>> = {
    search: 0, maxCrystal: 0, payHealth: 0, play: 0, move: 0, turn: 1, miasma: 0, wellWhispers: 0, lighthouse: 1,
    tenCrystals: 0, pickCrystal: 0, pickDraw: 0, mulligan: 0, fatigue: 0, handFull: 0, sealBroken: 0, wins: 0,
    bounce: 1, sacrifice: 0, dies: 1, echo: 1, lastToll: 0,
};

const other = (p: number) => 1 - p;

/** Lo stato visto dall'altro giocatore. `me` e `foe` sono i nomi da mostrare (il giocatore locale è sempre "Tu"). */
export function flipGame(G0: Game, me: string, foe: string): Game {
    const G = clone(G0);
    G.p = [G.p[1], G.p[0]];
    G.p[0].name = me;
    G.p[1].name = foe;
    G.active = other(G.active);
    G.first = other(G.first);
    if (G.winner != null) G.winner = other(G.winner);
    if (G.bell) G.bell = [G.bell[1], G.bell[0]];
    G.ev = G.ev.map(e => ('p' in e ? {...e, p: other(e.p)} : e));
    const who = (p: number) => G.p[p].name;
    const fmt = {
        who, poss: who, s: () => '', has: () => 'ha', card: nm, cards: (ids: readonly string[]) => ids.map(nm).join(', '),
        lane: (l: number) => LANE_NAME[l], bell: (c: Parameters<typeof bellInfo>[0], f: Parameters<typeof bellInfo>[1]) => bellInfo(c, f, 'it').name,
    };
    G.log = G.log.map(line => {
        const cls = line.cls === 'me' ? 'op' : line.cls === 'op' ? 'me' : line.cls;
        if (!line.k || !line.a) return {...line, cls};
        const i = PLAYER_ARG[line.k];
        const a = i == null ? line.a : line.a.map((x, j) => (j === i ? other(x as number) : x));
        return {...line, cls, a, txt: formatLog(IT_LOG, fmt, line.k, a)};
    });
    return G;
}

/** Un bersaglio scelto dall'ospite, tradotto nella prospettiva di chi ospita (e viceversa). */
export const flipTarget = (t: Target): Target => (t.type === 'lane' ? t : {...t, p: other(t.p)});
export const flipOpt = (o: PlayOpt): PlayOpt => (o.target ? {...o, target: flipTarget(o.target)} : o);
