// Presentazione del testo delle carte: parole chiave separate, inneschi evidenziati, icone di fazione e tipo.
import {CARDS, TOKENS} from '../engine/cards';
import type {CardType, Faction, Keyword} from '../engine/types';
import {EN_CARDS} from '../i18n/en/cards';
import {EN_KEYWORD_WORD} from '../i18n/en/mechanics';
import type {Lang} from '../i18n/lang';
import {ICONS} from './art/icons.generated';

// Slancio non ha un'icona propria fra quelle estratte: usa quella dell'Anguilla Guizzante, che scatta di corsia in corsia.
ICONS['kw-Slancio'] ??= ICONS['marea-c2'];
// Sfondare usa l'icona dell'Ariete Rovente, il primo sfondatore.
ICONS['kw-Sfondare'] ??= ICONS['brace-u0'];

export interface CardMention {
    n: string;
    id: string
}

let mentionable: CardMention[] | null = null, mentionableEn: CardMention[] | null = null;
/** Da chiamare quando cambiano i nomi delle carte (carte vive): l'elenco si ricalcola al prossimo uso. */
export const resetMentions = () => {
    mentionable = mentionableEn = null;
};
/** Ogni nome di carta (comprese le pedine), dal più lungo al più corto: così "Il Primo Fuoco" viene riconosciuto
 * prima che un suo pezzo possa combaciare con un altro nome più corto. */
const mentionableCards = (lang: Lang) => lang === 'en'
    ? (mentionableEn ??= [...CARDS, ...Object.values(TOKENS)]
        .map(c => ({n: EN_CARDS[c.id]?.n ?? c.n, id: c.id})).sort((a, b) => b.n.length - a.n.length))
    : (mentionable ??= [...CARDS, ...Object.values(TOKENS)]
        .map(c => ({n: c.n, id: c.id})).sort((a, b) => b.n.length - a.n.length));

/** Spezza un testo libero (registro, sincronie...) riconoscendo i nomi di carte citati, così chi lo mostra
 * può renderli cliccabili/passabili col mouse per aprire il dettaglio di quella carta. */
export function splitCardMentions(text: string, lang: Lang = 'it'): (string | CardMention)[] {
    let parts: (string | CardMention)[] = [text];
    for (const c of mentionableCards(lang)) {
        const next: (string | CardMention)[] = [];
        for (const part of parts) {
            if (typeof part !== 'string') {
                next.push(part);
                continue;
            }
            let rest = part, idx: number;
            while ((idx = rest.indexOf(c.n)) >= 0) {
                if (idx > 0) next.push(rest.slice(0, idx));
                next.push(c);
                rest = rest.slice(idx + c.n.length);
            }
            if (rest) next.push(rest);
        }
        parts = next;
    }
    return parts;
}

export const KW_SHORT: Record<Keyword, string> = {
    Rapido: 'attacca nel turno in cui entra',
    Guardiano: 'va attaccato per primo',
    Scossa: '+1 danno a un Sigillo accanto',
    Radicato: 'non può cambiare corsia',
    Eco: 'se muore torna in mano, costa +1',
    Assedio: 'danni doppi ai Sigilli',
    Cresce: '+1/+1 a ogni tuo turno',
    Aggirare: 'colpisce un Sigillo vicino scoperto',
    Veleno: 'distrugge ciò che ferisce',
    'Linfa vitale': 'i suoi danni curano il Sigillo',
    Offerta: 'si paga con i punti vita dei Sigilli',
    Auspicio: 'Ignora i presagi',
    Slancio: 'attacca anche dopo essersi spostata',
    Sfondare: 'ignora i Guardiani',
};
export const TYPE_NOTE: Record<CardType, string> = {
    U: '', I: 'Effetto immediato, poi va nel cimitero.', R: 'Si posa su un tuo Sigillo e agisce finché resiste.',
};
const KW_RE_IT = /\b(Rapido|Guardiano|Scossa|Radicato|Eco|Assedio|Cresce|Aggirare|Veleno|Linfa vitale|Offerta|Auspicio|Slancio|Sfondare)\b/g;
const LEAD_KW_IT = /^((Rapido|Guardiano|Scossa|Radicato|Eco|Assedio|Cresce|Aggirare|Veleno|Linfa vitale|Offerta \d|Auspicio|Slancio|Sfondare)\.\s*)+/;
const TRIGGER_IT = /(Rintocco:|Ingresso:|Lascito:|Martirio:|Mattutino:|Vespro:|Requiem:|Immolazione:|Presidio:|Aura:)/;

