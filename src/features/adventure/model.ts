// Avventure: capitoli ufficiali (curati dall'autore del gioco) e avventure create dalla community.
import {BYID, type CustodeId, CUSTODI, type Faction, FACTIONS} from '../../engine';
import type {Reward} from '../../economy/constants';
import {ADVENTURE} from './nodes';

export type Difficulty = 1 | 2 | 3 | 4;
export const DIFFS: Record<Difficulty, { name: string; tier: number; noise: number; oro: number }> = {
    1: {name: 'Facile', tier: 0, noise: 6, oro: 60},
    2: {name: 'Normale', tier: 1, noise: 4, oro: 90},
    3: {name: 'Difficile', tier: 2, noise: 2.5, oro: 120},
    4: {name: 'Leggendaria', tier: 3, noise: 1, oro: 160},
};

export interface AdvStage {
    n: string;
    foe: string;
    txt: string;
    facs: Faction[];
    diff: Difficulty;
    seal: number;
    art: string;
    force?: string[];
    custode?: CustodeId | null;
    portrait?: string;
    rw?: Reward
}

export interface Adventure {
    id: string;
    title: string;
    intro: string;
    official: boolean;
    stages: AdvStage[];
    author?: string;
    updatedAt: number;
    builtin?: boolean;
    draft?: boolean
}

/** Il Capitolo 1 incluso nel gioco. */
export const CHAPTER_1: Adventure = {
    id: 'cap1', builtin: true, official: true, updatedAt: 0, title: 'Capitolo 1: Il Risveglio',
    intro: "Il primo Sigillo della Rosa si è incrinato. Attraversa le terre delle quattro Casate fino a Nyxa.",
    stages: ADVENTURE.map(n => ({
        n: n.n,
        foe: n.foe,
        txt: n.txt,
        facs: n.facs,
        diff: (n.tier + 1) as Difficulty,
        seal: n.seal ?? 10,
        art: n.art,
        force: n.force,
        portrait: n.portrait,
        rw: n.rw
    })),
};
/** Capitoli ufficiali pubblicati con il gioco: l'autore li scrive in Modalità autore e li consegna con "Esporta per la pubblicazione". */
export const OFFICIAL_EXTRA: Adventure[] = [];

export const emptyStage = (): AdvStage => ({
    n: 'Nuova tappa',
    foe: 'Avversario',
    txt: '',
    facs: ['brace'],
    diff: 1,
    seal: 10,
    art: 'brace-c4'
});
export const newAdventure = (official: boolean): Adventure => ({
    id: (official ? 'off-' : 'com-') + Date.now().toString(36),
    title: official ? 'Nuovo capitolo' : 'La mia avventura',
    intro: '',
    official,
    stages: [emptyStage()],
    updatedAt: Date.now(),
    draft: official
});

const clip = (v: unknown, n: number) => String(v ?? '').slice(0, n);

/** Ripulisce un'avventura arrivata da fuori (codice condiviso): lunghezze, carte e fazioni valide. */
export function sanitize(a: Partial<Adventure>, official = false): Adventure | null {
    if (!a || !Array.isArray(a.stages) || !a.stages.length) return null;
    const stages = a.stages.slice(0, 8).map(st => {
        const facs = (Array.isArray(st.facs) ? st.facs : []).filter((f): f is Faction => f in FACTIONS).slice(0, 2);
        const diff = ([1, 2, 3, 4].includes(Number(st.diff)) ? Number(st.diff) : 1) as Difficulty;
        return {
            n: clip(st.n, 50) || 'Tappa',
            foe: clip(st.foe, 40) || 'Avversario',
            txt: clip(st.txt, 240),
            facs: facs.length ? facs : ['brace'] as Faction[],
            diff,
            seal: Math.min(16, Math.max(6, Math.round(Number(st.seal) || 10))),
            art: BYID[st.art as string] ? (st.art as string) : 'brace-c4',
            force: (Array.isArray(st.force) ? st.force : []).filter(id => BYID[id as string]).slice(0, 4) as string[],
            custode: st.custode && (st.custode as string) in CUSTODI ? st.custode : null,
        } satisfies AdvStage;
    });
    return {
        id: clip(a.id, 40) || 'imp-' + Date.now().toString(36),
        title: clip(a.title, 60) || 'Avventura',
        intro: clip(a.intro, 400),
        official,
        stages,
        author: clip(a.author, 40) || undefined,
        updatedAt: Date.now()
    };
}

/** Codice di condivisione: testo compatto da copiare e incollare. */
export function encode(a: Adventure) {
    const body = {
        title: a.title,
        intro: a.intro,
        author: a.author,
        stages: a.stages.map(({rw: _rw, portrait: _p, ...st}) => st)
    };
    return 'ROSA1:' + btoa(unescape(encodeURIComponent(JSON.stringify(body))));
}

export function decode(code: string): Adventure | null {
    try {
        const t = code.trim();
        if (!t.startsWith('ROSA1:')) return null;
        return sanitize(JSON.parse(decodeURIComponent(escape(atob(t.slice(6))))) as Partial<Adventure>);
    } catch {
        return null;
    }
}

/** Ricompensa della prima vittoria su una tappa. Le avventure della community danno poco, per evitare abusi. */
export const stageReward = (a: Adventure, st: AdvStage): Reward => (st.rw ? st.rw : a.official ? {oro: DIFFS[st.diff].oro} : {oro: 20});
