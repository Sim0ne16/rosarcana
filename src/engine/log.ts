// Messaggi del registro di partita: ogni riga è una chiave con i suoi argomenti (giocatore, carte, corsie,
// numeri), non solo testo. Il motore genera il testo italiano canonico; l'interfaccia può riformattare la
// stessa riga in un'altra lingua (i18n/en/log.ts) con i nomi delle carte localizzati.
import type {CustodeId} from './mechanics';
import {type NightId, NIGHT_TEXT} from './night';
import type {Faction} from './types';

/** Formattatore dei riferimenti: nomi di giocatori, carte e corsie, e accordo del verbo col soggetto. */
export interface LogFmt {
    /** Soggetto: il nome del giocatore (in inglese "You" per il giocatore). */
    who: (p: number) => string;
    /** Possessivo a inizio frase o nel mezzo ("your" / "Nyxa's"). */
    poss: (p: number) => string;
    /** Desinenza del verbo alla terza persona ("s" per l'avversario, "" per "you"). */
    s: (p: number) => string;
    /** "have" / "has". */
    has: (p: number) => string;
    card: (id: string) => string;
    cards: (ids: readonly string[]) => string;
    lane: (l: number) => string;
    /** Nome dell'Ultimo Rintocco: del Custode se c'è, altrimenti della fazione. */
    bell: (custode: CustodeId | null, f: Faction) => string;
}

type Tpl = (f: LogFmt, ...a: never[]) => string;

