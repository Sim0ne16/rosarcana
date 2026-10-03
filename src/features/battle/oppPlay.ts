// Giocata dell'avversario raccontata in tre tempi: rivelazione, mira, esito.
import {BYID, type Game, LANE_NAME, type PlayOpt} from '../../engine';
import {hasEffect} from '../collection/filters';
import {EN_LANE_NAME} from '../../i18n/en/mechanics';
import {cardName} from '../../i18n/names';
import type {Lang} from '../../i18n/lang';

/** Famiglia visiva dell'effetto: decide colore della freccia e animazione d'impatto. */
export type OppTone = 'fire' | 'void' | 'tide' | 'life' | 'gold';

export interface OppPlay {
    id: string;
    phase: 'reveal' | 'aim' | 'resolve';
    tone: OppTone;
    /** Selettore dell'elemento colpito o raggiunto (unità, Sigillo, corsia); assente per gli effetti su tutto il campo. */
    aim?: string;
    aimLabel: string;
    /** Righe del registro prodotte dalla giocata, già nella lingua dell'interfaccia. */
    lines?: string[];
}

export function oppTone(id: string): OppTone {
    const c = BYID[id];
    if (hasEffect(c, 'destroy')) return 'void';
    if (hasEffect(c, 'bounce') || hasEffect(c, 'move') || hasEffect(c, 'stun')) return 'tide';
    if (hasEffect(c, 'damage')) return 'fire';
    if (hasEffect(c, 'heal') || hasEffect(c, 'buff') || hasEffect(c, 'summon')) return 'life';
    return 'gold';
}

const laneName = (l: number, lang: Lang) => (lang === 'en' ? `${EN_LANE_NAME[l]} lane` : `corsia ${LANE_NAME[l]}`);

/** Dove punta la giocata e come dirlo in breve. */
export function oppAim(G: Game, id: string, o: PlayOpt, lang: Lang): { aim?: string; aimLabel: string } {
    const en = lang === 'en', c = BYID[id], t = o.target;
    if (t?.type === 'unit') {
        const u = G.p[t.p].board[t.lane].find(x => x.uid === t.uid);
        const who = u ? cardName(u.id, lang) : laneName(t.lane, lang);
        // effetti che spostano: si dice anche dove finirà
        return {aim: `[data-drop="unit:${t.uid}"]`, aimLabel: o.to != null ? `${who}, ${en ? 'to the' : 'verso la'} ${laneName(o.to, lang)}` : who};
    }
    if (t?.type === 'seal') return {
        aim: `[data-drop="seal:${t.p}-${t.lane}"]`,
        aimLabel: en ? `${t.p === 0 ? 'your' : 'its'} Seal, ${laneName(t.lane, lang)}` : `${t.p === 0 ? 'il tuo' : 'il suo'} Sigillo, ${laneName(t.lane, lang)}`
    };
    if (t?.type === 'lane') return {aim: `[data-tut="lane:${t.lane}"]`, aimLabel: laneName(t.lane, lang)};
    if (o.lane != null) return c.t === 'R'
        ? {aim: `[data-drop="seal:1-${o.lane}"]`, aimLabel: laneName(o.lane, lang)}
        : {aim: `[data-tut="lane:${o.lane}"]`, aimLabel: laneName(o.lane, lang)};
    return {aimLabel: en ? 'the whole board' : 'tutto il campo'};
}

/** Tempo per leggere la carta: cresce col testo, entro limiti ragionevoli. */
export const revealMs = (id: string) => {
    const c = BYID[id];
    return Math.min(4600, 1400 + c.tx.length * 30 + c.kw.length * 220);
};
