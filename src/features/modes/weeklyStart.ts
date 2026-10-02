import {aiDeck, CARDS, custodiOf, type Faction, mainFaction} from '../../engine';
import type {Deck} from '../../economy/decks';
import {WEEKLY_WINS, type WeeklyChallenge} from '../../economy/weekly';
import {useProfile} from '../../profile/store';
import {useBattle} from '../battle/store';
import {shuffled} from './pool';
import {dataLang, tr} from '../../i18n/langState';
import {EN_WEEKLY} from '../../i18n/en/ui';

const commonsOf = (facs: string[]) => CARDS.filter(c => facs.includes(c.f) && c.r === 'c').flatMap(c => [c.id, c.id]);

/** Avvia una sfida della settimana con il mazzo attivo e le regole speciali. */
export function startWeekly(ch: WeeklyChallenge, deck: Deck) {
    const facs = shuffled(['brace', 'marea', 'radice', 'vuoto'] as Faction[]).slice(0, 2), R = ch.rules;
    const myFacs = deck.fac.length ? deck.fac : [...new Set(deck.cards.map(id => CARDS.find(c => c.id === id)!.f))];
    const opDeck = R.commonsOnly ? commonsOf(facs) : aiDeck(facs, 1), oc = custodiOf(mainFaction(opDeck));
    useBattle.getState().startCustom({
        label: ch.title, startC: R.startC, omens: R.omens,
        me: {
            deck: R.commonsOnly ? commonsOf(myFacs) : deck.cards,
            custode: R.custodi?.[0] ?? deck.custode ?? null,
            seal: R.mySeal
        },
        op: {
            name: tr('Sfidante della settimana', 'Challenger of the week'),
            deck: opDeck,
            noise: 3,
            seal: R.opSeal,
            custode: R.custodi?.[1] ?? oc[Math.floor(Math.random() * oc.length)].id
        },
        onEnd: win => {
            const title = (dataLang() === 'en' ? EN_WEEKLY[ch.id]?.title : undefined) ?? ch.title;
            if (!win) return [tr(`${title}: sconfitta, riprova`, `${title}: defeat, try again`)];
            useProfile.getState().weeklyWin(ch.id);
            const n = useProfile.getState().weekly.wins[ch.id] ?? 0;
            return [tr(`${title}: vittoria ${Math.min(n, WEEKLY_WINS)} di ${WEEKLY_WINS}${n >= WEEKLY_WINS ? ', ricompensa pronta da riscuotere' : ''}`,
                `${title}: win ${Math.min(n, WEEKLY_WINS)} of ${WEEKLY_WINS}${n >= WEEKLY_WINS ? ', reward ready to claim' : ''}`)];
        },
    });
}
