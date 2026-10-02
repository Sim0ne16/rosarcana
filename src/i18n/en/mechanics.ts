// Traduzione inglese del vocabolario di gioco: parole chiave, tipi, rarità, fazioni, presagi, Ultimo Rintocco,
// Custodi. Le chiavi restano gli identificatori italiani canonici usati dal motore (Keyword, Faction, OmenId,
// CustodeId...) - qui si traduce solo ciò che il giocatore legge, mai un id.
import type {CardType, Faction, Keyword, Rarity} from '../../engine/types';
import type {CustodeId, OmenId} from '../../engine/mechanics';

/** La parola inglese che sostituisce il nome italiano della parola chiave DENTRO al testo tradotto di una carta,
 * così il riconoscimento delle parole chiave nel testo (grassetto, ecc.) funziona anche in inglese. */
export const EN_KEYWORD_WORD: Record<Keyword, string> = {
    Rapido: 'Haste',
    Guardiano: 'Guardian',
    Scossa: 'Shock',
    Radicato: 'Rooted',
    Eco: 'Echo',
    Assedio: 'Siege',
    Cresce: 'Growth',
    Aggirare: 'Flank',
    Veleno: 'Venom',
    'Linfa vitale': 'Lifesap',
    Offerta: 'Offering',
    Auspicio: 'Favor',
};

export const EN_KEYWORDS: Record<Keyword, string> = {
    Rapido: 'Can attack the turn it enters play.',
    Guardiano: "Your units in the lanes next to it can't be targeted by the opponent's spells and effects. Doesn't protect its own lane or itself.",
    Scossa: 'When it hits a Seal, it also deals 1 damage to a random intact Seal next to it.',
    Radicato: "Can't be moved to another lane, by you or the opponent.",
    Eco: 'When it dies, it returns to your hand and costs 1 more (the surcharge stacks on each return).',
    Assedio: 'Deals double damage when it hits a Seal.',
    Cresce: 'Gets +1 attack and +1 health at the start of each of your turns.',
    Aggirare: "If its lane has defenders, it instead attacks the Seal of a nearby lane with no defenders.",
    Offerta: "You may pay for it with your healthiest Seal's health instead of Crystals (the Seal can't drop below 1).",
    Auspicio: "Immune to its lane's omen: it gets neither the drawbacks nor the benefits.",
    Veleno: 'A unit that takes damage from this unit in combat is destroyed.',
    'Linfa vitale': 'When it deals damage, it restores that much health to your Seal in its lane.',
};
export const EN_KW_SHORT: Record<Keyword, string> = {
    Rapido: 'attacks the turn it enters',
    Guardiano: 'shields your lanes next to it',
    Scossa: '+1 damage to a Seal nearby',
    Radicato: "can't change lanes",
    Eco: 'returns to hand on death, costs +1',
    Assedio: 'double damage to Seals',
    Cresce: '+1/+1 each of your turns',
    Aggirare: 'hits an undefended Seal nearby',
    Veleno: 'destroys what it damages',
    'Linfa vitale': 'its damage heals the Seal',
    Offerta: 'paid with Seal health',
    Auspicio: 'Ignores omens',
};

export const EN_TYPES: Record<CardType, string> = {U: 'Unit', I: 'Spell', R: 'Relic'};
export const EN_TYPE_NOTE: Record<CardType, string> = {
    U: '', I: 'Immediate effect, then goes to the graveyard.', R: 'Sits on one of your Seals and acts while it holds.',
};
export const EN_RARITY_NAMES: Record<Rarity, string> = {c: 'Common', u: 'Uncommon', r: 'Rare', l: 'Legendary'};