export const IT_LOG = {
    krakenWakes: () => 'Il Kraken si risveglia: le unità nemiche saltano il prossimo attacco',
    search: (f: LogFmt, p: number, id: string) => `${f.who(p)} cerca nel mazzo: ${f.card(id)}`,
    necroRaises: (f: LogFmt, id: string) => `Il Negromante rialza ${f.card(id)}`,
    helRecalls: (f: LogFmt, id: string) => `Hel richiama ${f.card(id)}`,
    charmed: (f: LogFmt, id: string) => `${f.card(id)} è ammaliata e salterà il prossimo attacco`,
    maxCrystal: (f: LogFmt, p: number) => `${f.who(p)} ottiene un Cristallo massimo in più`,
    eyeReveals: (f: LogFmt, eye: string, ids: readonly string[]) => `${f.card(eye)} rivela: ${f.cards(ids)}`,
    eyeEmpty: (f: LogFmt, eye: string) => `${f.card(eye)}: la mano avversaria è vuota`,
    backFromGrave: (f: LogFmt, id: string) => `${f.card(id)} torna in mano dal cimitero`,
    nyxaRaises: (f: LogFmt, id: string) => `Nyxa evoca ${f.card(id)} dal cimitero`,
    payHealth: (f: LogFmt, p: number, id: string, n: number, l: number) => `${f.who(p)} paga ${f.card(id)} con ${n} punti vita del Sigillo ${f.lane(l)}`,
    play: (f: LogFmt, p: number, id: string) => `${f.who(p)} gioca ${f.card(id)}`,
    move: (f: LogFmt, p: number, id: string, l: number) => `${f.who(p)} sposta ${f.card(id)} nella corsia ${f.lane(l)}`,
    turn: (f: LogFmt, n: number, p: number) => `Turno ${n}: tocca a ${f.who(p)}`,
    firstFire: () => 'Il Primo Fuoco brucia i Sigilli nemici',
    pactConsumes: (f: LogFmt, id: string) => `Il Grande Patto consuma ${f.card(id)}`,
    miasma: (f: LogFmt, p: number, l: number) => `Il Miasma ferisce le unità di ${f.who(p)} nella corsia ${f.lane(l)}`,
    moonGrows: (f: LogFmt, id: string) => `La Luna crescente rafforza ${f.card(id)}`,
    wellWhispers: (f: LogFmt, p: number) => `Pozzo dei sussurri: ${f.who(p)} pesca una carta`,
    arenaKill: (f: LogFmt, id: string) => `Arena di sangue: ${f.card(id)} ottiene +1 attacco`,
    lighthouse: (f: LogFmt, relic: string, p: number) => `${f.card(relic)}: ${f.who(p)} mette in fondo una carta`,
    tenCrystals: (f: LogFmt, p: number) => `${f.who(p)} ha 10 Cristalli: pesca una carta in più`,
    pickCrystal: (f: LogFmt, p: number, n: number) => `${f.who(p)} sceglie un Cristallo (ora ${n})`,
    pickDraw: (f: LogFmt, p: number) => `${f.who(p)} sceglie di pescare una carta`,
    stunned: (f: LogFmt, id: string) => `${f.card(id)} è stordito e salta l'attacco`,
    flank: (f: LogFmt, id: string, l: number, n: number) => `${f.card(id)} aggira i difensori e colpisce il Sigillo ${f.lane(l)} per ${n}`,
    clash: (f: LogFmt, id: string, atk: number, other: string, oAtk: number) => `${f.card(id)} (${atk}) si scontra con ${f.card(other)} (${oAtk})`,
    hitSeal: (f: LogFmt, id: string, l: number, n: number) => `${f.card(id)} colpisce il Sigillo ${f.lane(l)} per ${n}`,
    mulligan: (f: LogFmt, p: number, n: number) => `${f.who(p)} sostituisce ${n} ${n === 1 ? 'carta' : 'carte'}`,
    fatigue: (f: LogFmt, p: number) => `${f.who(p)} non ha più carte: 2 danni a un proprio Sigillo`,
    handFull: (f: LogFmt, p: number, id: string) => `${f.who(p)} ha la mano piena: ${f.card(id)} va nel cimitero`,
    sealBroken: (f: LogFmt, p: number, l: number) => `Il Sigillo ${f.lane(l)} di ${f.who(p)} è spezzato!`,
    wins: (f: LogFmt, p: number) => `${f.who(p)} vince la partita`,
    bounce: (f: LogFmt, id: string, p: number) => `${f.card(id)} torna in mano a ${f.who(p)}`,
    sacrifice: (f: LogFmt, p: number, id: string) => `${f.who(p)} sacrifica ${f.card(id)}`,
    pushed: (f: LogFmt, id: string, l: number) => `${f.card(id)} viene spinto nella corsia ${f.lane(l)}`,
    ferryman: () => 'Il Traghettatore riscuote: 1 danno al Sigillo nemico',
    dies: (f: LogFmt, id: string, p: number) => `${f.card(id)} di ${f.who(p)} muore`,
    echo: (f: LogFmt, id: string, p: number) => `Eco: ${f.card(id)} torna in mano a ${f.who(p)}`,
    lastToll: (f: LogFmt, p: number, custode: CustodeId | null, fac: Faction) => `Ultimo Rintocco di ${f.who(p)}: ${f.bell(custode, fac)}`,
    ascends: (f: LogFmt, id: string) => `${f.card(id)} ascende!`,
    tollAnswer: (f: LogFmt, id: string) => `Rintocco: ${f.card(id)} risponde`,
    nightFalls: (_f: LogFmt, id: NightId) => `La Notte avanza: ${NIGHT_TEXT[id].name}`,
} satisfies Record<string, Tpl>;

export type LogKey = keyof typeof IT_LOG;
/** Argomenti di una chiave, nell'ordine del suo modello (senza il formattatore). */
export type LogArgs<K extends LogKey> = (typeof IT_LOG)[K] extends (f: LogFmt, ...a: infer A) => string ? A : [];
/** Tabella di modelli in un'altra lingua: stesse chiavi e stessi argomenti dell'italiano. */
export type LogTable = { [K in LogKey]: (f: LogFmt, ...a: LogArgs<K>) => string };

/** Applica un modello ai suoi argomenti (salvati nella riga come array generico). */
export const formatLog = (table: LogTable, f: LogFmt, k: LogKey, a: readonly unknown[]) =>
    (table[k] as (f: LogFmt, ...a: readonly unknown[]) => string)(f, ...a);
