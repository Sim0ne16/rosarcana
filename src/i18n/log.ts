// Righe del registro di partita nella lingua dell'interfaccia. L'italiano è già nel testo della riga; per
// l'inglese si riapplica il modello della sua chiave con nomi di carte, giocatori e corsie localizzati.
import type {Game, LogLine} from '../engine';
import {formatLog, type LogFmt} from '../engine/log';
import {EN_LANE_NAME} from './en/mechanics';
import {EN_LOG} from './en/log';
import type {Lang} from './langState';
import {bellInfo, cardName} from './names';

/** Il giocatore si chiama "Tu" nel motore: in inglese diventa "You", con verbo e possessivo accordati. */
export const YOU = 'You';

const enFmt = (G: Game): LogFmt => {
    const me = (p: number) => p === 0;
    const card = (id: string) => cardName(id, 'en');
    return {
        who: p => (me(p) ? YOU : G.p[p].name),
        poss: p => (me(p) ? 'your' : `${G.p[p].name}'s`),
        s: p => (me(p) ? '' : 's'),
        has: p => (me(p) ? 'have' : 'has'),
        card,
        cards: ids => ids.map(card).join(', '),
        lane: l => EN_LANE_NAME[l],
        bell: (c, f) => bellInfo(c, f, 'en').name,
    };
};

/** Traduttore delle righe del registro di una partita (il formattatore si crea una volta sola). Le righe
 * senza chiave (vecchie partite, note) restano com'erano. */
export function logTexts(G: Game, lang: Lang): (line: LogLine) => string {
    if (lang === 'it') return line => line.txt;
    const f = enFmt(G);
    return line => (line.k && line.a ? formatLog(EN_LOG, f, line.k, line.a) : line.txt);
}

/** Nome di un giocatore come lo mostra l'interfaccia ("Tu" / "You" per il giocatore). */
export const playerName = (G: Game, p: number, lang: Lang) => (p === 0 && lang === 'en' ? YOU : G.p[p].name);
