import {dataLang} from '../i18n/langState';
import {EN_BACKS} from '../i18n/en/ui';

export const ODDS = {std: {l: 0.01, r: 0.05, u: 0.23, c: 0.71}, slot5: {l: 0.08, r: 0.92}};
export const FOIL_CHANCE = 0.05;
export const PITY_MAX = 10, FIRST_LEG_BY = 5;
export const PACK_ORO = 150, PACK_GEMME = 150;
/** Moltiplicatori d'acquisto: più bustine insieme costano meno ciascuna. */
export const PACK_QTY = [{n: 1, off: 0}, {n: 5, off: 0.05}, {n: 10, off: 0.1}];
export const packPrice = (unit: number, n: number) => Math.round((unit * n * (1 - (PACK_QTY.find(q => q.n === n)?.off ?? 0))) / 10) * 10;
export const PASS_GEMME = 500, XP_LVL = 300, PASS_LEVELS = 20;

export interface Reward {
    oro?: number;
    polvere?: number;
    gemme?: number;
    pack?: number;
    back?: string;
    gettoni?: number;
    legChoice?: boolean
}

/** Oro per partita classificata: vittoria, sconfitta, prima vittoria del giorno. */
export const WIN_ORO = 10, LOSS_ORO = 3, FIRST_WIN_ORO = 40;
/** Missioni del giorno. `fam` è la famiglia: ogni giorno se ne pescano tre di famiglie diverse, così non
 * capitano mai tre missioni dello stesso tipo. `ev` è l'evento che le fa avanzare (vedi `bump` nel profilo). */
