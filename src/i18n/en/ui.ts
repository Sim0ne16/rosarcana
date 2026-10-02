// Testi inglesi dei dati di gioco mostrati nell'interfaccia (ranghi, missioni, prove, sfide, capitolo 1...).
// Come per le carte, l'italiano resta canonico nei moduli di dati: qui c'è solo lo strato di visualizzazione.
import type {Lang} from '../langState';

export const EN_RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legend'];

export const EN_QUESTS: Record<string, string> = {
    win3: 'Win 3 matches',
    win5: 'Win 5 matches',
    play5: 'Play 5 matches',
    play3: 'Play 3 matches',
    craft1: 'Craft or disenchant a card',
    open2: 'Open 2 packs',
};

export const EN_BACKS: Record<string, string> = {
    cera: 'Red Wax',
    brace: 'Golden Ember',
    abisso: 'Abyss',
    aurora: 'Void Aurora',
    rosone: 'The Great Rose Window',
    codice: 'Arcane Codex',
    eclisse: 'Eclipse',
    radici: 'Weave of Roots',
    fornace: 'Heart of the Furnace',
    abissi: 'Eye of the Deep'
};

export const EN_DIFFS: Record<number, string> = {1: 'Easy', 2: 'Normal', 3: 'Hard', 4: 'Legendary'};

export const EN_ASCEND_TEXT = 'A unit that survives 2 combats ascends: it gains +2/+2 and a golden aura.';

export const EN_LESSONS: Record<string, { title: string; goal: string; tips: string[] }> = {
    presagi: {
        title: 'Omens and Last Toll',
        goal: 'Win by making use of the lane omens.',
        tips: ['Every lane has an omen: you can read it in the middle of the lane. Here: Ashen Wind (+1 attack), Eclipse (+1 damage to Seals), Hallowed Ground (+1 health).', 'Put your attackers in the lanes that empower them.', "When a Seal breaks, the Last Toll rings: its owner's Custodian answers with an effect. Keep it in mind before breaking an enemy Seal."]
    },
    sincronie: {
        title: 'Synergies and Custodians',
        goal: 'Put two linked cards into play and use your Custodian\'s power.',
        tips: ['Cards with the blue "Synergy with…" text get stronger when their partner is in play on your side: a chain symbol appears on the board.', 'In this deck: Ember Smith and Novice Flamethrower, Ashguard and Captain of Pyres, Grey She-Wolf and Mother Bear.', 'Your Custodian, Vesta, gives +1 attack to the first unit you play each turn. Tap her portrait to read it again.']
    },
    ascesa: {
        title: 'Ascension and Lens',
        goal: 'Make at least one unit ascend.',
        tips: ['A unit that survives 2 combats ascends: +2/+2 and a golden aura. Units with lots of health are the best candidates.', 'The center lane is protected by The Green Man (+1 health): the right place to grow a unit.', 'Use the Lens (L key) to read the state of every unit: combats survived, omen and synergies.']
    },
};

export const EN_WEEKLY: Record<string, { title: string; desc: string }> = {
    fragili: {title: 'Brittle Seals', desc: 'Every Seal has only 6 health: whoever strikes first wins.'},
    ecate: {title: 'Hecate\'s Night', desc: 'Both players have Hecate of the Crossroads as their Custodian.'},
    comuni: {title: 'Commons Only', desc: 'Play with only the common cards of your deck\'s factions.'},
    nebbia: {title: 'Fog Everywhere', desc: 'All three lanes have the Fog omen: no targets.'},
    cristalli: {title: 'Crystal Storm', desc: 'Start with 5 Crystals: the big cards arrive right away.'},
    eclissi: {title: 'Total Eclipse', desc: 'Every lane has the Eclipse omen: each hit on a Seal deals 1 extra damage.'},
    fortezze: {title: 'Fortresses', desc: '14-health Seals and Hallowed Ground everywhere: long matches.'},
};

/** Capitoli ufficiali: titolo, introduzione e tappe (stesso ordine dei dati italiani). */
export const EN_CHAPTERS: Record<string, { title: string; intro: string; stages: { n: string; foe: string; txt: string }[] }> = {
    cap1: {
        title: 'Chapter 1: The Awakening',
        intro: 'The first Seal of the Rose has cracked. Cross the lands of the four Houses all the way to Nyxa.',
        stages: [
            {n: 'The Path of Embers', foe: 'Garra the Firebrand', txt: 'A fast deck that goes for open Seals. Keep at least one defender per lane.'},
            {n: 'The Misty Bay', foe: 'The Mute Fisherman', txt: 'Moves your units and sends them back to your hand. Don\'t rely on a single lane.'},
            {n: 'The Breathing Wood', foe: 'Mother Nettle', txt: 'Her units grow every turn: strike before they get huge.'},
            {n: 'The Veiled Crypt', foe: 'Friar Ash', txt: 'Sacrifices and returns from the graveyard. What you kill may come back.'},
            {n: 'Nyxa Awakens', foe: 'Nyxa, Queen of Nothing', txt: 'Final battle. Nyxa\'s Seals have 14 health instead of 10.'},
        ]
    }
};

