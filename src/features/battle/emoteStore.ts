// Emote di battaglia: frasi rapide mostrate in un fumetto sopra il ritratto di chi le usa. Il giocatore le
// sceglie dal selettore; l'avversario IA risponde a volte, con una piccola "personalità" probabilistica.
// Modulo a sé (non nello store della partita): lo store lo avvisa solo dei momenti chiave.
import {create} from 'zustand';
import {sfx} from '../../audio/sfx';
import type {Pair} from '../../i18n/words';

export type EmoteId = 'greet' | 'wellPlayed' | 'thanks' | 'wow' | 'oops' | 'threat';

export interface Emote {
    id: EmoteId;
    icon: string;
    text: Pair
}

export const EMOTES: readonly Emote[] = [
    {id: 'greet', icon: '👋', text: ['Salve, viandante.', 'Greetings, traveller.']},
    {id: 'wellPlayed', icon: '👏', text: ['Ben giocato.', 'Well played.']},
    {id: 'thanks', icon: '🌹', text: ['Grazie.', 'Thank you.']},
    {id: 'wow', icon: '✨', text: ['Incredibile!', 'Incredible!']},
    {id: 'oops', icon: '😅', text: ['Ops…', 'Oops…']},
    {id: 'threat', icon: '🔥', text: ['I tuoi Sigilli tremano.', 'Your Seals tremble.']},
];
export const EMOTE_BY_ID = Object.fromEntries(EMOTES.map(e => [e.id, e])) as Record<EmoteId, Emote>;

/** Durata di un fumetto, pausa minima tra due emote del giocatore e tra due reazioni dell'IA. */
export const EMOTE_SHOW_MS = 2800, EMOTE_COOLDOWN_MS = 3500, AI_REACT_GAP_MS = 6000;

/** Stimoli a cui l'IA può reagire: un'emote del giocatore o un momento della partita. */
export type EmoteTrigger = EmoteId | 'start' | 'sealTaken' | 'sealLost' | 'playerWon' | 'playerLost';

/** Per ogni stimolo, le possibili risposte con la loro probabilità (la somma resta sotto 1: a volte tace). */
const REACTIONS: Record<EmoteTrigger, readonly (readonly [EmoteId, number])[]> = {
    start: [['greet', 0.5]],
    greet: [['greet', 0.75]],
    wellPlayed: [['thanks', 0.7]],
    thanks: [['wellPlayed', 0.25]],
    wow: [['threat', 0.3]],
    oops: [['wow', 0.3]],
    threat: [['threat', 0.35], ['wow', 0.15]],
    sealTaken: [['threat', 0.35]],
    sealLost: [['oops', 0.3], ['wellPlayed', 0.15]],
    playerWon: [['wellPlayed', 0.8]],
    playerLost: [['wellPlayed', 0.5]],
};

type Side = 0 | 1;
type Bubble = { id: EmoteId; k: number } | null;

interface EmoteState {
    bubbles: readonly [Bubble, Bubble];
    /** L'avversario è silenziato: le sue emote non compaiono. Resta valido tra una partita e l'altra. */
    muted: boolean;
    /** Istante da cui il giocatore può mandare la prossima emote. */
    readyAt: number;
}

export const useEmotes = create<EmoteState>(() => ({bubbles: [null, null], muted: false, readyAt: 0}));

let seq = 0, aiQuiet = true, aiNextAt = 0;
const timers = new Set<ReturnType<typeof setTimeout>>();

/** setTimeout tracciato, così una nuova partita cancella i fumetti e le risposte in sospeso. */
function later(ms: number, fn: () => void) {
    const h = setTimeout(() => {
        timers.delete(h);
        fn();
    }, ms);
    timers.add(h);
}

const setBubble = (p: Side, b: Bubble) => useEmotes.setState(s => {
    const bubbles = [...s.bubbles] as [Bubble, Bubble];
    bubbles[p] = b;
    return {bubbles};
});

function show(p: Side, id: EmoteId) {
    const k = ++seq;
    setBubble(p, {id, k});
    later(EMOTE_SHOW_MS, () => {
        if (useEmotes.getState().bubbles[p]?.k === k) setBubble(p, null);
    });
}

/** Risposta dell'IA a uno stimolo, con un ritardo "umano". Le reazioni spontanee ai momenti della partita
 * arrivano al massimo una ogni AI_REACT_GAP_MS; le risposte a un'emote del giocatore no (`reply`): lo spam è
 * già frenato dalla pausa del giocatore. */
export function aiReact(trigger: EmoteTrigger, delay = 900 + Math.random() * 900, reply = false) {
    const now = Date.now();
    if (aiQuiet || useEmotes.getState().muted || (!reply && now < aiNextAt)) return;
    let r = Math.random();
    for (const [id, chance] of REACTIONS[trigger]) {
        if (r < chance) {
            aiNextAt = now + AI_REACT_GAP_MS;
            later(delay, () => {
                if (!useEmotes.getState().muted) show(1, id);
            });
            return;
        }
        r -= chance;
    }
}

/** Emote del giocatore; restituisce false se è ancora nella pausa tra un'emote e l'altra. */
export function sendEmote(id: EmoteId): boolean {
    const now = Date.now();
    if (now < useEmotes.getState().readyAt) return false;
    useEmotes.setState({readyAt: now + EMOTE_COOLDOWN_MS});
    show(0, id);
    sfx('click');
    aiReact(id, undefined, true);
    return true;
}

/** Nuova partita (o uscita): via fumetti e timer. `quiet` spegne le reazioni dell'IA, per esempio nel tutorial. */
export function resetEmotes(quiet = true) {
    timers.forEach(clearTimeout);
    timers.clear();
    aiQuiet = quiet;
    aiNextAt = 0;
    useEmotes.setState({bubbles: [null, null], readyAt: 0});
}

export const toggleMuteOpp = () => useEmotes.setState(s => ({
    muted: !s.muted,
    bubbles: s.muted ? s.bubbles : [s.bubbles[0], null]
}));