export const EN_FACTION_NAMES: Record<Faction, string> = {brace: 'Ember', marea: 'Tide', radice: 'Root', vuoto: 'Void'};
export const EN_FACTION_LORE: Record<Faction, { motto: string; text: string; insp: string }> = {
    brace: {
        motto: 'Fire never dies out: it passes from hand to hand.',
        insp: 'Prometheus, the Phoenix, Surtr, the Vestals',
        text: 'Descended from the First Fire, the flame stolen from the Night. They tend the pyres that keep the living apart from the dark and live in the shadow of the Mountain, where the giant Vulkara sleeps. They believe the light must be defended by striking first.'
    },
    marea: {
        motto: 'The sea always gives something back, but never what you gave it.',
        insp: 'The Odyssey, Atlantis, Scylla and Charybdis, the Leviathan',
        text: 'Heirs of a sunken city, the Atlantis of the Tides. Their queen Thalassa kept the Night away from the coasts with her song. They win not by force but by the patience of the current: they shift, they push back, they wait.'
    },
    radice: {
        motto: 'What is cut down grows back.',
        insp: 'Yggdrasil, the Druids, Persephone, the Capitoline Wolf',
        text: "Keepers of the forest that grows around Yggrin, the tree whose roots touch all three worlds. They are slow and stubborn: every wound closes, every season returns. Their druids speak to the Seals like old friends."
    },
    vuoto: {
        motto: 'Everything that lives belongs to us, sooner or later.',
        insp: 'Nyx, Orpheus, Faust, Koschei the Deathless, Sköll and Hati',
        text: 'They serve Nyxa, the chained Night, and work in silence to break the Seals. They trade in souls, pacts, and returns from the realm of the dead. To them death is not a defeat, but a currency.'
    },
};

export const EN_OMENS: Record<OmenId, { name: string; text: string; short: string }> = {
    nebbia: {
        name: 'Fog',
        text: "Units in this lane can't be targeted by spells and effects.",
        short: "Units can't be targeted"
    },
    consacrata: {name: 'Hallowed Ground', text: 'Units in this lane have +1 health.', short: '+1 health to units'},
    cenere: {name: 'Ashen Wind', text: 'Units in this lane have +1 attack.', short: '+1 attack to units'},
    eclissi: {
        name: 'Eclipse',
        text: 'Hits on the Seals of this lane deal 1 extra damage.',
        short: '+1 damage to Seals'
    },
    radici: {
        name: 'Ancient Roots',
        text: "Units can't enter or leave this lane by moving.",
        short: 'No movement'
    },
    campane: {
        name: 'Death Bells',
        text: "When a unit dies in this lane, its owner's Seal in this lane recovers 1 health.",
        short: 'Every death heals the Seal 1'
    },
    bastione: {
        name: 'Bulwark',
        text: 'Unit hits on the Seals of this lane deal 1 less damage (at least 1).',
        short: '-1 damage to Seals'
    },
    palude: {name: 'Mire', text: 'Units in this lane have -1 attack.', short: '-1 attack to units'},
    miasma: {
        name: 'Miasma',
        text: 'At the start of your turn, your units in this lane take 1 damage.',
        short: '1 damage at turn start'
    },
    luna: {
        name: 'Waxing Moon',
        text: 'At the start of your turn, your unit with the least attack in this lane gets +1 attack and +1 health permanently.',
        short: '+1/+1 to the weakest'
    },
    arena: {
        name: 'Blood Arena',
        text: 'When a unit in this lane kills an enemy unit in combat and survives, it gets +1 attack permanently.',
        short: 'Killers get +1 attack'
    },
    pozzo: {
        name: 'Well of Whispers',
        text: 'At the start of your turn, if you have more units than your opponent in this lane, draw a card.',
        short: 'Draw if you hold it'
    },
};

export const EN_BELLS: Record<Faction, { name: string; text: string }> = {
    brace: {name: 'Final Pyre', text: 'Deals 2 damage to every enemy unit in the lane of the broken Seal.'},
    marea: {name: 'Last Undertow', text: "Returns the opponent's units in the lane of the broken Seal to their hand."},
    radice: {name: 'Deep Roots', text: 'Restores 3 health to each of your other Seals.'},
    vuoto: {name: 'Final Pact', text: 'Draw 2 cards and gain 2 Crystals immediately.'},
};

