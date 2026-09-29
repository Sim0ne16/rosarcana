import {aiDeck, CARDS, custodiOf, type Faction, mainFaction} from '../../engine';
import type {Deck} from '../../economy/decks';
import {WEEKLY_WINS, type WeeklyChallenge} from '../../economy/weekly';
import {useProfile} from '../../profile/store';
import {useBattle} from '../battle/store';
import {shuffled} from './pool';

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
            name: 'Sfidante della settimana',
            deck: opDeck,
            noise: 3,
            seal: R.opSeal,
            custode: R.custodi?.[1] ?? oc[Math.floor(Math.random() * oc.length)].id
        },
        onEnd: win => {
            if (!win) return [`${ch.title}: sconfitta, riprova`];
            useProfile.getState().weeklyWin(ch.id);
            const n = useProfile.getState().weekly.wins[ch.id] ?? 0;
            return [`${ch.title}: vittoria ${Math.min(n, WEEKLY_WINS)} di ${WEEKLY_WINS}${n >= WEEKLY_WINS ? ', ricompensa pronta da riscuotere' : ''}`];
        },
    });
}
