// Intelligenza artificiale: valuta ogni azione possibile simulando il combattimento di fine turno.
import {BYID, CARDS} from './cards';
import {attackers, attackOne, chooseRes, endTurnEffects, moveTargets, moveUnit, playCard, playOptions} from './rules';
import {clone, costOf, hasKw, shuffle, uAtk, uMax} from './state';
import type {Action, Faction, Game} from './types';

export function evaluate(G: Game, p: number) {
    if (G.winner === p) return 1e6;
    if (G.winner === 1 - p) return -1e6;
    const me = G.p[p], op = G.p[1 - p];
    let s = 0;
    const sv = (P: typeof me) => P.seals.reduce((a, x) => a + (x > 0 ? x * 2.5 : -32), 0);
    s += sv(me) - sv(op);
    for (let q = 0; q < 2; q++) {
        const sg = q === p ? 1 : -1;
        G.p[q].board.forEach((B, l) => B.forEach(u => {
            const a = uAtk(G, q, l, u), hp = uMax(G, q, l, u) - u.dmg;
            s += sg * (a * 1.2 + hp * 0.9 + (u.kw.includes('Cresce') ? 1.5 : 0) + (u.kw.includes('Guardiano') ? 0.8 : 0));
        }));
    }
    s += me.hand.length * 1.6 - op.hand.length * 0.8 + me.maxC * 1.3 - op.maxC * 0.6;
    me.relics.forEach((r, l) => {
        if (r && me.seals[l] > 0) s += 4;
    });
    op.relics.forEach((r, l) => {
        if (r && op.seals[l] > 0) s -= 4;
    });
    const broken = me.seals.filter(x => x <= 0).length;
    for (let l = 0; l < 3; l++) {
        if (me.seals[l] <= 0) continue;
        const dmg = op.board[l].reduce((a, u) => a + uAtk(G, 1 - p, l, u) * (hasKw(G, 1 - p, u, 'Assedio') ? 2 : 1), 0);
        const through = me.board[l].length ? 0 : dmg;
        s -= Math.min(me.seals[l], through) * 2.2;
        if (through >= me.seals[l]) s -= broken ? 60 : 18;
    }
    return s;
}

function simEnd(G: Game, p: number) {
    endTurnEffects(G, p);
    for (let l = 0; l < 3; l++) for (const uid of attackers(G, p, l)) attackOne(G, p, l, uid);
}

export function actions(G: Game, p: number): Action[] {
    const out: Action[] = [];
    G.p[p].hand.forEach((_h, hi) => playOptions(G, p, hi).forEach(o => out.push({k: 'play', hi, o})));
    G.p[p].board.forEach(B => B.forEach(u => moveTargets(G, p, u.uid).forEach(to => out.push({
        k: 'move',
        uid: u.uid,
        to
    }))));
    return out;
}

export function apply(G: Game, p: number, a: Action) {
    if (a.k === 'play') playCard(G, p, a.hi, a.o); else moveUnit(G, p, a.uid, a.to);
}

export function bestAction(G: Game, p: number, noise: number): Action | null {
    const b = clone(G);
    b.sim = true;
    simEnd(b, p);
    let bv = evaluate(b, p) + 0.8, best: Action | null = null;
    for (const a of actions(G, p)) {
        const c = clone(G);
        c.sim = true;
        apply(c, p, a);
        simEnd(c, p);
        const v = evaluate(c, p) + Math.random() * noise;
        if (v > bv) {
            bv = v;
            best = a;
        }
    }
    return best;
}

/** Non più usata: il Cristallo arriva da solo a inizio turno. Resta per compatibilità. */
export function aiChoose(G: Game, p: number) {
    if (G.phase !== 'choice') return;
    const P = G.p[p];
    const want = P.maxC < 3 || (P.maxC < 7 && P.hand.length >= 2 && P.hand.some(h => costOf(G, p, h) > P.maxC));
    chooseRes(G, p, want && P.maxC < 10 ? 'crystal' : 'draw');
}

/** Mazzo dell'IA con quote per rarità, come un mazzo reale: più il livello è alto, più rare e leggendarie. */
const QUOTA: Record<number, Record<'l' | 'r' | 'u' | 'c', number>> = {
    0: {l: 0, r: 0, u: 8, c: 22},
    1: {l: 0, r: 4, u: 10, c: 16},
    2: {l: 2, r: 8, u: 10, c: 10},
    3: {l: 4, r: 10, u: 9, c: 7}
};

export function aiDeck(facs: Faction[], tier: number, force: string[] = []) {
    const q = QUOTA[Math.max(0, Math.min(3, tier))], deck = [...force];
    const pools: Record<string, string[]> = {l: [], r: [], u: [], c: []};
    CARDS.filter(c => facs.includes(c.f)).forEach(c => {
        const n = c.r === 'l' ? 1 : 2;
        for (let i = 0; i < n; i++) pools[c.r].push(c.id);
    });
    force.forEach(id => {
        const P = pools[BYID[id]?.r ?? 'c'], i = P.indexOf(id);
        if (i >= 0) P.splice(i, 1);
    });
    (['l', 'r', 'u', 'c'] as const).forEach(r => {
        shuffle(pools[r]);
        for (let k = 0; k < q[r] && pools[r].length && deck.length < 30; k++) deck.push(pools[r].pop()!);
    });
    const rest = shuffle([...pools.c, ...pools.u, ...pools.r]);
    while (deck.length < 30 && rest.length) deck.push(rest.pop()!);
    return deck;
}
