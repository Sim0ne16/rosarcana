// Carte vive: la community, votando il seguito di un racconto, può riscrivere una carta. La nuova versione vale
// per tutti (nome, testo, statistiche, storia); chi possedeva la carta prima del cambio ne tiene la Prima edizione.
// Una variante cambia solo statistiche e parole chiave, o prende in prestito l'effetto di un'altra carta: così
// non richiede mai codice nuovo nel motore e resta coerente con il testo mostrato.
import {BYID, type CardDef, EFFECTS, type Keyword} from '../engine';
import {EN_CARDS} from '../i18n/en/cards';
import {EN_LORE} from '../i18n/en/lore';
import {resetMentions} from './cardText';
import {LORE} from './lore';

export interface CardVariant {
    id: string;
    card: string;
    n: string;
    tx: string;
    flavor: string;
    a?: number;
    h?: number;
    kw?: Keyword[];
    /** Usa l'effetto (Quando entra, incantesimo...) di questa carta invece del proprio. */
    effectFrom?: string;
    en: { n: string; tx: string; flavor: string }
}

export const VARIANTS: Record<string, CardVariant> = {
    // Il diario dell'Esploratrice, capitolo 1: le tre strade di Elia
    'sentinella-faro': {
        id: 'sentinella-faro', card: 'marea-c3', a: 3,
        n: 'Sentinella del Faro', tx: 'Guardiano.', flavor: 'Ha visto passare Elia. Ora sorveglia la luce, non la porta.',
        en: {n: 'Lighthouse Sentinel', tx: 'Guardian.', flavor: 'It saw Elia pass. Now it guards the light, not the gate.'}
    },
    'fabbro-monte': {
        id: 'fabbro-monte', card: 'brace-c1', h: 3,
        n: 'Fabbro del Monte', tx: "Quando entra: un'altra tua unità ottiene +1 attacco.", flavor: "Elia gli ha portato una mappa del Monte. Da allora forgia seguendo le sue linee.",
        en: {n: 'Smith of the Mountain', tx: 'When it enters: another unit of yours gets +1 attack.', flavor: 'Elia brought him a map of the Mountain. Since then he forges along its lines.'}
    },
    'lupa-yggrin': {
        id: 'lupa-yggrin', card: 'radice-u3', h: 4, kw: ['Cresce', 'Radicato'],
        n: 'Lupa di Yggrin', tx: 'Cresce. Radicato.', flavor: 'Ha scelto di restare tra le radici che Elia ha disegnato. Non se ne andrà più.',
        en: {n: 'She-Wolf of Yggrin', tx: 'Growth. Rooted.', flavor: 'She chose to stay among the roots Elia drew. She will never leave again.'}
    },
};

type Snapshot = { def: Pick<CardDef, 'n' | 'tx' | 'a' | 'h' | 'kw'>; eff: unknown; en?: { n: string; tx: string }; flavor?: string; enFlavor?: string };
const originals = new Map<string, Snapshot>();

/** Applica le varianti attive ai dati di gioco (e ripristina quelle non più attive). Idempotente. */
export function applyVariants(active: readonly string[]) {
    const byCard = new Map(active.map(v => VARIANTS[v]).filter(Boolean).map(v => [v.card, v]));
    for (const [card, o] of originals) if (!byCard.has(card)) {
        Object.assign(BYID[card], o.def);
        (EFFECTS as Record<string, unknown>)[card] = o.eff;
        if (o.en) EN_CARDS[card] = o.en;
        if (LORE[card] && o.flavor != null) LORE[card].flavor = o.flavor;
        if (EN_LORE[card] && o.enFlavor != null) EN_LORE[card].flavor = o.enFlavor;
        originals.delete(card);
    }
    for (const [card, v] of byCard) {
        const c = BYID[card];
        if (!c) continue;
        if (!originals.has(card)) originals.set(card, {
            def: {n: c.n, tx: c.tx, a: c.a, h: c.h, kw: [...c.kw]}, eff: EFFECTS[card],
            en: EN_CARDS[card] && {...EN_CARDS[card]}, flavor: LORE[card]?.flavor, enFlavor: EN_LORE[card]?.flavor
        });
        const o = originals.get(card)!;
        Object.assign(c, {n: v.n, tx: v.tx, a: v.a ?? o.def.a, h: v.h ?? o.def.h, kw: v.kw ?? o.def.kw});
        (EFFECTS as Record<string, unknown>)[card] = v.effectFrom ? EFFECTS[v.effectFrom] : o.eff;
        EN_CARDS[card] = {n: v.en.n, tx: v.en.tx};
        if (LORE[card]) LORE[card].flavor = v.flavor;
        if (EN_LORE[card]) EN_LORE[card].flavor = v.en.flavor;
    }
    resetMentions();
}

/** Nome della carta prima del cambio (per la Prima edizione); undefined se la carta non è cambiata. */
export const originalName = (card: string, lang: 'it' | 'en') => {
    const o = originals.get(card);
    return o && (lang === 'en' ? o.en?.n ?? o.def.n : o.def.n);
};

/** Variante attiva di una carta, se la community l'ha cambiata. */
export const variantOf = (card: string, active: readonly string[]) => active.map(v => VARIANTS[v]).find(v => v?.card === card);
