// Sfide tra amici: collegamento diretto tra due browser (WebRTC tramite PeerJS). Il codice della partita è
// l'indirizzo di chi la crea sul server pubblico di PeerJS, che serve solo a far incontrare i due giocatori:
// dopo, i messaggi viaggiano direttamente da un browser all'altro.
import Peer, {type DataConnection} from 'peerjs';
import type {CustodeId, Game, PlayOpt} from '../../engine';

/** Cambia quando cambia il formato dei messaggi: due versioni diverse del gioco non si collegano. */
export const NET_V = 1;
const PREFIX = 'rosarcana-sfida-';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_LEN = 6;

export const makeCode = () => Array.from({length: CODE_LEN}, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
/** Il codice come lo scrive un amico: maiuscole, senza spazi né trattini. */
export const cleanCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LEN);

/** Azione dell'ospite, nella sua prospettiva capovolta solo per i bersagli (vedi flip.ts). */
export type RemoteAct =
    | { k: 'play'; hi: number; o: PlayOpt }
    | { k: 'move'; uid: number; to: number }
    | { k: 'guard'; uid: number }
    | { k: 'guardAll'; on: boolean }
    | { k: 'aim'; uid: number; target: number }
    | { k: 'end' }
    | { k: 'mull'; hids: number[] };

export interface Hello {
    t: 'hello';
    v: number;
    name: string;
    deck: string[];
    custode: CustodeId | null
}

export type Msg =
    | Hello
    /** Chi ospita avvia la partita: stato iniziale (nella sua prospettiva) e il suo nome. */
    | { t: 'start'; G: Game; name: string }
    | { t: 'state'; G: Game }
    /** Animazioni del combattimento: chi sta attaccando e quale corsia è in lotta. */
    | { t: 'atk'; a: { uid: number; p: number } | null; lane: number }
    /** Carta che chi ospita sta giocando (sulla pila), o `null` quando si risolve. */
    | { t: 'stack'; id: string | null; hid?: number }
    | { t: 'act'; a: RemoteAct }
    | { t: 'quit' }
    | { t: 'bye'; reason: string };

export interface Link {
    role: 'host' | 'guest';
    send: (m: Msg) => void;
    /** Un solo destinatario alla volta: la sala d'attesa prima, la partita poi. */
    onMsg: (fn: (m: Msg) => void) => void;
    onClose: (fn: () => void) => void;
    close: () => void;
}

function wrap(role: Link['role'], peer: Peer, conn: DataConnection): Link {
    let handler: (m: Msg) => void = () => {};
    let closed: () => void = () => {};
    let done = false;
    const end = () => {
        if (done) return;
        done = true;
        closed();
    };
    conn.on('data', d => handler(d as Msg));
    conn.on('close', end);
    conn.on('error', end);
    peer.on('disconnected', () => {
        // il server d'incontro non serve più a partita avviata: si prova a riconnettersi solo per pulizia
        if (!peer.destroyed) peer.reconnect();
    });
    return {
        role,
        send: m => {
            if (conn.open) conn.send(m);
        },
        onMsg: fn => {
            handler = fn;
        },
        onClose: fn => {
            closed = fn;
        },
        close: () => {
            done = true;
            try {
                conn.close();
            } catch { /* già chiusa */
            }
            peer.destroy();
        },
    };
}

export interface Pending {
    cancel: () => void
}

/** Crea una partita con un codice e aspetta l'amico. `onCode` arriva quando il codice è davvero registrato. */
export function hostGame(cb: { onCode: (code: string) => void; onLink: (l: Link) => void; onError: (e: NetError) => void }): Pending {
    let peer: Peer | null = null, tries = 0, linked = false;
    const open = () => {
        const code = makeCode();
        peer = new Peer(PREFIX + code);
        peer.on('open', () => cb.onCode(code));
        peer.on('connection', conn => {
            if (linked) {
                conn.on('open', () => conn.close());
                return;
            }
            linked = true;
            conn.on('open', () => cb.onLink(wrap('host', peer!, conn)));
        });
        peer.on('error', e => {
            if (linked) return;
            if (e.type === 'unavailable-id' && tries++ < 3) {
                peer?.destroy();
                open();
                return;
            }
            cb.onError(netError(e.type));
        });
    };
    open();
    return {
        cancel: () => {
            if (!linked) peer?.destroy();
        }
    };
}

/** Entra nella partita di un amico con il suo codice. */
export function joinGame(code: string, cb: { onLink: (l: Link) => void; onError: (e: NetError) => void }): Pending {
    const peer = new Peer();
    let linked = false;
    const timer = setTimeout(() => {
        if (!linked) {
            cb.onError('timeout');
            peer.destroy();
        }
    }, 15000);
    peer.on('open', () => {
        const conn = peer.connect(PREFIX + code, {reliable: true, serialization: 'json'});
        conn.on('open', () => {
            linked = true;
            clearTimeout(timer);
            cb.onLink(wrap('guest', peer, conn));
        });
    });
    peer.on('error', e => {
        if (linked) return;
        clearTimeout(timer);
        cb.onError(netError(e.type));
        peer.destroy();
    });
    return {
        cancel: () => {
            clearTimeout(timer);
            if (!linked) peer.destroy();
        }
    };
}

/** Errori di PeerJS ridotti a poche chiavi, tradotte dalla sala d'attesa. */
export type NetError = 'notfound' | 'network' | 'browser' | 'timeout' | 'other';

function netError(type: string): NetError {
    if (type === 'peer-unavailable') return 'notfound';
    if (type === 'network' || type === 'server-error' || type === 'socket-error' || type === 'socket-closed') return 'network';
    if (type === 'browser-incompatible' || type === 'webrtc') return 'browser';
    return 'other';
}
