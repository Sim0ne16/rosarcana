// Registro di partita in inglese: stessi messaggi (e argomenti) di engine/log.ts.
import type {LogFmt, LogTable} from '../../engine/log';
import {EN_NIGHT} from './ui';

/** Prima lettera maiuscola, per i possessivi a inizio frase ("Your ...", "Nyxa's ..."). */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const verb = (f: LogFmt, p: number, base: string) => `${f.who(p)} ${base}${f.s(p)}`;

export const EN_LOG: LogTable = {
    krakenWakes: () => 'The Kraken awakens: enemy units skip their next attack',
    search: (f, p, id) => `${verb(f, p, 'search')} the deck: ${f.card(id)}`,
    necroRaises: (f, id) => `The Necromancer raises ${f.card(id)}`,
    helRecalls: (f, id) => `Hel calls back ${f.card(id)}`,
    charmed: (f, id) => `${f.card(id)} is charmed and will skip its next attack`,
    maxCrystal: (f, p) => `${verb(f, p, 'gain')} an extra maximum Crystal`,
    eyeReveals: (f, eye, ids) => `${f.card(eye)} reveals: ${f.cards(ids)}`,
    eyeEmpty: (f, eye) => `${f.card(eye)}: the enemy hand is empty`,
    backFromGrave: (f, id) => `${f.card(id)} returns to hand from the graveyard`,
    nyxaRaises: (f, id) => `Nyxa summons ${f.card(id)} from the graveyard`,
    payHealth: (f, p, id, n, l) => `${verb(f, p, 'pay')} for ${f.card(id)} with ${n} health from the ${f.lane(l)} Seal`,
    play: (f, p, id) => `${verb(f, p, 'play')} ${f.card(id)}`,
    move: (f, p, id, l) => `${verb(f, p, 'move')} ${f.card(id)} to the ${f.lane(l)} lane`,
    turn: (f, n, p) => `Turn ${n}: ${f.poss(p)} turn`,
    firstFire: () => 'The First Fire burns the enemy Seals',
    pactConsumes: (f, id) => `The Great Pact consumes ${f.card(id)}`,
    miasma: (f, p, l) => `The Miasma wounds ${f.poss(p)} units in the ${f.lane(l)} lane`,
    moonGrows: (f, id) => `The Waxing Moon strengthens ${f.card(id)}`,
    wellWhispers: (f, p) => `Well of Whispers: ${verb(f, p, 'draw')} a card`,
    arenaKill: (f, id) => `Blood Arena: ${f.card(id)} gets +1 attack`,
    lighthouse: (f, relic, p) => `${f.card(relic)}: ${verb(f, p, 'put')} a card at the bottom`,
    tenCrystals: (f, p) => `${f.who(p)} ${f.has(p)} 10 Crystals: an extra card is drawn`,
    pickCrystal: (f, p, n) => `${verb(f, p, 'choose')} a Crystal (now ${n})`,
    pickDraw: (f, p) => `${verb(f, p, 'choose')} to draw a card`,
    stunned: (f, id) => `${f.card(id)} is stunned and skips its attack`,
    flank: (f, id, l, n) => `${f.card(id)} slips past the defenders and hits the ${f.lane(l)} Seal for ${n}`,
    clash: (f, id, atk, other, oAtk) => `${f.card(id)} (${atk}) clashes with ${f.card(other)} (${oAtk})`,
    hitSeal: (f, id, l, n) => `${f.card(id)} hits the ${f.lane(l)} Seal for ${n}`,
    mulligan: (f, p, n) => `${verb(f, p, 'replace')} ${n} ${n === 1 ? 'card' : 'cards'}`,
    fatigue: (f, p) => `${f.who(p)} ${f.has(p)} no cards left: one of ${f.poss(p)} Seals takes 2 damage`,
    handFull: (f, p, id) => `${cap(f.poss(p))} hand is full: ${f.card(id)} goes to the graveyard`,
    sealBroken: (f, p, l) => `${cap(f.poss(p))} ${f.lane(l)} Seal is broken!`,
    wins: (f, p) => `${verb(f, p, 'win')} the match`,
    bounce: (f, id, p) => `${f.card(id)} returns to ${f.poss(p)} hand`,
    sacrifice: (f, p, id) => `${verb(f, p, 'sacrifice')} ${f.card(id)}`,
    pushed: (f, id, l) => `${f.card(id)} is pushed into the ${f.lane(l)} lane`,
    ferryman: () => 'The Ferryman collects: 1 damage to the enemy Seal',
    dies: (f, id, p) => `${cap(f.poss(p))} ${f.card(id)} dies`,
    echo: (f, id, p) => `Echo: ${f.card(id)} returns to ${f.poss(p)} hand`,
    lastToll: (f, p, custode, fac) => `${cap(f.poss(p))} Last Toll: ${f.bell(custode, fac)}`,
    ascends: (f, id) => `${f.card(id)} ascends!`,
    tollAnswer: (f, id) => `Toll: ${f.card(id)} answers`,
    nightFalls: (_f, id) => `The Night advances: ${EN_NIGHT[id].name}`,
};
