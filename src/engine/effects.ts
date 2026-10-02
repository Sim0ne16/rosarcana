// Effetti delle carte: bersagli richiesti e cosa succede quando entrano in gioco o vengono lanciate.
import {cardInfo} from './cards';
import {
    bounce,
    cleanup,
    dmgSeal,
    dmgUnit,
    draw,
    emit,
    findU,
    glog,
    hasSpace,
    healSeal,
    highestGraveUnit,
    kill,
    pushAuto,
    pushTo,
    randomIntact,
    sacrifice,
    summon,
    toHand,
    uAtk as uAtkE
} from './state';
import type {Game, Target, TargetSpec, Unit} from './types';

export interface Effect {
    enterT?: TargetSpec;
    enter?: (G: Game, p: number, u: Unit, t: Target | undefined, lane: number, to?: number) => void;
    /** Solo per enterT: il testo dice esplicitamente "puoi" - si può giocare la carta senza scegliere un bersaglio
     * anche se ne esiste uno legale. Le altre abilità Quando entra con bersaglio sono obbligatorie: si può giocare
     * la carta senza effetto solo se davvero non c'è nessun bersaglio legale (gestito a monte da playOptions). */
    optional?: boolean;
    spellT?: TargetSpec;
    spell?: (G: Game, p: number, t: Target | undefined, to?: number) => void;
    /** L'effetto sposta il bersaglio in una corsia vicina scelta da chi gioca: le opzioni di gioco portano la
     * destinazione in `to`, e sono bersagli solo le unità che hanno davvero dove andare. */
    push?: boolean;
}

const tgtU = (G: Game, t?: Target) => (t && t.type === 'unit' ? findU(G, t.uid) : null);
const uidOf = (t?: Target) => (t && t.type === 'unit' ? t.uid : null);
const notRooted = (_G: Game, u: Unit) => !u.kw.includes('Radicato');
/** Sposta il bersaglio nella corsia scelta; senza scelta (vecchie chiamate) ne prende una a caso. */
const pushChosen = (G: Game, t: Target | undefined, to: number | undefined) => {
    const id = uidOf(t);
    if (id != null) (to != null ? pushTo(G, id, to) : pushAuto(G, id));
};

