// Funzioni di base sullo stato di gioco. Tutto è deterministico a parte il generatore casuale,
// così lo stesso codice può girare su un server autoritativo.
import {BYID, cardInfo, LANE_NAME, SLOTS} from './cards';
import type {Game, GameEvent, HandCard, Keyword, LogLine, Unit} from './types';
import {ASCEND_FIGHTS, BELLS, CUSTODI, omenFor, synergyBonus} from './mechanics';
import {formatLog, IT_LOG, type LogArgs, type LogFmt, type LogKey} from './log';
import {advanceNight, NIGHT_PER_BREAK, NIGHT_PER_SACRIFICE} from './night';

export let random = Math.random;
export const setRandom = (fn: () => number) => {
    random = fn;
};
export const rnd = (n: number) => Math.floor(random() * n);

export function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = rnd(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const clone = <T, >(G: T): T => JSON.parse(JSON.stringify(G));
export const nm = (id: string) => cardInfo(id).n;

/** Formattatore italiano del registro, uno per partita (i nomi dei giocatori non cambiano). */
const itFmts = new WeakMap<Game, LogFmt>();
const itFmt = (G: Game): LogFmt => {
    let f = itFmts.get(G);
    if (!f) {
        const who = (p: number) => G.p[p].name;
        f = {
            who, poss: who, s: () => '', has: () => 'ha', card: nm, cards: ids => ids.map(nm).join(', '),
            lane: l => LANE_NAME[l], bell: (c, fac) => (c ? CUSTODI[c].bellName : BELLS[fac].name)
        };
        itFmts.set(G, f);
    }
    return f;
};

/** Aggiunge una riga al registro: testo italiano canonico, più chiave e argomenti per le altre lingue. */
export function glog<K extends LogKey>(G: Game, k: K, a: LogArgs<K>, cls: LogLine['cls'] = '') {
    if (G.sim) return;
    G.log.push({txt: formatLog(IT_LOG, itFmt(G), k, a), cls, k, a});
    if (G.log.length > 150) G.log.shift();
}

export function emit(G: Game, e: GameEvent) {
    if (!G.sim) G.ev.push(e);
}

export const relicIn = (G: Game, p: number, l: number) => G.p[p].seals[l] > 0 ? G.p[p].relics[l] : null;
/** Quante unità con quell'id ci sono in gioco dalla parte p, esclusa u stessa. */
const lords = (G: Game, p: number, id: string, u: Unit) => G.p[p].board.flat().filter(x => x.id === id && x.uid !== u.uid && !x.dead).length;
const fac = (u: Unit) => cardInfo(u.id).f;
export const uAtk = (G: Game, p: number, l: number, u: Unit) => Math.max(0, u.a + (relicIn(G, p, l) === 'brace-u2' ? 1 : 0) + (fac(u) === 'brace' ? lords(G, p, 'brace-r3', u) : 0) + synergyBonus(G, p, u)[0]
    + (omenFor(G, l, u) === 'cenere' ? 1 : 0) - (omenFor(G, l, u) === 'palude' ? 1 : 0) - (relicIn(G, 1 - p, l) === 'marea-u6' ? 1 : 0));
export const uMax = (G: Game, p: number, l: number, u: Unit) => u.h + (relicIn(G, p, l) === 'radice-u2' ? 2 : 0) + synergyBonus(G, p, u)[1] + (omenFor(G, l, u) === 'consacrata' ? 1 : 0) + (l === 1 && G.p[p].custode === 'guardaboschi' ? 1 : 0)
    + (fac(u) === 'marea' ? lords(G, p, 'marea-r6', u) : 0);

export function hasKw(G: Game, p: number, u: Unit, k: Keyword) {
    if (u.kw.includes(k)) return true;
    if (k === 'Rapido') return u.id !== 'brace-r2' && fac(u) === 'brace' && G.p[p].board.some(B => B.some(x => x.id === 'brace-r2'));
    if (k === 'Linfa vitale') return fac(u) === 'radice' && lords(G, p, 'radice-r6', u) > 0;
    if (k === 'Eco') return fac(u) === 'vuoto' && lords(G, p, 'vuoto-r6', u) > 0;
    return false;
}

/** Può attaccare a fine turno: non appena arrivata (salvo Rapido) e non se si è spostata in questo turno (o attacca o si sposta). */
export const canAttack = (G: Game, p: number, u: Unit) => (!u.moved || u.dash || hasKw(G, p, u, 'Slancio')) && (!u.sick || hasKw(G, p, u, 'Rapido'));

export function mkUnit(G: Game, id: string, cm = 0, uid?: number): Unit {
    const c = cardInfo(id);
    return {
        uid: uid ?? ++G.uidc,
        id,
        a: c.a,
        h: c.h,
        dmg: 0,
        kw: [...c.kw],
        sick: true,
        moved: false,
        stun: false,
        token: !!c.token,
        cm
    };
}

export function findU(G: Game, uid: number) {
    for (let p = 0; p < 2; p++) for (let l = 0; l < 3; l++) {
        const i = G.p[p].board[l].findIndex(u => u.uid === uid);
        if (i >= 0) return {p, l, i, u: G.p[p].board[l][i]};
    }
    return null;
}

export const hasSpace = (G: Game, p: number, l: number) => l >= 0 && l < 3 && G.p[p].board[l].length < SLOTS;
export const intactLanes = (G: Game, p: number) => [0, 1, 2].filter(l => G.p[p].seals[l] > 0);

export function randomIntact(G: Game, p: number) {
    const a = intactLanes(G, p);
    return a.length ? a[rnd(a.length)] : -1;
}

export function weakest(G: Game, p: number) {
    const a = intactLanes(G, p).sort((x, y) => G.p[p].seals[x] - G.p[p].seals[y]);
    return a.length ? a[0] : -1;
}

export function draw(G: Game, p: number, n = 1) {
    const P = G.p[p];
    for (let k = 0; k < n; k++) {
        if (!P.deck.length) {
            const l = weakest(G, p);
            glog(G, 'fatigue', [p]);
            if (l >= 0) dmgSeal(G, p, l, 2);
            continue;
        }
        const id = P.deck.pop()!;
        if (P.hand.length >= 10) {
            P.grave.push(id);
            glog(G, 'handFull', [p, id]);
        } else {
            P.hand.push({id, cm: 0, hid: ++G.uidc});
            emit(G, {t: 'draw', p});
        }
    }
}

export function toHand(G: Game, p: number, id: string, cm: number, hid?: number) {
    const P = G.p[p];
    if (P.hand.length < 10) P.hand.push({id, cm, hid: hid ?? ++G.uidc}); else P.grave.push(id);
}

export function dmgUnit(G: Game, u: Unit, n: number) {
    if (n <= 0) return;
    u.dmg += n;
    emit(G, {t: 'dmgU', uid: u.uid, n});
}

export function dmgSeal(G: Game, p: number, l: number, n: number) {
    const P = G.p[p];
    if (P.seals[l] <= 0 || n <= 0) return;
    const before = P.seals[l];
    P.seals[l] = Math.max(0, P.seals[l] - n);
    emit(G, {t: 'dmgS', p, l, n: before - P.seals[l]});
    if (P.seals[l] === 0) {
        glog(G, 'sealBroken', [p, l], 'big');
        emit(G, {t: 'break', p, l});
        if (P.relics[l]) {
            P.grave.push(P.relics[l]!);
            P.relics[l] = null;
        }
        checkWin(G);
        if (G.winner == null) ringBell(G, p, l);
        advanceNight(G, NIGHT_PER_BREAK);
    }
}

export function healSeal(G: Game, p: number, l: number, n: number) {
    const P = G.p[p];
    if (P.seals[l] <= 0) return;
    const before = P.seals[l];
    P.seals[l] = Math.min(P.sealMax, P.seals[l] + n);
    if (P.seals[l] > before) emit(G, {t: 'healS', p, l, n: P.seals[l] - before});
}

export function checkWin(G: Game) {
    if (G.winner != null) return;
    for (let p = 0; p < 2; p++) if (G.p[p].seals.filter(s => s <= 0).length >= 2) {
        G.winner = 1 - p;
        G.phase = 'over';
        glog(G, 'wins', [1 - p], 'big');
        return;
    }
}

export function removeU(G: Game, uid: number) {
    const f = findU(G, uid);
    if (!f) return null;
    G.p[f.p].board[f.l].splice(f.i, 1);
    return f;
}

export function bounce(G: Game, uid: number) {
    const f = removeU(G, uid);
    if (!f) return;
    if (!f.u.token) toHand(G, f.p, f.u.id, 0, f.u.uid);
    glog(G, 'bounce', [f.u.id, f.p]);
}

export function kill(G: Game, uid: number) {
    const f = findU(G, uid);
    if (f) f.u.dead = true;
}

export function sacrifice(G: Game, p: number, uid: number) {
    const f = findU(G, uid);
    if (!f || f.p !== p) return null;
    const st = {a: uAtk(G, f.p, f.l, f.u), h: Math.max(1, uMax(G, f.p, f.l, f.u) - f.u.dmg)};
    f.u.dead = true;
    glog(G, 'sacrifice', [p, f.u.id]);
    advanceNight(G, NIGHT_PER_SACRIFICE);
    const P = G.p[p];
    P.relics.forEach((r, l) => {
        if (r === 'vuoto-u2' && P.seals[l] > 0) {
            const t = randomIntact(G, 1 - p);
            if (t >= 0) dmgSeal(G, 1 - p, t, 2);
        }
    });
    cleanup(G);
    return st;
}

export function summon(G: Game, p: number, l: number, id: string) {
    if (!hasSpace(G, p, l)) return null;
    const u = mkUnit(G, id);
    G.p[p].board[l].push(u);
    return u;
}

/** Corsie vicine in cui un'unità del giocatore `p` può passare dalla corsia `l`: con spazio e senza Radici antiche.
 * Le Radici antiche bloccano sia l'uscita sia l'entrata, per gli spostamenti volontari come per quelli forzati
 * (non per chi ha Auspicio). */
export const laneExits = (G: Game, p: number, l: number, u?: Unit) =>
    (omenFor(G, l, u) === 'radici' ? [] : [l - 1, l + 1].filter(x => hasSpace(G, p, x) && omenFor(G, x, u) !== 'radici'));

/** Dove una carta può spingere l'unità `uid` (vuoto se è Radicata o non ha corsie libere accanto). */
export function pushTargets(G: Game, uid: number): number[] {
    const f = findU(G, uid);
    return !f || f.u.kw.includes('Radicato') ? [] : laneExits(G, f.p, f.l, f.u);
}

/** Spostamento forzato in una corsia scelta; ignorato se quella corsia non è una destinazione valida. */
export function pushTo(G: Game, uid: number, to: number) {
    const f = findU(G, uid);
    if (!f || !pushTargets(G, uid).includes(to)) return;
    G.p[f.p].board[f.l].splice(f.i, 1);
    G.p[f.p].board[to].push(f.u);
    glog(G, 'pushed', [f.u.id, to]);
}

/** Spostamento forzato in una corsia vicina a caso (effetti che non fanno scegliere, come la Leviatana). */
export function pushAuto(G: Game, uid: number) {
    const opts = pushTargets(G, uid);
    if (opts.length) pushTo(G, uid, opts[rnd(opts.length)]);
}

export function cleanup(G: Game) {
    let again = true;
    while (again) {
        again = false;
        for (let p = 0; p < 2; p++) for (let l = 0; l < 3; l++) {
            const B = G.p[p].board[l];
            // salute data da aure (sincronie, reliquie, presagi): se l'aura sparisce la salute scende, ma l'unità non muore per questo
            for (const u of B) {
                const aura = uMax(G, p, l, u) - u.h;
                if (u.auraH != null && aura < u.auraH) u.dmg = Math.max(0, u.dmg - (u.auraH - aura));
                u.auraH = aura;
            }
            for (let i = B.length - 1; i >= 0; i--) {
                const u = B[i];
                if (!u) continue;
                if (u.dead || u.dmg >= uMax(G, p, l, u)) {
                    B.splice(i, 1);
                    again = true;
                    onDie(G, p, u, l);
                    if (omenFor(G, l, u) === 'campane') healSeal(G, p, l, 1);
                }
            }
        }
    }
    checkWin(G);
}

function onDie(G: Game, p: number, u: Unit, l = -1) {
    const P0 = G.p[p];
    P0.flags ??= {};
    if (P0.custode === 'traghettatore' && !P0.flags.ferry && l >= 0) {
        P0.flags.ferry = true;
        glog(G, 'ferryman', []);
        dmgSeal(G, 1 - p, l, 1);
    }
    glog(G, 'dies', [u.id, p]);
    emit(G, {t: 'death', uid: u.uid, p});
    if (u.id === 'vuoto-c0' || u.id === 'brace-c9') draw(G, p, 1);
    if (u.id === 'vuoto-c7') {
        const t = randomIntact(G, 1 - p);
        if (t >= 0) dmgSeal(G, 1 - p, t, 1);
    }
    if (P0.relics.some((r, x) => r === 'vuoto-u6' && P0.seals[x] > 0) && !P0.flags.reliq) {
        P0.flags.reliq = true;
        draw(G, p, 1);
    }
    for (let q = 0; q < 2; q++) G.p[q].board.forEach(B => B.forEach(m => {
        if (m.id === 'vuoto-u0' && !m.dead) {
            m.a++;
            m.h++;
        }
    }));
    if (u.token) return;
    if (u.kw.includes('Eco') || (fac(u) === 'vuoto' && G.p[p].board.flat().some(x => x.id === 'vuoto-r6' && !x.dead))) {
        toHand(G, p, u.id, u.cm + 1, u.uid);
        glog(G, 'echo', [u.id, p]);
    } else G.p[p].grave.push(u.id);
}

export function highestGraveUnit(G: Game, p: number) {
    const P = G.p[p];
    let bi = -1;
    P.grave.forEach((id, i) => {
        const c = BYID[id];
        if (c && c.t === 'U' && (bi < 0 || c.c > BYID[P.grave[bi]].c)) bi = i;
    });
    return bi;
}

export function costOf(G: Game, p: number, h: HandCard) {
    let c = cardInfo(h.id).c + (h.cm || 0);
    if (G.p[p].custode === 'ladro' && cardInfo(h.id).t === 'I' && !G.p[p].flags?.spell) c -= 1;
    if (h.id === 'vuoto-r0') c -= Math.min(4, G.p[p].grave.filter(id => BYID[id]?.t === 'U').length);
    const O = G.p[1 - p];
    c += O.relics.filter((r, l) => r === 'marea-u4' && O.seals[l] > 0).length;
    if (cardInfo(h.id).f === 'brace' && G.p[p].relics.some((r, l) => r === 'brace-l3' && G.p[p].seals[l] > 0)) c -= 1;
    return Math.max(0, c);
}

export const guarded = (G: Game, owner: number, l: number) => [l - 1, l + 1].some(x => x >= 0 && x < 3 && G.p[owner].board[x].some(u => u.kw.includes('Guardiano')));

/** Ultimo Rintocco: la fazione del giocatore risponde alla caduta di un suo Sigillo (una volta per Sigillo). */
function ringBell(G: Game, p: number, l: number) {
    const P = G.p[p], O = G.p[1 - p], cu = P.custode ? CUSTODI[P.custode] : null, f = G.bell?.[p];
    rintocco(G, p, l);
    if (!cu && !f) {
        cleanup(G);
        return;
    }
    const name = cu ? cu.bellName : BELLS[f!].name, text = cu ? cu.bell : BELLS[f!].text;
    glog(G, 'lastToll', [p, P.custode ?? null, cu ? cu.f : f!], 'big');
    emit(G, {t: 'bell', p, l, f: cu ? cu.f : f!, name, text});
    if (cu) {
        if (cu.id === 'vesta') [0, 1, 2].forEach(x => {
            if (hasSpace(G, p, x)) summon(G, p, x, 'brace-c0');
        });
        if (cu.id === 'ladro') {
            const t = weakest(G, 1 - p);
            if (t >= 0) dmgSeal(G, 1 - p, t, 3);
        }
        if (cu.id === 'veggente') draw(G, p, 3);
        if (cu.id === 'nocchiero') O.board.forEach(B => [...B].forEach(u => {
            if (cardInfo(u.id).c <= 3) bounce(G, u.uid);
        }));
        if (cu.id === 'guardaboschi') {
            for (let k = 0; k < 2; k++) {
                const x = [l, l - 1, l + 1].find(y => hasSpace(G, p, y));
                if (x != null) summon(G, p, x, 'tok-germoglio');
            }
            [0, 1, 2].forEach(x => {
                if (x !== l) healSeal(G, p, x, 2);
            });
        }
        if (cu.id === 'madre') P.board.forEach(B => B.forEach(u => {
            u.a++;
            u.h++;
        }));
        if (cu.id === 'traghettatore') {
            const bi = highestGraveUnit(G, p);
            if (bi >= 0) {
                const id = P.grave.splice(bi, 1)[0];
                toHand(G, p, id, -cardInfo(id).c);
            }
        }
        if (cu.id === 'ecate') {
            // Attacco effettivo (uAtk), non il valore base: come brace-u6 e vuoto-l3 poco sopra,
            // altrimenti un'unità potenziata da relitto/aura/presagio non viene riconosciuta come la più forte.
            const all = O.board.flatMap((B, x) => B.map(u => ({u, x})));
            if (all.length) {
                const t = all.reduce((a, b) => (uAtk(G, 1 - p, b.x, b.u) > uAtk(G, 1 - p, a.x, a.u) ? b : a));
                t.u.dead = true;
            }
        }
    } else {
        if (f === 'brace') O.board[l].forEach(u => dmgUnit(G, u, 2));
        if (f === 'marea') [...O.board[l]].forEach(u => bounce(G, u.uid));
        if (f === 'radice') [0, 1, 2].forEach(x => {
            if (x !== l) healSeal(G, p, x, 3);
        });
        if (f === 'vuoto') {
            draw(G, p, 2);
            P.crystals += 2;
        }
    }
    cleanup(G);
}

/** Ascesa: conta i combattimenti superati e trasforma l'unità al terzo. */
export function survivedFight(G: Game, p: number, u: Unit) {
    if (u.dead || u.asc) return;
    u.fights = (u.fights ?? 0) + 1;
    if (u.fights >= ASCEND_FIGHTS) {
        u.asc = true;
        u.a += 2;
        u.h += 2;
        glog(G, 'ascends', [u.id], 'big');
        emit(G, {t: 'ascend', uid: u.uid, p});
    }
}

/** Parola chiave Rintocco: effetti delle tue carte in gioco quando uno dei tuoi Sigilli si spezza. */
function rintocco(G: Game, p: number, l: number) {
    const P = G.p[p], O = G.p[1 - p];
    P.board.forEach((B, x) => [...B].forEach(u => {
        if (u.dead) return;
        if (u.id === 'brace-c10') O.board[x].forEach(e => dmgUnit(G, e, 2));
        if (u.id === 'marea-u7') draw(G, p, 2);
        if (u.id === 'radice-u7') {
            u.a += 3;
            u.h += 3;
        }
        if (u.id === 'vuoto-u7') {
            const bi = highestGraveUnit(G, p);
            const lane = [x, x - 1, x + 1, 0, 1, 2].find(y => hasSpace(G, p, y));
            if (bi >= 0 && lane != null) {
                const id = P.grave.splice(bi, 1)[0];
                summon(G, p, lane, id);
            }
        }
        if (['brace-c10', 'marea-u7', 'radice-u7', 'vuoto-u7'].includes(u.id)) {
            glog(G, 'tollAnswer', [u.id]);
            emit(G, {t: 'relicTurn', p, id: u.id});
        }
    }));
    void l;
}
