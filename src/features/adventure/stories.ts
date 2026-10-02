// Racconti della community: i moderatori scrivono i capitoli, la community vota come prosegue la storia.
// Online usa il database condiviso dell'artefatto (capability "db" + "user"); senza, funziona in locale.
import {useEffect, useState} from 'react';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Adventure, AdvStage} from './model';
import type {Faction, OmenId} from '../../engine';
import {useAdventures} from './store';
import {connectCommunity, type Db} from '../../app/community';
import {applyVariants, VARIANTS} from '../../cards/variants';
import {useProfile} from '../../profile/store';

/** Evento che parte quando la community sceglie questa opzione: dura 7 giorni. */
export interface StoryEvent {
    title: string;
    desc?: string;
    faction?: Faction | null;
    omen?: OmenId | null
}

export interface StoryOption {
    id: string;
    label: string;
    desc: string;
    event?: StoryEvent;
    /** Carta viva: se vince questa opzione, la carta cambia per sempre (id in cards/variants.ts). */
    variant?: string
}

export interface StoryChapter {
    id: string;
    title: string;
    text: string;
    stage: AdvStage;
    question?: string;
    options?: StoryOption[];
    status?: 'open' | 'closed';
    winner?: string;
    closedAt?: number
}

export interface Story {
    id: string;
    title: string;
    hero: string;
    intro: string;
    chapters: StoryChapter[];
    updatedAt: number
}

export const voteKey = (storyId: string, chapterId: string) => `${storyId}__${chapterId}`;
export const storyAdventure = (st: Story): Adventure => ({
    id: `story-${st.id}`,
    title: st.title,
    intro: st.intro,
    official: true,
    stages: st.chapters.map(c => ({...c.stage, n: c.title})),
    updatedAt: st.updatedAt
});

/** Esempio mostrato quando non c'è un database condiviso (anteprima locale). */
export const EXAMPLE_STORY: Story = {
    id: 'esploratrice', title: "Il diario dell'Esploratrice", hero: 'Elia Voss, cartografa', updatedAt: 0,
    intro: "Elia Voss disegna mappe per la Cattedrale. Quando il primo Sigillo si incrina, parte da sola per scoprire dove porta la crepa. Ogni capitolo finisce con una scelta: la decide la community.",
    chapters: [{
        id: 'c1', title: 'Il faro spento', status: 'open',
        text: "La crepa nel Sigillo punta verso il mare. Elia raggiunge l'ultimo faro della costa e lo trova spento, con un guardiano di corallo immobile sulla scala. Quando la vede, il guardiano si muove.",
        stage: {
            n: 'Il faro spento',
            foe: 'Guardiano del Faro',
            txt: '',
            facs: ['marea', 'radice'],
            diff: 1,
            seal: 8,
            art: 'marea-u2'
        },
        question: 'Il guardiano, sconfitto, indica tre strade. Dove va Elia?',
        options: [
            {
                id: 'onde',
                label: 'Sotto le onde',
                desc: 'Seguire la luce del faro sommerso fino alle rovine di Atlantide.',
                event: {title: 'Settimana delle Maree', faction: 'marea', omen: 'nebbia'},
                variant: 'sentinella-faro'
            },
            {
                id: 'monte',
                label: 'Verso il Monte',
                desc: 'Salire dove il fumo di Vulkara oscura il cielo.',
                event: {title: 'Settimana del Fuoco', faction: 'brace', omen: 'cenere'},
                variant: 'fabbro-monte'
            },
            {
                id: 'bosco',
                label: 'Nel bosco che respira',
                desc: 'Entrare tra le radici di Yggrin, dove nessuna mappa arriva.',
                event: {title: 'Settimana delle Radici', faction: 'radice', omen: 'consacrata'},
                variant: 'lupa-yggrin'
            },
        ],
    }],
};

interface LocalState {
    stories: Story[];
    votes: Record<string, string>;
    save: (s: Story) => void;
    remove: (id: string) => void;
    vote: (k: string, opt: string) => void
}

const useLocal = create<LocalState>()(persist(set => ({
    stories: [EXAMPLE_STORY], votes: {},
    save: st => set(s => ({stories: s.stories.some(x => x.id === st.id) ? s.stories.map(x => (x.id === st.id ? st : x)) : [...s.stories, st]})),
    remove: id => set(s => ({stories: s.stories.filter(x => x.id !== id)})),
    vote: (k, opt) => set(s => ({votes: {...s.votes, [k]: opt}})),
}), {name: 'rosarcana-stories'}));

export interface StoriesApi {
    online: boolean;
    ready: boolean;
    stories: Story[];
    tallies: Record<string, Record<string, number>>;
    mine: Record<string, string>;
    isMod: boolean;
    error: string;
    save: (s: Story) => Promise<void>;
    remove: (id: string) => Promise<void>;
    vote: (storyId: string, chapterId: string, opt: string) => Promise<void>
}