export const EN_CUSTODI: Record<CustodeId, {
    name: string;
    title: string;
    passive: string;
    bellName: string;
    bell: string;
    lore: string
}> = {
    vesta: {
        name: 'Vesta', title: 'Keeper of the Flame',
        passive: 'The first unit you play each turn gets +1 attack.',
        bellName: 'Eternal Flame', bell: 'Summon a Wandering Spark in each of your lanes with space.',
        lore: "The first of the Vestals, who never let the First Fire go out. They say she hasn't slept in a thousand years."
    },
    ladro: {
        name: 'The Nameless Thief', title: 'Fire-Bringer',
        passive: 'The first spell you play each turn costs 1 Crystal less.',
        bellName: 'Stolen Fire', bell: 'Deals 3 damage to a random enemy Seal.',
        lore: 'Stole the first flame from the Night and gave it to mortals. As punishment he was chained, but the chains melted in his warmth.'
    },
    veggente: {
        name: 'Cassandra of the Tides', title: 'The Unbelieved Voice',
        passive: 'You start the match with 1 extra card.',
        bellName: 'Prophecy', bell: 'Draw 3 cards.',
        lore: "She has seen every Seal fall before it happened. No one ever believed her, so she stopped warning and started preparing."
    },
    nocchiero: {
        name: 'The Helmsman of the Shoals', title: 'Guide Among the Rocks',
        passive: "The first move you make each turn costs no Crystals.",
        bellName: 'Storm Surge', bell: "Returns the opponent's units that cost 3 or less to their hand.",
        lore: 'Knows every current between Scylla and Charybdis. They say he once brought home a king the sea did not want to let go.'
    },
    guardaboschi: {
        name: 'The Green Man', title: 'Woodwarden',
        passive: 'Your units in the center lane have +1 health.',
        bellName: 'Spring', bell: 'Summon two Sprouts in the lane of the broken Seal and restore 2 health to your other Seals.',
        lore: 'The leaf-carved face in the oldest cathedrals. When the stone cracks, he is the one who grows moss over it.'
    },
    madre: {
        name: 'The Mother of Seasons', title: 'Lady of the Harvest',
        passive: 'At the end of your turn, restores 1 health to your weakest Seal.',
        bellName: 'Harvest', bell: 'Your units in play get +1/+1.',
        lore: 'She searches for her daughter every winter and finds her every spring. While she searches, nothing grows; when she finds her, everything is reborn.'
    },
    traghettatore: {
        name: 'The Ferryman', title: 'Boatman of the Dead',
        passive: 'The first of your units that dies each turn deals 1 damage to the enemy Seal in its lane.',
        bellName: 'The Toll', bell: 'Return the most expensive unit in your graveyard to hand: it costs 0.',
        lore: 'He carries souls to the far shore for a coin. Those without the coin stay on the shore, and those who stay, sooner or later, return to the fight.'
    },
    ecate: {
        name: 'Hecate of the Crossroads', title: 'Lady of the Thresholds',
        passive: 'You start the match with 1 extra Crystal.',
        bellName: 'Crossroads', bell: 'Destroys the enemy unit with the most attack.',
        lore: 'She holds the keys to every threshold between worlds. She showed the Thief the way to steal the fire, and she was the one who shut the door behind him.'
    },
};

export const EN_LANE_NAME = ['left', 'center', 'right'];
export const EN_SET_NAME = 'Base Set';

/** Traduzione delle Sincronie (mechanics.ts::SYNERGIES), chiave = id della sincronia. */
export const EN_SYNERGIES: Record<string, { name: string; text: string }> = {
    madri: {name: 'Mothers of the Wood', text: 'Grey She-Wolf gets +1 attack, Mother Bear +1 health.'},
    fucina: {name: 'The Forge', text: 'Novice Flamethrower gets +1/+1.'},
    cenere: {name: 'Ashguard', text: 'Ashguard gets +1/+1, Captain of Pyres +1 attack.'},
    rinascita: {name: 'Rebirth', text: 'With The First Fire on one of your Seals, Lesser Phoenix has +2 attack.'},
    scintilla: {name: 'The First Spark', text: 'With The First Fire on one of your Seals, Wandering Spark has +1/+1.'},
    rotta: {name: 'Song and Course', text: 'Brackish Admiral and Thalassa get +1/+1.'},
    profezia: {name: 'The Prophecy', text: 'Tide Seer gets +1/+1.'},
    atlantide: {name: 'Guardians of Atlantis', text: 'Coral Sentinel and Warden of the Gulf get +2 health.'},
    querce: {name: 'Voices of the Forest', text: 'Moss Druid gets +1/+1.'},
    caccia: {name: 'The Endless Hunt', text: 'Undergrowth Archer gets +2 attack.'},
    ago: {name: 'The Soul in the Needle', text: 'Soul Thief gets +1 attack, Hollow Sovereign +1 health.'},
    lupi: {name: 'Wolf Brothers', text: 'Devourer of Stars and Grey She-Wolf get +1 attack.'},
    devoti: {name: 'Black Candle', text: 'Veiled Acolyte gets +1/+1.'},
    orfeo: {name: "Don't Look Back", text: 'Wandering Wraith gets +1 attack while Reaper is in play.'},
};
