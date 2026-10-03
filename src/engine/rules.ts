// Regole: opzioni di gioco, turni, spostamenti e combattimento.
import {BYID, cardInfo} from './cards';
import {EFFECTS} from './effects';
import {advanceNight, NIGHT_PER_ROUND} from './night';
import {type CustodeId, omenAt, omenFor, type OmenId, OMENS, omenSealHit} from './mechanics';
import {
    canAttack,
    cleanup,
    costOf,
    dmgSeal,
    dmgUnit,
    draw,
    emit,
    findU,
    glog,
    guarded,
    hasKw,
    hasSpace,
    laneExits,
    pushTargets,
    healSeal,
    intactLanes,
    mkUnit,
    randomIntact,
    rnd,
    shuffle,
    summon,
    survivedFight,
    uAtk,
    uMax,
    weakest
} from './state';
import type {Game, Player, PlayOpt, Target, TargetSpec, Unit} from './types';

export function legalTargets(G: Game, p: number, spec?: TargetSpec): Target[] {
    if (!spec) return [];
    if (spec.kind === 'unit') {
        const out: Target[] = [];
        for (let q = 0; q < 2; q++) {
            if (spec.side === 'ally' && q !== p) continue;
            if (spec.side === 'enemy' && q === p) continue;
            for (let l = 0; l < 3; l++) {
                if (q !== p && guarded(G, q, l)) continue;
                for (const u of G.p[q].board[l]) if (omenFor(G, l, u) !== 'nebbia' && (!spec.filter || spec.filter(G, u))) out.push({
                    type: 'unit',
                    p: q,
                    lane: l,
                    uid: u.uid
                });
            }
        }
        return out;
    }
    if (spec.kind === 'seal') {
        // Nessuna carta usa oggi side:'any' su un Sigillo, ma va gestito comunque: senza questo caso
        // esplicito ricadrebbe silenziosamente su "solo i tuoi", come per 'unit' qualche riga sopra.
        if (spec.side === 'any') return [0, 1].flatMap(q => intactLanes(G, q).map(l => ({
            type: 'seal' as const,
            p: q,
            lane: l
        })));
        const q = spec.side === 'enemy' ? 1 - p : p;
        return intactLanes(G, q).map(l => ({type: 'seal', p: q, lane: l}));
    }
    return [0, 1, 2].map(l => ({type: 'lane', lane: l}));
}

export const needsTarget = (id: string) => !!EFFECTS[id]?.spellT;
export const enterSpec = (id: string) => EFFECTS[id]?.enterT;
/** Vero solo se il testo dice esplicitamente "puoi": per le altre abilità di Ingresso con bersaglio,
 * scegliere un bersaglio (quando ne esiste uno legale) non è facoltativo. */
export const enterOptional = (id: string) => !!EFFECTS[id]?.optional;

export function playOptions(G: Game, p: number, hi: number): PlayOpt[] {
    const P = G.p[p], h = P.hand[hi];
    if (!h) return [];
    const c = BYID[h.id], e = EFFECTS[h.id] ?? {};
    if (costOf(G, p, h) > P.crystals && !canOffer(G, p, h.id)) return [];
    const out: PlayOpt[] = [];
    // Effetti che spostano il bersaglio: un'opzione per ogni corsia di destinazione, e solo per le unità che
    // possono davvero spostarsi (un bersaglio bloccato renderebbe l'effetto nullo).
    const withDest = (t: Target): PlayOpt[] => (e.push && t.type === 'unit' ? pushTargets(G, t.uid).map(to => ({target: t, to})) : [{target: t}]);
    if (c.t === 'U') {
        const tg = e.enterT ? legalTargets(G, p, e.enterT).flatMap(withDest) : [];
        for (let l = 0; l < 3; l++) if (hasSpace(G, p, l)) {
            tg.forEach(t => out.push({lane: l, ...t}));
            // Senza bersagli legali si gioca comunque, senza effetto. Con bersagli legali, si può rinunciare
            // solo se il testo dice esplicitamente "puoi" (optional) - le altre abilità di Ingresso con bersaglio
            // sono obbligatorie, non si aggirano giocando la carta senza scegliere.
            if (!tg.length || e.optional) out.push({lane: l});
        }
    } else if (c.t === 'R') intactLanes(G, p).forEach(l => out.push({lane: l}));
    else if (e.spellT) out.push(...legalTargets(G, p, e.spellT).flatMap(withDest));
    else out.push({});
    return out;
}