export const QUEST_POOL = [
    // vittorie
    {id: 'win3', txt: 'Vinci 3 partite', goal: 3, ev: 'win', fam: 'win', oro: 50},
    {id: 'win5', txt: 'Vinci 5 partite', goal: 5, ev: 'win', fam: 'win', oro: 75},
    {id: 'winRanked2', txt: 'Vinci 2 partite in classificata', goal: 2, ev: 'winRanked', fam: 'win', oro: 55},
    {id: 'winBrace', txt: 'Vinci 2 partite con un mazzo di Brace', goal: 2, ev: 'win-brace', fam: 'win', oro: 50},
    {id: 'winMarea', txt: 'Vinci 2 partite con un mazzo di Marea', goal: 2, ev: 'win-marea', fam: 'win', oro: 50},
    {id: 'winRadice', txt: 'Vinci 2 partite con un mazzo di Radice', goal: 2, ev: 'win-radice', fam: 'win', oro: 50},
    {id: 'winVuoto', txt: 'Vinci 2 partite con un mazzo di Vuoto', goal: 2, ev: 'win-vuoto', fam: 'win', oro: 50},
    {id: 'flawless', txt: 'Vinci una partita senza perdere nessun Sigillo', goal: 1, ev: 'flawless', fam: 'win', oro: 60},
    // partite e carte giocate
    {id: 'play3', txt: 'Gioca 3 partite', goal: 3, ev: 'play', fam: 'play', oro: 20},
    {id: 'play5', txt: 'Gioca 5 partite', goal: 5, ev: 'play', fam: 'play', oro: 30},
    {id: 'units15', txt: 'Gioca 15 unità', goal: 15, ev: 'unit', fam: 'play', oro: 30},
    {id: 'spells6', txt: 'Lancia 6 incantesimi', goal: 6, ev: 'spell', fam: 'play', oro: 30},
    {id: 'relics3', txt: 'Metti in gioco 3 reliquie', goal: 3, ev: 'relic', fam: 'play', oro: 35},
    // combattimento
    {id: 'seals6', txt: 'Spezza 6 Sigilli nemici', goal: 6, ev: 'sealBreak', fam: 'fight', oro: 40},
    {id: 'sealDmg40', txt: 'Infliggi 40 danni ai Sigilli nemici con le tue unità', goal: 40, ev: 'sealDmg', fam: 'fight', oro: 40},
    {id: 'kills12', txt: 'Distruggi 12 unità nemiche in combattimento', goal: 12, ev: 'kill', fam: 'fight', oro: 40},
    // collezione
    {id: 'craft1', txt: 'Crea o disfa una carta', goal: 1, ev: 'craft', fam: 'collect', oro: 25},
    {id: 'open2', txt: 'Apri 2 bustine', goal: 2, ev: 'open', fam: 'collect', oro: 25},
] as const;
export type QuestEvent = (typeof QUEST_POOL)[number]['ev'];
export const BACKS: Record<string, string> = {
    cera: 'Cera rossa',
    brace: 'Brace dorata',
    abisso: 'Abisso',
    aurora: 'Aurora del Vuoto',
    rosone: 'Il Grande Rosone',
    codice: 'Codice Arcano',
    eclisse: 'Eclisse',
    radici: 'Trama di Radici',
    fornace: 'Cuore della Fornace',
    abissi: 'Occhio degli Abissi'
};
/** Dorsi illustrati: disponibili quando esiste l'immagine back-<id> e acquistabili in oro. */
export const IMAGE_BACKS = ['rosone', 'codice', 'eclisse', 'radici', 'fornace', 'abissi'];
export const BACK_PRICE = 400;
export const PASS_FREE: Reward[] = [{oro: 50}, {pack: 1}, {polvere: 100}, {oro: 75}, {pack: 1}, {gemme: 20}, {oro: 100}, {pack: 1}, {polvere: 150}, {pack: 2}, {oro: 100}, {gemme: 30}, {pack: 1}, {polvere: 200}, {oro: 150}, {pack: 2}, {gemme: 50}, {polvere: 250}, {pack: 2}, {legChoice: true}];
export const PASS_PREM: Reward[] = [{back: 'brace'}, {
    gettoni: 2,
    gemme: 25
}, {pack: 1}, {gemme: 25}, {gettoni: 2}, {gemme: 50}, {pack: 1}, {gemme: 25}, {back: 'abisso'}, {
    gemme: 50,
    gettoni: 2
}, {pack: 1}, {gemme: 50}, {gettoni: 3}, {gemme: 50}, {pack: 2}, {gemme: 50}, {
    gemme: 50,
    gettoni: 3
}, {pack: 2}, {gemme: 75}, {back: 'aurora', gemme: 75, gettoni: 5}];
export const RANKS = ['Bronzo', 'Argento', 'Oro', 'Platino', 'Diamante', 'Leggenda'];
export const OPP_NAMES = ['Varek il Bruciato', 'Sorella Salsedine', 'Ortensia dei Rovi', 'Il Velato', 'Maestra Brina', 'Corvo di Cenere', 'Lia delle Secche', 'Barone Muschio', 'Tessa Mezzanotte', 'Ugo Spaccasigilli'];

/** Nome del dorso nella lingua dell'interfaccia. */
export const backName = (id: string) => (dataLang() === 'en' ? EN_BACKS[id] : undefined) ?? BACKS[id];

export function rewardLabel(rw: Reward) {
    const en = dataLang() === 'en';
    const p: string[] = [];
    if (rw.oro) p.push(en ? `${rw.oro} gold` : `${rw.oro} oro`);
    if (rw.polvere) p.push(en ? `${rw.polvere} dust` : `${rw.polvere} polvere`);
    if (rw.gemme) p.push(en ? `${rw.gemme} gems` : `${rw.gemme} gemme`);
    if (rw.pack) p.push(en ? (rw.pack > 1 ? `${rw.pack} packs` : '1 pack') : rw.pack > 1 ? `${rw.pack} bustine` : '1 bustina');
    if (rw.gettoni) p.push(en ? (rw.gettoni > 1 ? `${rw.gettoni} style tokens` : '1 style token') : rw.gettoni > 1 ? `${rw.gettoni} gettoni stile` : '1 gettone stile');
    if (rw.back) p.push(en ? `${backName(rw.back)} card back` : `Dorso ${BACKS[rw.back]}`);
    if (rw.legChoice) p.push(en ? 'Legendary of your choice' : 'Leggendaria a scelta');
    return p.join(en ? ' and ' : ' e ');
}
