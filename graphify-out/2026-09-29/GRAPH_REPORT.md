# Graph Report - rosarcana  (2026-09-29)

## Corpus Check
- 130 files · ~3,865,341 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1211 nodes · 4357 edges · 51 communities (49 shown, 2 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 405 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e7c3a2f9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui.ts
- PackOpening.tsx
- Radice Suit (Root House)
- battle/store.ts
- Brace C4 - Armored Knight with Burning Banner
- devDependencies
- state.ts
- AdventureScreen.tsx
- ManaCurve.tsx
- useT
- Preview.tsx
- useProfile
- Card.tsx
- profile/store.ts
- Marea R2 - Drowned Warden with Trident Staff on the Wreck
- Shop Backdrop (Candlelit Reliquary Wall of Card Cases)
- Vuoto (Void) Suit
- Four-House Color Palette (Red / Teal / Green / Violet)
- PlayScreen.tsx
- Card Back: Radici (Glowing Root Knot in Verdant Frame)
- God Rays / Descending Light Shafts
- compilerOptions
- Card Frame Overlay (Transparent-Center Border Asset)
- Legendary entrance reveal
- useLang
- constants.ts
- Set Base (120 cards)
- confirmBuy.tsx
- emoteStore.ts
- CardDetail.tsx
- Solid black centre and background convention
- economy/ packs, odds, pity, rewards, decks
- Site batch 2: Custodi del Sigillo portraits (1:1)
- Sigilli (three lanes, three seals per side)
- Game modes (Arena, Spedizione, Allenamento, Prove)
- Casata Radice (root/forest faction)
- generate-art.mjs
- Options and accessibility
- engine/ pure rules engine
- extract-icons.mjs
- Framer Motion animation layer
- DecksScreen.tsx
- ArenaScreen.tsx
- CustodeId
- Codex.tsx
- stories.ts
- names.ts
- decks.ts
- Faction
- ModesScreens.tsx

## God Nodes (most connected - your core abstractions)
1. `useT()` - 109 edges
2. `useBattle` - 100 edges
3. `useProfile` - 94 edges
4. `useLang()` - 73 edges
5. `cardName()` - 46 edges
6. `Faction` - 44 edges
7. `cardInfo()` - 35 edges
8. `lookOf()` - 35 edges
9. `W` - 30 edges
10. `Card` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Legendary entrance reveal` --references--> `Yggrin, l'Albero che Cammina (radice-l0)`  [INFERRED]
  README.md → art/PROMPT-CARTE.txt
- `Legendary entrance reveal` --references--> `Nyxa, Regina del Nulla (vuoto-l0)`  [INFERRED]
  README.md → art/PROMPT-CARTE.txt
- `Legendary entrance reveal` --references--> `Thalassa, Voce degli Abissi (marea-l0)`  [INFERRED]
  README.md → art/PROMPT-CARTE.txt
- `Vulkara, Cuore del Monte (brace-l0)` --references--> `Casata Brace (ember/forge faction)`  [INFERRED]
  art/PROMPT-CARTE.txt → README.md
- `Legendary entrance reveal` --references--> `Vulkara, Cuore del Monte (brace-l0)`  [INFERRED]
  README.md → art/PROMPT-CARTE.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **All AI art prompt families share one gothic dark-fantasy style contract** — art_prompt_carte_stile_comune, art_prompt_carte_full_art_verticale, art_prompt_illustrazioni_mancanti_illustrazioni_mancanti, art_prompt_nuove_carte_dodici_nuove_carte, art_prompt_sito_custodi_del_sigillo, art_prompt_sito_casate, art_prompt_cornici_black_center_convention [EXTRACTED 1.00]
- **Living Creature Cards vs Landscape Cards in Radice** — src_assets_art_radice_r2, src_assets_art_radice_u3, src_assets_art_radice_u1 [INFERRED 0.65]
- **High-Rarity Mythic Fire Scenes** — src_assets_art_brace_l0, src_assets_art_brace_l1, src_assets_art_brace_r0 [INFERRED 0.75]
- **Human Agents Channeling Fire** — src_assets_art_brace_c1, src_assets_art_brace_c2, src_assets_art_brace_c3, src_assets_art_brace_c4, src_assets_art_brace_c5 [INFERRED 0.75]
- **Match Flow Screen Art (Mode Pick to Play Surface)** — src_assets_site_modo_casual, src_assets_site_modo_classificata, src_assets_site_tavolo, motif_game_mode_selection_tile [INFERRED 0.75]
- **Unified Dark-Fantasy Art Direction Across Site Illustrations** — motif_chiaroscuro_dark_fantasy_painting, motif_ornate_border_frame, motif_centered_radial_emblem, motif_elemental_color_coding, motif_ember_and_fire_glow [INFERRED 0.75]
- **Adventure Mode Asset Set (Four Character Portraits plus World Map)** — src_assets_site_avv_frate, src_assets_site_avv_garra, src_assets_site_avv_ortica, src_assets_site_avv_pescatore, src_assets_site_avventura_mappa [INFERRED 0.85]
- **Brace Common Card Set (c0-c5)** — src_assets_art_brace_c0, src_assets_art_brace_c1, src_assets_art_brace_c2, src_assets_art_brace_c3, src_assets_art_brace_c4, src_assets_art_brace_c5 [INFERRED 0.85]
- **Card cosmetics: three independent axes plus mastery unlocks** — readme_personalizzazione_carte, readme_stili_carta, readme_maestria, art_prompt_cornici_cornici_di_maestria, art_prompt_cornici_cornici_acquistabili, art_prompt_cornici_dorsi_dorsi_delle_carte, readme_image_override [INFERRED 0.85]
- **Four Casate drive cards, lords, art settings and AI opponents** — readme_casata_brace, readme_casata_marea, readme_casata_radice, readme_casata_vuoto, readme_signori_di_casata, readme_ultimo_rintocco, art_prompt_sito_casate, art_prompt_cornici_dorsi_dorsi_delle_carte [INFERRED 0.85]
- **Cathedral Scene Art Direction (Shared Setting, Lighting and Palette)** — src_assets_site_home_hero, src_assets_site_modo_classificata, src_assets_site_modo_casual, src_assets_site_negozio, src_assets_site_tavolo [INFERRED 0.85]
- **Humanoid Presences of the Vuoto Suit** — src_assets_art_vuoto_c0, src_assets_art_vuoto_c3, src_assets_art_vuoto_c5, src_assets_art_vuoto_l0 [INFERRED 0.85]
- **Vertical Light-Shaft Composition Family** — src_assets_art_tok_germoglio, src_assets_art_vuoto_c2, src_assets_art_vuoto_c3, src_assets_art_vuoto_c5 [INFERRED 0.85]
- **Marea Underwater Triptych - Storm, Drowned Tower, Leviathan** — src_assets_art_marea_u1, src_assets_art_marea_u2, src_assets_art_marea_u3, motif_teal_underwater_palette, motif_god_rays_shaft_light [INFERRED 0.85]
- **Mortal Figure Dwarfed by an Elemental Force (Cross-Suit Composition Pattern)** — src_assets_art_brace_r2, src_assets_art_brace_u3, src_assets_art_brace_u0, src_assets_art_marea_c0, src_assets_art_marea_c1 [INFERRED 0.85]
- **Colossal Ancient Tree Set of the Radice Suit** — src_assets_art_radice_l0, src_assets_art_radice_u0, src_assets_art_radice_r0 [INFERRED 0.85]
- **Radice Sacred Grove Cycle - Sapling, Druid, Boar, Treant, Archer, Sap** — src_assets_art_radice_c0, src_assets_art_radice_c1, src_assets_art_radice_c2, src_assets_art_radice_c3, src_assets_art_radice_c4, src_assets_art_radice_c5, motif_amber_green_forest_palette [INFERRED 0.85]
- **Sacred Grove Scenes - Menhirs, Moss and Shafted Light** — src_assets_art_radice_l1, src_assets_art_radice_r1, src_assets_art_radice_u2, src_assets_art_radice_r0 [INFERRED 0.85]
- **Rosone Brand Identity Across Card Back, Pack and Palette** — src_assets_site_back_rosone, src_assets_site_bustina, motif_rose_window_rosone, motif_four_house_color_palette, motif_gothic_architecture [INFERRED 0.85]
- **Shared Painterly Volumetric-Light Art Direction Across Suits** — motif_god_rays_shaft_light, motif_vertical_portrait_card_frame, motif_marea_suit, motif_radice_suit [INFERRED 0.85]
- **Sunken Civilization Backdrop Set** — src_assets_art_marea_c3, src_assets_art_marea_c4, src_assets_art_marea_l1, src_assets_art_marea_r2, src_assets_art_marea_u0 [INFERRED 0.85]
- **Tide-Bearer Character Cards (single wielder of the sea's power)** — src_assets_art_marea_l0, src_assets_art_marea_r2, src_assets_art_marea_u0 [INFERRED 0.85]
- **Transparent-Center Card Frame Asset Family (portrait-ratio PNG-style overlays)** — src_assets_site_frame_corallo, src_assets_site_frame_fornace, src_assets_site_frame_maestria_1, src_assets_site_frame_maestria_4, motif_card_frame_overlay [INFERRED 0.85]
- **Vuoto Rare Rank Family (r0-r2)** — src_assets_art_vuoto_r0, src_assets_art_vuoto_r1, src_assets_art_vuoto_r2 [INFERRED 0.85]
- **Vuoto Uncommon Rank Family (u0-u3)** — src_assets_art_vuoto_u0, src_assets_art_vuoto_u1, src_assets_art_vuoto_u2, src_assets_art_vuoto_u3 [INFERRED 0.85]
- **Vertical Light-Column Composition Across Vuoto Art** — src_assets_art_vuoto_l1, src_assets_art_vuoto_u0, src_assets_art_vuoto_u1, src_assets_art_vuoto_u2, src_assets_art_vuoto_r2 [INFERRED 0.85]
- **Brace House Visual Identity: Ember Palette, Fire Iconography, Backlit Silhouettes** — src_assets_art_brace_r1, src_assets_art_brace_r2, src_assets_art_brace_u0, src_assets_art_brace_u1, src_assets_art_brace_u2, src_assets_art_brace_u3, motif_molten_ember_palette [INFERRED 0.95]
- **Five-Suit Card Back Set (Abissi, Codice, Eclisse, Fornace, Radici)** — src_assets_site_back_abissi, src_assets_site_back_codice, src_assets_site_back_eclisse, src_assets_site_back_fornace, src_assets_site_back_radici [INFERRED 0.95]
- **Portrait Card Frame Overlay Set (Rarity / Cosmetic Variants)** — src_assets_site_frame_maestria_5, src_assets_site_frame_maestria_6, src_assets_site_frame_notte, src_assets_site_frame_radici, src_assets_site_frame_reliquia, src_assets_site_frame_rosone [INFERRED 0.95]
- **Custode Guardian Portrait Roster (dark painterly bust set)** — src_assets_site_custode_nocchiero, src_assets_site_custode_traghettatore, src_assets_site_custode_uomoverde, src_assets_site_custode_vesta, motif_guardian_portrait [INFERRED 0.95]
- **Four House Key-Art Set (Brace / Marea / Radice / Vuoto)** — src_assets_site_casata_brace, src_assets_site_casata_marea, src_assets_site_casata_radice, src_assets_site_casata_vuoto, motif_four_house_color_palette [INFERRED 0.95]
- **Guardian Portrait Set (Cassandra / Ecate / Ladro / Madre)** — src_assets_site_custode_cassandra, src_assets_site_custode_ecate, src_assets_site_custode_ladro, src_assets_site_custode_madre, motif_ui_role_guardian_portrait [INFERRED 0.95]
- **Marea House Visual Identity: Turquoise Depths, Submerged Ruins, Light Through Water** — src_assets_art_marea_c0, src_assets_art_marea_c1, src_assets_art_marea_c2, motif_turquoise_abyss_palette, motif_god_rays [INFERRED 0.95]
- **Marea (Tide) Suit Illustration Cycle** — src_assets_art_marea_c3, src_assets_art_marea_c4, src_assets_art_marea_c5, src_assets_art_marea_l0, src_assets_art_marea_l1, src_assets_art_marea_r0, src_assets_art_marea_r1, src_assets_art_marea_r2, src_assets_art_marea_u0 [INFERRED 0.95]
- **Mastery Tier Frame Ladder (bronze to pearl progression)** — src_assets_site_frame_maestria_1, src_assets_site_frame_maestria_2, src_assets_site_frame_maestria_3, src_assets_site_frame_maestria_4, motif_mastery_tier_progression [INFERRED 0.95]
- **Vuoto Suit C-Rank Card Ladder (c0-c5)** — src_assets_art_vuoto_c0, src_assets_art_vuoto_c1, src_assets_art_vuoto_c2, src_assets_art_vuoto_c3, src_assets_art_vuoto_c4, src_assets_art_vuoto_c5 [INFERRED 0.95]

## Communities (51 total, 2 thin omitted)

### Community 0 - "ui.ts"
Cohesion: 0.17
Nodes (11): chapterText(), EN_ART_STYLES, EN_ASCEND_TEXT, EN_CHAPTERS, EN_DIFFS, EN_FX, EN_LESSONS, EN_QUESTS (+3 more)

### Community 1 - "PackOpening.tsx"
Cohesion: 0.06
Nodes (51): Logo(), PAL, flipSfx(), artUri(), cache, IMG, Rose, ART_DEFS (+43 more)

### Community 2 - "Radice Suit (Root House)"
Cohesion: 0.15
Nodes (43): Amber-and-Green Forest Palette, Ancient Colossal Tree Bearing a Face in Its Bark, Bioluminescent Spores and Warm Ember Particles, Colossal Beast Silhouette, Forest Guardian Beast Portrait, Glowing Green Luminous Relic at Scene Center, God Rays - Volumetric Light Shafts Through Canopy, God Rays / Crepuscular Shaft Light (+35 more)

### Community 3 - "battle/store.ts"
Cohesion: 0.08
Nodes (41): SEAL_PAL, hasAttackTarget(), BattleScreen(), Coach(), TurnClock(), H, Lane(), LegendEntrance() (+33 more)

### Community 4 - "Brace C4 - Armored Knight with Burning Banner"
Cohesion: 0.14
Nodes (42): Amber-Red Chiaroscuro Palette, Armored Warrior Figure, Motif: Ascending Apparition, Brace Suit (Fire House), Common Rank Family (c-prefix), Fire and Ember Motif, Legendary Rank Family (l-prefix), Lone Silhouetted Figure Against Blaze (+34 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (40): d3-delaunay, framer-motion, @iconify-json/game-icons, dependencies, d3-delaunay, framer-motion, react, react-dom (+32 more)

### Community 6 - "state.ts"
Cohesion: 0.05
Nodes (114): decodeDeck(), encodeDeck(), actions(), aiChoose(), aiDeck(), apply(), bestAction(), evaluate() (+106 more)

### Community 7 - "AdventureScreen.tsx"
Cohesion: 0.12
Nodes (29): CardArt, AdventureScreen(), copy(), Tab, UNITS, CommunityStories(), newChapter(), Adventure (+21 more)

### Community 9 - "useT"
Cohesion: 0.14
Nodes (20): CUSTODI, CustodeBadge(), usage(), Floaters(), CrystalPool(), Crystals(), fmt(), PlayerBar() (+12 more)

### Community 11 - "Preview.tsx"
Cohesion: 0.18
Nodes (14): LANE_NAME, activeSynergies(), Game, Log(), Preview(), ReplayBar(), BattleState, ReplayFrame (+6 more)

### Community 12 - "useProfile"
Cohesion: 0.12
Nodes (28): App(), Tab, TABS, SvgDefs(), packPrice(), autoDeck(), countMap(), deckIssues() (+20 more)

### Community 13 - "Card.tsx"
Cohesion: 0.10
Nodes (27): Card, CardMention, EN_KW_LIST, KW_RE_EN, KW_SHORT, kwIcon(), LEAD_KW_EN, RichText() (+19 more)

### Community 14 - "profile/store.ts"
Cohesion: 0.11
Nodes (28): backName(), rewardLabel(), CUST_MISSIONS, CUST_REWARD, custDone(), CustProgress, starterDecks(), starterOwned() (+20 more)

### Community 15 - "Marea R2 - Drowned Warden with Trident Staff on the Wreck"
Cohesion: 0.28
Nodes (24): Abyssal Leviathan / Colossal Sea Creature, Bioluminescent Glow Source, Crashing Wave / Churning Surf Foreground, Drowned Ruins and Submerged Architecture, Godray Light Shafts Piercing Water, Marea - Tide House / Water Suit, Shipwreck Hulls and Broken Masts, Solitary Robed Figure as Focal Subject (+16 more)

### Community 16 - "Shop Backdrop (Candlelit Reliquary Wall of Card Cases)"
Cohesion: 0.18
Nodes (24): Candlelit Warm Amber Palette, Card Collection Display / Shop Shelving, Dark Fantasy Painterly Illustration Style, Full-Bleed Scene Backdrop Behind UI (UI Role), Game Mode Selection Tile (UI Role), Gemstone Inlay and Metal Filigree Ornament, Gothic Cathedral Architecture, Mastery Tier Progression Frame (+16 more)

### Community 17 - "Vuoto (Void) Suit"
Cohesion: 0.24
Nodes (24): Constellation and Starfield Iconography, Contained Soul-Light (Vessel, Altar, Harvested Sparks), Crowned Skull / Hollow Monarch, Crumbling Crypts and Gothic Ruins, Eclipsed Orb / Black Sun, Grasping Hand Reaching Upward, Lone Small Figure Dwarfed by Vast Architecture, Legendary Rank Family (l-suffix art) (+16 more)

### Community 18 - "Four-House Color Palette (Red / Teal / Green / Violet)"
Cohesion: 0.18
Nodes (23): Chiaroscuro Painterly Portrait, Ember and Living Fire, Four-House Color Palette (Red / Teal / Green / Violet), Gothic Cathedral Architecture, Hooded Cloaked Figure, Lone Figure Dwarfed by Vast Scene, Overgrown Nature and Ancient Stone, Rose Window (Rosone) Emblem (+15 more)

### Community 19 - "PlayScreen.tsx"
Cohesion: 0.20
Nodes (18): daysToReset(), POOL, weekIndex(), WEEKLY_REWARD, WEEKLY_WINS, WeeklyChallenge, weeklyChallenges(), custodiOf() (+10 more)

### Community 20 - "Card Back: Radici (Glowing Root Knot in Verdant Frame)"
Cohesion: 0.23
Nodes (21): UI Role: Adventure Character Portrait (512x512 Square Avatar), Visual Motif: Arcane Rose Sigil (Rosarcana Brand Mark), UI Role: Card Back (400x560 Deck Reverse), Visual Motif: Centered Radial Glowing Emblem, Visual Motif: Chiaroscuro Dark-Fantasy Painterly Style, Visual Motif: Elemental Suit Color Coding (Water/Fire/Earth/Night/Arcane), Visual Motif: Ember Sparks and Molten Glow, Visual Motif: Nature Overgrowth (Thorns, Roots, Ivy) (+13 more)

### Community 22 - "God Rays / Descending Light Shafts"
Cohesion: 0.30
Nodes (20): Dark Foreground Ledge / Stage Band at Base, God Rays / Descending Light Shafts, Lone Figure Against an Elemental Force, Molten Ember Palette (Crimson, Orange, Gold on Black), Monstrous Beast Looming over Mortals, Painterly Digital Concept-Art Portrait Card Frame, Ruined Architecture Silhouetted in Haze, Brace Suit (Ember / Fire House) (+12 more)

### Community 23 - "compilerOptions"
Cohesion: 0.10
Nodes (19): DOM, DOM.Iterable, ES2021, src, vite/client, compilerOptions, isolatedModules, jsx (+11 more)

### Community 24 - "Card Frame Overlay (Transparent-Center Border Asset)"
Cohesion: 0.27
Nodes (17): Baroque Scrollwork and Gemstone Ornamentation, Card Frame Overlay (Transparent-Center Border Asset), Chiaroscuro Darkness with Single Light Source, Elemental Frame Theming (Sea vs Fire Material Identity), Guardian (Custode) Portrait Archetype, Held Luminous Vessel (Lantern / Brazier), Mastery Tier Progression (Material Rarity Ladder), Custode Nocchiero (Helmsman Guardian Portrait) (+9 more)

### Community 26 - "Legendary entrance reveal"
Cohesion: 0.15
Nodes (15): Nyxa, Regina del Nulla (vuoto-l0), Occhio Vacuo (vuoto-c4), Thalassa, Voce degli Abissi (marea-l0), Vulkara, Cuore del Monte (brace-l0), Dorsi delle carte (card backs), Site batch 4: Casata banners (3:2), Casata Brace (ember/forge faction), Casata Marea (tide/sea faction) (+7 more)

### Community 27 - "useLang"
Cohesion: 0.21
Nodes (22): defaultArt(), Editor(), StoryEditor(), dropAt(), pointOf(), GraveView(), Hand(), OppHand() (+14 more)

### Community 28 - "constants.ts"
Cohesion: 0.10
Nodes (31): Icon(), FIRST_LEG_BY, FIRST_WIN_ORO, FOIL_CHANCE, LOSS_ORO, ODDS, PACK_GEMME, PACK_ORO (+23 more)

### Community 29 - "Set Base (120 cards)"
Cohesion: 0.19
Nodes (14): Full-art vertical 5:7 format, Horizontal 4:3 classic frame format, Sciame di Spore (radice-u1), Common art style directive, 60 missing card illustrations, 12 new card illustrations, Site batch 1: missing cards and tokens, Germoglio token (summoned by Sciame di Spore) (+6 more)

### Community 31 - "confirmBuy.tsx"
Cohesion: 0.67
Nodes (3): ConfirmBuyHost(), Req, useBuy

### Community 33 - "emoteStore.ts"
Cohesion: 0.09
Nodes (38): BELL, envGain(), glass(), init(), LEGEND_VOICE, legendSfx(), noise(), scale() (+30 more)

### Community 34 - "CardDetail.tsx"
Cohesion: 0.19
Nodes (17): files, hasIllustration(), mentionableCards(), splitCardMentions(), linksOf(), freeStyles(), levelOf(), synergiesOf() (+9 more)

### Community 35 - "Solid black centre and background convention"
Cohesion: 0.33
Nodes (10): Image-based purchasable frames, Solid black centre and background convention, Cornici acquistabili (purchasable frames), Cornici di maestria (rank frames, bronze to master), Mastery frames by rank name (Apprendista to Leggenda), Ascesa (+2/+2 after surviving 2 combats), Codex della Rosa, Image override for backs and frames (+2 more)

### Community 36 - "economy/ packs, odds, pity, rewards, decks"
Cohesion: 0.20
Nodes (10): Site batch 3: environment backgrounds (16:9), Site batch 6: booster pack illustration, Anti-farming reward gate, ARCHETYPES (10 model decks), Deck codes RDECK1:, economy/ packs, odds, pity, rewards, decks, Preset starter decks, Improved duplicate protection in packs (+2 more)

### Community 37 - "Site batch 2: Custodi del Sigillo portraits (1:1)"
Cohesion: 0.22
Nodes (10): Cassandra delle Maree, Ecate dei Crocevia, Il Ladro senza Nome (Prometeo), La Madre delle Stagioni (Demetra), Il Nocchiero delle Secche (Odisseo), Il Traghettatore (Caronte), L'Uomo Verde, Vesta, Custode della Fiamma (+2 more)

### Community 38 - "Sigilli (three lanes, three seals per side)"
Cohesion: 0.25
Nodes (9): Aggirare (bypass a defended lane), Cristalli (permanent crystal ramp), Offerta N (pay with your own Seal's life), Rintocco (trigger when your Seal breaks), Rosarcana: la guerra dei Sigilli, Sigilli (three lanes, three seals per side), Ultimo Rintocco (faction death-rattle), Vite + React 18 + TypeScript stack (+1 more)

### Community 39 - "Game modes (Arena, Spedizione, Allenamento, Prove)"
Cohesion: 0.29
Nodes (8): Eclissi (vuoto-r1), Site batch 5: mode tiles and AI opponents, Auspicio (+1/+1 in lanes with an omen), Avventura della Rosa, Game modes (Arena, Spedizione, Allenamento, Prove), Pannello autore (balance/economy simulations), Presagi di corsia (lane omens), Racconti della community (voted serials)

### Community 40 - "Casata Radice (root/forest faction)"
Cohesion: 0.29
Nodes (8): Fenice Minore (brace-r0), Il Primo Fuoco (brace-l1), Lupa Grigia (radice-u3), Orsa Madre (radice-r2), Yggrin, l'Albero che Cammina (radice-l0), Cucciolo token (summoned by Orsa Madre), Casata Radice (root/forest faction), Sincronie (14 lore-linked card pairs)

### Community 41 - "generate-art.mjs"
Cohesion: 0.25
Nodes (5): args, cfg, force, only, outDir

### Community 42 - "Options and accessibility"
Cohesion: 0.33
Nodes (6): Image-to-video looping animation prompts, Google Fonts preconnect and font set, Inline data-URI SVG rose-window favicon, index.html app shell, Options and accessibility, npm run build:single (single-file dist/index.html)

### Community 43 - "engine/ pure rules engine"
Cohesion: 0.33
Nodes (6): engine/ pure rules engine, Mulligan, Replay system, Turn clock (TURN_SECONDS / RESERVE_SECONDS), rosarcana-unity C# engine port, Zustand stores (profile + battle)

### Community 44 - "extract-icons.mjs"
Cohesion: 0.40
Nodes (4): map, out, require, set

### Community 47 - "DecksScreen.tsx"
Cohesion: 0.09
Nodes (32): FACTION_GLYPH, Glyph(), HEART, RarityGem(), StatGem(), SWORD, TYPE_GLYPH, BACK_PRICE (+24 more)

### Community 48 - "ArenaScreen.tsx"
Cohesion: 0.12
Nodes (29): ArenaScreen(), RunHub(), TYPES_ORDER, botDraft(), copyLimit(), counts(), DRAFT_COST, DRAFT_COST_GEMS (+21 more)

### Community 49 - "CustodeId"
Cohesion: 0.17
Nodes (13): OPP_NAMES, PRESETS, WeeklyRules, CustodeId, OmenId, NewGameOpts, CustomMatch, DraftState (+5 more)

### Community 50 - "Codex.tsx"
Cohesion: 0.20
Nodes (9): FACTION_LORE, LINKS, Lore, WORLD, CODEX_LEVEL, SECRETS, CARDS, EN_SECRETS (+1 more)

### Community 51 - "stories.ts"
Cohesion: 0.15
Nodes (17): AdvStage, activeEvent(), claude(), Db, EVENT_DAYS, EventSync(), EXAMPLE_STORY, LocalState (+9 more)

### Community 53 - "names.ts"
Cohesion: 0.10
Nodes (30): ART_STYLES, ArtStyle, CardLook, CRAFT_FRAMES, DEFAULT_ART, EffectId, FrameId, FRAMES (+22 more)

### Community 55 - "decks.ts"
Cohesion: 0.23
Nodes (10): Archetype, ARCHETYPES, commons(), Deck, Preset, Lang, setDataLang(), tLang() (+2 more)

### Community 57 - "Faction"
Cohesion: 0.15
Nodes (18): CardProps, Reward, CardDef, Faction, ADVENTURE, AdvNode, StoryEvent, EXP_BLESSING (+10 more)

### Community 58 - "ModesScreens.tsx"
Cohesion: 0.52
Nodes (6): expOpponent(), expOver(), expReward(), useExpedition, ExpeditionScreen(), custodeName()

## Ambiguous Edges - Review These
- `Abyssal Leviathan / Colossal Sea Creature` → `Marea C3 - Coral-Encrusted Colossus in the Drowned Chasm`  [AMBIGUOUS]
  src/assets/art/marea-c3.webp · relation: references
- `Gothic Cathedral Architecture` → `Brace C4 - Armored Knight with Burning Banner`  [AMBIGUOUS]
  src/assets/art/brace-c4.webp · relation: references
- `Verdant Palette - Emerald Greens with Warm Gold Backlight` → `Radice R2 - Great Bear and Cubs in Backlit Forest`  [AMBIGUOUS]
  src/assets/art/radice-r2.webp · relation: references
- `Brace U2 - Burning Banner on the Ridge` → `Marea C1 - Netcaster in the Drowned City`  [AMBIGUOUS]
  src/assets/art/brace-u2.webp · relation: conceptually_related_to
- `Game modes (Arena, Spedizione, Allenamento, Prove)` → `Racconti della community (voted serials)`  [AMBIGUOUS]
  README.md · relation: shares_data_with
- `Motif: Mossy Forest Sanctuary` → `Motif: Vuoto Violet-Indigo Palette`  [AMBIGUOUS]
  src/assets/art/tok-germoglio.webp · relation: semantically_similar_to
- `Image-to-video looping animation prompts` → `Options and accessibility`  [AMBIGUOUS]
  art/PROMPT-CARTE.txt · relation: conceptually_related_to

## Knowledge Gaps
- **191 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Abyssal Leviathan / Colossal Sea Creature` and `Marea C3 - Coral-Encrusted Colossus in the Drowned Chasm`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Gothic Cathedral Architecture` and `Brace C4 - Armored Knight with Burning Banner`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Verdant Palette - Emerald Greens with Warm Gold Backlight` and `Radice R2 - Great Bear and Cubs in Backlit Forest`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Brace U2 - Burning Banner on the Ridge` and `Marea C1 - Netcaster in the Drowned City`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Game modes (Arena, Spedizione, Allenamento, Prove)` and `Racconti della community (voted serials)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Motif: Mossy Forest Sanctuary` and `Motif: Vuoto Violet-Indigo Palette`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Image-to-video looping animation prompts` and `Options and accessibility`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._