export function playCard(G: Game, p: number, hi: number, opt: PlayOpt) {
    const P = G.p[p], h = P.hand[hi];
    if (!h) return false;
    const c = BYID[h.id], e = EFFECTS[h.id] ?? {}, cost = costOf(G, p, h);
    if (cost > P.crystals && !canOffer(G, p, h.id)) return false;
    if (cost > P.crystals) {
        const n = c.offer!, l = offerSeal(G, p);
        P.seals[l] -= n;
        emit(G, {t: 'dmgS', p, l, n});
        glog(G, 'payHealth', [p, c.id, n, l], p === 0 ? 'me' : 'op');
    } else P.crystals -= cost;
    P.hand.splice(hi, 1);
    glog(G, 'play', [p, c.id], p === 0 ? 'me' : 'op');
    emit(G, {t: 'play', p, id: h.id});
    P.flags ??= {};
    if (c.t === 'I') P.flags.spell = true;
    if (c.t === 'U') {
        const u = mkUnit(G, h.id, h.cm, h.hid);
        if (P.custode === 'vesta' && !P.flags.unit) {
            u.a += 1;
            P.flags.unit = true;
        }
        P.board[opt.lane!].push(u);
        e.enter?.(G, p, u, opt.target, opt.lane!, opt.to);
    } else if (c.t === 'R') {
        const l = opt.lane!;
        if (P.relics[l]) P.grave.push(P.relics[l]!);
        P.relics[l] = h.id;
    } else {
        e.spell?.(G, p, opt.target, opt.to);
        P.grave.push(h.id);
        // il Ladro concentra il fuoco: ogni incantesimo brucia anche il Sigillo nemico più debole
        if (P.custode === 'ladro') {
            const l = weakest(G, 1 - p);
            if (l >= 0) dmgSeal(G, 1 - p, l, 1);
        }
    }
    cleanup(G);
    return true;
}

export const moveCost = (G: Game, p: number) => (G.p[p].board.some(B => B.some(u => u.id === 'marea-r2')) || (G.p[p].custode === 'nocchiero' && !G.p[p].flags?.move) ? 0 : 1);

export function moveTargets(G: Game, p: number, uid: number): number[] {
    const f = findU(G, uid);
    if (!f || f.p !== p || f.u.moved || f.u.kw.includes('Radicato') || G.p[p].crystals < moveCost(G, p)) return [];
    return laneExits(G, p, f.l, f.u);
}

export function moveUnit(G: Game, p: number, uid: number, to: number) {
    const f = findU(G, uid);
    if (!f) return;
    // il primo spostamento gratuito del Nocchiero non costa l'attacco
    const dash = G.p[p].custode === 'nocchiero' && !G.p[p].flags?.move;
    G.p[p].crystals -= moveCost(G, p);
    (G.p[p].flags ??= {}).move = true;
    if (dash) f.u.dash = true;
    G.p[p].board[f.l].splice(f.i, 1);
    f.u.moved = true;
    G.p[p].board[to].push(f.u);
    glog(G, 'move', [p, f.u.id, to], p === 0 ? 'me' : 'op');
    cleanup(G);
}

