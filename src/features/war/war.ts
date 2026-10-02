// Guerra della Rosa: ogni settimana le Casate si contendono i 12 petali del rosone. Ogni partita dà punti alla
// Casata principale del mazzo; la Casata che vince la settimana dà il presagio alla corsia centrale di tutte le
// partite della settimana dopo. Online i punti di tutti si sommano (database condiviso); in locale contano i tuoi.
import {useEffect} from 'react';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {connectCommunity} from '../../app/community';
import type {Faction, OmenId} from '../../engine';
import {weekIndex} from '../../economy/weekly';

export const WAR_PETALS = 12, WAR_PLAY_PTS = 1, WAR_WIN_PTS = 2;
export const WAR_FACTIONS: readonly Faction[] = ['brace', 'marea', 'radice', 'vuoto'];
/** Presagio che la Casata vincitrice porta sulla corsia centrale per la settimana successiva. */
export const WAR_OMEN: Record<Faction, OmenId> = {brace: 'cenere', marea: 'nebbia', radice: 'consacrata', vuoto: 'campane'};

export type Points = Partial<Record<Faction, number>>;

/** Contributo di un giocatore: la settimana in corso e quella prima (per sapere chi ha vinto). */
export interface WarEntry {
    week: number;
    pts: Points;
    prev?: { week: number; pts: Points }
}

const emptyEntry = (): WarEntry => ({week: weekIndex(), pts: {}});

/** Porta un contributo alla settimana corrente: la settimana vecchia diventa `prev`. */
function rollover(e: WarEntry, week = weekIndex()): WarEntry {
    if (e.week === week) return e;
    return {week, pts: {}, prev: e.week === week - 1 ? {week: e.week, pts: e.pts} : e.prev?.week === week - 1 ? e.prev : undefined};
}

const add = (into: Points, pts: Points) => {
    for (const f of WAR_FACTIONS) if (pts[f]) into[f] = (into[f] ?? 0) + pts[f]!;
    return into;
};

/** Somma dei contributi per la settimana `week`. */
export function totalsFor(entries: readonly WarEntry[], week: number): Points {
    const out: Points = {};
    for (const e of entries) {
        if (e.week === week) add(out, e.pts);
        else if (e.prev?.week === week) add(out, e.prev.pts);
    }
    return out;
}

/** Casata in testa (null se nessuno ha punti; a pari merito vince chi viene prima nell'ordine delle Casate). */
export const leader = (t: Points): Faction | null =>
    WAR_FACTIONS.reduce<Faction | null>((best, f) => ((t[f] ?? 0) > (best ? t[best] ?? 0 : 0) ? f : best), null);

/** I 12 petali divisi fra le Casate in proporzione ai punti (metodo dei resti più grandi); null = petalo libero. */
export function petals(t: Points): (Faction | null)[] {
    const sum = WAR_FACTIONS.reduce((a, f) => a + (t[f] ?? 0), 0);
    if (!sum) return Array(WAR_PETALS).fill(null);
    const quota = WAR_FACTIONS.map(f => ({f, q: ((t[f] ?? 0) / sum) * WAR_PETALS}));
    const n = quota.map(x => ({f: x.f, n: Math.floor(x.q), r: x.q - Math.floor(x.q)}));
    let left = WAR_PETALS - n.reduce((a, x) => a + x.n, 0);
    [...n].sort((a, b) => b.r - a.r).forEach(x => {
        if (left > 0 && x.r > 0) {
            x.n++;
            left--;
        }
    });
    return n.flatMap(x => Array<Faction>(x.n).fill(x.f));
}

/* ---------------- Stato: il tuo contributo e i totali di tutti ---------------- */

interface WarState {
    mine: WarEntry;
    /** Contributi di tutti i giocatori (online); vuoto in locale. */
    all: WarEntry[];
    online: boolean
}

export const useWar = create<WarState>()(persist((): WarState => ({mine: emptyEntry(), all: [], online: false}), {
    name: 'rosarcana-war',
    partialize: s => ({mine: s.mine}),
}));

/** Contributi validi: online quelli di tutti, altrimenti solo il tuo. */
const entries = (s: WarState) => (s.online ? s.all : [rollover(s.mine)]);

export const weekTotals = (s: WarState, week = weekIndex()) => totalsFor(entries(s), week);

/** Presagio della Guerra per questa settimana (dalla Casata che ha vinto la precedente), se c'è. */
export function warOmen(): OmenId | null {
    const f = leader(weekTotals(useWar.getState(), weekIndex() - 1));
    return f ? WAR_OMEN[f] : null;
}

/** Registra una partita per la Casata principale del mazzo e, online, pubblica il tuo contributo. */
export function recordWar(fac: Faction, win: boolean) {
    const mine = rollover(useWar.getState().mine);
    const next: WarEntry = {...mine, pts: {...mine.pts, [fac]: (mine.pts[fac] ?? 0) + (win ? WAR_WIN_PTS : WAR_PLAY_PTS)}};
    useWar.setState({mine: next});
    void connectCommunity().then(c => {
        if (c?.myId) void c.db.doc(`war/${c.myId}`).set(next as unknown as Record<string, unknown>).catch(() => undefined);
    });
}

/** Tiene aggiornati i contributi di tutti i giocatori (montato una volta, accanto a EventSync). */
export function WarSync() {
    useEffect(() => {
        let unsub: (() => void) | undefined, alive = true;
        void connectCommunity().then(c => {
            if (!c || !alive) return;
            useWar.setState({online: true});
            unsub = c.db.collection('war').onSnapshot(q => useWar.setState({
                all: q.docs.map(d => d.data() as unknown as WarEntry).filter(e => e && typeof e.week === 'number')
            }));
        });
        return () => {
            alive = false;
            unsub?.();
        };
    }, []);
    return null;
}