export const EN_TRAINING_NAME = 'Rose Dummy';
export const EN_PUPIL_NAME = 'Pupil of the Rose';

/** Nome del rango nella lingua scelta. */
export const rankName = (ranks: string[], i: number, lang: Lang) => (lang === 'en' ? EN_RANKS[i] : ranks[i]) ?? ranks[i];

/** Capitolo o tappa ufficiale in inglese; i contenuti scritti dai giocatori restano come sono. */
export function chapterText<T extends { id: string; title: string; intro: string }>(a: T, lang: Lang) {
    const en = lang === 'en' ? EN_CHAPTERS[a.id] : undefined;
    return en ? {title: en.title, intro: en.intro} : {title: a.title, intro: a.intro};
}

export function stageText(chapterId: string, i: number, st: { n: string; foe: string; txt: string }, lang: Lang) {
    const en = lang === 'en' ? EN_CHAPTERS[chapterId]?.stages[i] : undefined;
    return en ?? {n: st.n, foe: st.foe, txt: st.txt};
}


/** Mazzi base e per archetipo (nome, descrizione, etichetta dell'archetipo). */
export const EN_PRESETS: Record<string, { name: string; blurb: string; archetype?: string }> = {
    'p-fiamma-radice': {name: 'Flame and Root', blurb: 'Aggressive: fast Ember units up front, tenacious roots protecting them. Vesta empowers the first unit you play each turn.'},
    'p-maree-vuoto': {name: 'Tides of the Void', blurb: 'Control: send opponents back and turn deaths into damage to Seals with the Ferryman.'},
    'p-bosco-sommerso': {name: 'Sunken Wood', blurb: 'Defensive: Guardians and high health in the center lane, protected by The Green Man, while the Tide moves threats away.'},
    'p-ceneri-notte': {name: 'Ashes of the Night', blurb: 'Sacrifice and fire: start with an extra Crystal thanks to Hecate and burn everything left on the board.'},
    'a-aggro': {name: 'Swift Pyre', archetype: 'Aggro', blurb: 'Cheap units and Haste: hit the Seals before your opponent gets organised.'},
    'a-burn': {name: 'Ash and Smoke', archetype: 'Burn', blurb: 'Direct damage to Seals from every direction: spells, relics and deaths that burn.'},
    'a-tribale': {name: 'Legion of Embers', archetype: 'Tribal', blurb: 'All Ember: the Lord and the Herald empower every other unit of the House.'},
    'a-tempo': {name: 'Hidden Currents', archetype: 'Tempo', blurb: 'An early threat, then bounce cards to hand and make attacks skip until you win.'},
    'a-prison': {name: 'Salt Vice', archetype: 'Prison', blurb: 'Make everything costlier and slower for your opponent, then finish with the Kraken.'},
    'a-control': {name: 'Silence of the Lighthouse', archetype: 'Control', blurb: 'Survive, draw and destroy: win late with the best cards.'},
    'a-ramp': {name: 'Deep Roots', archetype: 'Ramp', blurb: 'Build up Crystals quickly and play Titans and Yggrin ahead of time.'},
    'a-midrange': {name: 'Pack of the Wood', archetype: 'Midrange', blurb: 'Solid, efficient units that adapt to every match.'},
    'a-combo': {name: 'Pact of Nothing', archetype: 'Combo', blurb: 'Sacrifice, raise, repeat: every death brings you closer to the final blow.'},
    'a-rintocco': {name: 'Last Toll', archetype: 'Toll', blurb: 'Let a Seal fall at the right moment: your cards all answer together.'},
};

export const EN_MASTERY_NAMES = ['Apprentice', 'Adept', 'Custodian', 'Master', 'Grand Master', 'Legend'];

export const EN_FRAMES: Record<string, { name: string; desc: string }> = {
    rosone: {name: 'Rose Window', desc: 'Lead-bound Cathedral stained glass in the colours of the four Houses.'},
    fornace: {name: 'Furnace', desc: 'Wrought iron and embers glowing between the joints.'},
    corallo: {name: 'Coral and Pearls', desc: 'Coral from the ruins of Atlantis set with pearls.'},
    radici: {name: 'Living Wood', desc: 'Woven roots, moss and small glowing flowers.'},
    notte: {name: 'Starry Obsidian', desc: 'Black volcanic glass dotted with stars.'},
    reliquia: {name: 'Reliquary', desc: 'Worked gold and gems, like the reliquary of the high altar.'},
    ...Object.fromEntries(EN_MASTERY_NAMES.map((n, i) => [`maestria-${i + 1}`, {
        name: `${n} Mastery`,
        desc: `Mastery frame of the ${n} grade: earned by playing this card and completing its challenges.`
    }])),
};

