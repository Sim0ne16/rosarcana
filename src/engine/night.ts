// Notte Incatenata: modalità in cui Nyxa è un terzo giocatore. Ogni round e ogni Sigillo spezzato allentano le
// Catene; a certe soglie la Notte colpisce ENTRAMBI i giocatori. Spezzare un Sigillo resta un vantaggio, ma
// avvicina un pericolo comune: conta anche scegliere quando non colpire.
import {cleanup, dmgSeal, emit, glog, kill, uAtk} from './state';
import type {Game} from './types';

export type NightId = 'fog' | 'reap' | 'wake' | 'toll';

/** Catene guadagnate a ogni round completo, per ogni Sigillo spezzato e per ogni sacrificio (i patti del Vuoto). */
export const NIGHT_PER_ROUND = 1, NIGHT_PER_BREAK = 3, NIGHT_PER_SACRIFICE = 1;
/** Soglie fisse; dopo l'ultima, un rintocco nero ogni NIGHT_TOLL_EVERY catene. */
export const NIGHT_STEPS: readonly { at: number; id: NightId }[] = [{at: 4, id: 'fog'}, {at: 8, id: 'reap'}, {at: 12, id: 'wake'}];
export const NIGHT_TOLL_EVERY = 4;

export const NIGHT_TEXT: Record<NightId, { name: string; text: string }> = {
    fog: {name: 'Il buio avanza', text: 'La corsia centrale si copre di Nebbia: le sue unità non possono più essere bersagliate.'},
    reap: {name: 'La Notte reclama', text: 'L\'unità con più attacco di ogni giocatore viene distrutta.'},
    wake: {name: 'Nyxa si desta', text: 'Il Sigillo più debole di ogni giocatore subisce 2 danni.'},
    toll: {name: 'Rintocco nero', text: 'Il Sigillo più debole di ogni giocatore subisce 1 danno.'},
};

/** Prossima soglia dopo `chains` catene (per l'indicatore sul tavolo). */
export function nextNight(chains: number): { at: number; id: NightId } {
    const fixed = NIGHT_STEPS.find(s => s.at > chains);
    if (fixed) return fixed;
    const last = NIGHT_STEPS[NIGHT_STEPS.length - 1].at;
    return {at: last + Math.ceil((chains + 1 - last) / NIGHT_TOLL_EVERY) * NIGHT_TOLL_EVERY, id: 'toll'};
}

/** Tratto in corso verso la prossima soglia: da `from` (l'ultima soglia raggiunta, o 0) ad `at`. */
export function nightSegment(chains: number): { from: number; at: number; id: NightId } {
    const next = nextNight(chains), i = NIGHT_STEPS.findIndex(x => x.at === next.at);
    const from = next.id === 'toll' ? next.at - NIGHT_TOLL_EVERY : i > 0 ? NIGHT_STEPS[i - 1].at : 0;
    return {...next, from};
}

/** Soglie superate passando da `from` a `to` catene, in ordine. */
function crossed(from: number, to: number): NightId[] {
    const out: NightId[] = [];
    for (let c = from + 1; c <= to; c++) {
        const s = nextNight(c - 1);
        if (s.at === c) out.push(s.id);
    }
    return out;
}

/** Sigillo intatto con meno punti vita (-1 se non ne resta nessuno). */
const weakestSeal = (G: Game, p: number) => G.p[p].seals.reduce((best, hp, l) => (hp > 0 && (best < 0 || hp < G.p[p].seals[best]) ? l : best), -1);

function strike(G: Game, id: NightId) {
    // Chi non è di turno subisce per primo: se la Notte chiude la partita, non la regala a chi l'ha provocata.
    const order = [1 - G.active, G.active];
    if (id === 'fog') G.omens = (G.omens ?? [null, null, null]).map((o, l) => (l === 1 ? 'nebbia' : o));
    if (id === 'reap') {
        for (const p of order) {
            let best: { uid: number; a: number } | null = null;
            G.p[p].board.forEach((B, l) => B.forEach(u => {
                const a = uAtk(G, p, l, u);
                if (!best || a > best.a) best = {uid: u.uid, a};
            }));
            if (best) kill(G, (best as { uid: number }).uid);
        }
        cleanup(G);
    }
    if (id === 'wake' || id === 'toll') for (const p of order) {
        if (G.winner != null) break;
        const l = weakestSeal(G, p);
        if (l >= 0) dmgSeal(G, p, l, id === 'wake' ? 2 : 1);
    }
}

/** Fa avanzare le Catene (solo nelle partite di Notte Incatenata) e scatena le soglie superate. */
export function advanceNight(G: Game, n: number) {
    const N = G.night;
    if (!N || n <= 0 || G.winner != null) return;
    const from = N.chains;
    N.chains += n;
    // Un colpo della Notte può spezzare un Sigillo e far avanzare di nuovo le Catene: le soglie nuove si
    // accodano invece di annidarsi, così ognuna scatta una sola volta e nell'ordine giusto.
    if (N.busy) return;
    N.busy = true;
    let done = from;
    while (done < N.chains && G.winner == null) {
        const to = N.chains;
        for (const id of crossed(done, to)) {
            if (G.winner != null) break;
            glog(G, 'nightFalls', [id], 'big');
            emit(G, {t: 'night', id});
            strike(G, id);
        }
        done = to;
    }
    N.busy = false;
}