export const EFFECTS: Record<string, Effect> = {
    'brace-c7': {
        enterT: {kind: 'unit', side: 'ally', filter: (_G, u) => cardInfo(u.id).f === 'brace'},
        enter: (G, _p, u, t) => {
            const f = tgtU(G, t);
            if (f && f.u.uid !== u.uid) f.u.a += 1;
        }
    },
    'brace-c8': {
        spellT: {kind: 'unit', side: 'enemy'}, spell: (G, p, t) => {
            const f = tgtU(G, t);
            if (!f) return;
            dmgUnit(G, f.u, 2);
            dmgSeal(G, 1 - p, f.l, 1);
        }
    },
    'brace-r4': {
        enter: (G, p) => {
            G.p[1 - p].board.forEach(B => B.forEach(x => dmgUnit(G, x, 1)));
        }
    },
    'brace-r5': {
        spellT: {kind: 'lane'}, spell: (G, p, t) => {
            if (!t) return;
            G.p[1 - p].board[t.lane].forEach(x => dmgUnit(G, x, 3));
            dmgSeal(G, 1 - p, t.lane, 2);
        }
    },
    'brace-r6': {
        enter: (G, p, u) => {
            G.p[p].board.forEach(B => B.forEach(x => {
                if (x.uid !== u.uid && cardInfo(x.id).f === 'brace') x.a += 1;
            }));
        }
    },
    'marea-c7': {
        spellT: {kind: 'unit', side: 'enemy', filter: (_G, u) => cardInfo(u.id).c <= 3}, spell: (G, _p, t) => {
            const id = uidOf(t);
            if (id != null) bounce(G, id);
        }
    },
    'marea-c9': {
        enter: (G, p, _u, _t, l) => {
            if (l != null && G.omens?.[l]) draw(G, p, 1);
        }
    },
    'marea-c10': {
        spellT: {kind: 'unit', side: 'enemy'}, spell: (G, p, t) => {
            const f = tgtU(G, t);
            if (f) f.u.stun = true;
            draw(G, p, 1);
        }
    },
    'marea-r4': {
        enter: (G, p) => {
            G.p[1 - p].board.forEach(B => B.forEach(x => {
                x.stun = true;
            }));
            glog(G, 'krakenWakes', []);
        }
    },
    'marea-r5': {
        spellT: {kind: 'lane'}, spell: (G, p, t) => {
            if (t) G.p[1 - p].board[t.lane].forEach(x => {
                x.stun = true;
            });
            draw(G, p, 1);
        }
    },
    'marea-l2': {
        enter: (G, p, _u, _t, l) => {
            if (l == null) return;
            [...G.p[1 - p].board[l]].forEach(x => bounce(G, x.uid));
            G.p[p].board[l].forEach(x => {
                x.a += 1;
                x.h += 1;
            });
        }
    },
    'radice-c8': {
        spell: (G, p) => {
            const P = G.p[p];
            if (P.maxC < 10) P.maxC += 1;
        }
    },
    'radice-c10': {
        enterT: {kind: 'seal', side: 'ally'}, enter: (G, p, _u, t) => {
            if (t) healSeal(G, p, t.lane, 2);
        }
    },
    'radice-r4': {
        enter: (G, p) => {
            const P = G.p[p];
            if (P.maxC < 10) P.maxC += 1;
            [0, 1, 2].forEach(x => healSeal(G, p, x, 2));
        }
    },
    'radice-r5': {
        spell: (G, p) => {
            G.p[p].board.forEach(B => B.forEach(x => {
                x.a += 1;
                x.h += 2;
            }));
            draw(G, p, 1);
        }
    },
    'radice-l3': {
        spell: (G, p) => {
            G.p[p].board.forEach(B => B.forEach(x => {
                x.dmg = 0;
            }));
            [0, 1, 2].forEach(x => healSeal(G, p, x, 4));
            draw(G, p, 2);
        }
    },
    'vuoto-c8': {
        spellT: {kind: 'unit', side: 'ally'}, spell: (G, p, t) => {
            const id = uidOf(t);
            if (id == null) return;
            if (sacrifice(G, p, id)) {
                G.p[p].crystals += 1;
                draw(G, p, 1);
            }
        }
    },
    'vuoto-c10': {
        spell: (G, p) => {
            const P = G.p[p], i = P.deck.findIndex(id => cardInfo(id).t === 'U' && cardInfo(id).c <= 3);
            if (i >= 0) {
                const id = P.deck.splice(i, 1)[0];
                toHand(G, p, id, 0);
                glog(G, 'search', [p, id], p === 0 ? 'me' : 'op');
            }
        }
    },
    'vuoto-u5': {
        enter: (G, p, _u, _t, l) => {
            const P = G.p[p];
            let bi = -1;
            P.grave.forEach((id, i) => {
                const c = cardInfo(id);
                if (c.t === 'U' && c.c <= 2 && (bi < 0 || c.c > cardInfo(P.grave[bi]).c)) bi = i;
            });
            const lane = [l ?? 1, (l ?? 1) - 1, (l ?? 1) + 1, 0, 1, 2].find(x => hasSpace(G, p, x));
            if (bi >= 0 && lane != null) {
                const id = P.grave.splice(bi, 1)[0];
                summon(G, p, lane, id);
                glog(G, 'necroRaises', [id]);
            }
        }
    },
    'vuoto-r4': {
        enterT: {kind: 'unit', side: 'ally'}, optional: true, enter: (G, p, u, t) => {
            const id = uidOf(t);
            if (id == null || id === u.uid) return;
            if (sacrifice(G, p, id)) {
                u.a += 3;
                u.h += 3;
            }
        }
    },
    'vuoto-r5': {
        spellT: {kind: 'unit', side: 'enemy'}, spell: (G, p, t) => {
            const id = uidOf(t);
            if (id != null) kill(G, id);
            const s = randomIntact(G, p);
            if (s >= 0) dmgSeal(G, p, s, 3);
        }
    },
    'vuoto-l2': {
        enter: (G, p, _u, _t, l) => {
            const P = G.p[p];
            for (let k = 0; k < 2; k++) {
                const bi = highestGraveUnit(G, p),
                    lane = [l ?? 1, (l ?? 1) - 1, (l ?? 1) + 1, 0, 1, 2].find(x => hasSpace(G, p, x));
                if (bi < 0 || lane == null) break;
                const id = P.grave.splice(bi, 1)[0];
                summon(G, p, lane, id);
                glog(G, 'helRecalls', [id]);
            }
        }
    },
    'brace-u4': {
        enter: (G, p) => {
            [0, 1, 2].forEach(l => {
                if (G.p[1 - p].seals[l] > 0) dmgSeal(G, 1 - p, l, 1);
            });
        }
    },
    'marea-r3': {
        enterT: {kind: 'unit', side: 'enemy'}, enter: (G, _p, _u, t) => {
            const f = tgtU(G, t);
            if (f) {
                f.u.stun = true;
                glog(G, 'charmed', [f.u.id]);
            }
        }
    },
    'radice-c6': {
        enter: (G, p) => {
            const P = G.p[p];
            if (P.maxC < 10) {
                P.maxC += 1;
                glog(G, 'maxCrystal', [p]);
            }
        }
    },
    'vuoto-c6': {
        enter: (G, p) => {
            const P = G.p[p], i = P.deck.findIndex(id => cardInfo(id).t === 'I');
            if (i >= 0) {
                const id = P.deck.splice(i, 1)[0];
                toHand(G, p, id, 0);
                glog(G, 'search', [p, id], p === 0 ? 'me' : 'op');
            }
        }
    },
    'vuoto-r3': {
        spell: (G) => {
            for (let q = 0; q < 2; q++) G.p[q].board.forEach((B, l) => B.forEach(u => {
                if (uAtkE(G, q, l, u) <= 3) u.dead = true;
            }));
        }
    },
    'brace-c1': {
        enterT: {kind: 'unit', side: 'ally'}, enter: (G, _p, u, t) => {
            const f = tgtU(G, t);
            if (f && f.u.uid !== u.uid) f.u.a += 1;
        }
    },
    'brace-c3': {
        spellT: {kind: 'unit', side: 'any'}, spell: (G, _p, t) => {
            const f = tgtU(G, t);
            if (f) dmgUnit(G, f.u, 2);
        }
    },
    'brace-u1': {spell: (G, p) => G.p[1 - p].board.forEach(B => B.forEach(u => dmgUnit(G, u, 1)))},
    'brace-r1': {
        spellT: {kind: 'seal', side: 'enemy'}, spell: (G, p, t) => {
            if (t) dmgSeal(G, 1 - p, t.lane, 4);
        }
    },
    'brace-l0': {
        enter: (G, _p, u, _t, l) => {
            for (let q = 0; q < 2; q++) G.p[q].board[l].forEach(x => {
                if (x.uid !== u.uid) dmgUnit(G, x, 3);
            });
        }
    },
    'brace-l2': {
        // "Il gigante che porterà il fuoco alla fine del mondo. Nella Rosa, lo porta adesso": un colpo che
        // arde tutti i Sigilli nemici in un'unica entrata, non solo la sua corsia come Vulkara.
        enter: (G, p) => {
            [0, 1, 2].forEach(l => dmgSeal(G, 1 - p, l, 2));
        }
    },
    'marea-c0': {
        spellT: {kind: 'unit', side: 'any', filter: (_G, u) => cardInfo(u.id).c <= 2}, spell: (G, _p, t) => {
            const id = uidOf(t);
            if (id != null) bounce(G, id);
        }
    },
    'marea-c2': {
        enterT: {kind: 'unit', side: 'enemy', filter: notRooted}, push: true,
        enter: (G, _p, _u, t, _l, to) => pushChosen(G, t, to)
    },
    'marea-c4': {
        spellT: {kind: 'unit', side: 'any', filter: notRooted}, push: true, spell: (G, p, t, to) => {
            pushChosen(G, t, to);
            draw(G, p, 1);
        }
    },
    'marea-u0': {enter: (G, p) => draw(G, p, 1)},
    'marea-u1': {
        spellT: {kind: 'unit', side: 'any'}, spell: (G, _p, t) => {
            const id = uidOf(t);
            if (id != null) bounce(G, id);
        }
    },
    'marea-r0': {
        spellT: {kind: 'lane'}, spell: (G, p, t) => {
            if (!t) return;
            [...G.p[1 - p].board[t.lane]].forEach(u => bounce(G, u.uid));
        }
    },
    'marea-r1': {enter: (G, p, _u, _t, l) => [...G.p[1 - p].board[l]].forEach(x => pushAuto(G, x.uid))},
    'marea-l0': {
        enter: (G, p) => G.p[1 - p].board.forEach(B => [...B].forEach(x => {
            if (cardInfo(x.id).c <= 3) bounce(G, x.uid);
        }))
    },
    'marea-l1': {
        spell: (G, p) => {
            G.p[1 - p].board.forEach(B => [...B].forEach(x => bounce(G, x.uid)));
            draw(G, p, 2);
        }
    },
    'radice-c3': {
        spellT: {kind: 'unit', side: 'any'}, spell: (G, _p, t) => {
            const f = tgtU(G, t);
            if (f) f.u.h += 3;
        }
    },
    'radice-c4': {
        enterT: {kind: 'unit', side: 'enemy'}, enter: (G, _p, _u, t) => {
            const f = tgtU(G, t);
            if (f) dmgUnit(G, f.u, 1);
        }
    },
    'radice-c5': {
        spellT: {kind: 'unit', side: 'any'}, spell: (G, _p, t) => {
            const f = tgtU(G, t);
            if (f) {
                f.u.a += 2;
                f.u.h += 2;
            }
        }
    },
    'radice-u1': {
        spellT: {kind: 'lane'}, spell: (G, p, t) => {
            if (!t) return;
            for (let k = 0; k < 2; k++) {
                const l = [t.lane, t.lane - 1, t.lane + 1].find(x => hasSpace(G, p, x));
                if (l != null) summon(G, p, l, 'tok-germoglio');
            }
        }
    },
    'radice-r1': {
        spellT: {kind: 'seal', side: 'ally'}, spell: (G, p, t) => {
            if (t) healSeal(G, p, t.lane, 5);
        }
    },
    'radice-r2': {
        enter: (G, p, _u, _t, l) => [l - 1, l + 1].forEach(x => {
            if (x >= 0 && x < 3) summon(G, p, x, 'tok-cucciolo');
        })
    },
    'vuoto-c2': {
        spellT: {kind: 'unit', side: 'ally'}, spell: (G, p, t) => {
            const id = uidOf(t);
            if (id != null) sacrifice(G, p, id);
            draw(G, p, 2);
        }
    },
    'vuoto-c4': {
        enter: (G, p) => {
            const h = G.p[1 - p].hand;
            h.forEach(x => {
                x.known = true;
            });
            if (h.length) glog(G, 'eyeReveals', ['vuoto-c4', h.map(x => x.id)], p === 0 ? 'me' : 'op');
            else glog(G, 'eyeEmpty', ['vuoto-c4'], p === 0 ? 'me' : 'op');
            emit(G, {t: 'reveal', p, ids: h.map(x => x.id)});
        }
    },
    'vuoto-c5': {
        spellT: {kind: 'unit', side: 'enemy'}, spell: (G, _p, t) => {
            const f = tgtU(G, t);
            if (f) f.u.a = Math.max(0, f.u.a - 2);
        }
    },
    'vuoto-u1': {
        spell: (G, p) => {
            const P = G.p[p], bi = highestGraveUnit(G, p);
            if (bi >= 0) {
                const id = P.grave.splice(bi, 1)[0];
                toHand(G, p, id, 0);
                glog(G, 'backFromGrave', [id]);
            }
        }
    },
    'vuoto-u3': {
        enterT: {kind: 'unit', side: 'ally'}, optional: true, enter: (G, p, u, t) => {
            const id = uidOf(t);
            if (id == null || id === u.uid) return;
            const s = sacrifice(G, p, id);
            if (s) {
                u.a += s.a;
                u.h += s.h;
            }
        }
    },
    'vuoto-r1': {
        spellT: {kind: 'unit', side: 'any'}, spell: (G, _p, t) => {
            const id = uidOf(t);
            if (id != null) kill(G, id);
        }
    },
    'vuoto-l0': {
        enter: (G, p, _u, _t, l) => {
            const P = G.p[p], bi = highestGraveUnit(G, p);
            if (bi < 0) return;
            const lane = [l, l - 1, l + 1, 0, 1, 2].find(x => hasSpace(G, p, x));
            if (lane == null) return;
            const id = P.grave.splice(bi, 1)[0];
            summon(G, p, lane, id);
            glog(G, 'nyxaRaises', [id]);
        }
    },
    'vuoto-l1': {
        spell: (G, p) => {
            let n = 0;
            for (let q = 0; q < 2; q++) G.p[q].board.forEach(B => B.forEach(u => {
                u.dead = true;
                n++;
            }));
            cleanup(G);
            for (let i = 0; i < n; i++) {
                const l = randomIntact(G, 1 - p);
                if (l < 0) break;
                dmgSeal(G, 1 - p, l, 1);
            }
        }
    },
};
