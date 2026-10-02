// Notte Incatenata: modalità a parte (non cambia Classificata e Casual) in cui Nyxa è un terzo giocatore.
import {aiDeck, custodiOf, type Faction, mainFaction} from '../../engine';
import {OPP_NAMES} from '../../economy/constants';
import type {Deck} from '../../economy/decks';
import {tr} from '../../i18n/langState';
import {W} from '../../i18n/words';
import {useProfile} from '../../profile/store';
import {useBattle} from '../battle/store';
import {shuffled} from './pool';

/** Partite da giocare prima che la modalità si sblocchi, e oro per vittoria o sconfitta. */
export const NIGHT_MIN_GAMES = 3, NIGHT_WIN_ORO = 20, NIGHT_LOSS_ORO = 5;

/** Avvia una partita di Notte Incatenata con il mazzo attivo contro un avversario IA. */
export function startNight(deck: Deck) {
    const facs = shuffled(['brace', 'marea', 'radice', 'vuoto'] as Faction[]).slice(0, 2), opDeck = aiDeck(facs, 1);
    const oc = custodiOf(mainFaction(opDeck));
    useBattle.getState().startCustom({
        label: tr(W.chainedNight),
        night: true,
        me: {deck: deck.cards, custode: deck.custode ?? null},
        op: {name: shuffled(OPP_NAMES)[0], deck: opDeck, noise: 3, custode: oc[Math.floor(Math.random() * oc.length)].id},
        onEnd: win => {
            const oro = win ? NIGHT_WIN_ORO : NIGHT_LOSS_ORO;
            return [tr('Notte Incatenata: ', 'Chained Night: ') + useProfile.getState().grant({oro}, tr(W.chainedNight))];
        }
    });
}
