import type {CardDef, Keyword} from '../../engine';
import {EN_CARDS} from '../../i18n/en/cards';
import {EN_KEYWORD_WORD} from '../../i18n/en/mechanics';

/** Famiglie di effetto riconosciute dal testo canonico (italiano) della carta: valgono in qualsiasi lingua. */
export const EFFECT_TAGS = {
    enter: {it: 'Ingresso', en: 'Entrance', re: /Ingresso:/},
    death: {it: 'Lascito e Martirio', en: 'Legacy and Martyrdom', re: /Lascito:|Martirio:/},
    toll: {it: 'Rintocco', en: 'Toll', re: /Rintocco:/},
    turn: {it: 'Mattutino e Vespro', en: 'Matins and Vespers', re: /Mattutino:|Vespro:/},
    aura: {it: 'Aura e Presidio', en: 'Aura and Bastion', re: /Aura:|Presidio:|finché/i},
    requiem: {it: 'Requiem', en: 'Requiem', re: /Requiem:/},
    draw: {it: 'Pesca', en: 'Draw', re: /pesc/i},
    damage: {it: 'Danni', en: 'Damage', re: /dann[oi]/i},
    heal: {it: 'Cura', en: 'Heal', re: /ripristin|\bcur[ao]/i},
    buff: {it: 'Potenzia', en: 'Buff', re: /\+\d+ (attacco|vita)|\+\d+\/\+\d+/i},
    destroy: {it: 'Distrugge', en: 'Destroy', re: /distrugg/i},
    summon: {it: 'Evoca', en: 'Summon', re: /evoc/i},
    sacrifice: {it: 'Sacrificio', en: 'Sacrifice', re: /sacrific|Offerta|Immolazione/i},
    grave: {it: 'Cimitero', en: 'Graveyard', re: /cimitero|rimette in gioco/i},
    move: {it: 'Sposta', en: 'Move', re: /spost/i},
    bounce: {it: 'Rimanda in mano', en: 'Bounce', re: /in mano (al proprietario|all'avversario)/i},
    stun: {it: 'Stordisce', en: 'Stun', re: /salta(no)? il (suo|loro) prossimo attacco/i},
    tutor: {it: 'Cerca nel mazzo', en: 'Tutor', re: /cerca nel tuo mazzo/i},
    cost: {it: 'Modifica costi', en: 'Cost change', re: /cost(a|ano) 1 in (meno|più)/i},
    seal: {it: 'Sigilli', en: 'Seals', re: /Sigill/},
    crystal: {it: 'Cristalli', en: 'Crystals', re: /Cristall/i},
} as const;
export type EffectTag = keyof typeof EFFECT_TAGS;

export const hasEffect = (c: CardDef, e: EffectTag) => EFFECT_TAGS[e].re.test(c.tx);

/** Costi raggruppati: l'ultimo raccoglie tutto da 7 in su. */
export const COSTS = [0, 1, 2, 3, 4, 5, 6, 7] as const;
export const costMatch = (c: CardDef, n: number) => (n === 7 ? c.c >= 7 : c.c === n);

/** Testo su cui cercare: nome e testo in entrambe le lingue più le parole chiave, senza accenti né maiuscole. */
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const hay = new Map<string, string>();
export function matchesQuery(c: CardDef, q: string) {
    if (!q.trim()) return true;
    let h = hay.get(c.id + c.tx);
    if (h == null) {
        const en = EN_CARDS[c.id];
        h = norm([c.n, c.tx, en?.n, en?.tx, ...c.kw, ...c.kw.map((k: Keyword) => EN_KEYWORD_WORD[k])].filter(Boolean).join(' '));
        hay.set(c.id + c.tx, h);
    }
    // Ogni parola deve comparire, in qualsiasi ordine.
    return norm(q).split(/\s+/).filter(Boolean).every(w => h.includes(w));
}
