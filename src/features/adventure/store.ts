import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {type Adventure, CHAPTER_1, decode, OFFICIAL_EXTRA} from './model';

interface AdvState {
    mine: Adventure[];
    imported: Adventure[];
    drafts: Adventure[];
    authorMode: boolean;
    progress: Record<string, number[]>;
    save: (a: Adventure) => void;
    remove: (id: string) => void;
    importCode: (code: string) => Adventure | null;
    setAuthor: (on: boolean) => void;
    complete: (advId: string, stage: number) => boolean;
}

/** Avventure locali: le tue, quelle importate con un codice, e le bozze dei capitoli ufficiali (Modalità autore). */
export const useAdventures = create<AdvState>()(persist((set, get) => ({
    mine: [], imported: [], drafts: [], authorMode: false, progress: {},
    save: a => set(s => {
        const key = a.official ? 'drafts' : 'mine', list = s[key], i = list.findIndex(x => x.id === a.id),
            next = {...a, updatedAt: Date.now()};
        return {[key]: i >= 0 ? list.map(x => (x.id === a.id ? next : x)) : [...list, next]} as Partial<AdvState>;
    }),
    remove: id => set(s => ({
        mine: s.mine.filter(a => a.id !== id),
        imported: s.imported.filter(a => a.id !== id),
        drafts: s.drafts.filter(a => a.id !== id)
    })),
    importCode: code => {
        const a = decode(code);
        if (!a) return null;
        const withId = {...a, id: 'imp-' + Date.now().toString(36)};
        set(s => ({imported: [...s.imported, withId]}));
        return withId;
    },
    setAuthor: on => set({authorMode: on}),
    complete: (advId, stage) => {
        const done = get().progress[advId] ?? [];
        if (done.includes(stage)) return false;
        set(s => ({progress: {...s.progress, [advId]: [...done, stage]}}));
        return true;
    },
}), {name: 'rosarcana-adventures'}));

export function allAdventures(st: Pick<AdvState, 'mine' | 'imported' | 'drafts'>) {
    return [CHAPTER_1, ...OFFICIAL_EXTRA, ...st.drafts, ...st.mine, ...st.imported];
}

const runtime = new Map<string, Adventure>();
/** Avventure create al volo (capitoli dei racconti della community). */
export const registerRuntime = (a: Adventure) => {
    runtime.set(a.id, a);
};
export const findAdventure = (id: string) => runtime.get(id) ?? allAdventures(useAdventures.getState()).find(a => a.id === id);
