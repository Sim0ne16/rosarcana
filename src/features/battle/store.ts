// Stato della partita e "regista" delle animazioni: esegue il motore passo per passo
// e pubblica ogni passo come istantanea immutabile per React.
import { create } from 'zustand';
import {
  aiDeck, aiMulligan, mulligan, apply, attackers, hasAttackTarget, attackOne, bestAction, cardInfo, clone, costOf, endTurnEffects, EFFECTS, findU,
  legalTargets, moveTargets, moveUnit, newGame, playCard, playOptions, startTurn, custodiOf, CUSTODI, mainFaction, OMENS, BYID, FACTIONS, type CustodeId, type Faction, type Game, type OmenId, type GameEvent, type PlayOpt, type Target,
} from '../../engine';
import { legendSfx, sfx } from '../../audio/sfx';
import { OPP_NAMES } from '../../economy/constants';
import { useProfile, tierIdx } from '../../profile/store';
import { DIFFS, stageReward } from '../adventure/model';
import { useEvent } from '../adventure/stories';
import { findAdventure, useAdventures } from '../adventure/store';
import { TUTORIAL, type TutExpect } from '../tutorial/script';
import type { MatchStats } from '../../economy/mastery';

export interface Fx { id: number; kind: 'dmg' | 'heal' | 'break' | 'death' | 'ascend'; uid?: number; p?: number; l?: number; n?: number }
export type Sel =
  | { kind: 'hand'; hi: number; hid: number; opts: PlayOpt[]; step: 'lane' | 'target' | 'confirm'; lane?: number; targets?: Target[]; skip?: boolean }
  | { kind: 'unit'; uid: number; to: number[] };
export type Mode = 'ranked' | 'casual' | 'adv' | 'tutorial' | 'custom';
/** Partita configurata da un'altra modalità (Draft, Spedizione, prove, allenamento). */
export interface CustomMatch {
  label: string; startC?: number; me: { deck: string[]; custode?: CustodeId | null; seal?: number }; op: { name: string; deck: string[]; noise: number; seal?: number; custode?: CustodeId | null };
  omens?: (OmenId | null)[]; coach?: { title: string; tips: string[] }; timed?: boolean; onEnd: (win: boolean) => string[];
}
interface Stack { id: string; hid: number; p: number; targeting?: boolean }

interface BattleState {
  G: Game | null; mode: Mode; node?: number; advId?: string; noise: number;
  sel: Sel | null; hint: string; stack: Stack | null; pending: number | null; dragging: number | null;
  attacking: { uid: number; p: number } | null; laneHl: number; fx: Fx[]; banner: { txt: string; sub?: string; id: number } | null;
  busy: boolean; result: { win: boolean; lines: string[] } | null; preview: { id: string; uid?: number; cost?: number; rect?: { x: number; y: number; w: number; h: number } } | null;
  shake: number; tutStep: number; tutFree: boolean;
  /** Tempo del turno e riserva (millisecondi). */
  timed: boolean; turnLeft: number; reserveLeft: number;
  reveal: { p: number; ids: string[]; id: number } | null; closeReveal: () => void;
  /** Entrata in scena di una leggendaria appena giocata. */
  legend: { id: string; p: number; k: number } | null;
  replay: { i: number; n: number; note: string; title: string } | null; openReplay: () => void; replayGo: (i: number) => void;
  mull: { sel: number[] } | null;
  /** Accende o spegne il tempo del turno (per i test); la riserva resta quella della partita. */
  toggleTimer: () => void; toggleMull: (hid: number) => void; confirmMull: () => void;
  coach: { title: string; tips: string[] } | null; startCustom: (m: CustomMatch) => void;
  lens: boolean; inspected: { id: string; uid?: number; cost?: number; p?: number } | null;
  toggleLens: () => void; inspect: (x: { id: string; uid?: number; cost?: number; p?: number } | null) => void;
  start: (mode: Mode, node?: number, advId?: string) => void;
  selectHand: (hi: number) => void;
  dropHand: (hi: number, drop: string | null) => void;
  clickLane: (l: number) => void; clickSeal: (p: number, l: number) => void; clickUnit: (uid: number) => void;
  dropUnit: (uid: number, drop: string | null) => void;
  confirm: () => void; skip: () => void; cancel: () => void; endTurn: () => void;
  setDragging: (hid: number | null) => void; setPreview: (p: BattleState['preview']) => void;
  tutNext: () => void; quit: () => void; exit: () => void;
}