export function useStories(): StoriesApi {
    const local = useLocal(), author = useAdventures(s => s.authorMode);
    const [db, setDb] = useState<Db | null>(null), [ready, setReady] = useState(false), [isMod, setMod] = useState(false), [myId, setMyId] = useState<string | null>(null);
    const [stories, setStories] = useState<Story[]>([]), [ballots, setBallots] = useState<Record<string, Record<string, string>>>({}), [error, setError] = useState('');
    useEffect(() => {
        let alive = true;
        const unsubs: (() => void)[] = [];
        (async () => {
            const com = await connectCommunity();
            if (!alive) return;
            if (!com) {
                setReady(true);
                return;
            }
            const d = com.db;
            setDb(d);
            setMyId(com.myId);
            setMod(com.isMod);
            unsubs.push(d.collection('stories').onSnapshot(q => {
                setStories(q.docs.map(x => x.data() as unknown as Story).filter(Boolean).sort((a, b) => a.updatedAt - b.updatedAt));
                setReady(true);
            }, () => setError('Impossibile leggere i racconti')));
            unsubs.push(d.collection('ballots').onSnapshot(q => {
                const m: Record<string, Record<string, string>> = {};
                q.docs.forEach(x => {
                    m[x.id] = ((x.data() ?? {}).votes ?? {}) as Record<string, string>;
                });
                setBallots(m);
            }));
        })();
        return () => {
            alive = false;
            unsubs.forEach(f => f());
        };
    }, []);
    if (!db) {
        const tallies: Record<string, Record<string, number>> = {};
        Object.entries(local.votes).forEach(([k, v]) => {
            (tallies[k] ??= {})[v] = (tallies[k][v] ?? 0) + 1;
        });
        return {
            online: false,
            ready,
            stories: local.stories,
            tallies,
            mine: local.votes,
            isMod: author,
            error,
            save: async st => local.save(st),
            remove: async id => local.remove(id),
            vote: async (s, c, o) => local.vote(voteKey(s, c), o)
        };
    }
    const tallies: Record<string, Record<string, number>> = {};
    Object.values(ballots).forEach(v => Object.entries(v).forEach(([k, o]) => {
        (tallies[k] ??= {})[o] = (tallies[k][o] ?? 0) + 1;
    }));
    const mine = (myId && ballots[myId]) || {};
    return {
        online: true, ready, stories, tallies, mine, isMod, error,
        save: async st => {
            try {
                await db.doc(`stories/${st.id}`).set(st as unknown as Record<string, unknown>);
            } catch {
                setError('Solo i moderatori possono salvare i racconti');
            }
        },
        remove: async id => {
            try {
                await db.doc(`stories/${id}`).delete();
            } catch {
                setError('Eliminazione non riuscita');
            }
        },
        vote: async (s, c, o) => {
            if (!myId) {
                setError('Accedi per votare');
                return;
            }
            try {
                await db.doc(`ballots/${myId}`).set({votes: {...mine, [voteKey(s, c)]: o}});
            } catch {
                setError('Per votare serve almeno il ruolo Contributor su questo artefatto');
            }
        },
    };
}

/** Evento attivo: l'ultima scelta della community chiusa negli ultimi 7 giorni che porta un evento. */
export const EVENT_DAYS = 7;

export function activeEvent(stories: Story[], now = Date.now()) {
    let best: { ev: StoryEvent; until: number; story: string; option: string } | null = null;
    for (const st of stories) for (const c of st.chapters) {
        if (c.status !== 'closed' || !c.winner || !c.closedAt) continue;
        const o = c.options?.find(x => x.id === c.winner);
        if (!o?.event) continue;
        const until = c.closedAt + EVENT_DAYS * 86400000;
        if (until > now && (!best || until > best.until)) best = {ev: o.event, until, story: st.title, option: o.label};
    }
    return best;
}

/** Carte vive: varianti scelte dalla community, dai capitoli chiusi (valgono per sempre, non 7 giorni). */
export function activeVariants(stories: Story[]) {
    const out: { variant: string; story: string; option: string }[] = [];
    for (const st of stories) for (const c of st.chapters) {
        const o = c.status === 'closed' ? c.options?.find(x => x.id === c.winner) : undefined;
        if (o?.variant && VARIANTS[o.variant]) out.push({variant: o.variant, story: st.title, option: o.label});
    }
    return out;
}

/** Evento e carte vive correnti, condivisi con il resto del gioco (partite, schermata Gioca, collezione). */
export const useEvent = create<{ ev: ReturnType<typeof activeEvent>; variants: ReturnType<typeof activeVariants> }>(() => ({ev: null, variants: []}));

export function EventSync() {
    const api = useStories();
    const ev = activeEvent(api.stories), variants = activeVariants(api.stories);
    const key = JSON.stringify([ev, variants]);
    useEffect(() => {
        applyVariants(variants.map(v => v.variant));
        useEvent.setState({ev, variants});
        useProfile.getState().noteVariants(variants.map(v => VARIANTS[v.variant].card));
    }, [key]);
    return null;
}
