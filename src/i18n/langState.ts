// Lingua corrente e traduttore per i moduli senza React (store, economia, mazzi, prove...). Non importa lo
// store del profilo di proposito: lo store importa questi moduli, quindi leggerlo da qui creerebbe un ciclo di
// import. lang.ts tiene la lingua allineata alle impostazioni del profilo.
import type {Pair} from './words';

export type Lang = 'it' | 'en';

let cur: Lang = 'it';

export const dataLang = (): Lang => cur;
export const setDataLang = (l: Lang) => {
    cur = l;
};

export const tLang = (lang: Lang, it: string, en: string) => (lang === 'en' ? en : it);

/** Traduttore: `t(W.chiave)` per le parole ricorrenti (words.ts), `t('Testo', 'Text')` per le frasi usate
 * una volta sola, affiancate al punto d'uso. */
export type Translate = { (pair: Pair): string; (it: string, en: string): string };

export const translator = (lang: Lang): Translate =>
    ((a: string | Pair, b?: string) => (typeof a === 'string' ? tLang(lang, a, b ?? a) : tLang(lang, a[0], a[1]))) as Translate;

/** Traduttore nella lingua del momento, per messaggi creati fuori dai componenti (toast, registro, esiti). */
export const tr: Translate = ((a: string | Pair, b?: string) => translator(cur)(a as never, b as never)) as Translate;
