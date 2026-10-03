// Stato della partita e "regista" delle animazioni: esegue il motore passo per passo
// e pubblica ogni passo come istantanea immutabile per React.
import {create} from 'zustand';
import {
    aiDeck,
    aiGuards,
    aiMulligan,
    apply,
    attackers,
    attackOne,
    bestAction,
    BYID,
    cardInfo,
    clone,
    costOf,
    type CustodeId,
    custodiOf,
    EFFECTS,
    endTurnEffects,
    type Faction,
    findU,
    type Game,
    type GameEvent,
    hasAttackTarget,
    LANE_NAME,
    mainFaction,
    moveTargets,
    moveUnit,
    mulligan,
    newGame,
    type OmenId,
    OMENS,
    playCard,
    type PlayOpt,
    playOptions,
    startTurn,
    type Target,
    toggleGuard,
    readyToAttack,
    aimTargets,
    setAim,
} from '../../engine';
import {legendSfx, sfx} from '../../audio/sfx';
import {OPP_NAMES, type QuestEvent} from '../../economy/constants';
import {tierIdx, useProfile} from '../../profile/store';
import {DIFFS, stageReward} from '../adventure/model';
import {useEvent} from '../adventure/stories';
import {findAdventure, useAdventures} from '../adventure/store';
import {type TutExpect, TUTORIAL} from '../tutorial/script';
import type {MatchStats} from '../../economy/mastery';
import {aiReact, resetEmotes} from './emoteStore';
import {recordWar, warOmen} from '../war/war';
import {dataLang, tr} from '../../i18n/langState';
import {logTexts, playerName} from '../../i18n/log';
import {oppAim, type OppPlay, oppTone, revealMs} from './oppPlay';
import {EN_LANE_NAME} from '../../i18n/en/mechanics';
import {bellInfo, cardName, custodeName, factionName, nightText} from '../../i18n/names';
import {W} from '../../i18n/words';
import {flipGame, flipOpt} from '../online/flip';
import type {Link, Msg, RemoteAct} from '../online/net';

export interface Fx {
    id: number;
    kind: 'dmg' | 'heal' | 'break' | 'death' | 'ascend' | 'relic';
    uid?: number;
    /** Carta coinvolta (per 'relic': la reliquia che si è attivata). */
    card?: string;
    p?: number;
    l?: number;
    n?: number
}

export type Sel =
    | {
    kind: 'hand';
    hi: number;
    hid: number;
    opts: PlayOpt[];
    /** 'dest': bersaglio scelto, manca la corsia in cui spostarlo (effetti che spingono un'unità). */
    step: 'lane' | 'target' | 'dest' | 'confirm';
    lane?: number;
    targets?: Target[];
    target?: Target;
    dests?: number[];
    skip?: boolean
}
    | { kind: 'unit'; uid: number; to: number[]; aims: number[] };
export type Mode = 'ranked' | 'casual' | 'adv' | 'tutorial' | 'custom';

/** Partita configurata da un'altra modalità (Draft, Spedizione, prove, allenamento). */
export interface CustomMatch {
    label: string;
    startC?: number;
    me: { deck: string[]; custode?: CustodeId | null; seal?: number };
    op: { name: string; deck: string[]; noise: number; seal?: number; custode?: CustodeId | null };
    omens?: (OmenId | null)[];
    coach?: { title: string; tips: string[] };
    timed?: boolean;
    /** Notte Incatenata: Nyxa come terzo giocatore (engine/night.ts). */
    night?: boolean;
    /** Nessuna ricompensa, missione o statistica: solo le righe di `onEnd` (prove degli archetipi, sfide tra amici). */
    noRewards?: boolean;
    onEnd: (win: boolean) => string[];
}

/** Avvio di una sfida tra amici (features/online/FriendMatch.tsx). */
export interface OnlineStart {
    link: Link;
    me: { name: string; deck: string[]; custode: CustodeId | null; deckName: string };
    foe: { name: string; deck: string[]; custode: CustodeId | null };
    /** Solo per l'ospite: lo stato iniziale inviato da chi ospita. */
    start?: Game;
}

export type CoinFace = 'testa' | 'croce';

export interface Toss {
    /** Chi chiama la moneta: 0 il giocatore, 1 l'avversario (sorteggiato a caso). */
    caller: number;
    call: CoinFace | null;
    result: CoinFace | null;
    phase: 'call' | 'flip' | 'done';
    /** Scadenza della scelta del giocatore (ms): allo scadere la moneta viene chiamata a caso. */
    until?: number;
    /** Chi inizia, noto alla fine del lancio. */
    first?: number
}

interface Stack {
    id: string;
    hid: number;
    p: number;
    targeting?: boolean;
    /** Spostamento verso il bersaglio con cui la carta esce dalla pila (incantesimi e reliquie dell'avversario). */
    flyTo?: { x: number; y: number }
}

interface BattleState {
    G: Game | null;
    mode: Mode;
    node?: number;
    advId?: string;
    noise: number;
    sel: Sel | null;
    hint: string;
    stack: Stack | null;
    /** Giocata dell'avversario in corso, raccontata in tre tempi (vedi oppPlay.ts). */
    opp: OppPlay | null;
    /** Carta che l'avversario sta sfilando dalla mano (si solleva prima di volare sulla pila). */
    oppLift: number | null;
    /** Carta in mano sotto il mouse (hid): la riserva di Cristalli mostra quanti ne spenderebbe. */
    hoverHid: number | null;
    setHoverHid: (hid: number | null) => void;
    /** Testa o croce di inizio partita: chi chiama, cosa ha chiamato, cosa è uscito. */
    toss: Toss | null;
    /** Il giocatore chiama la moneta (quando il sorteggio ha scelto lui). */
    chooseToss: (call: CoinFace) => void;
    pending: number | null;
    dragging: number | null;
    attacking: { uid: number; p: number } | null;
    laneHl: number;
    fx: Fx[];
    banner: { txt: string; sub?: string; id: number } | null;
    busy: boolean;
    /** `cardLines`: progressi di maestria/sfide per singola carta - possono essere tanti, la UI li raccoglie a parte. */
    result: { win: boolean; lines: string[]; cardLines: string[] } | null;
    preview: { id: string; uid?: number; cost?: number; rect?: { x: number; y: number; w: number; h: number } } | null;
    shake: number;
    tutStep: number;
    tutFree: boolean;
    /** Tempo del turno e riserva (millisecondi). */
    timed: boolean;
    turnLeft: number;
    reserveLeft: number;
    reveal: { p: number; ids: string[]; id: number } | null;
    closeReveal: () => void;
    /** Entrata in scena di una leggendaria appena giocata. */
    legend: { id: string; p: number; k: number } | null;
    replay: { i: number; n: number; title: string } | null;
    openReplay: () => void;
    replayGo: (i: number) => void;
    mull: { sel: number[] } | null;
    /** Accende o spegne il tempo del turno (per i test); la riserva resta quella della partita. */
    toggleTimer: () => void;
    toggleMull: (hid: number) => void;
    confirmMull: () => void;
    coach: { title: string; tips: string[] } | null;
    startCustom: (m: CustomMatch) => void;
    /** Sfida tra amici: chi ospita crea la partita, l'ospite la riceve (`start`) dal primo messaggio. */
    startOnline: (o: OnlineStart) => void;
    lens: boolean;
    inspected: { id: string; uid?: number; cost?: number; p?: number } | null;
    toggleLens: () => void;
    inspect: (x: { id: string; uid?: number; cost?: number; p?: number } | null) => void;
    start: (mode: Mode, node?: number, advId?: string) => void;
    selectHand: (hi: number) => void;
    dropHand: (hi: number, drop: string | null) => void;
    clickLane: (l: number) => void;
    clickSeal: (p: number, l: number) => void;
    clickUnit: (uid: number) => void;
    /** Attacca o resta in guardia (per il turno in corso). */
    toggleGuard: (uid: number) => void;
    /** Tutte le unità pronte in guardia (true) o tutte all'attacco (false). */
    guardAll: (on: boolean) => void;
    dropUnit: (uid: number, drop: string | null) => void;
    confirm: () => void;
    skip: () => void;
    cancel: () => void;
    endTurn: () => void;
    setDragging: (hid: number | null) => void;
    setPreview: (p: BattleState['preview']) => void;
    tutNext: () => void;
    quit: () => void;
    exit: () => void;
}