export const EN_ART_STYLES: Record<string, { name: string; desc: string }> = {
    dipinta: {name: 'Painted', desc: 'Oil painting: brushstrokes, backlight and canvas texture. Always available.'},
    vetrata: {name: 'Stained glass', desc: 'Coloured glass and leading in a gothic arch. Always available.'},
    incisione: {name: 'Engraving', desc: 'Ink on parchment, woodcut hatching.'},
    illustrata: {name: 'Illustrated', desc: 'AI-generated full-card illustration. Free when available.'},
};

export const EN_FX: Record<string, { name: string; desc: string }> = {
    orofuso: {name: 'Molten Gold', desc: 'A flow of gold runs over the card with warm glints. Free at the Legend mastery grade.'},
    alone: {name: 'Halo', desc: 'A halo in the faction colour slowly pulses around the card. Free at the Custodian grade.'},
    luce: {name: 'Raking Light', desc: 'Now and then a thread of light crosses the card, like a glint on stained glass. Also drops from packs.'},
};

/** Voce localizzata di una tabella {name, desc}: ricade sull'italiano se manca la traduzione. */
export function loc<T extends { name: string; desc: string }>(it: T, en: { name: string; desc: string } | undefined, lang: Lang) {
    return lang === 'en' && en ? {...it, ...en} : it;
}

export const EN_WORLD = {
    title: 'The Arcane Rose',
    text: [
        'Before the world there was only the Night, Nyxa, and in her womb slept four forces: fire, water, root and void.',
        'When a nameless thief stole the first flame from the Night and gave it to mortals, Nyxa woke up hungry. To stop her, the four Houses built the First Cathedral and at its heart the Arcane Rose: a rose window of glass in which every petal is a Seal that keeps the Night in chains.',
        'For a thousand years the Houses have fought over the Seals. Whoever breaks two, the prophecy says, decides who will guard the Rose in the next age. But every Seal that falls loosens a chain, and somewhere, deep in the dark, Nyxa smiles.',
    ],
};

/** Passi del tutorial in inglese, nello stesso ordine di TUTORIAL.steps. */
export const EN_TUTORIAL: { title: string; text: string }[] = [
    {title: 'Welcome to Rosarcana', text: 'The board has three lanes. At the top are your opponent\'s Seals, at the bottom yours. The first to break two Seals out of three wins. Here the enemy Seals have 6 health, to speed things up. Every turn you automatically get one more Crystal, up to 10: from then on you draw two cards per turn.'},
    {title: 'Play a unit', text: 'You have 2 Crystals, the blue medallion next to End turn. Drag Wandering Spark (cost 1) into a free slot in the center lane: with Haste it attacks this very turn.'},
    {title: 'End turn and attack', text: 'Press End turn. Your units attack in their own lane: if nobody is in front of them, they hit the Seal.'},
    {title: 'Opponent\'s turn', text: 'Now your opponent plays. Watch what they do.'},
    {title: 'Targeted spells', text: 'The Eel blocks Spark. Drag Flare onto the field, then aim the arrow at the Eel and tap it: 2 damage is enough.'},
    {title: 'Open a second front', text: 'Play Novice Flamethrower in the left lane. It has no Haste, so it will attack from next turn.'},
    {title: 'End turn', text: 'Press End turn. Spark will hit the center Seal again.'},
    {title: 'Opponent\'s turn', text: 'Your opponent responds.'},
    {title: 'Move your units', text: 'Coral Sentinel has 5 health and blocks Flamethrower. Drag Flamethrower into the center lane: moving costs 1 Crystal.'},
    {title: 'Strike where it is open', text: 'Play Blazing Runner in the right lane: with Haste it hits the undefended Seal right away.'},
    {title: 'Break the Seal', text: 'Press End turn and watch the center lane.'},
    {title: 'A Seal has fallen', text: 'One to go. Your opponent now plays on their own.'},
    {title: 'Your turn', text: 'From here you play freely: break the second Seal to win. The right Seal has only 2 health.'},
];

export const EN_FACTION_OF: Record<string, string> = {brace: 'of Ember', marea: 'of the Tide', radice: 'of the Root', vuoto: 'of the Void'};

/** Notte Incatenata: i colpi della Notte (stesse chiavi di engine/night.ts). */
export const EN_NIGHT: Record<import('../../engine/night').NightId, { name: string; text: string }> = {
    fog: {name: 'The dark advances', text: 'Fog covers the center lane: its units can no longer be targeted.'},
    reap: {name: 'The Night claims', text: 'The unit with the highest attack of each player is destroyed.'},
    wake: {name: 'Nyxa awakens', text: 'The weakest Seal of each player takes 2 damage.'},
    toll: {name: 'Black toll', text: 'The weakest Seal of each player takes 1 damage.'},
};