export function startTurn(G: Game, p: number) {
    G.active = p;
    G.turn++;
    // un round è finito quando torna di turno chi ha iniziato la partita
    if (p === G.first && G.turn > 1) advanceNight(G, NIGHT_PER_ROUND);
    G.phase = 'main';
    const P = G.p[p];
    P.crystals = P.maxC;
    P.flags = {};
    G.p[1 - p].flags = {...G.p[1 - p].flags, ferry: false};
    glog(G, 'turn', [G.turn, p], 'turn');
    P.board.forEach(B => B.forEach(u => {
        u.sick = false;
        u.guard = false;
        u.aim = undefined;
        u.moved = false;
        u.dash = false;
        if (u.kw.includes('Cresce')) {
            u.a++;
            u.h++;
        }
        if (u.id === 'radice-l0') {
            u.a += 1;
            u.h += 1;
            [0, 1, 2].forEach(x => healSeal(G, p, x, 2));
        }
    }));
    // Presagi che agiscono all'inizio del turno di chi ha unità nella corsia.
    [0, 1, 2].forEach(l => {
        const o = omenAt(G, l), B = P.board[l].filter(u => !u.dead), hit = B.filter(u => omenFor(G, l, u));
        if (o === 'miasma' && hit.length) {
            hit.forEach(u => dmgUnit(G, u, 1));
            glog(G, 'miasma', [p, l]);
        }
        if (o === 'luna' && hit.length) {
            const u = hit.reduce((a, b) => (uAtk(G, p, l, b) < uAtk(G, p, l, a) ? b : a));
            u.a++;
            u.h++;
            glog(G, 'moonGrows', [u.id]);
        }
        if (o === 'pozzo' && B.length > G.p[1 - p].board[l].filter(u => !u.dead).length) {
            draw(G, p, 1);
            glog(G, 'wellWhispers', [p]);
        }
    });
    P.relics.forEach((r, l) => {
        if (!r || P.seals[l] <= 0) return;
        emit(G, {t: 'relicTurn', p, id: r});
        if (r === 'brace-l1') {
            glog(G, 'firstFire', []);
            [0, 1, 2].forEach(x => dmgSeal(G, 1 - p, x, 1));
        }
        if (r === 'radice-l1') P.board.forEach(B => B.forEach(u => {
            u.a++;
            u.h++;
        }));
        if (r === 'brace-u6') {
            const all = G.p[1 - p].board.flatMap((B, x) => B.map(u => ({u, x})));
            if (all.length) {
                const t = all.reduce((a, b) => (uMax(G, 1 - p, b.x, b.u) - b.u.dmg < uMax(G, 1 - p, a.x, a.u) - a.u.dmg ? b : a));
                dmgUnit(G, t.u, 1);
            }
        }
        if (r === 'marea-l3') draw(G, p, 1);
        if (r === 'radice-u6' && hasSpace(G, p, l)) summon(G, p, l, 'tok-germoglio');
        if (r === 'vuoto-l3') {
            const all = P.board.flatMap((B, x) => B.map(u => ({u, x})));
            if (all.length) {
                const t = all.reduce((a, b) => (uAtk(G, p, b.x, b.u) < uAtk(G, p, a.x, a.u) ? b : a));
                t.u.dead = true;
                glog(G, 'pactConsumes', [t.u.id]);
                const s = randomIntact(G, 1 - p);
                if (s >= 0) dmgSeal(G, 1 - p, s, 2);
            }
        }
        if (r === 'marea-u2' && P.deck.length) {
            const top = P.deck[P.deck.length - 1];
            if (BYID[top].c > P.maxC + 1) {
                P.deck.pop();
                P.deck.unshift(top);
                glog(G, 'lighthouse', [r, p]);
            }
        }
    });
    // Ogni turno: +1 Cristallo permanente fino a 10; al massimo, si pesca una carta in più.
    if (P.maxC < 10) {
        P.maxC++;
        P.crystals = P.maxC;
        emit(G, {t: 'crystal', p, n: P.maxC});
    } else if (G.turn > 1) {
        draw(G, p, 1);
        glog(G, 'tenCrystals', [p]);
    }
    if (G.turn > 1) draw(G, p, 1);
    cleanup(G);
}