let g: Game | null = null;
let stats: MatchStats = {};
let custom: CustomMatch | null = null;
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
export interface ReplayFrame { G: Game; note: string }
let frames: ReplayFrame[] = [];
export let lastReplay: { frames: ReplayFrame[]; title: string; win: boolean } | null = null;
let clock: ReturnType<typeof setInterval> | null = null, lastTick = 0, lastSec = -1;
/** Suono di pescata per ogni carta della mano iniziale, sincronizzato con l'animazione. */
const dealSounds = (n: number) => { for (let i = 0; i < n; i++) setTimeout(() => sfx('draw'), 350 + i * 220); };
const stopClock = () => { if (clock) { clearInterval(clock); clock = null; } };
const timeK = () => 1;
export const turnMs = () => TURN_SECONDS * 1000 * timeK(), reserveMs = () => RESERVE_SECONDS * 1000 * timeK();
let fxId = 0;
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const STACK_MS = 650;

export const useBattle = create<BattleState>((set, get) => {
  const alive = (G: Game | null) => !!G && g === G && !get().result;
  function commit() {
    if (!g) return;
    if (frames.length < 600) { const note = g.log[g.log.length - 1]?.txt ?? ''; const last = frames[frames.length - 1]; if (!last || last.note !== note || last.G.turn !== g.turn) frames.push({ G: clone(g), note }); }
    const ev = g.ev; g.ev = [];
    const fx: Fx[] = [], bells: Extract<GameEvent, { t: 'bell' }>[] = [];
    for (const e of ev) {
      if (e.t === 'dmgU') fx.push({ id: ++fxId, kind: 'dmg', uid: e.uid, n: e.n });
      if (e.t === 'dmgS') fx.push({ id: ++fxId, kind: 'dmg', p: e.p, l: e.l, n: e.n });
      if (e.t === 'healS') fx.push({ id: ++fxId, kind: 'heal', p: e.p, l: e.l, n: e.n });
      if (e.t === 'break') { fx.push({ id: ++fxId, kind: 'break', p: e.p, l: e.l }); sfx('seal'); }
      if (e.t === 'death') sfx('death');
      if (e.t === 'draw' && e.p === 0) sfx('draw');
      if (e.t === 'crystal' && e.p === 0) setTimeout(() => sfx('crystal'), 350);
      if (e.t === 'ascend') { fx.push({ id: ++fxId, kind: 'ascend', uid: e.uid }); sfx('ascend'); }
      if (e.t === 'play' && cardInfo(e.id).r === 'l') { const k = Date.now(); set({ legend: { id: e.id, p: e.p, k } }); legendSfx(e.id); setTimeout(() => set(st => (st.legend?.k === k ? { legend: null } : st)), 2300); }
      if (e.t === 'reveal') { const id = Date.now(); set({ reveal: { p: e.p, ids: e.ids, id } }); sfx('lens'); setTimeout(() => set(st => (st.reveal?.id === id ? { reveal: null } : st)), e.p === 0 ? 5200 : 3200); }
      if (e.t === 'bell') { bells.push(e); if (e.p === 0) bellsMe++; }
      if ('p' in e && e.p === 0 && (e.t === 'play' || e.t === 'hit' || e.t === 'kill' || e.t === 'relicTurn')) {
        const st = (stats[e.id] ??= { plays: 0, seal: 0, kills: 0, relic: 0 });
        if (e.t === 'play') st.plays++; else if (e.t === 'hit') st.seal += e.n; else if (e.t === 'kill') st.kills++; else st.relic++;
      }
      if (e.t === 'dmgS') sfx('crack');
    }
    const broke = fx.some(f => f.kind === 'break');
    for (const b of bells) setTimeout(() => { sfx('toll'); banner('Ultimo Rintocco', `${g?.p[b.p].name ?? ''}: ${b.name}. ${b.text}`, 2600); }, 700);
    set(s => ({ G: clone(g!), fx: [...s.fx, ...fx], shake: broke ? s.shake + 1 : s.shake }));
    if (fx.length) { const ids = new Set(fx.map(f => f.id)); setTimeout(() => set(s => ({ fx: s.fx.filter(f => !ids.has(f.id)) })), 1400); }
  }
  const banner = (txt: string, sub?: string, ms = 1500) => { const id = Date.now(); set({ banner: { txt, sub, id } }); setTimeout(() => set(s => (s.banner?.id === id ? { banner: null } : s)), ms); };

  // ---- tutorial ----
  const tutStep = () => (get().mode === 'tutorial' && !get().tutFree ? TUTORIAL.steps[get().tutStep] : null);
  function tutAllows(e: TutExpect | { type: 'select'; card: string } | { type: 'selectUnit'; card: string }): boolean {
    const st = tutStep(); if (!st) return true;
    if (st.kind === 'free') return true;
    const x = st.expect;
    if (st.kind !== 'do' || !x) { { sfx('error'); set({ hint: 'Segui il suggerimento in alto.' }); } return false; }
    let ok = false;
    if (e.type === 'select') ok = x.type === 'play' && x.card === e.card;
    else if (e.type === 'selectUnit') ok = x.type === 'move' && x.card === e.card;
    else if (e.type === x.type) {
      if (e.type === 'play' && x.type === 'play') ok = e.card === x.card && (x.lane == null || e.lane === x.lane) && (x.targetCard == null || e.targetCard === x.targetCard);
      else if (e.type === 'move' && x.type === 'move') ok = e.card === x.card && e.to === x.to;
      else ok = true;
    }
    if (!ok) { sfx('error'); set({ hint: 'Nel tutorial segui il passo indicato in alto.' }); }
    return ok;
  }
  const tutAdvance = () => { if (tutStep()) set(s => ({ tutStep: Math.min(TUTORIAL.steps.length - 1, s.tutStep + 1) })); };
  const tutOnMyTurn = () => { const st = tutStep(); if (st?.kind === 'wait') tutAdvance(); };

  // ---- fine partita ----
  /** Orologio del turno: prima scorre il tempo del turno, poi la riserva della partita; finiti entrambi il turno passa da solo. */
  function startClock() {
    stopClock(); if (!get().timed) return;
    set({ turnLeft: turnMs() }); lastTick = performance.now(); lastSec = -1;
    clock = setInterval(() => {
      const now = performance.now(), dt = now - lastTick; lastTick = now;
      const s = get(); if (!g || s.result || g.active !== 0) { stopClock(); return; }
      if (s.busy) return; // le animazioni non consumano tempo
      let { turnLeft, reserveLeft } = s;
      if (turnLeft > 0) turnLeft = Math.max(0, turnLeft - dt); else reserveLeft = Math.max(0, reserveLeft - dt);
      const secs = Math.ceil((turnLeft > 0 ? turnLeft : reserveLeft) / 1000);
      if (secs <= 10 && secs !== lastSec && secs > 0) { lastSec = secs; sfx('tick'); }
      if (turnLeft <= 0 && s.turnLeft > 0 && reserveLeft > 0) banner('Riserva di tempo', `Il tempo del turno è finito: ti restano ${Math.ceil(reserveLeft / 1000)} secondi di riserva`, 1800);
      set({ turnLeft, reserveLeft });
      if (turnLeft <= 0 && reserveLeft <= 0) { stopClock(); cancelStack(); set({ hint: 'Tempo scaduto: il turno passa all\'avversario.' }); sfx('error'); void get().endTurn(); }
    }, 200);
  }
  /** Primo turno della partita (dopo l'eventuale mulligan). */
  function begin(label: string) {
    if (!g) return;
    if (g.first === 0) { startTurn(g, 0); commit(); banner('Il tuo turno', `${label}. ${turnNote(g)}`); startClock(); }
    else { banner(g.p[1].name, 'inizia per primo'); void aiTurn(); }
  }
  function finish() {
    stopClock();
    if (g) { frames.push({ G: clone(g), note: g.winner === 0 ? 'Vittoria' : 'Sconfitta' }); lastReplay = { frames, title: `${g.p[0].name} contro ${g.p[1].name}`, win: g.winner === 0 }; frames = []; }
    if (!g || get().result) return;
    const win = g.winner === 0, s = get(), prof = useProfile.getState();
    const short = s.mode !== 'tutorial' && myMoves < MIN_MOVES;
    const cu = g.p[0].custode, custLines = cu && s.mode !== 'tutorial' && !short ? prof.recordCustode(cu, CUSTODI[cu].name, win, bellsMe) : [];
    if (s.mode !== 'tutorial' && !s.replay) prof.recordFactions(myFacs, win);
    prof.addHistory({ t: Date.now(), mode: s.mode, label: matchLabel, foe: g.p[1].name, win, turns: g.turn, deck: deckName, custode: g.p[0].custode ?? null, facs: myFacs });
    const adv = s.mode === 'adv' && s.advId ? findAdventure(s.advId) : undefined, stage = adv && s.node != null ? adv.stages[s.node] : undefined;
    const builtin = adv?.id === 'cap1';
    if (s.mode === 'custom' && custom) {
      const lines = short ? [...(win ? [] : custom.onEnd(false)), `Meno di ${MIN_MOVES} mosse: nessuna ricompensa`] : [...custom.onEnd(win), ...prof.matchResult({ mode: 'other', win, foe: g.p[1].name, stats }), ...custLines];
      sfx(win ? 'win' : 'lose'); set({ result: { win, lines }, busy: true, sel: null, stack: null, pending: null }); return;
    }
    const lines = short ? [...prof.matchResult({ mode: s.mode === 'custom' ? 'other' : s.mode, win, foe: g.p[1].name, noReward: true }), `Meno di ${MIN_MOVES} mosse: nessuna ricompensa`] : prof.matchResult({ mode: s.mode === 'custom' ? 'other' : s.mode, win, node: builtin ? s.node : undefined, foe: g.p[1].name, advReward: stage && builtin ? stageReward(adv!, stage) : undefined, advName: stage?.n, stats });
    if (adv && stage && !builtin && win && !short) {
      if (useAdventures.getState().complete(adv.id, s.node!)) lines.unshift('Prima vittoria: ' + prof.grant(stageReward(adv, stage), `${adv.title}, ${stage.n}`));
      else { prof.grant({ oro: 10 }, adv.title); lines.unshift('+10 oro'); }
    }
    lines.push(...custLines);
    const ev = useEvent.getState().ev?.ev;
    if (!short && win && ev?.faction && s.mode !== 'tutorial' && g.p[0].grave.concat(g.p[0].hand.map(h => h.id), g.p[0].deck).some(id => BYID[id]?.f === ev.faction)) lines.push(`${ev.title}: ` + prof.grant({ oro: 15 }, ev.title) + ' per aver giocato ' + FACTIONS[ev.faction].name);
    sfx(win ? 'win' : 'lose');
    set({ result: { win, lines }, busy: true, sel: null, stack: null, pending: null });
  }

  // ---- azioni del giocatore ----
  async function doPlay(hi: number, opt: PlayOpt, alreadyOnStack = false) {
    if (!g) return; const G = g, h = g.p[0].hand[hi]; if (!h) return;
    const tgtCard = opt.target?.type === 'unit' ? findU(g, opt.target.uid)?.u.id : undefined;
    if (!tutAllows({ type: 'play', card: h.id, lane: opt.lane, targetCard: tgtCard })) { cancelStack(); return; }
    set({ busy: true, sel: null, hint: '', stack: { id: h.id, hid: h.hid, p: 0 }, pending: h.hid });
    sfx('play'); await wait(alreadyOnStack ? 250 : STACK_MS); if (!alive(G)) return;
    playCard(g, 0, hi, opt); myMoves++; set({ stack: null, pending: null }); commit(); tutAdvance();
    await wait(380); if (!alive(G)) return;
    set({ busy: false });
    if (g.winner != null) finish();
  }
  function cancelStack() { set({ stack: null, pending: null, sel: null }); }
  function beginTargeting(hi: number, opts: PlayOpt[], lane?: number) {
    const h = g!.p[0].hand[hi];
    const withT = opts.filter(o => o.target && (lane == null || o.lane === lane));
    set({ sel: { kind: 'hand', hi, hid: h.hid, opts, step: 'target', lane, targets: withT.map(o => o.target!), skip: lane != null }, stack: { id: h.id, hid: h.hid, p: 0, targeting: true }, pending: h.hid, hint: '' });
  }
  function laneChosen(hi: number, opts: PlayOpt[], l: number) {
    const os = opts.filter(o => o.lane === l); if (!os.length) return false;
    const c = cardInfo(g!.p[0].hand[hi].id);
    if (c.t === 'U' && os.some(o => o.target)) {
      if (!tutAllows({ type: 'play', card: c.id, lane: l })) return true;
      beginTargeting(hi, opts, l); return true;
    }
    void doPlay(hi, os.find(o => !o.target) ?? os[0]); return true;
  }
  const myTurn = () => !!g && g.active === 0 && g.winner == null && !get().busy;
  function targetChosen(t: Target) {
    const s = get().sel; if (!s || s.kind !== 'hand' || s.step !== 'target') return false;
    const match = s.targets!.find(x => x.type === t.type && (x.type !== 'unit' || (t.type === 'unit' && x.uid === t.uid)) && (x.type === 'unit' || x.lane === t.lane) && (x.type !== 'seal' || (t.type === 'seal' && x.p === t.p)));
    if (!match) return false;
    void doPlay(s.hi, s.lane != null ? { lane: s.lane, target: match } : { target: match }, true); return true;
  }

  // ---- turno avversario e combattimento ----
  async function combat(p: number) {
    const G = g!;
    for (let l = 0; l < 3; l++) {
      const ids = attackers(g!, p, l).filter(uid => hasAttackTarget(g!, p, l, uid)); if (!ids.length) continue;
      set({ laneHl: l }); await wait(220); if (!alive(G)) return;
      for (const uid of ids) {
        if (!hasAttackTarget(g!, p, l, uid)) continue;
        set({ attacking: { uid, p } }); await wait(190); if (!alive(G)) return;
        sfx('hit'); attackOne(g!, p, l, uid); commit(); await wait(150);
        set({ attacking: null }); await wait(300); if (!alive(G)) return;
        if (g!.winner != null) break;
      }
      if (g!.winner != null) break;
    }
    set({ laneHl: -1 });
  }
  async function aiTurn() {
    const G = g!, s = get(); set({ busy: true, sel: null });
    startTurn(g!, 1); commit(); banner(`Turno di ${g!.p[1].name}`); await wait(1000); if (!alive(G)) return;
    if (g!.winner != null) return finish();
    const script = s.mode === 'tutorial' ? TUTORIAL.oppTurns[Math.floor(g!.turn / 2) - 1] : undefined;
    if (script) {
      for (const a of script) {
        if (a.play) { const hi = g!.p[1].hand.findIndex(h => h.id === a.play); if (hi < 0) continue;
          const h = g!.p[1].hand[hi]; set({ stack: { id: h.id, hid: h.hid, p: 1 }, pending: h.hid, preview: { id: h.id } }); sfx('play'); await wait(900); if (!alive(G)) return;
          playCard(g!, 1, hi, { lane: a.lane }); set({ stack: null, pending: null }); commit(); await wait(500); }
      }
    } else {
      await wait(300); if (!alive(G)) return;
      for (let k = 0; k < 12; k++) {
        const a = bestAction(g!, 1, get().noise); if (!a) break;
        if (a.k === 'play') { const h = g!.p[1].hand[a.hi]; set({ stack: { id: h.id, hid: h.hid, p: 1 }, pending: h.hid, preview: { id: h.id, cost: costOf(g!, 1, h) } }); sfx('play'); await wait(900); if (!alive(G)) return; }
        apply(g!, 1, a); if (a.k === 'move') sfx('move'); set({ stack: null, pending: null }); commit();
        if (get().legend) { await wait(2000); if (!alive(G)) return; }
        if (g!.winner != null) return finish();
        await wait(550); if (!alive(G)) return;
      }
    }
    endTurnEffects(g!, 1); commit(); await combat(1); if (!alive(G)) return;
    if (g!.winner != null) return finish();
    startTurn(g!, 0); commit(); set({ busy: false, preview: null }); banner('Il tuo turno', turnNote(g!)); sfx('turn'); tutOnMyTurn(); startClock();
    if (g!.winner != null) finish();
  }

  return {
    G: null, mode: 'ranked', noise: 3, sel: null, hint: '', stack: null, pending: null, dragging: null, attacking: null, laneHl: -1, fx: [], banner: null,
    busy: false, result: null, preview: null, shake: 0, tutStep: 0, tutFree: false, lens: false, inspected: null,
    coach: null, timed: false, turnLeft: 0, reserveLeft: 0, reveal: null, closeReveal: () => set({ reveal: null }), legend: null,
    mull: null,
    toggleTimer: () => {
      const prof = useProfile.getState(), off = !prof.settings?.noTimer; prof.setSetting('noTimer', off);
      if (off) { stopClock(); set({ timed: false }); }
      else if (get().mode !== 'tutorial') { set({ timed: true }); if (g && g.active === 0 && !get().result) startClock(); }
    },
    replay: null,
    openReplay: () => { const r = lastReplay; if (!r || !r.frames.length) return; stopClock(); g = null;
      set({ replay: { i: 0, n: r.frames.length, note: r.frames[0].note, title: r.title }, G: r.frames[0].G, result: null, busy: true, sel: null, stack: null, pending: null, fx: [], banner: null, mull: null, reveal: null, coach: null, timed: false, preview: null }); },
    replayGo: i => { const r = lastReplay; if (!r) return; const k = Math.max(0, Math.min(r.frames.length - 1, i)); set(s => ({ replay: s.replay ? { ...s.replay, i: k, note: r.frames[k].note } : null, G: r.frames[k].G })); },
    toggleMull: hid => set(s => (s.mull ? { mull: { sel: s.mull.sel.includes(hid) ? s.mull.sel.filter(x => x !== hid) : [...s.mull.sel, hid] } } : s)),
    confirmMull: () => { const m = get().mull; if (!g || !m) return; mulligan(g, 0, m.sel); aiMulligan(g, 1); set({ mull: null }); if (m.sel.length) sfx('draw'); commit(); begin(beginLabel); },
    startCustom: m => {
      custom = m;
      g = newGame({ name: 'Tu', deck: m.me.deck }, { name: m.op.name, deck: m.op.deck }, { mySeal: m.me.seal, seal: m.op.seal, startC: m.startC, omens: m.omens, custodi: [m.me.custode ?? null, m.op.custode ?? null] }); stats = {}; bellsMe = 0; myMoves = 0; frames = []; myFacs = facsOf(m.me.deck); matchLabel = m.label; deckName = m.label; myBack = useProfile.getState().back;
      set({ G: clone(g), mode: 'custom', node: undefined, advId: undefined, noise: m.op.noise, sel: null, hint: '', stack: null, pending: null, attacking: null, laneHl: -1, fx: [], banner: null, busy: false, result: null, preview: null, tutStep: 0, tutFree: false, lens: false, inspected: null, mull: null, coach: m.coach ?? null, timed: (m.timed ?? true) && !useProfile.getState().settings?.noTimer, turnLeft: turnMs(), reserveLeft: reserveMs() });
      beginLabel = m.label; set({ mull: { sel: [] } }); dealSounds(g.p[0].hand.length);
    },
    toggleLens: () => { sfx('lens'); set(s => ({ lens: !s.lens, preview: null })); },
    inspect: x => { if (x) sfx('lens'); set({ inspected: x, preview: null }); },
    start: (mode, node, advId) => {
      const prof = useProfile.getState();
      let myCustode: CustodeId | null = null, advCustode: CustodeId | null | undefined;
      let me: { name: string; deck: string[] }, op: { name: string; deck: string[] }, noise = 3, opts: Parameters<typeof newGame>[2] = {};
      if (mode === 'tutorial') {
        me = { name: 'Tu', deck: TUTORIAL.playerDeck }; op = { name: TUTORIAL.oppName, deck: TUTORIAL.oppDeck }; noise = 9;
        opts = { first: 0, keepOrder: true, startC: 1, seal: TUTORIAL.oppSeal, hands: [TUTORIAL.playerHand, TUTORIAL.oppHand], noOmens: true, noBell: true };
      } else {
        const d = prof.decks.find(x => x.id === prof.activeDeck)!; me = { name: 'Tu', deck: d.cards }; myCustode = d.custode ?? null; deckName = d.name;
        myBack = prof.backMode === 'deck' && d.back ? d.back : prof.back;
        if (mode === 'ranked' || mode === 'casual') { const t = tierIdx(prof.rank), facs = (['brace', 'marea', 'radice', 'vuoto'] as Faction[]).sort(() => Math.random() - 0.5).slice(0, 2);
          op = { name: OPP_NAMES[Math.floor(Math.random() * OPP_NAMES.length)], deck: aiDeck(facs, Math.min(3, t)) }; noise = [7, 5, 3.5, 2, 1, 0.3][t]; }
        else { const a = findAdventure(advId ?? 'cap1')!, n = a.stages[node!], D = DIFFS[n.diff]; op = { name: n.foe, deck: aiDeck(n.facs, D.tier, n.force ?? []) }; noise = D.noise; opts = { seal: n.seal }; advCustode = n.custode ?? undefined; }
      }
      const ev = useEvent.getState().ev?.ev;
      if (mode !== 'tutorial' && ev?.omen) { const others = (Object.keys(OMENS) as OmenId[]).filter(o => o !== ev.omen).sort(() => Math.random() - 0.5); opts = { ...opts, omens: [others[0], ev.omen, others[1]] }; }
      if (mode !== 'tutorial') { const oc = custodiOf(mainFaction(op.deck)); if (advCustode !== undefined) { opts = { ...opts, custodi: [myCustode, advCustode] }; } else opts = { ...opts, custodi: [myCustode, oc[Math.floor(Math.random() * oc.length)].id] }; }
      g = newGame(me, op, opts); stats = {}; bellsMe = 0; myMoves = 0; frames = []; myFacs = facsOf(me.deck); matchLabel = ({ ranked: 'Classificata', casual: 'Casual', adv: 'Avventura', tutorial: 'Tutorial', custom: '' } as Record<string, string>)[mode] ?? mode; if (mode === 'tutorial') deckName = 'Tutorial';
      custom = null;
      set({ coach: null, timed: mode !== 'tutorial' && !useProfile.getState().settings?.noTimer, turnLeft: turnMs(), reserveLeft: reserveMs() });
      set({ G: clone(g), mode, node, advId: advId ?? (mode === 'adv' ? 'cap1' : undefined), noise, sel: null, hint: '', stack: null, pending: null, attacking: null, laneHl: -1, fx: [], banner: null, busy: false, result: null, preview: null, tutStep: 0, tutFree: false, lens: false, inspected: null });
      if (mode === 'tutorial') { dealSounds(g.p[0].hand.length); begin('Inizi tu'); } else { beginLabel = 'Inizi tu'; set({ mull: { sel: [] } }); dealSounds(g.p[0].hand.length); }
    },
    selectHand: hi => {
      if (!g) return; const h = g.p[0].hand[hi]; if (!h) return;
      set({ preview: { id: h.id, cost: costOf(g, 0, h) } });
      if (!myTurn() || g.phase !== 'main') return;
      const s = get().sel;
      if (s?.kind === 'hand' && s.hi === hi) { cancelStack(); return; }
      if (!tutAllows({ type: 'select', card: h.id })) return;
      const opts = playOptions(g, 0, hi), c = cardInfo(h.id);
      if (!opts.length) { sfx('error'); set({ sel: null, hint: costOf(g, 0, h) > g.p[0].crystals ? `Servono ${costOf(g, 0, h)} Cristalli per ${c.n}.` : `Nessun bersaglio valido per ${c.n}.` }); return; }
      if (c.t !== 'I') set({ sel: { kind: 'hand', hi, hid: h.hid, opts, step: 'lane' }, hint: '' });
      else if (EFFECTS[h.id]?.spellT) beginTargeting(hi, opts);
      else set({ sel: { kind: 'hand', hi, hid: h.hid, opts, step: 'confirm' }, stack: { id: h.id, hid: h.hid, p: 0, targeting: true }, pending: h.hid, hint: '' });
    },
    dropHand: (hi, drop) => {
      set({ dragging: null });
      if (!g || !myTurn() || g.phase !== 'main') return;
      const h = g.p[0].hand[hi]; if (!h) return;
      if (!tutAllows({ type: 'select', card: h.id })) return;
      const opts = playOptions(g, 0, hi), c = cardInfo(h.id); if (!opts.length) { get().selectHand(hi); return; }
      if (!drop) return;
      const [k, v] = drop.split(':');
      if (c.t === 'U' && k === 'unit') { const l = laneOfDrop(drop); if (l.startsWith('lane:')) laneChosen(hi, opts, +l.split(':')[1]); return; }
      if (c.t === 'U' || c.t === 'R') { if (k === 'lane' || k === 'seal') { const l = k === 'seal' ? +v.split('-')[1] : +v; if (c.t === 'R' && k === 'seal' && v.split('-')[0] !== '0') return; laneChosen(hi, opts, l); } return; }
      if (EFFECTS[h.id]?.spellT) {
        // rilasciata su un bersaglio valido: giocala subito, altrimenti apri la freccia di mira
        const tgt = dropToTarget(drop);
        const match = tgt && legalTargets(g, 0, EFFECTS[h.id].spellT).find(t => sameTarget(t, tgt));
        if (match) { void doPlay(hi, { target: match }); return; }
        beginTargeting(hi, opts); return;
      }
      void doPlay(hi, {});
    },
    clickLane: l => {
      const s = get().sel; if (!g || !s) return;
      if (s.kind === 'hand' && s.step === 'lane' && cardInfo(g.p[0].hand[s.hi].id).t === 'U') { laneChosen(s.hi, s.opts, l); return; }
      if (s.kind === 'hand' && s.step === 'target') { targetChosen({ type: 'lane', lane: l }); return; }
      if (s.kind === 'unit' && s.to.includes(l)) get().dropUnit(s.uid, `lane:${l}`);
    },
    clickSeal: (p, l) => {
      const s = get().sel; if (!g || !s || s.kind !== 'hand') return;
      if (s.step === 'lane' && p === 0 && cardInfo(g.p[0].hand[s.hi].id).t === 'R') { const o = s.opts.find(o => o.lane === l); if (o) void doPlay(s.hi, o); return; }
      if (s.step === 'target') targetChosen({ type: 'seal', p, lane: l });
    },
    clickUnit: uid => {
      if (!g) return; const f = findU(g, uid); if (!f) return;
      const s = get().sel;
      if (s?.kind === 'hand' && s.step === 'target') { if (s.targets![0]?.type === 'lane') { targetChosen({ type: 'lane', lane: f.l }); return; } if (targetChosen({ type: 'unit', p: f.p, lane: f.l, uid })) return; }
      if (get().preview?.uid !== uid) set({ preview: { id: f.u.id, uid } });
      if (!myTurn() || g.phase !== 'main' || f.p !== 0 || s?.kind === 'hand') return;
      if (s?.kind === 'unit' && s.uid === uid) { set({ sel: null }); return; }
      if (!tutAllows({ type: 'selectUnit', card: f.u.id })) return;
      const to = moveTargets(g, 0, uid);
      set(to.length ? { sel: { kind: 'unit', uid, to }, hint: '' } : { sel: null, hint: f.u.kw.includes('Radicato') ? 'Questa unità è Radicata e non può spostarsi.' : f.u.moved ? 'Si è già spostata in questo turno.' : g.p[0].crystals < 1 ? 'Serve 1 Cristallo per spostare un\'unità.' : 'Nessuna corsia adiacente ha spazio.' });
    },
    dropUnit: (uid, drop) => {
      set({ dragging: null });
      if (!g || !myTurn() || g.phase !== 'main' || !drop) return;
      const [k, v] = laneOfDrop(drop).split(':'); if (k !== 'lane') return;
      const to = +v, f = findU(g, uid); if (!f || !moveTargets(g, 0, uid).includes(to)) return;
      if (!tutAllows({ type: 'move', card: f.u.id, to })) return;
      moveUnit(g, 0, uid, to); myMoves++; sfx('move'); set({ sel: null }); commit(); tutAdvance();
      if (g.winner != null) finish();
    },
    confirm: () => { const s = get().sel; if (s?.kind === 'hand' && s.step === 'confirm') void doPlay(s.hi, {}, true); },
    skip: () => { const s = get().sel; if (s?.kind === 'hand' && s.lane != null) void doPlay(s.hi, { lane: s.lane }, true); },
    cancel: () => cancelStack(),
    endTurn: async () => {
      if (!myTurn() || g!.phase !== 'main') return;
      if (!tutAllows({ type: 'end' })) return;
      stopClock();
      const G = g!; cancelStack(); set({ busy: true, hint: '' }); tutAdvance();
      endTurnEffects(g!, 0); commit(); await combat(0); if (!alive(G)) return;
      if (g!.winner != null) return finish();
      await aiTurn();
    },
    setDragging: hid => set({ dragging: hid }),
    setPreview: p => set({ preview: p }),
    tutNext: () => { const st = tutStep(); if (st?.kind === 'info') tutAdvance(); else if (st?.kind === 'free') set({ tutFree: true }); },
    quit: () => { if (!g || get().result) return; g.winner = 1; finish(); },
    exit: () => { stopClock(); g = null; set({ replay: null }); set({ G: null, result: null, busy: false, stack: null, sel: null, fx: [] }); },
  };
});

