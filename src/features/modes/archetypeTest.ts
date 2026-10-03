// Banco di prova degli archetipi: un mazzo modello per ogni stile di gioco, giocabile subito contro l'IA anche
// senza possedere le carte. Serve a provare gli archetipi, quindi niente ricompense.
import {ARCHETYPES, type Archetype} from '../../economy/decks';
import {EN_PRESETS} from '../../i18n/en/ui';
import {dataLang, tr} from '../../i18n/langState';
import {useBattle} from '../battle/store';

/** Nome dell'archetipo nella lingua dei dati. */
export const archetypeName = (a: Archetype) => (dataLang() === 'en' ? EN_PRESETS[a.id]?.name ?? a.name : a.name);

/** Avvia una partita di prova: `opId` assente o 'random' sceglie a caso un altro archetipo. */
export function startArchetypeTest(meId: string, opId?: string) {
    const me = ARCHETYPES.find(a => a.id === meId);
    if (!me) return;
    const others = ARCHETYPES.filter(a => a.id !== meId);
    const op = ARCHETYPES.find(a => a.id === opId) ?? others[Math.floor(Math.random() * others.length)];
    useBattle.getState().startCustom({
        label: tr(`Prova: ${archetypeName(me)}`, `Test: ${archetypeName(me)}`),
        me: {deck: [...me.cards], custode: me.custode ?? null},
        op: {name: archetypeName(op), deck: [...op.cards], noise: 1.5, custode: op.custode ?? null},
        timed: false,
        noRewards: true,
        onEnd: win => [win
            ? tr(`${archetypeName(me)} batte ${archetypeName(op)}. Prova: nessuna ricompensa.`, `${archetypeName(me)} beats ${archetypeName(op)}. Test match: no rewards.`)
            : tr(`${archetypeName(op)} batte ${archetypeName(me)}. Prova: nessuna ricompensa.`, `${archetypeName(op)} beats ${archetypeName(me)}. Test match: no rewards.`)]
    });
}
