// Nomi localizzati delle entità di gioco: unica fonte per carte, fazioni, Custodi, presagi, Ultimi Rintocchi,
// gradi di maestria e personalizzazioni. L'italiano canonico sta nei moduli del motore e delle carte; l'inglese
// ricade sull'italiano se una traduzione manca.
import {BELLS, cardInfo, NIGHT_TEXT, type NightId, type CardType, type CustodeId, CUSTODI, type Faction, FACTIONS, type OmenId, OMENS, RARITY, type Rarity, TYPES} from '../engine';
import {ART_STYLES, type ArtStyle, type EffectId, FRAMES, type FrameId, FX, MASTERY_NAMES} from '../cards/styles';
import {EN_CARDS} from './en/cards';
import {EN_BELLS, EN_CUSTODI, EN_FACTION_NAMES, EN_OMENS, EN_RARITY_NAMES, EN_TYPES} from './en/mechanics';
import {EN_ART_STYLES, EN_FRAMES, EN_FX, EN_MASTERY_NAMES, EN_NIGHT} from './en/ui';
import type {Lang} from './langState';

const en = (lang: Lang) => lang === 'en';

export const cardName = (id: string, lang: Lang) => (en(lang) ? EN_CARDS[id]?.n : undefined) ?? cardInfo(id)?.n ?? id;
export const factionName = (f: Faction, lang: Lang) => (en(lang) ? EN_FACTION_NAMES[f] : FACTIONS[f].name);
export const custodeName = (id: CustodeId, lang: Lang) => (en(lang) ? EN_CUSTODI[id].name : CUSTODI[id].name);
export const rarityName = (r: Rarity, lang: Lang) => (en(lang) ? EN_RARITY_NAMES[r] : RARITY[r].name);
export const typeName = (t: CardType, lang: Lang) => (en(lang) ? EN_TYPES[t] : TYPES[t]);
export const omenName = (id: OmenId, lang: Lang) => (en(lang) ? EN_OMENS[id].name : OMENS[id].name);
/** Nome del grado di maestria `i` (0 = Apprendista). */
export const masteryName = (i: number, lang: Lang) => (en(lang) ? EN_MASTERY_NAMES : MASTERY_NAMES)[i];

/** Ultimo Rintocco di un giocatore: quello del suo Custode se ne ha uno, altrimenti quello della fazione. */
export function bellInfo(custode: CustodeId | null | undefined, f: Faction, lang: Lang): { name: string; text: string } {
    if (custode) {
        const c = en(lang) ? EN_CUSTODI[custode] : CUSTODI[custode];
        return {name: c.bellName, text: c.bell};
    }
    return en(lang) ? EN_BELLS[f] : BELLS[f];
}

export const frameName = (f: FrameId, lang: Lang) => (en(lang) ? EN_FRAMES[f]?.name : undefined) ?? FRAMES[f].name;
export const styleName = (s: ArtStyle, lang: Lang) => (en(lang) ? EN_ART_STYLES[s]?.name : undefined) ?? ART_STYLES[s].name;
export const fxName = (fx: EffectId, lang: Lang) => (en(lang) ? EN_FX[fx]?.name : undefined) ?? FX[fx].name;

/** Colpo della Notte (Notte Incatenata): nome e descrizione. */
export const nightText = (id: NightId, lang: Lang) => (en(lang) ? EN_NIGHT : NIGHT_TEXT)[id];
