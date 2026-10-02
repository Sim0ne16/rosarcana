// Lingua dell'interfaccia. L'italiano resta la lingua "canonica" dei dati di gioco (id, testo delle
// regole interno al motore, corrispondenza delle parole chiave via regex): l'inglese è uno strato di
// visualizzazione applicato sopra, mai usato per la logica di gioco.
import {useMemo} from 'react';
import {useProfile} from '../profile/store';
import {type Lang, setDataLang, type Translate, translator} from './langState';

export {type Lang, tLang, tr, type Translate, translator} from './langState';

export const useLang = (): Lang => useProfile(p => p.settings?.lang ?? 'it');

/** Lingua corrente fuori da un componente React (azioni dello store, messaggi del registro, toast...). */
export const currentLang = (): Lang => useProfile.getState().settings?.lang ?? 'it';

// I moduli senza React leggono la lingua da langState (senza importare lo store): la teniamo allineata qui.
setDataLang(currentLang());
useProfile.subscribe(p => setDataLang(p.settings?.lang ?? 'it'));

/** Traduttore per i componenti React: si aggiorna quando cambia la lingua. */
export function useT(): Translate {
    const lang = useLang();
    return useMemo(() => translator(lang), [lang]);
}
