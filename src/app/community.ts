// Collegamento al database condiviso dell'artefatto (capability "db" + "user"), usato da Racconti della community
// e Guerra della Rosa. Senza database il gioco funziona in locale: chi lo usa riceve `null` e ripiega su di sé.

export interface Db {
    collection: (p: string) => {
        onSnapshot: (n: (q: {
            docs: { id: string; data: () => Record<string, unknown> | undefined }[]
        }) => void, e?: (err: unknown) => void) => () => void
    };
    doc: (p: string) => { set: (d: Record<string, unknown>) => Promise<void>; delete: () => Promise<void> };
}

interface User {
    id: () => Promise<string | null>;
    canEdit: () => Promise<boolean>;
    isOwner: () => Promise<boolean>
}

export interface Community {
    db: Db;
    /** Utente corrente (null se l'artefatto non conosce chi lo sta guardando). */
    myId: string | null;
    /** Può scrivere i racconti e chiudere le votazioni. */
    isMod: boolean
}

let conn: Promise<Community | null> | null = null;

/** Connessione unica per tutta l'app: la prima chiamata la apre, le altre riusano la stessa promessa. */
export function connectCommunity(): Promise<Community | null> {
    conn ??= (async () => {
        const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
        if (!c?.use) return null;
        const db = (await c.use('db').catch(() => null)) as Db | null;
        if (!db) return null;
        const u = (await c.use('user').catch(() => null)) as User | null;
        return {db, myId: u ? await u.id() : null, isMod: u ? (await u.canEdit()) || (await u.isOwner()) : false};
    })();
    return conn;
}