let g: Game | null = null;
let stats: MatchStats = {};
let custom: CustomMatch | null = null;
/** Sfida tra amici in corso. Chi ospita fa girare il motore (l'amico è il giocatore 1); l'ospite manda le sue
 * azioni e riceve ogni stato capovolto, così per l'interfaccia resta sempre il giocatore 0. `wait`: l'ospite
 * aspetta la risposta a un'azione ('act') o la fine del proprio turno ('end'). */
let online: { link: Link; foe: string; mull: [boolean, boolean]; wait: 'act' | 'end' | null } | null = null;
let hostQ: Promise<unknown> = Promise.resolve();
const isHost = () => online?.link.role === 'host', isGuest = () => online?.link.role === 'guest';
const guestSend = (a: RemoteAct, w: 'act' | 'end' = 'act') => {
    if (!online) return;
    online.wait = w;
    online.link.send({t: 'act', a});
};
let bellsMe = 0;
/** Mosse del giocatore (carte giocate e spostamenti): sotto le 5 la partita non dà ricompense. */
let myMoves = 0;
export const MIN_MOVES = 5;
let myFacs: string[] = [];
export let myBack = 'cera';
let matchLabel = '', deckName = '';
const facsOf = (deck: string[]) => [...new Set(deck.map(id => BYID[id]?.f).filter(Boolean))] as string[];
export const TURN_SECONDS = 75, RESERVE_SECONDS = 60;
let beginLabel = '';

/** Fotogrammi della partita in corso e dell'ultima conclusa, per il replay. */
export interface ReplayFrame {
    G: Game;
    note: string
}

let frames: ReplayFrame[] = [];
export let lastReplay: { frames: ReplayFrame[]; title: string; win: boolean } | null = null;
let clock: ReturnType<typeof setInterval> | null = null, lastTick = 0, lastSec = -1;
/** Suono di pescata per ogni carta della mano iniziale, sincronizzato con l'animazione. */
const dealSounds = (n: number) => {
    for (let i = 0; i < n; i++) setTimeout(() => sfx('draw'), 350 + i * 220);
};
const stopClock = () => {
    if (clock) {
        clearInterval(clock);
        clock = null;
    }
};
const timeK = () => 1;
export const turnMs = () => TURN_SECONDS * 1000 * timeK(), reserveMs = () => RESERVE_SECONDS * 1000 * timeK();
let fxId = 0;
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
/** Argomenti dell'ultima partita creata: se la moneta sceglie un altro primo giocatore, si rifà la distribuzione. */
let lastArgs: Parameters<typeof newGame> | null = null;
let afterToss: ((call: CoinFace) => void) | null = null;
const STACK_MS = 650;
/** Tempo per leggere una carta appena rivelata sulla pila: più testo o parole chiave ha, più tempo resta esposta. */

