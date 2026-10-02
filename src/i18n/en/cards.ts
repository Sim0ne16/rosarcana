// Traduzione inglese di nome e testo delle carte. Le parole chiave e gli inneschi dentro `tx` usano
// esattamente le parole di EN_KEYWORD_WORD e le frasi di TRIGGER_EN (cardText.tsx), così l'evidenziazione
// del testo funziona anche in inglese. Chiave = id canonico della carta (mai tradotto).
export const EN_CARDS: Record<string, { n: string; tx: string }> = {
    // ---------- Ember (Brace) ----------
    'brace-c0': {n: 'Wandering Spark', tx: 'Haste.'},
    'brace-c1': {n: 'Ember Smith', tx: 'When it enters: another unit of yours gets +1 attack.'},
    'brace-c2': {n: 'Novice Flamethrower', tx: ''},
    'brace-c3': {n: 'Flare', tx: 'Deal 2 damage to a unit of your choice, yours or the enemy\'s.'},
    'brace-c4': {n: 'Ashguard', tx: 'Guardian.'},
    'brace-c5': {n: 'Blazing Runner', tx: 'Haste.'},
    'brace-c6': {n: 'Ashen Griffin', tx: 'Flank.'},
    'brace-c7': {n: 'War Drummer', tx: 'When it enters: another Ember unit of yours gets +1 attack.'},
    'brace-c8': {n: 'Burning Shard', tx: "Deal 2 damage to an enemy unit and 1 damage to the Seal of its lane."},
    'brace-c9': {n: 'Pyre Fanatic', tx: 'Offering 2.'},
    'brace-c10': {n: 'Smoldering Sentinel', tx: 'Toll: deals 2 damage to every enemy unit in its lane.'},
    'brace-u0': {n: 'Searing Ram', tx: 'Siege.'},
    'brace-u1': {n: 'Rain of Embers', tx: 'Deal 1 damage to every enemy unit.'},
    'brace-u2': {n: 'Glowing Standard', tx: 'While this Seal is intact, your units in its lane have +1 attack.'},
    'brace-u3': {n: 'Ember Duelist', tx: 'Shock.'},
    'brace-u4': {n: 'Incendiary', tx: 'When it enters: deals 1 damage to every enemy Seal.'},
    'brace-u5': {n: 'Ashen Berserker', tx: 'Haste. Offering 3.'},
    'brace-u6': {
        n: 'Votive Pyre',
        tx: 'At the start of your turn, while this Seal is intact: deal 1 damage to the enemy unit with the least health.'
    },
    'brace-u7': {n: 'Ember Veteran', tx: 'Favor.'},
    'brace-r0': {n: 'Lesser Phoenix', tx: 'Haste. Echo.'},
    'brace-r1': {n: 'Lava Flow', tx: 'Deal 4 damage to an enemy Seal of your choice.'},
    'brace-r2': {n: 'Captain of Pyres', tx: 'Your other Ember units have Haste.'},
    'brace-r3': {n: 'Lord of Embers', tx: 'Your other Ember units have +1 attack.'},
    'brace-r4': {n: 'Ember Dragon', tx: 'Flank. When it enters: deals 1 damage to every enemy unit.'},
    'brace-r5': {
        n: 'Eruption',
        tx: 'Deal 3 damage to every enemy unit in a lane and 2 damage to the enemy Seal of that lane.'
    },
    'brace-r6': {n: 'Herald of Fire', tx: 'Haste. When it enters: your other Ember units get +1 attack.'},
    'brace-l0': {
        n: 'Vulkara, Heart of the Mountain',
        tx: 'Siege. When it enters: deals 3 damage to every other unit in its lane, yours and the enemy\'s alike.'
    },
    'brace-l1': {
        n: 'The First Fire',
        tx: 'At the start of your turn, while this Seal is intact: deal 1 damage to every enemy Seal.'
    },
    'brace-l2': {
        n: 'Surtr, the Black Giant',
        tx: 'Offering 4. Siege. When it enters: deals 2 damage to every enemy Seal.'
    },
    'brace-l3': {n: 'Eternal Forge', tx: 'While this Seal is intact, your Ember cards cost 1 less.'},

    // ---------- Tide (Marea) ----------
    'marea-c0': {
        n: 'Splash',
        tx: "Return a unit that costs 2 or less to its owner's hand. Summoned units are removed instead."
    },
    'marea-c1': {n: 'Mist Fisher', tx: ''},
    'marea-c2': {n: 'Darting Eel', tx: "When it enters: move a non-Rooted enemy unit to a nearby lane with space."},
    'marea-c3': {n: 'Coral Sentinel', tx: 'Guardian.'},
    'marea-c4': {n: 'Undertow', tx: 'Move a non-Rooted unit to a nearby lane with space. Draw 1 card.'},
    'marea-c5': {
        n: 'Pale Jellyfish',
        tx: 'If it dies in combat, the unit that killed it skips its next attack.'
    },
    'marea-c6': {n: 'Shoal Gull', tx: 'Flank.'},
    'marea-c7': {n: 'Rogue Wave', tx: "Return an enemy unit that costs 3 or less to the opponent's hand."},
    'marea-c8': {n: 'Armored Crab', tx: 'Guardian.'},
    'marea-c9': {n: 'Pearl Diver', tx: 'When it enters: if its lane has an omen, draw 1 card.'},
    'marea-c10': {n: 'Brackish Fog', tx: 'An enemy unit skips its next attack. Draw 1 card.'},
    'marea-u0': {n: 'Tide Seer', tx: 'When it enters: draw 1 card.'},
    'marea-u1': {n: 'Riptide', tx: "Return a unit to its owner's hand. Summoned units are removed instead."},
    'marea-u2': {
        n: 'Sunken Lighthouse',
        tx: 'At the start of your turn, while this Seal is intact: if the top card of your deck costs more than 1 above your maximum Crystals, put it on the bottom of the deck.'
    },
    'marea-u3': {n: 'Warden of the Gulf', tx: 'Rooted. Guardian.'},
    'marea-u4': {n: 'High Tide', tx: "While this Seal is intact, the opponent's cards cost 1 more."},
    'marea-u5': {n: 'Triton Scout', tx: 'Flank.'},
    'marea-u6': {n: 'Broken Anchor', tx: 'While this Seal is intact, enemy units in its lane have -1 attack.'},
    'marea-u7': {n: 'Current Witch', tx: 'Toll: draw 2 cards.'},
    'marea-r0': {n: 'Maelstrom', tx: "Return all of the opponent's units in a lane to their hand."},
    'marea-r1': {
        n: 'Young Leviathan',
        tx: "When it enters: move every non-Rooted enemy unit in its lane to a nearby lane with space."
    },
    'marea-r2': {n: 'Brackish Admiral', tx: 'While in play, moving your units costs no Crystals.'},
    'marea-r3': {n: 'Beguiling Siren', tx: 'Flank. When it enters: an enemy unit skips its next attack.'},
    'marea-r4': {n: 'Sleeping Kraken', tx: 'Rooted. When it enters: every enemy unit skips its next attack.'},
    'marea-r5': {
        n: 'Countertide',
        tx: 'Choose a lane: enemy units there skip their next attack. Draw 1 card.'
    },
    'marea-r6': {n: 'Lady of the Shoals', tx: 'Your other Tide units have +1 health.'},
    'marea-l0': {
        n: 'Thalassa, Voice of the Abyss',
        tx: "When it enters: return all of the opponent's units with base cost 3 or less to their hand."
    },
    'marea-l1': {n: 'Eternal Tide', tx: "Return all of the opponent's units to their hand. Draw 2 cards."},
    'marea-l2': {
        n: 'Scylla',
        tx: "When it enters: return the enemy units in its lane to the opponent's hand; your units in its lane get +1/+1."
    },
    'marea-l3': {
        n: 'Lighthouse of Alexandria',
        tx: 'At the start of your turn, while this Seal is intact: draw 1 card.'
    },

    // ---------- Root (Radice) ----------
    'radice-c0': {n: 'Stubborn Sprout', tx: 'Growth.'},
    'radice-c1': {
        n: 'Moss Druid',
        tx: "At the end of your turn: restore 1 health to your Seal in its lane (not above the maximum)."
    },
    'radice-c2': {n: 'Bramble Boar', tx: 'Rooted.'},
    'radice-c3': {n: 'Bark', tx: 'A unit of your choice gets +3 health permanently.'},
    'radice-c4': {n: 'Undergrowth Archer', tx: 'When it enters: deals 1 damage to an enemy unit of your choice.'},
    'radice-c5': {n: 'Sap', tx: 'A unit of your choice gets +2 attack and +2 health permanently.'},
    'radice-c6': {n: 'Keeper of the Springs', tx: 'When it enters: gain 1 maximum Crystal (up to 10).'},
    'radice-c7': {n: 'Climbing Moss', tx: 'Growth. Rooted.'},
    'radice-c8': {n: 'Wandering Seed', tx: 'Gain 1 maximum Crystal (up to 10).'},
    'radice-c9': {n: 'Young Wolf', tx: 'Favor.'},
    'radice-c10': {n: 'Herbalist', tx: 'When it enters: restore 2 health to one of your intact Seals.'},
    'radice-u0': {n: 'Watchful Oak', tx: 'Guardian. Rooted.'},
    'radice-u1': {
        n: 'Swarm of Spores',
        tx: "Summon two 1/1 Sprouts with Growth in the lane you choose; if it's full, in nearby lanes."
    },
    'radice-u2': {n: 'Circle of Stones', tx: 'While this Seal is intact, your units in its lane have +2 health.'},
    'radice-u3': {n: 'Grey She-Wolf', tx: 'Growth.'},
    'radice-u4': {n: 'Undergrowth Viper', tx: 'Venom.'},
    'radice-u5': {n: 'Warden Treant', tx: 'Guardian. Lifesap.'},
    'radice-u6': {
        n: 'Fairy Ring',
        tx: "At the start of your turn, while this Seal is intact: summon a Sprout in its lane, if there's space."
    },
    'radice-u7': {n: 'Furious Boar', tx: 'Toll: gets +3/+3.'},
    'radice-r0': {n: 'Ancient Vine', tx: 'Guardian. Growth.'},
    'radice-r1': {n: 'Green Rebirth', tx: 'Restore up to 5 health to one of your intact Seals (not above the maximum).'},
    'radice-r2': {n: 'Mother Bear', tx: 'When it enters: summon a 2/2 Cub in every nearby lane with space.'},
    'radice-r3': {n: 'White Stag', tx: 'Lifesap.'},
    'radice-r4': {
        n: 'Ancient Dryad',
        tx: 'When it enters: gain 1 maximum Crystal and restore 2 health to each of your Seals.'
    },
    'radice-r5': {n: 'Call of the Forest', tx: 'Your units get +1 attack and +2 health. Draw 1 card.'},
    'radice-r6': {n: 'Lord of Stags', tx: 'Your other Root units have Lifesap.'},
    'radice-l0': {
        n: 'Yggrin, the Walking Tree',
        tx: 'Rooted. At the start of your turn: gets +2/+2 and restores 2 health to each of your Seals.'
    },
    'radice-l1': {
        n: 'Seed of the World',
        tx: 'At the start of your turn, while this Seal is intact: your units in play get +1/+1.'
    },
    'radice-l2': {n: 'Oaken Titan', tx: 'Rooted. Guardian. Lifesap.'},
    'radice-l3': {
        n: 'Eternal Spring',
        tx: 'Fully heal your units, restore 4 health to each of your Seals, and draw 2 cards.'
    },

    // ---------- Void (Vuoto) ----------
    'vuoto-c0': {n: 'Veiled Acolyte', tx: 'When it dies: draw 1 card.'},
    'vuoto-c1': {n: 'Hungry Shadow', tx: ''},
    'vuoto-c2': {n: 'Blood Pact', tx: 'Sacrifice one of your units in play. Draw 2 cards.'},
    'vuoto-c3': {n: 'Wandering Wraith', tx: 'Echo.'},
    'vuoto-c4': {
        n: 'Hollow Eye',
        tx: "When it enters: reveal the opponent's hand. Revealed cards stay face up until they are played."
    },
    'vuoto-c5': {n: 'Whisper', tx: "An enemy unit gets -2 attack permanently (doesn't go below 0)."},
    'vuoto-c6': {n: 'Scribe of Nothing', tx: 'When it enters: search your deck for a spell and put it in hand.'},
    'vuoto-c7': {n: 'Novice of the Veil', tx: 'When it dies: deals 1 damage to a random enemy Seal.'},
    'vuoto-c8': {n: 'Tribute', tx: 'Sacrifice one of your units: gain 1 Crystal this turn and draw 1 card.'},
    'vuoto-c9': {n: 'Reanimated Skeleton', tx: 'Echo.'},
    'vuoto-c10': {n: 'Whisper of the Well', tx: 'Search your deck for a unit that costs 3 or less and put it in hand.'},
    'vuoto-u0': {n: 'Reaper', tx: "When another unit dies, yours or the enemy's: gets +1/+1."},
    'vuoto-u1': {n: 'Call from the Pit', tx: 'Return the most expensive unit in your graveyard to hand.'},
    'vuoto-u2': {
        n: 'Cracked Altar',
        tx: 'When you sacrifice a unit, while this Seal is intact: deal 1 damage to a random enemy Seal.'
    },
    'vuoto-u3': {
        n: 'Soul Thief',
        tx: "When it enters: you may sacrifice another unit of yours; it adds its attack and its remaining health."
    },
    'vuoto-u4': {n: 'Crypt Bat', tx: 'Flank. Venom.'},
    'vuoto-u5': {n: 'Necromancer', tx: 'When it enters: return a unit that costs 2 or less from your graveyard to play.'},
    'vuoto-u6': {
        n: 'Dark Reliquary',
        tx: 'While this Seal is intact: the first time one of your units dies each turn, draw 1 card.'
    },
    'vuoto-u7': {n: 'Priestess of Nothing', tx: 'Toll: return your most expensive unit from your graveyard to play.'},
    'vuoto-r0': {n: 'Devourer of Stars', tx: 'Costs 1 less for every unit in your graveyard, up to 4 less.'},
    'vuoto-r1': {n: 'Eclipse', tx: 'Destroy a unit of your choice.'},
    'vuoto-r2': {n: 'Hollow Sovereign', tx: 'Echo. Siege.'},
    'vuoto-r3': {n: 'Great Eclipse', tx: 'Destroy all units with 3 or less attack, yours and the enemy\'s.'},
    'vuoto-r4': {
        n: 'Devourer of Souls',
        tx: 'When it enters: you may sacrifice another unit of yours; if you do, it gets +3/+3.'
    },
    'vuoto-r5': {n: 'Pact of Shadows', tx: 'Destroy an enemy unit. Deal 3 damage to a random Seal of yours.'},
    'vuoto-r6': {n: 'Archbishop of Silence', tx: 'Your other Void units have Echo.'},
    'vuoto-l0': {
        n: 'Nyxa, Queen of Nothing',
        tx: 'When it enters: return your most expensive unit from your graveyard to play, in its lane or the nearest one with space.'
    },
    'vuoto-l1': {n: 'The Silence', tx: 'Destroy all units. For each one, deal 1 damage to a random enemy Seal.'},
    'vuoto-l2': {n: 'Hel, Queen of the Dead', tx: 'When it enters: return your two most expensive units from your graveyard to play.'},
    'vuoto-l3': {
        n: 'The Great Pact',
        tx: 'At the start of your turn, while this Seal is intact: sacrifice your weakest unit and deal 2 damage to a random enemy Seal.'
    },

    // ---------- Tokens ----------
    'tok-germoglio': {n: 'Sprout', tx: 'Growth. Summoned by a card.'},
    'tok-cucciolo': {n: 'Cub', tx: 'Summoned by Mother Bear.'},
};
