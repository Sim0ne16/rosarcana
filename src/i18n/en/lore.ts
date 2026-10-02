// Traduzione inglese della lore delle carte (testo, frase breve, fonte d'ispirazione). I `links` restano
// quelli canonici in lore.ts (sono id, non testo) - qui si traduce solo ciò che il giocatore legge.
export interface EnLore {
    text: string;
    flavor: string;
    insp: string;
}

export const EN_LORE: Record<string, EnLore> = {
    // ---------- Ember (Brace) ----------
    'brace-c0': {
        text: "The first spark that escaped the torch of the First Fire. It wanders from hearth to hearth, looking for the hand that set it free.",
        flavor: 'First to flee, first to arrive.', insp: 'Prometheus'
    },
    'brace-c1': {
        text: "An apprentice of the forge beneath the Mountain, he beats iron to the rhythm of Vulkara's heart. They say he forged the chains of the Seals.",
        flavor: 'Every strike is a heartbeat of the Mountain.', insp: 'Hephaestus and Vulcan'
    },
    'brace-c2': {
        text: 'A recruit of the Ashguard. She has sworn never to let the fire on her back go out, a gift from the Ember Smith.',
        flavor: 'She swore never to let her fire go out.', insp: 'The vigiles of ancient Rome'
    },
    'brace-c3': {
        text: 'The gesture with which the Captain of Pyres lights the bonfires. Once learned, you can no longer warm your hands without burning something.',
        flavor: 'One gesture, and the night retreats.', insp: 'The fire from heaven of the prophet Elijah'
    },
    'brace-c4': {
        text: 'Keepers of the First Fire, they wear the blackened armor of those who wore it before them. No one remembers their own name: they only remember their watch.',
        flavor: "No one remembers their name, only their watch.", insp: 'The Vestal keepers of the sacred fire'
    },
    'brace-c5': {
        text: 'He carried the flame from the Mountain to the Cathedral in a single night. He has not stopped running since.',
        flavor: 'He arrived before dawn. He never stopped.', insp: 'Pheidippides and the Olympic torchbearers'
    },
    'brace-u0': {
        text: "Forged to break down the gates of the Tides' Atlantis, it came back smoking and half-melted. The Ember still call it a victory.",
        flavor: 'No door holds. Almost none.', insp: 'The Trojan Horse and the siege rams'
    },
    'brace-u1': {
        text: 'When Vulkara sighs in his sleep, ash and embers fall over the fields for three days.',
        flavor: 'The Mountain sighs, and the sky burns.', insp: 'The eruption that buried Pompeii'
    },
    'brace-u2': {
        text: "The banner of the first revolt against the Night. It doesn't burn whoever holds it: it only takes away their fear.",
        flavor: 'Whoever holds it does not tremble.', insp: 'The Oriflamme of the kings of France'
    },
    'brace-u3': {
        text: 'He challenges anyone at sunset, above all his own shadow. So far he has always won; the shadow, patiently, waits.',
        flavor: 'He duels his own shadow at sunset.', insp: "The shadow that runs away in Andersen's fairy tales"
    },
    'brace-r0': {
        text: 'Daughter of the Phoenix that burned on the day of the First Night. Every time she is reborn from the ashes, she remembers her mother a little less.',
        flavor: 'She is reborn, and each time she forgets.', insp: "Herodotus's Phoenix"
    },
    'brace-r1': {
        text: "Vulkara's wrath, descending from the Mountain to melt the walls of those who offended him.",
        flavor: "The Mountain's wrath flows down into the valley.", insp: 'Pele, Hawaiian goddess of volcanoes'
    },
    'brace-r2': {
        text: 'She commands the Ashguard and keeps lit the pyres that keep the living apart from the Night. She has sworn not to sleep while Nyxa remains in chains.',
        flavor: 'She will not sleep while the Night is chained.', insp: 'Joan of Arc'
    },
    'brace-l0': {
        text: 'The fire giant born when the First Fire touched the earth. He sleeps beneath the Mountain and, they say, will wake to burn the world at the end of time.',
        flavor: 'He sleeps. For now.', insp: 'Surtr, the fire giant of Norse myth'
    },
    'brace-l1': {
        text: 'The flame stolen from the Night by a nameless thief and given to mortals. Every Ember descends from her, and every war of the Seals begins with her.',
        flavor: 'Every light descends from her.', insp: 'Prometheus stealing fire from the gods'
    },
    'brace-c6': {
        text: 'Griffins born in the ash of the Mountain: their feathers never stop smoking.',
        flavor: 'Her feathers still smoke.', insp: 'The griffin of medieval legend'
    },
    'brace-u4': {
        text: 'She lights the fuses under enemy walls and vanishes before the blast. No one has ever seen her face.',
        flavor: 'One fuse, then silence.', insp: 'The saboteurs of siege warfare'
    },
    'brace-r3': {
        text: 'The eldest of the Guardians of the Forge. Where he walks, embers stir back to life and soldiers find their courage.',
        flavor: 'Where he passes, embers stir back to life.', insp: 'Loki and the fire that inspires warriors'
    },
    'brace-c7': {
        text: 'She keeps the marching beat with two blackened bones. Whoever hears it cannot fall behind.',
        flavor: 'Whoever hears it does not fall behind.', insp: 'The drummers of the legions'
    },
    'brace-c8': {
        text: 'A shard of the Forge, thrown by someone who knows exactly where it hurts most.',
        flavor: 'Small, but it always finds the crack.', insp: 'The incendiary arrows of sieges'
    },
    'brace-c9': {
        text: 'He has sworn to burn before the fire goes out. He pays in his own skin what he cannot pay in gold.',
        flavor: 'He pays in skin what he lacks in gold.', insp: 'The medieval flagellants'
    },
    'brace-c10': {
        text: 'She stays motionless on the walls, wrapped in smoke. She moves only when her Seal falls.',
        flavor: 'She moves only when everything crumbles.', insp: 'The sentinels of Pompeii who stayed at their post'
    },
    'brace-u5': {
        text: 'In the ashes of the battlefield he finds his fury. The more he burns, the more he fights.',
        flavor: 'The more he burns, the more he fights.', insp: 'The Norse berserkers'
    },
    'brace-u6': {
        text: "A pyre lit every evening on the walls. The smoke seeks out the weakest enemy and smothers them.",
        flavor: 'The smoke always finds the weakest.', insp: 'The votive fires of ancient temples'
    },
    'brace-u7': {
        text: 'He has fought under every sky, and every omen reminds him of a victory.',
        flavor: 'Every sky reminds him of a victory.', insp: 'The veterans of the Punic Wars'
    },
    'brace-r4': {
        text: 'Born in the heart of the Mountain, he flies over the walls and rains fire on those who defend them.',
        flavor: 'Where he passes, walls no longer matter.', insp: 'Fáfnir and the dragons of the sagas'
    },
    'brace-r5': {
        text: "When Vulkara loses his patience, an entire lane turns to lava.",
        flavor: 'An entire lane turns to lava.', insp: 'Vesuvius in 79 AD'
    },
    'brace-r6': {
        text: 'He carries the standard and the war cry. Wherever he arrives, every Guardian finds their fire again.',
        flavor: 'Wherever he arrives, the fire rises again.', insp: 'The heralds of medieval tournaments'
    },
    'brace-l2': {
        text: 'The giant who, in legend, will bring fire at the end of the world. In the Rosa, he brings it now.',
        flavor: 'The fire of the end, brought now.', insp: 'Surtr of Ragnarök'
    },
    'brace-l3': {
        text: 'The forge that never goes out. Whoever works beside her does everything faster.',
        flavor: 'Whoever works beside her never tires.', insp: 'The forge of Hephaestus'
    },

    // ---------- Tide (Marea) ----------
    'marea-c0': {
        text: "A prank of the Nereids: it sends back to shore what the sea doesn't want.",
        flavor: "The sea rejects what it doesn't like.", insp: 'The Nereids'
    },
    'marea-c1': {
        text: 'He casts his net into the fog and fishes up the memories of lost sailors. Once he pulled up a sealed jar: he threw it back without opening it, and it was the wisest thing he ever did.',
        flavor: 'He fishes memories from the fog, and throws some back.', insp: 'The fisherman and the genie, from the Thousand and One Nights'
    },
    'marea-c2': {
        text: 'The eels of the bay swim to a distant sea to be born and to die. No one has ever seen them return, and yet they always do.',
        flavor: 'No one has ever seen them return.', insp: 'The mystery of eels and the Sargasso Sea'
    },
    'marea-c3': {
        text: 'Soldiers drowned during the fall of Atlantis, slowly turned to coral. They still guard doors that no one opens anymore.',
        flavor: 'They guard doors that no one opens anymore.', insp: "Atlantis in Plato's account"
    },
    'marea-c4': {
        text: "The undertow takes away and gives back. Old sailors say it counts every stone, to know if it's been a good day.",
        flavor: 'It takes away, gives back, counts.', insp: 'The songs of sailors'
    },
    'marea-c5': {
        text: 'Whoever looks at her too long freezes like stone, if only for an instant. She is all that remains of an ancient Gorgon\'s gaze.',
        flavor: 'One look, and time stops.', insp: 'Medusa and the Gorgons'
    },
    'marea-u0': {
        text: "She reads the future in pearls but speaks only in riddles. Three times she has foretold Nyxa's return, and three times no one believed her.",
        flavor: 'She always tells the truth. No one ever believes her.', insp: 'Cassandra and Proteus, the old man of the sea'
    },
    'marea-u1': {
        text: 'The curse of one who offended the sea: every time the shore is near, the current carries him back out.',
        flavor: 'The shore is always a little further away.', insp: 'Odysseus persecuted by Poseidon'
    },
    'marea-u2': {
        text: 'The last lighthouse of Atlantis still shines beneath the waves, guiding ships that no longer exist.',
        flavor: 'It guides ships that no longer exist.', insp: 'The Lighthouse of Alexandria and Atlantis'
    },
    'marea-u3': {
        text: 'A turtle so ancient that an island has grown on her shell. Monks once landed to say Mass, believing her to be land.',
        flavor: 'Someone built a church on her back.', insp: 'Saint Brendan and the island that moved'
    },
    'marea-r0': {
        text: 'The whirlpool between the two cliffs. Sail too close to one and you meet the monster; too close to the other, the vortex.',
        flavor: 'Between the monster and the vortex.', insp: 'Scylla and Charybdis'
    },
    'marea-r1': {
        text: 'Still a pup, she is already larger than a fleet. Her mother sleeps on the ocean floor, coiled around the roots of the world.',
        flavor: 'Still a pup, already bigger than a fleet.', insp: "The Leviathan and the world serpent Jörmungandr"
    },
    'marea-r2': {
        text: 'He has sailed ten years to get home and has stopped counting them. His ships obey the wind before he even speaks.',
        flavor: "Ten years to get home. He'll make it.", insp: 'Odysseus'
    },
    'marea-l0': {
        text: 'Queen of the oldest sea, she sings for the shipwrecked and calls them to her. Her song kept Nyxa away from the coasts for a thousand years.',
        flavor: 'Her song keeps the Night away.', insp: 'The Sirens and Thalassa, the spirit of the sea'
    },
    'marea-l1': {
        text: 'The flood that washed the world after the First Night. They say it will return when the last Seal breaks.',
        flavor: 'It will return when the last Seal falls.', insp: 'The Flood of Gilgamesh and of Noah'
    },
    'marea-c6': {
        text: 'He follows ships to the shoals and cries out when the seabed draws near. Sailors consider him a good omen.',
        flavor: 'He cries out when the seabed draws near.', insp: "The sailors' gull"
    },
    'marea-u4': {
        text: 'When the tide rises, every step costs twice as much. The Tide invoke her to slow down whoever pursues them.',
        flavor: 'Every step costs twice as much.', insp: 'King Canute and the tide that would not obey'
    },
    'marea-r3': {
        text: 'She sings for whoever listens, and the enemy forgets to fight. Thalassa taught her a single song.',
        flavor: 'One song, and the enemy forgets.', insp: 'The Sirens of Ulysses'
    },
    'marea-c7': {
        text: 'It rises out of nowhere, sweeps away anyone not well planted, and returns to the sea as if nothing happened.',
        flavor: 'It rises from nothing, returns to nothing.', insp: "The rogue waves of sailors' tales"
    },
    'marea-c8': {
        text: 'He closes his claws in front of his companions and waits. No one has ever managed to pry them open.',
        flavor: 'No one has ever opened his claws.', insp: 'The crab of Heracles and the Hydra'
    },
    'marea-c9': {
        text: 'She dives only when the sky sends a sign. When it does, she always comes back with something.',
        flavor: 'She dives only when the sky speaks.', insp: 'The pearl divers of the Gulf'
    },
    'marea-c10': {
        text: 'A fog that tastes of salt and makes you forget where you were going.',
        flavor: 'It makes you forget where you were going.', insp: 'The mists of Avalon'
    },
    'marea-u5': {
        text: 'He explores the side currents and surfaces where no one expects him.',
        flavor: "He always surfaces where you don't expect him.", insp: 'Triton, messenger of the sea'
    },
    'marea-u6': {
        text: 'The anchor of a sunken ship. It still holds fast whoever passes near it.',
        flavor: 'It still holds fast whoever passes near.', insp: 'The anchor of the Ship of Theseus'
    },
    'marea-u7': {
        text: 'She reads the currents like a book. When a Seal falls, she already knows what comes next.',
        flavor: 'She already knows what comes next.', insp: 'Circe and the witches of the sea'
    },
    'marea-r4': {
        text: 'He has slept on the seabed for a thousand years. When he wakes, the whole sea holds its breath.',
        flavor: 'The sea holds its breath.', insp: 'The Kraken of Scandinavian legend'
    },
    'marea-r5': {
        text: 'The tide that turns back at the worst possible moment, leaving the enemy empty-handed.',
        flavor: 'It turns back at the worst moment.', insp: 'The parting of the Red Sea'
    },
    'marea-r6': {
        text: 'She reigns over the shoals where ships run aground. Whoever serves her never sinks.',
        flavor: 'Whoever serves her does not sink.', insp: 'Amphitrite, queen of the sea'
    },
    'marea-l2': {
        text: 'The monster of the strait: six heads, twelve arms, and no mercy for whoever sails too close.',
        flavor: 'No mercy for whoever sails close.', insp: "Scylla of the Odyssey"
    },
    'marea-l3': {
        text: "The wonder of the ancient world, reborn in the Rosa. Its light shows a new path every day.",
        flavor: 'A new path every day.', insp: 'The Lighthouse of Alexandria'
    },

    // ---------- Root (Radice) ----------
    'radice-c0': {
        text: "It sprouts from the cracks in the Cathedral's pavement. The keepers pull it up every morning; every evening it's back.",
        flavor: "They pull it up every morning. Every evening it's back.", insp: 'The tale of the stubborn seed'
    },
    'radice-c1': {
        text: 'He has slept so long in the forest that the moss mistook him for a rock. Now he talks to the Seals like old friends.',
        flavor: 'He talks to the Seals like old friends.', insp: 'The Celtic Druids and Merlin'
    },
    'radice-c2': {
        text: 'Descendant of the boar that no hunter ever managed to fell. Where he passes, the bramble grows back thicker.',
        flavor: 'Where he passes, the bramble grows back thicker.', insp: 'The Calydonian Boar'
    },
    'radice-c3': {
        text: 'The blessing of the Oak: a skin of bark that withstands the blade as well as time.',
        flavor: 'It withstands the blade as well as time.', insp: 'Daphne transformed into laurel'
    },
    'radice-c4': {
        text: 'She has hunted in the woods since before names existed. She has never missed a target, except for one bramble boar she still chases.',
        flavor: 'She has never missed a target. Except one.', insp: 'Artemis the huntress and Robin Hood'
    },
    'radice-c5': {
        text: 'A drop of dew that falls from Yggrin. Whoever drinks it remembers they are alive.',
        flavor: 'Whoever drinks it remembers they are alive.', insp: 'The dew of the world tree in the Edda'
    },
    'radice-u0': {
        text: "The sacred oaks used to listen to pilgrims' questions. This one, tired of listening, started answering.",
        flavor: 'Tired of listening, she started answering.', insp: 'The talking oaks of the oracle of Dodona'
    },
    'radice-u1': {
        text: "Mushrooms are the forest's underground memory: every spore carries a memory to a distant tree.",
        flavor: 'Every spore carries a memory.', insp: 'Fairy rings'
    },
    'radice-u2': {
        text: 'No one knows who raised the stones, but everyone knows not to count them: the number changes every time.',
        flavor: "Don't count them. The number changes.", insp: 'Stonehenge and the stones that refuse to be counted'
    },
    'radice-u3': {
        text: 'She nursed two twins abandoned on a riverbank, who went on to found a city. Her wild brothers still chase the sun and the moon across the sky.',
        flavor: 'She protects those who have no one.', insp: 'The Capitoline Wolf of Romulus and Remus'
    },
    'radice-r0': {
        text: 'For a hundred years it wound around the tower of a sleeping princess. When she left, the vine stayed behind to wait.',
        flavor: 'A hundred years of waiting. It can wait a hundred more.', insp: 'Sleeping Beauty'
    },
    'radice-r1': {
        text: "Every spring the daughter of the Earth rises from the underworld, and the fields are reborn at her passing.",
        flavor: 'Every spring, she returns.', insp: 'Persephone and Demeter'
    },
    'radice-r2': {
        text: 'A huntress turned into a bear and then carried among the stars. She comes down to earth only to protect her cubs.',
        flavor: 'She comes down from the stars for her cubs.', insp: 'Callisto and the Great Bear'
    },
    'radice-l0': {
        text: 'Its roots touch all three worlds: the land of the living, the bottom of the sea, and the well of the Night. When it walks, the whole world creaks.',
        flavor: 'When it walks, the world creaks.', insp: 'Yggdrasil, the Norse world tree'
    },
    'radice-l1': {
        text: "The seed from which Yggrin sprouted. The Moss Druid keeps it, to plant at the start of the next age.",
        flavor: "Tomorrow's world, in a fist.", insp: 'The cosmic egg and the seed of the world'
    },
    'radice-c6': {
        text: "He watches over the springs where Yggrin's sap is born. Whoever drinks there feels their strength grow.",
        flavor: 'Where he drinks, strength grows.', insp: 'The nymphs of the springs'
    },
    'radice-u4': {
        text: 'Small, slow, and patient. A single bite is enough, even for the largest of boars.',
        flavor: 'One bite is enough.', insp: "Cleopatra's asp"
    },
    'radice-r3': {
        text: 'Whoever sees him in the woods finds their way home. Whoever hunts him finds nothing ever again.',
        flavor: 'Whoever sees him finds their way home.', insp: 'The white stag of Arthurian legend'
    },
    'radice-c7': {
        text: 'It grows slowly on the stones of the Seals and never lets go again.',
        flavor: 'Slow, but it never lets go again.', insp: 'The moss on the stones of Stonehenge'
    },
    'radice-c8': {
        text: 'A seed carried by the wind. Wherever it lands, the earth grows more generous.',
        flavor: 'Wherever it lands, the earth gives.', insp: 'The parable of the sower'
    },
    'radice-c9': {
        text: 'Still young, but he senses the omens before the grown wolves do.',
        flavor: 'He senses the omen before the others.', insp: 'The wolves of Gubbio'
    },
    'radice-c10': {
        text: 'She gathers herbs at the feet of the Seals and uses them to heal their cracks.',
        flavor: 'She heals cracks with herbs.', insp: 'Hildegard of Bingen'
    },
    'radice-u5': {
        text: 'A tree that took to walking to defend the forest. What wounds it feeds it.',
        flavor: 'What wounds it feeds it.', insp: 'The Ents and the guardian trees'
    },
    'radice-u6': {
        text: 'A ring of mushrooms that widens every night. Whoever enters does not leave alone.',
        flavor: 'Whoever enters does not leave alone.', insp: 'The fairy rings of Irish folklore'
    },
    'radice-u7': {
        text: 'He charges when all seems lost. Rage makes him bigger.',
        flavor: 'Rage makes him bigger.', insp: 'The Calydonian boar'
    },
    'radice-r4': {
        text: 'She has lived since before the Seals. When she speaks, the forest grows and the cracks close.',
        flavor: 'When she speaks, the forest grows.', insp: 'The dryads of Greek mythology'
    },
    'radice-r5': {
        text: "The wardens' horn echoes among the trees, and every creature of the forest answers.",
        flavor: 'Every creature of the forest answers.', insp: 'The horn of Roland'
    },
    'radice-r6': {
        text: "He leads the forest's packs. Every wound his kin inflict returns to the earth as sap.",
        flavor: 'Every wound returns to the earth.', insp: 'Cernunnos, the horned god'
    },
    'radice-l2': {
        text: 'The oldest oak in the world has risen. No one moves it, no one gets past it.',
        flavor: 'No one moves it, no one gets past it.', insp: 'The oak of Dodona'
    },
    'radice-l3': {
        text: 'The spring that never ends. Every wound closes, every Seal breathes.',
        flavor: 'Every wound closes.', insp: 'Persephone and the return of spring'
    },

    // ---------- Void (Vuoto) ----------
    'vuoto-c0': {
        text: 'He handed his own name over to the Night in exchange for a candle that never goes out. Its light is black.',
        flavor: 'He gave his name for a black candle.', insp: 'The mystery cults'
    },
    'vuoto-c1': {
        text: 'A shadow that fled its master and now seeks a body to imitate. It hungers for shape, for weight, for footsteps.',
        flavor: 'A shadow fled from its master, starving for shape.', insp: "Andersen's shadow and Peter Pan's"
    },
    'vuoto-c2': {
        text: "A contract signed in blood: years of knowledge in exchange for a soul. No one has ever read every clause.",
        flavor: 'No one has ever read every clause.', insp: 'The pact of Faust'
    },
    'vuoto-c3': {
        text: 'Leaving the underworld, he turned to look back, and lost what he loved. Now he wanders back and forth, never finding peace.',
        flavor: 'He looked back once. That was enough.', insp: 'Orpheus and Eurydice'
    },
    'vuoto-c4': {
        text: "An eye left as collateral at the bottom of the well beneath Yggrin's roots, in exchange for wisdom. It sees everything, except the one who gave it.",
        flavor: 'It sees everything, except who gave it.', insp: 'Odin and the well of Mímir'
    },
    'vuoto-c5': {
        text: 'The voice that first spoke to the heart of a jealous king. One word in the right ear is enough to disarm an army.',
        flavor: 'One word, in the right ear.', insp: "Iago in Shakespeare's Othello"
    },
    'vuoto-u0': {
        text: "She gathers what's left on the field after every battle. She's in no hurry: everything ripens, sooner or later.",
        flavor: "She's in no hurry. Everything ripens.", insp: 'The Morrígan and the Grim Reaper'
    },
    'vuoto-u1': {
        text: "The song that convinced the queen of the underworld to give back a soul. It always works, as long as you don't turn around.",
        flavor: "It always works, if you don't turn around.", insp: 'Orpheus and Eurydice'
    },
    'vuoto-u2': {
        text: 'The first blood was spilled on the altar of the First Night. The crack widens every time someone kneels there.',
        flavor: 'The crack widens with every prayer.', insp: 'The sacrifice of Iphigenia'
    },
    'vuoto-u3': {
        text: "He stole the Hollow Sovereign's soul and hid it in a needle, inside an egg, inside a duck, inside a chest.",
        flavor: 'A needle, in an egg, in a duck, in a chest.', insp: 'Koschei the Deathless'
    },
    'vuoto-r0': {
        text: 'The wolf of the Night who chases the stars. He has already devoured enough to darken half the sky; his sister wolf, down on earth, has never forgiven him.',
        flavor: 'He has already devoured half the sky.', insp: 'The wolves Sköll and Hati of Norse myth'
    },
    'vuoto-r1': {
        text: 'The day the wolf caught the sun. It lasted only a few minutes, but no one who saw it ever slept soundly again.',
        flavor: 'The day the wolf caught the sun.', insp: 'Sköll devouring the sun'
    },
    'vuoto-r2': {
        text: 'A king who hid his own soul so he would never die. He succeeded: now he doesn\'t even live.',
        flavor: "He will never die. He doesn't even live.", insp: 'Koschei the Deathless'
    },
    'vuoto-l0': {
        text: 'The Night that came before the world. She was chained by the Seals of the Rosa Arcana, but every broken Seal loosens a chain.',
        flavor: 'Every broken Seal loosens a chain.', insp: 'Nyx, the primordial Night of Hesiod'
    },
    'vuoto-l1': {
        text: 'What will remain when the last Seal falls: no screams, no songs, no wind.',
        flavor: 'No screams. No songs. No wind.', insp: 'Ragnarök and the great winter Fimbulvetr'
    },
    'vuoto-c6': {
        text: "He copies every spell he hears onto the crypt's walls. His library has no doors.",
        flavor: 'A library with no doors.', insp: 'The scriptoria and forbidden books'
    },
    'vuoto-u4': {
        text: 'He sleeps hanging from the crypt\'s vaults and wakes only when he smells blood.',
        flavor: 'He wakes at the scent of blood.', insp: 'Crypt bats and vampires'
    },
    'vuoto-r3': {
        text: 'When the wolf fully covers the sun, weak things stop existing.',
        flavor: 'Weak things stop existing.', insp: 'Fimbulvetr and the devoured sun'
    },
    'vuoto-c7': {
        text: 'She has just taken her vows. Her first sacrifice will also be her last.',
        flavor: 'The first sacrifice is the last.', insp: 'The novices of the monasteries'
    },
    'vuoto-c8': {
        text: 'You offer something to the Void, and the Void gives back strength. The bill always comes.',
        flavor: 'The bill always comes.', insp: 'Tributes to the gods of the underworld'
    },
    'vuoto-c9': {
        text: "The bones reassemble every time. They don't remember why they fight, but they never stop.",
        flavor: 'The bones always reassemble.', insp: 'The skeletons of the Argonauts'
    },
    'vuoto-c10': {
        text: 'A whisper that rises from the well and brings what you seek. Sometimes too quickly.',
        flavor: 'It brings what you seek.', insp: 'The well of Mímir'
    },
    'vuoto-u5': {
        text: 'He calls the smallest of the dead, the ones no one mourns, and sets them back on their feet.',
        flavor: 'He raises up those no one mourns.', insp: 'Medieval necromancy'
    },
    'vuoto-u6': {
        text: 'He keeps the bones of saints and of the damned. Every death near him whispers a secret.',
        flavor: 'Every death whispers a secret to him.', insp: 'The reliquaries of gothic cathedrals'
    },
    'vuoto-u7': {
        text: 'She prays in silence and waits. When a Seal breaks, her prayers are answered.',
        flavor: 'Her prayers are answered.', insp: 'The priestesses of Hecate'
    },
    'vuoto-r4': {
        text: 'He feeds on the souls of his companions. Every soul makes him bigger, and more hollow.',
        flavor: 'Bigger, and more hollow.', insp: 'The soul-devourers of Egyptian legend'
    },
    'vuoto-r5': {
        text: 'A pact signed in the shadows: the enemy falls, but your own house trembles too.',
        flavor: 'The enemy falls, and your house trembles.', insp: 'The pact of Faust'
    },
    'vuoto-r6': {
        text: 'He leads the liturgy of silence. His faithful, even dead, always return to pray.',
        flavor: 'Even dead, they return to pray.', insp: 'The inquisitors and rites of death'
    },
    'vuoto-l2': {
        text: 'The queen of the realm of the dead opens the gates, and her subjects return to fight.',
        flavor: 'She opens the gates, and the dead return.', insp: 'Hel of Norse mythology'
    },
    'vuoto-l3': {
        text: 'The oldest pact: one life every dawn, in exchange for fire upon the enemy Seals.',
        flavor: 'One life every dawn.', insp: 'Sacrifices to the sun gods'
    },

    // ---------- Tokens ----------
    'tok-germoglio': {
        text: "Born from a spore, it doesn't yet know what it will become.",
        flavor: "It doesn't yet know what it will become.", insp: 'Fairy rings'
    },
    'tok-cucciolo': {
        text: 'He follows his mother everywhere, even into battle.',
        flavor: 'He follows his mother everywhere.', insp: 'Callisto and the Little Bear'
    },
};