/** Rilasciare sopra una propria unità equivale a rilasciare nella sua corsia. */
function laneOfDrop(drop: string) {
  const [k, v] = drop.split(':');
  if (k === 'unit' && g) { const f = findU(g, +v); if (f && f.p === 0) return `lane:${f.l}`; }
  return drop;
}
const turnNote = (G: Game) => (G.p[0].maxC >= 10 ? 'Cristalli al massimo: peschi due carte' : `+1 Cristallo: ora ne hai ${G.p[0].maxC}`);
function dropToTarget(drop: string): Target | null {
  const [k, v] = drop.split(':');
  if (k === 'unit' && g) { const f = findU(g, +v); return f ? { type: 'unit', p: f.p, lane: f.l, uid: f.u.uid } : null; }
  if (k === 'seal') { const [p, l] = v.split('-').map(Number); return { type: 'seal', p, lane: l }; }
  if (k === 'lane') return { type: 'lane', lane: +v };
  return null;
}
const sameTarget = (a: Target, b: Target) => a.type === b.type && (a.type === 'unit' ? b.type === 'unit' && a.uid === b.uid : a.type === 'seal' ? b.type === 'seal' && a.p === b.p && a.lane === b.lane : a.lane === b.lane);
export { moveTargets, playOptions };

// maniglia per i test automatici (strumenti di sviluppo)
if (typeof window !== 'undefined') (window as unknown as { __rosaBattle?: unknown }).__rosaBattle = useBattle;