export function chooseRes(G: Game, p: number, which: 'crystal' | 'draw') {
    const P = G.p[p];
    if (which === 'crystal' && P.maxC < 10) {
        P.maxC++;
        P.crystals++;
        glog(G, 'pickCrystal', [p, P.maxC], p === 0 ? 'me' : 'op');
    } else {
        draw(G, p, 1);
        glog(G, 'pickDraw', [p], p === 0 ? 'me' : 'op');
    }
    G.phase = 'main';
}

export function endTurnEffects(G: Game, p: number) {
    G.p[p].board.forEach((B, l) => B.forEach(u => {
        if (u.id === 'radice-c1') healSeal(G, p, l, 1);
    }));
    if (G.p[p].custode === 'madre') {
        const l = weakest(G, p);
        if (l >= 0) healSeal(G, p, l, 1);
    }
}

/** Le unità che attaccheranno in una corsia, nell'ordine. */
export const attackers = (G: Game, p: number, l: number) => G.p[p].board[l].filter(u => !u.guard && canAttack(G, p, u) && uAtk(G, p, l, u) > 0).map(u => u.uid);

/** Può attaccare in questo turno (quindi ha senso offrirle la scelta tra attaccare e restare in guardia). */
export const readyToAttack = (G: Game, p: number, l: number, u: Unit) => !u.dead && !u.stun && canAttack(G, p, u) && uAtk(G, p, l, u) > 0;

/** Sfondare: l'unità ignora i Guardiani e può colpire chi vuole nella sua corsia. */
const breaches = (G: Game, p: number, u: Unit) => hasKw(G, p, u, 'Sfondare');

/** Nemici che un'unità può scegliere come bersaglio nella sua corsia: se ci sono Guardiani, solo loro. */
export function aimTargets(G: Game, p: number, uid: number): number[] {
    const f = findU(G, uid);
    if (!f || f.p !== p) return [];
    const foes = G.p[1 - p].board[f.l].filter(x => !x.dead);
    const guards = breaches(G, p, f.u) ? [] : foes.filter(x => hasKw(G, 1 - p, x, 'Guardiano'));
    return (guards.length ? guards : foes).map(x => x.uid);
}

/** Sceglie il bersaglio dell'attacco di questo turno. */
export function setAim(G: Game, p: number, uid: number, target: number) {
    const f = findU(G, uid);
    if (!f || !readyToAttack(G, p, f.l, f.u) || !aimTargets(G, p, uid).includes(target)) return false;
    f.u.aim = target;
    return true;
}

/** Il difensore che un'attaccante colpisce: un Guardiano se c'è (quello scelto, o il primo), altrimenti il
 * bersaglio scelto, altrimenti il primo della corsia. */
function defenderFor(G: Game, p: number, u: Unit, foes: Unit[]) {
    const guards = breaches(G, p, u) ? [] : foes.filter(x => hasKw(G, 1 - p, x, 'Guardiano'));
    const pool = guards.length ? guards : foes;
    return pool.find(x => x.uid === u.aim) ?? pool[0];
}

/** Attacca o resta in guardia: vale solo per il turno in corso. */
export function toggleGuard(G: Game, p: number, uid: number) {
    const f = findU(G, uid);
    if (!f || f.p !== p || !readyToAttack(G, p, f.l, f.u)) return false;
    f.u.guard = !f.u.guard;
    return true;
}