// Stesso riconoscimento, in inglese: la lista delle parole chiave è generata da EN_KEYWORD_WORD così le due
// lingue restano sempre in sincronia (un solo posto dove aggiornare i nomi tradotti).
const EN_KW_LIST = Object.values(EN_KEYWORD_WORD).join('|');
const KW_RE_EN = new RegExp(`\\b(${EN_KW_LIST})\\b`, 'g');
const LEAD_KW_EN = new RegExp(`^((${EN_KW_LIST}) ?\\d?\\.\\s*)+`);
const TRIGGER_EN = /(Toll:|Entrance:|Legacy:|Martyrdom:|Matins:|Vespers:|Requiem:|Immolation:|Bastion:|Aura:)/;

/** Parole chiave della carta e testo restante (senza l'elenco iniziale di parole chiave). */
export function splitText(tx: string, kw: Keyword[], lang: Lang = 'it') {
    return {kws: kw, rest: tx.replace(lang === 'en' ? LEAD_KW_EN : LEAD_KW_IT, '').trim()};
}

/** Spiegazione di ogni innesco ("Rintocco:", "Quando entra:"...), mostrata al passaggio del mouse come per le parole chiave. */
const TRIGGER_TIP: Record<string, [string, string]> = {
    "Rintocco": ["Si attiva quando uno dei tuoi Sigilli si spezza, se questa unità è in gioco.", "Triggers when one of your Seals breaks, if this unit is in play."],
    "Ingresso": ["Si attiva quando la giochi e l'unità entra in campo.", "Triggers when you play it and the unit enters the board."],
    "Lascito": ["Si attiva quando questa unità muore, in qualunque modo.", "Triggers when this unit dies, in any way."],
    "Martirio": ["Si attiva solo se l'unità muore durante uno scontro.", "Triggers only if the unit dies during a clash."],
    "Mattutino": ["Si attiva all'inizio di ogni tuo turno. Su una reliquia, solo finché il suo Sigillo è intatto.", "Triggers at the start of each of your turns. On a relic, only while its Seal is intact."],
    "Vespro": ["Si attiva alla fine di ogni tuo turno, prima degli attacchi.", "Triggers at the end of each of your turns, before attacks."],
    "Requiem": ["Si attiva ogni volta che muore un'altra unità sul campo, tua o nemica.", "Triggers every time another unit on the board dies, yours or the enemy's."],
    "Immolazione": ["Si attiva ogni volta che sacrifichi una tua unità, finché il Sigillo della reliquia è intatto.", "Triggers every time you sacrifice one of your units, while the relic's Seal is intact."],
    "Presidio": ["Effetto continuo della reliquia: vale finché il suo Sigillo è intatto.", "Ongoing effect of the relic: it lasts while its Seal is intact."],
    "Aura": ["Effetto continuo: vale finché l'unità resta sul campo.", "Ongoing effect: it lasts while the unit stays on the board."],
};
/** Gli inneschi inglesi puntano alla stessa spiegazione, nello stesso ordine delle due espressioni regolari. */
const TRIGGER_KEYS = TRIGGER_IT.source.slice(1, -1).split('|').map(x => x.replace(/[:,]$/, ''));
const TRIGGER_EN_KEYS = TRIGGER_EN.source.slice(1, -1).split('|').map(x => x.replace(/[:,]$/, ''));

function triggerTip(part: string, lang: Lang) {
    const raw = part.replace(/[:,]$/, '');
    const i = (lang === 'en' ? TRIGGER_EN_KEYS : TRIGGER_KEYS).indexOf(raw);
    const tip = TRIGGER_TIP[TRIGGER_KEYS[i] ?? raw];
    return tip ? tip[lang === 'en' ? 1 : 0] : undefined;
}

export function RichText({text, lang = 'it'}: { text: string; lang?: Lang }) {
    const TRIGGER = lang === 'en' ? TRIGGER_EN : TRIGGER_IT, KW_RE = lang === 'en' ? KW_RE_EN : KW_RE_IT;
    return <>{text.split(TRIGGER).map((part, i) => i % 2
        ? <em key={i} className="trigger" data-tip={triggerTip(part, lang)} data-tip-title={part.replace(/[:,]$/, '')}>{part}</em>
        : part.split(KW_RE).map((p, j) => (j % 2 ? <b key={i + '-' + j}>{p}</b> : p)))}</>;
}

export function Icon({k, className, title}: { k: string; className?: string; title?: string }) {
    const d = ICONS[k];
    if (!d) return null;
    return <svg viewBox="0 0 512 512" className={className} aria-hidden={title ? undefined : true}
                role={title ? 'img' : undefined}>{title && <title>{title}</title>}
        <path d={d} fill="currentColor"/>
    </svg>;
}

export const facIcon = (f: Faction) => `fac-${f}`;
export const typeIcon = (t: CardType) => `type-${t}`;
export const kwIcon = (k: Keyword) => `kw-${k}`;