export const useBattle = create<BattleState>((set, get) => {
    const alive = (G: Game | null) => !!G && g === G && !get().result;

    function commit() {
        if (!g) return;
        // chi ospita manda all'amico lo stato con gli eventi ancora dentro, prima che vengano consumati qui
        const snap = isHost() ? clone(g) : null;
        if (frames.length < 600) {
            const note = g.log[g.log.length - 1]?.txt ?? '';
            const last = frames[frames.length - 1];
            if (!last || last.note !== note || last.G.turn !== g.turn) frames.push({G: clone(g), note});
        }
        const ev = g.ev;
        g.ev = [];
        const fx: Fx[] = [], bells: Extract<GameEvent, { t: 'bell' }>[] = [];
        for (const e of ev) {
            if (e.t === 'dmgU') fx.push({id: ++fxId, kind: 'dmg', uid: e.uid, n: e.n});
            if (e.t === 'dmgS') fx.push({id: ++fxId, kind: 'dmg', p: e.p, l: e.l, n: e.n});
            if (e.t === 'healS') fx.push({id: ++fxId, kind: 'heal', p: e.p, l: e.l, n: e.n});
            if (e.t === 'relicTurn') fx.push({id: ++fxId, kind: 'relic', p: e.p, card: e.id});
            if (e.t === 'break') {
                fx.push({id: ++fxId, kind: 'break', p: e.p, l: e.l});
                sfx('seal');
                aiReact(e.p === 0 ? 'sealTaken' : 'sealLost');
            }
            if (e.t === 'death') sfx('death');
            if (e.t === 'draw' && e.p === 0) sfx('draw');
            if (e.t === 'crystal' && e.p === 0) setTimeout(() => sfx('crystal'), 350);
            if (e.t === 'night') {
                const txt = nightText(e.id, dataLang());
                sfx('toll');
                banner(txt.name, txt.text, 2600);
            }
            if (e.t === 'ascend') {
                fx.push({id: ++fxId, kind: 'ascend', uid: e.uid});
                sfx('ascend');
            }
            if (e.t === 'play' && cardInfo(e.id).r === 'l') {
                const k = Date.now();
                set({legend: {id: e.id, p: e.p, k}});
                legendSfx(e.id);
                setTimeout(() => set(st => (st.legend?.k === k ? {legend: null} : st)), 2300);
            }
            if (e.t === 'reveal') {
                const id = Date.now();
                set({reveal: {p: e.p, ids: e.ids, id}});
                sfx('lens');
                setTimeout(() => set(st => (st.reveal?.id === id ? {reveal: null} : st)), e.p === 0 ? 5200 : 3200);
            }
            if (e.t === 'bell') {
                bells.push(e);
                if (e.p === 0) bellsMe++;
            }
            if ('p' in e && e.p === 0 && (e.t === 'play' || e.t === 'hit' || e.t === 'kill' || e.t === 'relicTurn')) {
                const st = (stats[e.id] ??= {plays: 0, seal: 0, kills: 0, relic: 0});
                if (e.t === 'play') st.plays++; else if (e.t === 'hit') st.seal += e.n; else if (e.t === 'kill') st.kills++; else st.relic++;
            }
            if (e.t === 'dmgS') sfx('crack');
        }
        const broke = fx.some(f => f.kind === 'break');
        for (const b of bells) setTimeout(() => {
            sfx('toll');
            const toll = g ? bellInfo(g.p[b.p].custode, b.f, dataLang()) : b;
            banner(tr(W.lastToll), `${g ? playerName(g, b.p, dataLang()) : ''}: ${toll.name}. ${toll.text}`, 2600);
        }, 700);
        set(s => ({G: clone(g!), fx: [...s.fx, ...fx], shake: broke ? s.shake + 1 : s.shake}));
        if (snap) online!.link.send({t: 'state', G: snap});
        if (fx.length) {
            const ids = new Set(fx.map(f => f.id));
            setTimeout(() => set(s => ({fx: s.fx.filter(f => !ids.has(f.id))})), 1400);
        }
    }

    // I banner si mettono in fila invece di sostituirsi: un colpo della Notte o un Ultimo Rintocco che arriva
    // insieme a "Il tuo turno" non viene cancellato prima di poterlo leggere.
    const bannerQueue: { txt: string; sub?: string; ms: number }[] = [];
    let bannerSeq = 0;
    const showNextBanner = () => {
        const b = bannerQueue.shift();
        if (!b) return;
        const id = ++bannerSeq;
        set({banner: {txt: b.txt, sub: b.sub, id}});
        setTimeout(() => {
            set(s => (s.banner?.id === id ? {banner: null} : s));
            showNextBanner();
        }, b.ms);
    };
    const banner = (txt: string, sub?: string, ms = 1500) => {
        bannerQueue.push({txt, sub, ms});
        if (bannerQueue.length === 1 && !get().banner) showNextBanner();
    };

    // ---- tutorial ----
    const tutStep = () => (get().mode === 'tutorial' && !get().tutFree ? TUTORIAL.steps[get().tutStep] : null);

    function tutAllows(e: TutExpect | { type: 'select'; card: string } | {
        type: 'selectUnit';
        card: string
    }): boolean {
        const st = tutStep();
        if (!st) return true;
        if (st.kind === 'free') return true;
        const x = st.expect;
        if (st.kind !== 'do' || !x) {
            {
                sfx('error');
                set({hint: tr('Segui il suggerimento in alto.', 'Follow the hint at the top.')});
            }
            return false;
        }
        let ok = false;
        if (e.type === 'select') ok = x.type === 'play' && x.card === e.card;
        else if (e.type === 'selectUnit') ok = x.type === 'move' && x.card === e.card;
        else if (e.type === x.type) {
            if (e.type === 'play' && x.type === 'play') ok = e.card === x.card && (x.lane == null || e.lane === x.lane) && (x.targetCard == null || e.targetCard === x.targetCard);
            else if (e.type === 'move' && x.type === 'move') ok = e.card === x.card && e.to === x.to;
            else ok = true;
        }
        if (!ok) {
            sfx('error');
            set({hint: tr('Nel tutorial segui il passo indicato in alto.', 'In the tutorial, follow the step shown at the top.')});
        }
        return ok;
    }

    const tutAdvance = () => {
        if (tutStep()) set(s => ({tutStep: Math.min(TUTORIAL.steps.length - 1, s.tutStep + 1)}));
    };
    const tutOnMyTurn = () => {
        const st = tutStep();
        if (st?.kind === 'wait') tutAdvance();
    };

    // ---- fine partita ----
    /** Orologio del turno: prima scorre il tempo del turno, poi la riserva della partita; finiti entrambi il turno passa da solo. */
    function startClock() {
        stopClock();
        if (!get().timed) return;
        set({turnLeft: turnMs()});
        lastTick = performance.now();
        lastSec = -1;
        clock = setInterval(() => {
            const now = performance.now(), dt = now - lastTick;
            lastTick = now;
            const s = get();
            if (!g || s.result || g.active !== 0) {
                stopClock();
                return;
            }
            if (s.busy) return; // le animazioni non consumano tempo
            let {turnLeft, reserveLeft} = s;
            if (turnLeft > 0) turnLeft = Math.max(0, turnLeft - dt); else reserveLeft = Math.max(0, reserveLeft - dt);
            const secs = Math.ceil((turnLeft > 0 ? turnLeft : reserveLeft) / 1000);
            if (secs <= 10 && secs !== lastSec && secs > 0) {
                lastSec = secs;
                sfx('tick');
            }
            if (turnLeft <= 0 && s.turnLeft > 0 && reserveLeft > 0) banner(tr('Riserva di tempo', 'Reserve time'), tr(`Il tempo del turno è finito: ti restano ${Math.ceil(reserveLeft / 1000)} secondi di riserva`, `Turn time is up: ${Math.ceil(reserveLeft / 1000)} seconds of reserve left`), 1800);
            set({turnLeft, reserveLeft});
            if (turnLeft <= 0 && reserveLeft <= 0) {
                stopClock();
                cancelStack();
                set({hint: tr('Tempo scaduto: il turno passa all\'avversario.', 'Time is up: the turn passes to your opponent.')});
                sfx('error');
                void get().endTurn();
            }
        }, 200);
    }

    const mkGame = (...args: Parameters<typeof newGame>) => {
        lastArgs = args;
        return newGame(...args);
    };

    /** Testa o croce: un giocatore a caso chiama, la moneta gira, chi indovina (o chi vince, se chiama l'avversario)
     * inizia. Le carte si distribuiscono solo dopo, con il primo giocatore deciso dal lancio. */
    function tossThenMulligan() {
        const G0 = g, caller = Math.random() < 0.5 ? 0 : 1;
        const flip = async (call: CoinFace) => {
            const result: CoinFace = Math.random() < 0.5 ? 'testa' : 'croce';
            set({toss: {caller, call, result, phase: 'flip'}});
            sfx('coinFlip');
            // la moneta atterra poco prima della fine dell'animazione
            setTimeout(() => g === G0 && sfx('coin'), 1800);
            await wait(2100);
            if (!g || g !== G0 || get().result) return;
            const first = call === result ? caller : 1 - caller;
            set({toss: {caller, call, result, phase: 'done', first}});
            sfx(first === 0 ? 'claim' : 'turn');
            await wait(1700);
            if (!g || g !== G0 || get().result) return;
            if (first !== g.first && lastArgs) {
                const [me, op, opts] = lastArgs;
                g = mkGame(me, op, {...opts, first});
            }
            set({toss: null, G: clone(g), mull: {sel: []}});
            dealSounds(g.p[0].hand.length);
        };
        if (caller === 0) {
            // cinque secondi per chiamare; poi sceglie la sorte
            const until = Date.now() + 5000;
            set({toss: {caller, call: null, result: null, phase: 'call', until}, mull: null});
            const timer = setTimeout(() => {
                if (g === G0 && afterToss) get().chooseToss(Math.random() < 0.5 ? 'testa' : 'croce');
            }, 5000);
            afterToss = c => {
                clearTimeout(timer);
                void flip(c);
            };
        } else {
            set({toss: {caller, call: null, result: null, phase: 'call'}, mull: null});
            afterToss = null;
            // l'avversario ci pensa un attimo, poi chiama
            void wait(1300).then(() => {
                if (g === G0 && get().toss?.phase === 'call') {
                    const call: CoinFace = Math.random() < 0.5 ? 'testa' : 'croce';
                    set({toss: {caller, call, result: null, phase: 'call'}});
                    void wait(900).then(() => {
                        if (g === G0) void flip(call);
                    });
                }
            });
        }
    }

    /** Primo turno della partita (dopo l'eventuale mulligan). */
    function begin(label: string) {
        if (!g) return;
        aiReact('start', 1800);
        if (g.first === 0) {
            startTurn(g, 0);
            commit();
            banner(tr(W.yourTurn), `${label}. ${turnNote(g)}`);
            startClock();
        } else {
            banner(g.p[1].name, tr('inizia per primo', 'goes first'));
            if (isHost()) remoteTurnStart(); else void aiTurn();
        }
    }

    /** Azzera le statistiche della partita appena creata; `quiet` spegne le emote dell'avversario (tutorial). */
    function resetMatch(quiet: boolean) {
        online?.link.close();
        online = null;
        hostQ = Promise.resolve();
        stats = {};
        set({opp: null, oppLift: null, toss: null});
        afterToss = null;
        bellsMe = 0;
        myMoves = 0;
        frames = [];
        resetEmotes(quiet);
        bannerQueue.length = 0;
    }

    function finish() {
        stopClock();
        if (g) {
            frames.push({G: clone(g), note: g.winner === 0 ? 'Vittoria' : 'Sconfitta'});
            lastReplay = {frames, title: tr(`${g.p[0].name} contro ${g.p[1].name}`, `You vs ${g.p[1].name}`), win: g.winner === 0};
            aiReact(g.winner === 0 ? 'playerWon' : 'playerLost', 1500);
            frames = [];
        }
        if (!g || get().result) return;
        const win = g.winner === 0, s = get(), prof = useProfile.getState();
        // partite senza conseguenze (tutorial, prove degli archetipi, sfide tra amici): niente ricompense né statistiche
        const free = s.mode === 'tutorial' || (s.mode === 'custom' && !!custom?.noRewards);
        const short = !free && myMoves < MIN_MOVES;
        const cu = g.p[0].custode,
            custLines = cu && !free && !short ? prof.recordCustode(cu, custodeName(cu, dataLang()), win, bellsMe) : [];
        if (!free && !s.replay) prof.recordFactions(myFacs, win);
        if (!free && !s.replay && !short) {
            // Missioni del giorno legate a ciò che è successo in partita (le carte giocate vengono da `stats`).
            const all = Object.entries(stats), sum = (k: 'plays' | 'seal' | 'kills', t?: string) =>
                all.reduce((a, [id, st]) => a + (!t || BYID[id]?.t === t ? st[k] : 0), 0);
            prof.bump('unit', sum('plays', 'U'));
            prof.bump('spell', sum('plays', 'I'));
            prof.bump('relic', sum('plays', 'R'));
            prof.bump('sealDmg', sum('seal'));
            prof.bump('kill', sum('kills'));
            prof.bump('sealBreak', g.p[1].seals.filter(x => x <= 0).length);
            if (win) {
                if (s.mode === 'ranked') prof.bump('winRanked');
                if (g.p[0].seals.every(x => x > 0)) prof.bump('flawless');
                for (const f of myFacs) prof.bump(`win-${f}` as QuestEvent);
            }
        }
        if (!free && !short) {
            // Guerra della Rosa: i punti vanno alla Casata principale del mazzo giocato (tutte le carte, ovunque siano)
            const P = g.p[0];
            recordWar(mainFaction([...P.deck, ...P.grave, ...P.hand.map(h => h.id), ...P.board.flat().map(u => u.id)]), win);
        }
        prof.addHistory({
            t: Date.now(),
            mode: s.mode,
            label: matchLabel,
            foe: g.p[1].name,
            win,
            turns: g.turn,
            deck: deckName,
            custode: g.p[0].custode ?? null,
            facs: myFacs
        });
        const adv = s.mode === 'adv' && s.advId ? findAdventure(s.advId) : undefined,
            stage = adv && s.node != null ? adv.stages[s.node] : undefined;
        const builtin = adv?.id === 'cap1';
        if (s.mode === 'custom' && custom) {
            let lines: string[], cardLines: string[] = [];
            if (custom.noRewards) lines = custom.onEnd(win);
            else if (short) lines = [...(win ? [] : custom.onEnd(false)), tr(`Meno di ${MIN_MOVES} mosse: nessuna ricompensa`, `Fewer than ${MIN_MOVES} moves: no rewards`)];
            else {
                const r = prof.matchResult({mode: 'other', win, foe: g.p[1].name, stats});
                lines = [...custom.onEnd(win), ...r.lines, ...custLines];
                cardLines = r.cardLines;
            }
            sfx(win ? 'win' : 'lose');
            set({result: {win, lines, cardLines}, busy: true, sel: null, stack: null, pending: null});
            return;
        }
        let lines: string[], cardLines: string[] = [];
        if (short) {
            const r = prof.matchResult({mode: s.mode === 'custom' ? 'other' : s.mode, win, foe: g.p[1].name, noReward: true});
            lines = [...r.lines, tr(`Meno di ${MIN_MOVES} mosse: nessuna ricompensa`, `Fewer than ${MIN_MOVES} moves: no rewards`)];
        } else {
            const r = prof.matchResult({
                mode: s.mode === 'custom' ? 'other' : s.mode,
                win,
                node: builtin ? s.node : undefined,
                foe: g.p[1].name,
                advReward: stage && builtin ? stageReward(adv!, stage) : undefined,
                advName: stage?.n,
                stats
            });
            lines = r.lines;
            cardLines = r.cardLines;
            if (adv && stage && !builtin && win) {
                if (useAdventures.getState().complete(adv.id, s.node!)) lines.unshift(`${tr(W.firstWin)}: ` + prof.grant(stageReward(adv, stage), `${adv.title}, ${stage.n}`));
                else {
                    prof.grant({oro: 10}, adv.title);
                    lines.unshift(`+10 ${tr(W.gold)}`);
                }
            }
            lines.push(...custLines);
            const ev = useEvent.getState().ev?.ev;
            if (win && ev?.faction && s.mode !== 'tutorial' && g.p[0].grave.concat(g.p[0].hand.map(h => h.id), g.p[0].deck).some(id => BYID[id]?.f === ev.faction)) lines.push(`${ev.title}: ` + prof.grant({oro: 15}, ev.title) + tr(' per aver giocato ', ' for playing ') + factionName(ev.faction, dataLang()));
        }
        sfx(win ? 'win' : 'lose');
        set({result: {win, lines, cardLines}, busy: true, sel: null, stack: null, pending: null});
    }

    // ---- azioni del giocatore ----
    async function doPlay(hi: number, opt: PlayOpt, alreadyOnStack = false) {
        if (!g) return;
        const G = g, h = g.p[0].hand[hi];
        if (!h) return;
        const tgtCard = opt.target?.type === 'unit' ? findU(g, opt.target.uid)?.u.id : undefined;
        if (!tutAllows({type: 'play', card: h.id, lane: opt.lane, targetCard: tgtCard})) {
            cancelStack();
            return;
        }
        set({busy: true, sel: null, hint: '', stack: {id: h.id, hid: h.hid, p: 0}, pending: h.hid});
        sfx('play');
        if (isGuest()) {
            // la carta resta sulla pila finché chi ospita non risponde con lo stato aggiornato
            myMoves++;
            guestSend({k: 'play', hi, o: flipOpt(opt)});
            return;
        }
        if (isHost()) online!.link.send({t: 'stack', id: h.id, hid: h.hid});
        await wait(alreadyOnStack ? 250 : STACK_MS);
        if (!alive(G)) return;
        playCard(g, 0, hi, opt);
        myMoves++;
        set({stack: null, pending: null});
        commit();
        tutAdvance();
        await wait(380);
        if (!alive(G)) return;
        set({busy: false});
        if (g.winner != null) finish();
    }

    function cancelStack() {
        set({stack: null, pending: null, sel: null});
    }

    function beginTargeting(hi: number, opts: PlayOpt[], lane?: number) {
        const h = g!.p[0].hand[hi];
        const withT = opts.filter(o => o.target && (lane == null || o.lane === lane));
        set({
            sel: {
                kind: 'hand',
                hi,
                hid: h.hid,
                opts,
                step: 'target',
                lane,
                // più opzioni per lo stesso bersaglio (una per destinazione): ognuno compare una volta sola
                targets: withT.map(o => o.target!).filter((t, i, a) => a.findIndex(x => sameTarget(x, t)) === i),
                // "Salta effetto" esiste solo se opts contiene ancora l'opzione senza bersaglio per questa corsia:
                // playOptions() la toglie per le abilità obbligatorie quando un bersaglio legale esiste davvero.
                skip: lane != null && opts.some(o => o.lane === lane && !o.target)
            }, stack: {id: h.id, hid: h.hid, p: 0, targeting: true}, pending: h.hid, hint: ''
        });
    }

    function laneChosen(hi: number, opts: PlayOpt[], l: number) {
        const os = opts.filter(o => o.lane === l);
        if (!os.length) return false;
        const c = cardInfo(g!.p[0].hand[hi].id);
        if (c.t === 'U' && os.some(o => o.target)) {
            if (!tutAllows({type: 'play', card: c.id, lane: l})) return true;
            beginTargeting(hi, opts, l);
            return true;
        }
        void doPlay(hi, os.find(o => !o.target) ?? os[0]);
        return true;
    }

    const myTurn = () => !!g && g.active === 0 && g.winner == null && !get().busy;

    /** Sceglie il bersaglio dell'attacco di una tua unità (per l'ospite lo decide chi ospita). */
    const aimAt = (uid: number, target: number) => {
        if (!g) return false;
        if (!isGuest()) return setAim(g, 0, uid, target);
        if (!aimTargets(g, 0, uid).includes(target)) return false;
        set({busy: true});
        guestSend({k: 'aim', uid, target});
        return true;
    };

    function targetChosen(t: Target) {
        const s = get().sel;
        if (!s || s.kind !== 'hand' || s.step !== 'target') return false;
        const match = s.targets!.find(x => x.type === t.type && (x.type !== 'unit' || (t.type === 'unit' && x.uid === t.uid)) && (x.type === 'unit' || x.lane === t.lane) && (x.type !== 'seal' || (t.type === 'seal' && x.p === t.p)));
        if (!match) return false;
        const os = optsFor(s, match);
        // Effetti che spostano il bersaglio: con più corsie possibili si chiede dove, con una sola si gioca subito.
        if (os.length > 1 && os.every(o => o.to != null)) {
            set({sel: {...s, step: 'dest', target: match, dests: os.map(o => o.to!)}});
            return true;
        }
        void doPlay(s.hi, os[0] ?? (s.lane != null ? {lane: s.lane, target: match} : {target: match}), true);
        return true;
    }

    /** Opzioni di gioco della carta selezionata per quel bersaglio (e per la corsia già scelta, se è un'unità). */
    const optsFor = (s: Extract<Sel, { kind: 'hand' }>, t: Target) =>
        s.opts.filter(o => o.target && sameTarget(o.target, t) && (s.lane == null || o.lane === s.lane));

    function destChosen(l: number) {
        const s = get().sel;
        if (!s || s.kind !== 'hand' || s.step !== 'dest' || !s.target) return false;
        const o = optsFor(s, s.target).find(x => x.to === l);
        if (!o) return false;
        void doPlay(s.hi, o, true);
        return true;
    }

    // ---- turno avversario e combattimento ----
    async function combat(p: number) {
        const G = g!;
        for (let l = 0; l < 3; l++) {
            const ids = attackers(g!, p, l).filter(uid => hasAttackTarget(g!, p, l, uid));
            // le stordite saltano l'attacco senza scattare in avanti: il motore consuma lo stordimento e lo annota
            const skip = ids.filter(uid => g!.p[p].board[l].find(x => x.uid === uid)?.stun);
            if (skip.length) {
                skip.forEach(uid => attackOne(g!, p, l, uid));
                commit();
            }
            const strikers = ids.filter(uid => !skip.includes(uid));
            if (!strikers.length) continue;
            set({laneHl: l});
            atkSend(null, l);
            await wait(220);
            if (!alive(G)) return;
            for (const uid of strikers) {
                if (!hasAttackTarget(g!, p, l, uid)) continue;
                set({attacking: {uid, p}});
                atkSend({uid, p}, l);
                await wait(190);
                if (!alive(G)) return;
                sfx('hit');
                attackOne(g!, p, l, uid);
                commit();
                await wait(150);
                set({attacking: null});
                atkSend(null, l);
                await wait(300);
                if (!alive(G)) return;
                if (g!.winner != null) break;
            }
            if (g!.winner != null) break;
        }
        set({laneHl: -1});
        atkSend(null, -1);
    }

    const atkSend = (a: { uid: number; p: number } | null, lane: number) => {
        if (isHost()) online!.link.send({t: 'atk', a, lane});
    };

    // ---- sfida tra amici ----
    /** Chi ospita: inizia il turno dell'amico e aspetta le sue azioni (hostAct). */
    function remoteTurnStart() {
        if (!g) return;
        set({busy: true, sel: null});
        startTurn(g, 1);
        commit();
        banner(tr(`Turno di ${g.p[1].name}`, `${g.p[1].name}'s turn`));
        if (g.winner != null) finish();
    }

    /** Chi ospita: l'amico ha finito il turno. Combattimento, poi tocca di nuovo a chi ospita. */
    async function remoteEnd() {
        const G = g!;
        endTurnEffects(G, 1);
        commit();
        await combat(1);
        if (!alive(G)) return;
        if (G.winner != null) return finish();
        startTurn(G, 0);
        commit();
        set({busy: false, preview: null});
        banner(tr(W.yourTurn), turnNote(G));
        sfx('turn');
        startClock();
        if (G.winner != null) finish();
    }

    const sameOpt = (a: PlayOpt, b: PlayOpt) => a.lane === b.lane && a.to === b.to && (!a.target ? !b.target : !!b.target && sameTarget(a.target, b.target));

    /** Chi ospita: applica un'azione dell'amico (giocatore 1). Ogni azione finisce con un commit, che manda lo
     * stato all'amico e lo sblocca anche quando l'azione non era valida. */
    async function hostAct(a: RemoteAct) {
        const G = g;
        if (!G || !online || get().result) return;
        if (a.k === 'mull') {
            if (online.mull[1]) return;
            mulligan(G, 1, a.hids);
            online.mull[1] = true;
            commit();
            if (online.mull[0]) begin(beginLabel);
            return;
        }
        if (G.active !== 1 || G.phase !== 'main' || G.winner != null) return;
        if (a.k === 'play') {
            const h = G.p[1].hand[a.hi];
            if (h && playOptions(G, 1, a.hi).some(o => sameOpt(o, a.o))) {
                set({stack: {id: h.id, hid: h.hid, p: 1}, pending: h.hid, preview: {id: h.id, cost: costOf(G, 1, h)}});
                sfx('play');
                await wait(STACK_MS);
                if (!alive(G)) return;
                playCard(G, 1, a.hi, a.o);
                set({stack: null, pending: null});
            }
        } else if (a.k === 'move') {
            if (moveTargets(G, 1, a.uid).includes(a.to)) {
                moveUnit(G, 1, a.uid, a.to);
                sfx('move');
            }
        } else if (a.k === 'guard') toggleGuard(G, 1, a.uid);
        else if (a.k === 'guardAll') G.p[1].board.forEach((B, l) => B.forEach(u => {
            if (readyToAttack(G, 1, l, u)) u.guard = a.on;
        }));
        else if (a.k === 'aim') setAim(G, 1, a.uid, a.target);
        else if (a.k === 'end') return remoteEnd();
        commit();
        if (G.winner != null) finish();
    }

    function hostMsg(m: Msg) {
        if (!g || !online) return;
        if (m.t === 'quit') {
            if (!get().result) {
                banner(tr(`${online.foe} si è ritirato`, `${online.foe} conceded`));
                g.winner = 0;
                commit();
                finish();
            }
            return;
        }
        if (m.t === 'act') {
            const a = m.a;
            hostQ = hostQ.then(() => hostAct(a)).catch(e => console.error(e));
        }
    }

    /** L'ospite: tutto ciò che arriva da chi ospita. */
    function guestMsg(m: Msg) {
        if (!online) return;
        if (m.t === 'quit') {
            if (g && !get().result) {
                banner(tr(`${online.foe} si è ritirato`, `${online.foe} conceded`));
                g.winner = 0;
                finish();
            }
            return;
        }
        if (m.t === 'atk') {
            set({attacking: m.a ? {uid: m.a.uid, p: 1 - m.a.p} : null, laneHl: m.lane});
            if (m.a) setTimeout(() => sfx('hit'), 190);
            return;
        }
        if (m.t === 'stack') {
            if (m.id && m.hid != null) {
                set({stack: {id: m.id, hid: m.hid, p: 1}, pending: m.hid, preview: {id: m.id}});
                sfx('play');
            } else set({stack: null, pending: null});
            return;
        }
        if (m.t !== 'state' || get().result) return;
        const prev = g;
        g = flipGame(m.G, 'Tu', online.foe);
        const st = get();
        if (st.stack && !st.stack.targeting) set({stack: null, pending: null});
        commit();
        if (g.winner != null) {
            finish();
            return;
        }
        if (g.turn > 0 && (!prev || prev.turn !== g.turn || prev.active !== g.active)) {
            online.wait = null;
            if (g.active === 0) {
                set({busy: false, preview: null});
                banner(tr(W.yourTurn), turnNote(g));
                sfx('turn');
                startClock();
            } else {
                stopClock();
                set({busy: true, sel: null});
                banner(tr(`Turno di ${g.p[1].name}`, `${g.p[1].name}'s turn`));
            }
        } else if (online.wait === 'act' && g.active === 0) {
            online.wait = null;
            set({busy: false});
        }
    }

    /** Giocata dell'avversario: la carta si mostra, punta il bersaglio, si risolve e lascia scritto cosa è successo. */
    async function oppPlays(G: Game, hi: number, o: PlayOpt): Promise<boolean> {
        const h = g!.p[1].hand[hi], lang = dataLang(), c = BYID[h.id];
        const {aim, aimLabel} = oppAim(g!, h.id, o, lang);
        // la carta si stacca dalla mano coperta prima di volare sulla pila
        set({oppLift: h.hid});
        await wait(480);
        if (!alive(G)) return false;
        set({
            oppLift: null,
            stack: {id: h.id, hid: h.hid, p: 1}, pending: h.hid, preview: {id: h.id, cost: costOf(g!, 1, h)},
            opp: {id: h.id, phase: 'reveal', tone: oppTone(h.id), aim, aimLabel}
        });
        sfx('play');
        await wait(revealMs(h.id));
        if (!alive(G)) return false;
        set(st => ({opp: st.opp && {...st.opp, phase: 'aim'}}));
        await wait(aim ? 1000 : 500);
        if (!alive(G)) return false;
        // incantesimi e reliquie escono dalla pila volando verso il bersaglio; le unità ci arrivano da sole (layoutId)
        const from = document.getElementById('stack-card')?.getBoundingClientRect(),
            to = aim ? document.querySelector(aim)?.getBoundingClientRect() : undefined;
        if (c.t !== 'U' && from && to) {
            const flyTo = {x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2)};
            set(st => ({stack: st.stack && {...st.stack, flyTo}}));
            await wait(30);
        }
        const before = g!.log.length;
        playCard(g!, 1, hi, o);
        set({stack: null, pending: null});
        commit();
        const fmt = logTexts(g!, lang);
        const lines = g!.log.slice(before).filter(l => l.k !== 'play').map(fmt).slice(0, 4);
        // giocate senza effetti da raccontare: almeno dire dove sono finite
        const {aimLabel: where} = oppAim(g!, h.id, o, lang);
        if (!lines.length && c.t === 'U') lines.push(tr(`Entra in campo, ${where}`, `Enters the board, ${where}`));
        if (!lines.length && c.t === 'R') lines.push(tr(`Posta sul Sigillo, ${where}`, `Placed on the Seal, ${where}`));
        set(st => ({opp: st.opp && {...st.opp, phase: 'resolve', lines}}));
        // il tempo per vedere l'impatto sul bersaglio; le frasi dell'esito vanno solo ai lettori di schermo
        await wait(1000);
        set({opp: null});
        return alive(G);
    }

    async function aiTurn() {
        const G = g!, s = get();
        set({busy: true, sel: null});
        startTurn(g!, 1);
        commit();
        banner(tr(`Turno di ${g!.p[1].name}`, `${g!.p[1].name}'s turn`));
        await wait(1000);
        if (!alive(G)) return;
        if (g!.winner != null) return finish();
        const script = s.mode === 'tutorial' ? TUTORIAL.oppTurns[Math.floor(g!.turn / 2) - 1] : undefined;
        if (script) {
            for (const a of script) {
                if (a.play) {
                    const hi = g!.p[1].hand.findIndex(h => h.id === a.play);
                    if (hi < 0) continue;
                    if (!(await oppPlays(G, hi, {lane: a.lane}))) return;
                    await wait(300);
                }
            }
        } else {
            await wait(300);
            if (!alive(G)) return;
            for (let k = 0; k < 12; k++) {
                const a = bestAction(g!, 1, get().noise);
                if (!a) break;
                if (a.k === 'play') {
                    if (!(await oppPlays(G, a.hi, a.o))) return;
                } else {
                    // spostamento: prima si indica quale unità e dove va, poi si muove
                    const f = findU(g!, a.uid), lang = dataLang();
                    if (f) set({
                        opp: {
                            id: f.u.id, phase: 'aim', tone: 'tide', aim: `[data-drop="unit:${a.uid}"]`,
                            aimLabel: tr(`sposta ${cardName(f.u.id, lang)} nella corsia ${LANE_NAME[a.to]}`, `moves ${cardName(f.u.id, lang)} to the ${EN_LANE_NAME[a.to]} lane`)
                        }
                    });
                    await wait(900);
                    if (!alive(G)) return;
                    apply(g!, 1, a);
                    sfx('move');
                    commit();
                    await wait(500);
                    set({opp: null});
                }
                if (get().legend) {
                    await wait(2000);
                    if (!alive(G)) return;
                }
                if (g!.winner != null) return finish();
                await wait(550);
                if (!alive(G)) return;
            }
        }
        aiGuards(g!, 1);
        endTurnEffects(g!, 1);
        commit();
        await combat(1);
        if (!alive(G)) return;
        if (g!.winner != null) return finish();
        startTurn(g!, 0);
        commit();
        set({busy: false, preview: null});
        banner(tr(W.yourTurn), turnNote(g!));
        sfx('turn');
        tutOnMyTurn();
        startClock();
        if (g!.winner != null) finish();
    }

    return {
        G: null,
        mode: 'ranked',
        noise: 3,
        sel: null,
        hint: '',
        stack: null,
        opp: null,
        oppLift: null,
        hoverHid: null,
        setHoverHid: hid => set(s => (s.hoverHid === hid ? s : {hoverHid: hid})),
        toss: null,
        chooseToss: call => {
            const go = afterToss;
            afterToss = null;
            go?.(call);
        },
        pending: null,
        dragging: null,
        attacking: null,
        laneHl: -1,
        fx: [],
        banner: null,
        busy: false,
        result: null,
        preview: null,
        shake: 0,
        tutStep: 0,
        tutFree: false,
        lens: false,
        inspected: null,
        coach: null,
        timed: false,
        turnLeft: 0,
        reserveLeft: 0,
        reveal: null,
        closeReveal: () => set({reveal: null}),
        legend: null,
        mull: null,
        toggleTimer: () => {
            const prof = useProfile.getState(), off = !prof.settings?.noTimer;
            prof.setSetting('noTimer', off);
            if (off) {
                stopClock();
                set({timed: false});
            } else if (get().mode !== 'tutorial') {
                set({timed: true});
                if (g && g.active === 0 && !get().result) startClock();
            }
        },
        replay: null,
        openReplay: () => {
            const r = lastReplay;
            if (!r || !r.frames.length) return;
            stopClock();
            g = null;
            set({
                replay: {i: 0, n: r.frames.length, title: r.title},
                G: r.frames[0].G,
                result: null,
                busy: true,
                sel: null,
                stack: null,
                pending: null,
                fx: [],
                banner: null,
                mull: null,
                reveal: null,
                coach: null,
                timed: false,
                preview: null
            });
        },
        replayGo: i => {
            const r = lastReplay;
            if (!r) return;
            const k = Math.max(0, Math.min(r.frames.length - 1, i));
            set(s => ({replay: s.replay ? {...s.replay, i: k} : null, G: r.frames[k].G}));
        },
        toggleMull: hid => set(s => (s.mull ? {mull: {sel: s.mull.sel.includes(hid) ? s.mull.sel.filter(x => x !== hid) : [...s.mull.sel, hid]}} : s)),
        confirmMull: () => {
            const m = get().mull;
            if (!g || !m) return;
            if (online) {
                set({mull: null});
                if (m.sel.length) sfx('draw');
                if (isGuest()) {
                    set({busy: true, hint: tr(`In attesa di ${online.foe}…`, `Waiting for ${online.foe}…`)});
                    guestSend({k: 'mull', hids: m.sel}, 'end');
                    return;
                }
                mulligan(g, 0, m.sel);
                online.mull[0] = true;
                commit();
                if (online.mull[1]) begin(beginLabel);
                else set({hint: tr(`In attesa di ${online.foe}…`, `Waiting for ${online.foe}…`)});
                return;
            }
            mulligan(g, 0, m.sel);
            aiMulligan(g, 1);
            set({mull: null});
            if (m.sel.length) sfx('draw');
            commit();
            begin(beginLabel);
        },
        startCustom: m => {
            custom = m;
            g = mkGame({name: 'Tu', deck: m.me.deck}, {name: m.op.name, deck: m.op.deck}, {
                mySeal: m.me.seal,
                seal: m.op.seal,
                startC: m.startC,
                omens: m.omens,
                custodi: [m.me.custode ?? null, m.op.custode ?? null],
                night: m.night
            });
            resetMatch(false);
            myFacs = facsOf(m.me.deck);
            matchLabel = m.label;
            deckName = m.label;
            myBack = useProfile.getState().back;
            set({
                G: clone(g),
                mode: 'custom',
                node: undefined,
                advId: undefined,
                noise: m.op.noise,
                sel: null,
                hint: '',
                stack: null,
                pending: null,
                attacking: null,
                laneHl: -1,
                fx: [],
                banner: null,
                busy: false,
                result: null,
                preview: null,
                tutStep: 0,
                tutFree: false,
                lens: false,
                inspected: null,
                mull: null,
                coach: m.coach ?? null,
                timed: (m.timed ?? true) && !useProfile.getState().settings?.noTimer,
                turnLeft: turnMs(),
                reserveLeft: reserveMs()
            });
            beginLabel = m.label;
            tossThenMulligan();
        },
        startOnline: o => {
            const foe = o.foe.name, prof = useProfile.getState();
            custom = {
                label: tr(`Sfida con ${foe}`, `Challenge vs ${foe}`),
                me: {deck: o.me.deck, custode: o.me.custode},
                op: {name: foe, deck: o.foe.deck, noise: 0, custode: o.foe.custode},
                noRewards: true,
                onEnd: win => [win ? tr(`Hai battuto ${foe}!`, `You beat ${foe}!`) : tr(`${foe} ha vinto la sfida.`, `${foe} won the challenge.`),
                    tr('Sfida tra amici: nessuna ricompensa.', 'Friendly challenge: no rewards.')]
            };
            if (o.link.role === 'host') g = mkGame({name: 'Tu', deck: o.me.deck}, {name: foe, deck: o.foe.deck}, {custodi: [o.me.custode, o.foe.custode]});
            else {
                g = flipGame(o.start!, 'Tu', foe);
                g.ev = [];
            }
            resetMatch(true);
            online = {link: o.link, foe, mull: [false, false], wait: null};
            myFacs = facsOf(o.me.deck);
            matchLabel = custom.label;
            deckName = o.me.deckName;
            myBack = prof.back;
            set({
                G: clone(g),
                mode: 'custom',
                node: undefined,
                advId: undefined,
                noise: 0,
                sel: null,
                hint: '',
                stack: null,
                pending: null,
                attacking: null,
                laneHl: -1,
                fx: [],
                banner: null,
                busy: false,
                result: null,
                preview: null,
                tutStep: 0,
                tutFree: false,
                lens: false,
                inspected: null,
                mull: {sel: []},
                coach: null,
                timed: !prof.settings?.noTimer,
                turnLeft: turnMs(),
                reserveLeft: reserveMs()
            });
            beginLabel = g.first === 0 ? tr('Inizi tu', 'You go first') : tr(`Inizia ${foe}`, `${foe} goes first`);
            dealSounds(g.p[0].hand.length);
            o.link.onMsg(o.link.role === 'host' ? hostMsg : guestMsg);
            o.link.onClose(() => {
                if (!online || online.link !== o.link) return;
                online = null;
                if (g && !get().result) {
                    banner(tr(`${foe} si è disconnesso`, `${foe} disconnected`));
                    g.winner = 0;
                    finish();
                }
            });
            if (o.link.role === 'host') o.link.send({t: 'start', G: clone(g), name: o.me.name});
        },
        toggleLens: () => {
            sfx('lens');
            set(s => ({lens: !s.lens, preview: null}));
        },
        inspect: x => {
            if (x) sfx('lens');
            set({inspected: x, preview: null});
        },
        start: (mode, node, advId) => {
            const prof = useProfile.getState();
            let myCustode: CustodeId | null = null, advCustode: CustodeId | null | undefined;
            let me: { name: string; deck: string[] }, op: { name: string; deck: string[] }, noise = 3,
                opts: Parameters<typeof newGame>[2] = {};
            if (mode === 'tutorial') {
                me = {name: 'Tu', deck: TUTORIAL.playerDeck};
                op = {name: TUTORIAL.oppName, deck: TUTORIAL.oppDeck};
                noise = 9;
                opts = {
                    first: 0,
                    keepOrder: true,
                    startC: 1,
                    seal: TUTORIAL.oppSeal,
                    hands: [TUTORIAL.playerHand, TUTORIAL.oppHand],
                    noOmens: true,
                    noBell: true
                };
            } else {
                const d = prof.decks.find(x => x.id === prof.activeDeck)!;
                me = {name: 'Tu', deck: d.cards};
                myCustode = d.custode ?? null;
                deckName = d.name;
                myBack = prof.backMode === 'deck' && d.back ? d.back : prof.back;
                if (mode === 'ranked' || mode === 'casual') {
                    const t = tierIdx(prof.rank),
                        facs = (['brace', 'marea', 'radice', 'vuoto'] as Faction[]).sort(() => Math.random() - 0.5).slice(0, 2);
                    op = {
                        name: OPP_NAMES[Math.floor(Math.random() * OPP_NAMES.length)],
                        deck: aiDeck(facs, Math.min(3, t))
                    };
                    noise = [7, 5, 3.5, 2, 1, 0.3][t];
                } else {
                    const a = findAdventure(advId ?? 'cap1')!, n = a.stages[node!], D = DIFFS[n.diff];
                    op = {name: n.foe, deck: aiDeck(n.facs, D.tier, n.force ?? [])};
                    noise = D.noise;
                    opts = {seal: n.seal};
                    advCustode = n.custode ?? undefined;
                }
            }
            const ev = useEvent.getState().ev?.ev;
            // Corsia centrale: il presagio dell'evento della community, altrimenti quello della Guerra della Rosa
            const centre = mode !== 'tutorial' ? ev?.omen ?? warOmen() : null;
            if (centre) {
                const others = (Object.keys(OMENS) as OmenId[]).filter(o => o !== centre).sort(() => Math.random() - 0.5);
                opts = {...opts, omens: [others[0], centre, others[1]]};
            }
            if (mode !== 'tutorial') {
                const oc = custodiOf(mainFaction(op.deck));
                if (advCustode !== undefined) {
                    opts = {...opts, custodi: [myCustode, advCustode]};
                } else opts = {...opts, custodi: [myCustode, oc[Math.floor(Math.random() * oc.length)].id]};
            }
            g = mkGame(me, op, opts);
            resetMatch(mode === 'tutorial');
            myFacs = facsOf(me.deck);
            matchLabel = ({
                ranked: 'Classificata',
                casual: 'Casual',
                adv: 'Avventura',
                tutorial: 'Tutorial',
                custom: ''
            } as Record<string, string>)[mode] ?? mode;
            if (mode === 'tutorial') deckName = 'Tutorial';
            custom = null;
            set({
                coach: null,
                timed: mode !== 'tutorial' && !useProfile.getState().settings?.noTimer,
                turnLeft: turnMs(),
                reserveLeft: reserveMs()
            });
            set({
                G: clone(g),
                mode,
                node,
                advId: advId ?? (mode === 'adv' ? 'cap1' : undefined),
                noise,
                sel: null,
                hint: '',
                stack: null,
                pending: null,
                attacking: null,
                laneHl: -1,
                fx: [],
                banner: null,
                busy: false,
                result: null,
                preview: null,
                tutStep: 0,
                tutFree: false,
                lens: false,
                inspected: null
            });
            if (mode === 'tutorial') {
                dealSounds(g.p[0].hand.length);
                begin(tr('Inizi tu', 'You go first'));
            } else {
                beginLabel = tr('Inizi tu', 'You go first');
                tossThenMulligan();
            }
        },
        selectHand: hi => {
            if (!g) return;
            const h = g.p[0].hand[hi];
            if (!h) return;
            set({preview: {id: h.id, cost: costOf(g, 0, h)}});
            if (!myTurn() || g.phase !== 'main') return;
            const s = get().sel;
            if (s?.kind === 'hand' && s.hi === hi) {
                cancelStack();
                return;
            }
            if (!tutAllows({type: 'select', card: h.id})) return;
            const opts = playOptions(g, 0, hi), c = cardInfo(h.id);
            if (!opts.length) {
                sfx('error');
                set({
                    sel: null,
                    hint: costOf(g, 0, h) > g.p[0].crystals ? tr(`Servono ${costOf(g, 0, h)} Cristalli per ${c.n}.`, `You need ${costOf(g, 0, h)} Crystals for ${cardName(c.id, 'en')}.`) : tr(`Nessun bersaglio valido per ${c.n}.`, `No valid target for ${cardName(c.id, 'en')}.`)
                });
                return;
            }
            if (c.t !== 'I') set({sel: {kind: 'hand', hi, hid: h.hid, opts, step: 'lane'}, hint: ''});
            else if (EFFECTS[h.id]?.spellT) beginTargeting(hi, opts);
            else set({
                    sel: {kind: 'hand', hi, hid: h.hid, opts, step: 'confirm'},
                    stack: {id: h.id, hid: h.hid, p: 0, targeting: true},
                    pending: h.hid,
                    hint: ''
                });
        },
        dropHand: (hi, drop) => {
            set({dragging: null});
            if (!g || !myTurn() || g.phase !== 'main') return;
            const h = g.p[0].hand[hi];
            if (!h) return;
            if (!tutAllows({type: 'select', card: h.id})) return;
            const opts = playOptions(g, 0, hi), c = cardInfo(h.id);
            if (!opts.length) {
                get().selectHand(hi);
                return;
            }
            if (!drop) return;
            const [k, v] = drop.split(':');
            if (c.t === 'U' && k === 'unit') {
                const l = laneOfDrop(drop);
                if (l.startsWith('lane:')) laneChosen(hi, opts, +l.split(':')[1]);
                return;
            }
            if (c.t === 'U' || c.t === 'R') {
                if (k === 'lane' || k === 'seal') {
                    const l = k === 'seal' ? +v.split('-')[1] : +v;
                    if (c.t === 'R' && k === 'seal' && v.split('-')[0] !== '0') return;
                    laneChosen(hi, opts, l);
                }
                return;
            }
            if (EFFECTS[h.id]?.spellT) {
                // le carte con bersaglio si giocano sempre prima e poi si mira: anche se rilasciate sopra un'unità
                // o un Sigillo, si apre la freccia e il bersaglio si sceglie con un tocco
                beginTargeting(hi, opts);
                return;
            }
            void doPlay(hi, {});
        },
        guardAll: on => {
            if (!g || !myTurn() || g.phase !== 'main') return;
            if (isGuest()) {
                sfx('click');
                set({busy: true});
                guestSend({k: 'guardAll', on});
                return;
            }
            let changed = false;
            g.p[0].board.forEach((B, l) => B.forEach(u => {
                if (readyToAttack(g!, 0, l, u) && !!u.guard !== on) {
                    u.guard = on;
                    changed = true;
                }
            }));
            if (changed) {
                sfx('click');
                commit();
            }
        },
        toggleGuard: uid => {
            if (!g || !myTurn() || g.phase !== 'main') return;
            if (isGuest()) {
                sfx('click');
                set({busy: true});
                guestSend({k: 'guard', uid});
                return;
            }
            if (toggleGuard(g, 0, uid)) {
                sfx('click');
                commit();
            }
        },
        clickLane: l => {
            const s = get().sel;
            if (!g || !s) return;
            if (s.kind === 'hand' && s.step === 'lane' && cardInfo(g.p[0].hand[s.hi].id).t === 'U') {
                laneChosen(s.hi, s.opts, l);
                return;
            }
            if (s.kind === 'hand' && s.step === 'target') {
                targetChosen({type: 'lane', lane: l});
                return;
            }
            if (s.kind === 'hand' && s.step === 'dest') {
                destChosen(l);
                return;
            }
            if (s.kind === 'unit' && s.to.includes(l)) get().dropUnit(s.uid, `lane:${l}`);
        },
        clickSeal: (p, l) => {
            const s = get().sel;
            if (!g || !s || s.kind !== 'hand') return;
            if (s.step === 'lane' && p === 0 && cardInfo(g.p[0].hand[s.hi].id).t === 'R') {
                const o = s.opts.find(o => o.lane === l);
                if (o) void doPlay(s.hi, o);
                return;
            }
            if (s.step === 'target') targetChosen({type: 'seal', p, lane: l});
        },
        clickUnit: uid => {
            if (!g) return;
            const f = findU(g, uid);
            if (!f) return;
            const s = get().sel;
            if (s?.kind === 'hand' && s.step === 'target') {
                if (s.targets![0]?.type === 'lane') {
                    targetChosen({type: 'lane', lane: f.l});
                    return;
                }
                if (targetChosen({type: 'unit', p: f.p, lane: f.l, uid})) return;
            }
            // con una tua unità selezionata, toccare un nemico della sua corsia lo sceglie come bersaglio dell'attacco
            if (s?.kind === 'unit' && f.p === 1 && s.aims.includes(uid) && myTurn() && aimAt(s.uid, uid)) {
                sfx('lens');
                set({sel: null, hint: '', preview: null});
                commit();
                return;
            }
            // nemico nella stessa corsia ma dietro un Guardiano: lo si dice invece di non fare nulla
            const me = s?.kind === 'unit' ? findU(g, s.uid) : null;
            if (me && f.p === 1 && f.l === me.l && myTurn()) {
                sfx('error');
                set({hint: tr('Devi colpire prima il Guardiano di questa corsia.', 'You must hit the Guardian in this lane first.')});
                return;
            }
            if (get().preview?.uid !== uid) set({preview: {id: f.u.id, uid}});
            if (!myTurn() || g.phase !== 'main' || f.p !== 0 || s?.kind === 'hand') return;
            if (s?.kind === 'unit' && s.uid === uid) {
                set({sel: null});
                return;
            }
            if (!tutAllows({type: 'selectUnit', card: f.u.id})) return;
            const to = moveTargets(g, 0, uid), aims = readyToAttack(g, 0, f.l, f.u) ? aimTargets(g, 0, uid) : [];
            if (aims.length) {
                set({
                    sel: {kind: 'unit', uid, to, aims},
                    hint: to.length ? tr('Tocca un nemico evidenziato per sceglierlo come bersaglio, o una corsia vicina per spostarti (chi si sposta non attacca in questo turno).', 'Tap a highlighted enemy to make it the target, or a nearby lane to move (a unit that moves does not attack this turn).')
                        : tr('Tocca un nemico evidenziato per sceglierlo come bersaglio.', 'Tap a highlighted enemy to make it the target.')
                });
                return;
            }
            set(to.length ? {sel: {kind: 'unit', uid, to, aims}, hint: ''} : {
                sel: null,
                hint: f.u.kw.includes('Radicato') ? tr('Questa unità è Radicata e non può spostarsi.', 'This unit is Rooted and cannot move.') : f.u.moved ? tr('Si è già spostata in questo turno.', 'It has already moved this turn.') : g.p[0].crystals < 1 ? tr('Serve 1 Cristallo per spostare un\'unità.', 'You need 1 Crystal to move a unit.') : tr('Nessuna corsia adiacente ha spazio.', 'No nearby lane has space.')
            });
        },
        dropUnit: (uid, drop) => {
            set({dragging: null});
            if (!g || !myTurn() || g.phase !== 'main' || !drop) return;
            // rilasciata su un nemico della sua corsia: diventa il bersaglio dell'attacco
            if (drop.startsWith('unit:')) {
                const tid = +drop.split(':')[1], tf = findU(g, tid);
                if (tf?.p === 1 && aimAt(uid, tid)) {
                    sfx('lens');
                    set({sel: null, hint: ''});
                    commit();
                    return;
                }
            }
            const [k, v] = laneOfDrop(drop).split(':');
            if (k !== 'lane') return;
            const to = +v, f = findU(g, uid);
            if (!f || !moveTargets(g, 0, uid).includes(to)) return;
            if (!tutAllows({type: 'move', card: f.u.id, to})) return;
            if (isGuest()) {
                sfx('move');
                set({sel: null, busy: true});
                guestSend({k: 'move', uid, to});
                return;
            }
            moveUnit(g, 0, uid, to);
            myMoves++;
            sfx('move');
            set({sel: null});
            commit();
            tutAdvance();
            if (g.winner != null) finish();
        },
        confirm: () => {
            const s = get().sel;
            if (s?.kind === 'hand' && s.step === 'confirm') void doPlay(s.hi, {}, true);
        },
        skip: () => {
            const s = get().sel;
            if (s?.kind === 'hand' && s.lane != null) void doPlay(s.hi, {lane: s.lane}, true);
        },
        cancel: () => cancelStack(),
        endTurn: async () => {
            if (!myTurn() || g!.phase !== 'main') return;
            if (!tutAllows({type: 'end'})) return;
            stopClock();
            const G = g!;
            cancelStack();
            set({busy: true, hint: ''});
            if (isGuest()) {
                guestSend({k: 'end'}, 'end');
                return;
            }
            tutAdvance();
            endTurnEffects(g!, 0);
            commit();
            await combat(0);
            if (!alive(G)) return;
            if (g!.winner != null) return finish();
            if (isHost()) remoteTurnStart(); else await aiTurn();
        },
        setDragging: hid => set({dragging: hid}),
        setPreview: p => set({preview: p}),
        tutNext: () => {
            const st = tutStep();
            if (st?.kind === 'info') tutAdvance(); else if (st?.kind === 'free') set({tutFree: true});
        },
        quit: () => {
            if (!g || get().result) return;
            online?.link.send({t: 'quit'});
            g.winner = 1;
            finish();
        },
        exit: () => {
            online?.link.close();
            online = null;
            stopClock();
            resetEmotes();
            g = null;
            set({replay: null});
            set({G: null, result: null, busy: false, stack: null, sel: null, fx: []});
        },
    };
});

/** Rilasciare sopra una propria unità equivale a rilasciare nella sua corsia. */
function laneOfDrop(drop: string) {
    const [k, v] = drop.split(':');
    if (k === 'unit' && g) {
        const f = findU(g, +v);
        if (f && f.p === 0) return `lane:${f.l}`;
    }
    return drop;
}

const turnNote = (G: Game) => (G.p[0].maxC >= 10 ? tr('Cristalli al massimo: peschi due carte', 'Crystals maxed out: you draw two cards') : tr(`+1 Cristallo: ora ne hai ${G.p[0].maxC}`, `+1 Crystal: you now have ${G.p[0].maxC}`));


const sameTarget = (a: Target, b: Target) => a.type === b.type && (a.type === 'unit' ? b.type === 'unit' && a.uid === b.uid : a.type === 'seal' ? b.type === 'seal' && a.p === b.p && a.lane === b.lane : a.lane === b.lane);
export {moveTargets, playOptions};

// maniglia per i test automatici (strumenti di sviluppo)
if (typeof window !== 'undefined') (window as unknown as { __rosaBattle?: unknown }).__rosaBattle = useBattle;