/** Un singolo attacco: restituisce il bersaglio colpito, per le animazioni. */
export function attackOne(G: Game, p: number, l: number, uid: number): { uid?: number; seal?: boolean } | null {
    if (G.winner != null) return null;
    const me = G.p[p], op = G.p[1 - p], u = me.board[l].find(x => x.uid === uid);
    if (!u || u.dead) return null;
    const atk = uAtk(G, p, l, u);
    if (atk <= 0 || !canAttack(G, p, u)) return null;
    if (u.stun) {
        u.stun = false;
        glog(G, 'stunned', [u.id]);
        return null;
    }
    const foes = op.board[l].filter(x => !x.dead);
    // Aggirare: se la sua corsia è difesa, colpisce un Sigillo vicino senza difensori
    if (foes.length && hasKw(G, p, u, 'Aggirare')) {
        const side = [l - 1, l + 1].filter(x => x >= 0 && x < 3 && op.seals[x] > 0 && !op.board[x].some(y => !y.dead));
        if (side.length) {
            const x = side[Math.floor(Math.random() * side.length)], n = omenSealHit(G, x, atk, u);
            glog(G, 'flank', [u.id, x, n], p === 0 ? 'me' : 'op');
            const before = op.seals.reduce((a, y) => a + y, 0);
            dmgSeal(G, 1 - p, x, n);
            if (hasKw(G, p, u, 'Linfa vitale')) healSeal(G, p, l, n);
            emit(G, {t: 'hit', p, id: u.id, n: before - op.seals.reduce((a, y) => a + y, 0)});
            return {seal: true};
        }
    }
    if (foes.length) {
        const t = defenderFor(G, p, u, foes), ta = uAtk(G, 1 - p, l, t);
        dmgUnit(G, t, atk);
        dmgUnit(G, u, ta);
        if (atk > 0 && hasKw(G, p, u, 'Veleno')) t.dead = true;
        if (ta > 0 && hasKw(G, 1 - p, t, 'Veleno')) u.dead = true;
        if (hasKw(G, p, u, 'Linfa vitale')) healSeal(G, p, l, atk);
        if (hasKw(G, 1 - p, t, 'Linfa vitale')) healSeal(G, 1 - p, l, ta);
        glog(G, 'clash', [u.id, atk, t.id, ta]);
        cleanup(G);
        // Arena di sangue: chi esce vivo da uno scontro in cui ha ucciso diventa più forte, attaccante o difensore.
        if (omenFor(G, l, u) === 'arena' && !findU(G, t.uid) && findU(G, u.uid)) {
            u.a++;
            glog(G, 'arenaKill', [u.id]);
        }
        if (omenFor(G, l, t) === 'arena' && !findU(G, u.uid) && findU(G, t.uid)) {
            t.a++;
            glog(G, 'arenaKill', [t.id]);
        }
        if (!findU(G, t.uid)) emit(G, {t: 'kill', p, id: u.id});
        if (findU(G, u.uid)) survivedFight(G, p, u);
        if (findU(G, t.uid)) survivedFight(G, 1 - p, t);
        return {uid: t.uid};
    }
    if (op.seals[l] > 0) {
        const n = omenSealHit(G, l, atk * (hasKw(G, p, u, 'Assedio') ? 2 : 1), u);
        glog(G, 'hitSeal', [u.id, l, n], p === 0 ? 'me' : 'op');
        const before = op.seals.reduce((a, x) => a + x, 0);
        dmgSeal(G, 1 - p, l, n);
        if (hasKw(G, p, u, 'Linfa vitale')) healSeal(G, p, l, n);
        if (hasKw(G, p, u, 'Scossa')) {
            const adj = [l - 1, l + 1].filter(x => x >= 0 && x < 3 && op.seals[x] > 0);
            if (adj.length) dmgSeal(G, 1 - p, adj[rnd(adj.length)], 1);
        }
        emit(G, {t: 'hit', p, id: u.id, n: before - op.seals.reduce((a, x) => a + x, 0)});
        return {seal: true};
    }
    return null;
}

export function combatLane(G: Game, p: number, l: number) {
    for (const uid of attackers(G, p, l)) {
        attackOne(G, p, l, uid);
        if (G.winner != null) return;
    }
}

export interface NewGameOpts {
    seal?: number;
    first?: number;
    keepOrder?: boolean;
    hands?: [string[], string[]];
    noOmens?: boolean;
    noBell?: boolean;
    mySeal?: number;
    startC?: number;
    omens?: (OmenId | null)[];
    custodi?: [CustodeId | null, CustodeId | null];
    /** Notte Incatenata: Nyxa come terzo giocatore (engine/night.ts). */
    night?: boolean
}

