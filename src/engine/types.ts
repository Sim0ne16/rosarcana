export type Faction = 'brace' | 'marea' | 'radice' | 'vuoto';
export type Rarity = 'c' | 'u' | 'r' | 'l';
export type CardType = 'U' | 'I' | 'R';
export type Keyword =
    'Rapido'
    | 'Guardiano'
    | 'Scossa'
    | 'Radicato'
    | 'Eco'
    | 'Assedio'
    | 'Cresce'
    | 'Aggirare'
    | 'Veleno'
    | 'Linfa vitale'
    | 'Offerta'
    | 'Auspicio';

export interface CardDef {
    id: string;
    n: string;
    t: CardType;
    c: number;
    a: number;
    h: number;
    tx: string;
    f: Faction;
    r: Rarity;
    kw: Keyword[];
    token?: boolean;
    offer?: number;
}

/** `known`: la carta è stata rivelata all'avversario e resta scoperta finché non viene giocata o scartata. */
export interface HandCard {
    id: string;
    cm: number;
    hid: number;
    known?: boolean
}

export interface Unit {
    uid: number;
    id: string;
    a: number;
    h: number;
    dmg: number;
    kw: Keyword[];
    sick: boolean;
    moved: boolean;
    stun: boolean;
    token: boolean;
    cm: number;
    dead?: boolean;
    fights?: number;
    asc?: boolean;
    auraH?: number;
}

export interface Player {
    name: string;
    deck: string[];
    hand: HandCard[];
    grave: string[];
    seals: number[];
    sealMax: number;
    relics: (string | null)[];
    board: Unit[][];
    crystals: number;
    maxC: number;
    custode?: import('./mechanics').CustodeId | null;
    flags?: Record<string, boolean>;
}

export type GameEvent =
    | { t: 'dmgU'; uid: number; n: number }
    | { t: 'dmgS'; p: number; l: number; n: number }
    | { t: 'healS'; p: number; l: number; n: number }
    | { t: 'break'; p: number; l: number }
    | { t: 'death'; uid: number; p: number }
    | { t: 'draw'; p: number }
    | { t: 'play'; p: number; id: string }
    | { t: 'hit'; p: number; id: string; n: number }
    | { t: 'kill'; p: number; id: string }
    | { t: 'relicTurn'; p: number; id: string }
    | { t: 'bell'; p: number; l: number; f: Faction; name: string; text: string }
    | { t: 'ascend'; uid: number; p: number }
    | { t: 'crystal'; p: number; n: number }
    | { t: 'reveal'; p: number; ids: string[] };

export interface LogLine {
    txt: string;
    cls: '' | 'me' | 'op' | 'big' | 'turn'
}

export interface Game {
    turn: number;
    active: number;
    phase: 'choice' | 'main' | 'over';
    p: [Player, Player];
    uidc: number;
    log: LogLine[];
    ev: GameEvent[];
    winner: number | null;
    first: number;
    sim?: boolean;
    omens?: (import('./mechanics').OmenId | null)[];
    bell?: (Faction | null)[];
}

export type Target =
    | { type: 'unit'; p: number; lane: number; uid: number }
    | { type: 'seal'; p: number; lane: number }
    | { type: 'lane'; lane: number };

export interface PlayOpt {
    lane?: number;
    target?: Target
}

export interface TargetSpec {
    kind: 'unit' | 'seal' | 'lane';
    side?: 'ally' | 'enemy' | 'any';
    filter?: (G: Game, u: Unit) => boolean;
}

export type Action =
    | { k: 'play'; hi: number; o: PlayOpt }
    | { k: 'move'; uid: number; to: number };