export function newGame(me: { name: string; deck: string[] }, op: {
    name: string;
    deck: string[]
}, o: NewGameOpts = {}): Game {
    const mk = (name: string, deck: string[], hp: number): Player => ({
        name, deck: o.keepOrder ? [...deck] : shuffle([...deck]), hand: [], grave: [], seals: [hp, hp, hp], sealMax: hp,
        relics: [null, null, null], board: [[], [], []], crystals: 0, maxC: 0,
    });
    const G: Game = {
        turn: 0,
        active: 0,
        phase: 'main',
        p: [mk(me.name, me.deck, o.mySeal ?? 10), mk(op.name, op.deck, o.seal ?? 10)],
        uidc: 0,
        log: [],
        ev: [],
        winner: null,
        first: o.first ?? (Math.random() < 0.5 ? 0 : 1)
    };
    G.omens = o.omens ?? (o.noOmens ? [null, null, null] : shuffle(Object.keys(OMENS) as OmenId[]).slice(0, 3));
    G.bell = o.noBell ? [null, null] : [mainFaction(me.deck), mainFaction(op.deck)];
    if (o.night) G.night = {chains: 0};
    if (o.startC) G.p.forEach(P => {
        P.maxC = o.startC!;
    });
    if (o.custodi) o.custodi.forEach((c, p) => {
        G.p[p].custode = c;
        if (c === 'ecate') G.p[p].maxC += 1;
    });
    if (o.hands) o.hands.forEach((h, p) => h.forEach(id => G.p[p].hand.push({id, cm: 0, hid: ++G.uidc})));
    else {
        draw(G, G.first, 4);
        draw(G, 1 - G.first, 5);
        G.p.forEach((P, p) => {
            if (P.custode === 'veggente') draw(G, p, 1);
        });
    }
    G.ev = [];
    return G;
}

export {cardInfo};

/** Fazione principale di un mazzo: quella con più carte (decide l'Ultimo Rintocco). */
export function mainFaction(deck: string[]) {
    const n: Record<string, number> = {};
    deck.forEach(id => {
        const f = cardInfo(id).f;
        n[f] = (n[f] || 0) + 1;
    });
    return (Object.entries(n).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'brace') as import('./types').Faction;
}

/** Mulligan: le carte scelte tornano nel mazzo, che viene rimescolato, e si pescano altrettante carte. Una volta sola, a inizio partita. */
export function mulligan(G: Game, p: number, hids: number[]) {
    const P = G.p[p], back = P.hand.filter(h => hids.includes(h.hid));
    if (!back.length) return;
    P.hand = P.hand.filter(h => !hids.includes(h.hid));
    P.deck = shuffle([...P.deck, ...back.map(h => h.id)]);
    draw(G, p, back.length);
    glog(G, 'mulligan', [p, back.length], p === 0 ? 'me' : 'op');
}

/** L'IA sostituisce le carte troppo costose per l'inizio partita. */
export function aiMulligan(G: Game, p: number) {
    mulligan(G, p, G.p[p].hand.filter(h => cardInfo(h.id).c >= 5).map(h => h.hid));
}

/** Offerta N: la carta si può pagare con N punti vita del tuo Sigillo più integro, che non può scendere sotto 1. */
export const offerSeal = (G: Game, p: number) => [0, 1, 2].filter(l => G.p[p].seals[l] > 0).sort((a, b) => G.p[p].seals[b] - G.p[p].seals[a])[0] ?? -1;

export function canOffer(G: Game, p: number, id: string) {
    const n = BYID[id]?.offer;
    if (!n) return false;
    const l = offerSeal(G, p);
    return l >= 0 && G.p[p].seals[l] > n;
}

/** Vero se l'unità ha qualcosa da colpire: un'unità nemica, il Sigillo della corsia, o (con Aggirare) un Sigillo vicino scoperto. */
export function hasAttackTarget(G: Game, p: number, l: number, uid: number) {
    const u = G.p[p].board[l].find(x => x.uid === uid);
    if (!u) return false;
    const op = G.p[1 - p];
    if (op.board[l].some(x => !x.dead)) return true;
    return op.seals[l] > 0;
}
