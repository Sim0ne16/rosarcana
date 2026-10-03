# Graph Report - rosarcana  (2026-10-02)

## Corpus Check
- 142 files · ~3,877,042 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1320 nodes · 4779 edges · 54 communities (53 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 406 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8f054669`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PlayScreen.tsx
- CardArt.tsx
- Radice Suit (Root House)
- stories.ts
- Brace C4 - Armored Knight with Burning Banner
- devDependencies
- App.tsx
- siteImg
- AdventureScreen.tsx
- index.ts
- rules.ts
- glog
- AuthorScreen.tsx
- battle/store.ts
- words.ts
- Marea R2 - Drowned Warden with Trident Staff on the Wreck
- Shop Backdrop (Candlelit Reliquary Wall of Card Cases)
- Vuoto (Void) Suit
- Four-House Color Palette (Red / Teal / Green / Violet)
- useBattle
- Card Back: Radici (Glowing Root Knot in Verdant Frame)
- God Rays / Descending Light Shafts
- compilerOptions
- Card Frame Overlay (Transparent-Center Border Asset)
- Legendary entrance reveal
- effects.ts
- constants.ts
- Set Base (120 cards)
- engine/night.ts
- PackOpening.tsx
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
- useT
- ArenaScreen.tsx
- CollectionScreen.tsx
- war.ts
- lang.ts
- names.ts
- DecksScreen.tsx
- useLang
- state.ts
- Card.tsx
- profile/store.ts

## God Nodes (most connected - your core abstractions)
1. `useT()` - 121 edges
2. `useBattle` - 112 edges
3. `useProfile` - 97 edges
4. `useLang()` - 77 edges
5. `cardName()` - 49 edges
6. `Faction` - 47 edges
7. `cardInfo()` - 35 edges
8. `lookOf()` - 35 edges
9. `W` - 31 edges
10. `CardDetail()` - 30 edges

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
- 3-file cycle: `src/engine/log.ts -> src/engine/night.ts -> src/engine/state.ts -> src/engine/log.ts`

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

## Communities (54 total, 1 thin omitted)

### Community 0 - "PlayScreen.tsx"
Cohesion: 0.10
Nodes (29): Tab, backName(), rewardLabel(), Archetype, ARCHETYPES, commons(), Deck, deckIssues() (+21 more)

### Community 1 - "CardArt.tsx"
Cohesion: 0.11
Nodes (27): artUri(), cache, IMG, ART_DEFS, cache, engraving(), ICONS, files (+19 more)

### Community 2 - "Radice Suit (Root House)"
Cohesion: 0.15
Nodes (43): Amber-and-Green Forest Palette, Ancient Colossal Tree Bearing a Face in Its Bark, Bioluminescent Spores and Warm Ember Particles, Colossal Beast Silhouette, Forest Guardian Beast Portrait, Glowing Green Luminous Relic at Scene Center, God Rays - Volumetric Light Shafts Through Canopy, God Rays / Crepuscular Shaft Light (+35 more)

### Community 3 - "stories.ts"
Cohesion: 0.12
Nodes (21): resetMentions(), applyVariants(), CardVariant, originals, Snapshot, VARIANTS, Keyword, AdvStage (+13 more)

### Community 4 - "Brace C4 - Armored Knight with Burning Banner"
Cohesion: 0.14
Nodes (42): Amber-Red Chiaroscuro Palette, Armored Warrior Figure, Motif: Ascending Apparition, Brace Suit (Fire House), Common Rank Family (c-prefix), Fire and Ember Motif, Legendary Rank Family (l-prefix), Lone Silhouetted Figure Against Blaze (+34 more)

### Community 5 - "devDependencies"
Cohesion: 0.05
Nodes (41): d3-delaunay, framer-motion, @iconify-json/game-icons, dependencies, d3-delaunay, framer-motion, react, react-dom (+33 more)

### Community 6 - "App.tsx"
Cohesion: 0.16
Nodes (12): App(), TABS, SvgDefs(), useEvent, Credits(), SettingsModal(), FONT_SETS, Ambient() (+4 more)

### Community 7 - "siteImg"
Cohesion: 0.18
Nodes (13): files, SITE, siteImg(), EffectLayer, FrameLayer, FRAME_HOLES, ImageFrame, Miniature (+5 more)

### Community 8 - "AdventureScreen.tsx"
Cohesion: 0.12
Nodes (37): defaultArt(), originalName(), AdventureScreen(), Chapter(), copy(), Editor(), Tab, UNITS (+29 more)

### Community 9 - "index.ts"
Cohesion: 0.14
Nodes (15): Logo(), PAL, Rose, BACK_PAL, SEAL_PAL, rose(), RoseOpts, CardBack() (+7 more)

### Community 10 - "rules.ts"
Cohesion: 0.20
Nodes (14): aiChoose(), EFFECTS, aiMulligan(), canOffer(), legalTargets(), mulligan(), offerSeal(), playCard() (+6 more)

### Community 11 - "glog"
Cohesion: 0.32
Nodes (21): advanceNight(), attackOne(), chooseRes(), startTurn(), checkWin(), cleanup(), dmgSeal(), dmgUnit() (+13 more)

### Community 12 - "AuthorScreen.tsx"
Cohesion: 0.11
Nodes (32): F, games, N, played, wins, simulateEconomy(), actions(), aiDeck() (+24 more)

### Community 13 - "battle/store.ts"
Cohesion: 0.09
Nodes (29): LANE_NAME, hasAttackTarget(), Game, PlayOpt, laneName(), oppAim(), OppPlay, oppTone (+21 more)

### Community 14 - "words.ts"
Cohesion: 0.21
Nodes (10): Challenge, LEVEL_XP, matchXp(), SECTIONS, NIGHT_LOSS_ORO, NIGHT_MIN_GAMES, NIGHT_WIN_ORO, setDataLang() (+2 more)

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

### Community 19 - "useBattle"
Cohesion: 0.12
Nodes (21): BattleScreen(), Coach(), BEADS, CoinToss(), EDGE, PELLETS, OppAim(), OppAnnouncer() (+13 more)

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

### Community 27 - "effects.ts"
Cohesion: 0.21
Nodes (15): Effect, pushChosen(), tgtU(), uidOf(), bounce(), findU(), pushAuto(), pushTargets() (+7 more)

### Community 28 - "constants.ts"
Cohesion: 0.10
Nodes (34): Icon(), FIRST_LEG_BY, FIRST_WIN_ORO, FOIL_CHANCE, LOSS_ORO, ODDS, PACK_GEMME, PACK_ORO (+26 more)

### Community 29 - "Set Base (120 cards)"
Cohesion: 0.19
Nodes (14): Full-art vertical 5:7 format, Horizontal 4:3 classic frame format, Sciame di Spore (radice-u1), Common art style directive, 60 missing card illustrations, 12 new card illustrations, Site batch 1: missing cards and tokens, Germoglio token (summoned by Sciame di Spore) (+6 more)

### Community 30 - "engine/night.ts"
Cohesion: 0.19
Nodes (13): crossed(), nextNight(), NIGHT_PER_BREAK, NIGHT_PER_ROUND, NIGHT_PER_SACRIFICE, NIGHT_STEPS, NIGHT_TEXT, NIGHT_TOLL_EVERY (+5 more)

### Community 32 - "PackOpening.tsx"
Cohesion: 0.07
Nodes (42): BELL, chime(), envGain(), flipSfx(), glass(), init(), LEGEND_VOICE, legendSfx() (+34 more)

### Community 34 - "CardDetail.tsx"
Cohesion: 0.13
Nodes (22): FACTION_GLYPH, Glyph(), FACTION_LORE, LINKS, linksOf(), Lore, WORLD, CODEX_LEVEL (+14 more)

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

### Community 47 - "useT"
Cohesion: 0.18
Nodes (21): EmoteBubble(), EmotePicker(), useEmotes, CrystalPool(), Crystals(), fmt(), PlayerBar(), QuitButton() (+13 more)

### Community 48 - "ArenaScreen.tsx"
Cohesion: 0.06
Nodes (58): OPP_NAMES, Reward, CARDS, Faction, ADVENTURE, AdvNode, ArenaScreen(), DeckSide() (+50 more)

### Community 49 - "CollectionScreen.tsx"
Cohesion: 0.08
Nodes (35): CardMention, EN_KW_LIST, KW_RE_EN, KW_SHORT, kwIcon(), LEAD_KW_EN, mentionableCards(), RichText() (+27 more)

### Community 50 - "war.ts"
Cohesion: 0.09
Nodes (39): Community, connectCommunity(), Db, User, daysToReset(), POOL, weekIndex(), WEEKLY_REWARD (+31 more)

### Community 52 - "lang.ts"
Cohesion: 0.14
Nodes (16): CustodeBadge(), usage(), NightGauge(), Log(), ReplayBar(), CustodePortrait(), EN_LANE_NAME, Lang (+8 more)

### Community 53 - "names.ts"
Cohesion: 0.07
Nodes (41): ART_STYLES, ArtStyle, CardLook, CRAFT_FRAMES, EffectId, FrameId, FRAMES, FREE_STYLES (+33 more)

### Community 54 - "DecksScreen.tsx"
Cohesion: 0.17
Nodes (17): CardArt, CUST_MISSIONS, CUST_REWARD, CustProgress, decodeDeck(), encodeDeck(), BYID, FACTIONS (+9 more)

### Community 57 - "useLang"
Cohesion: 0.16
Nodes (29): Card, loreOf(), cardInfo(), activeSynergies(), ASCEND_FIGHTS, omenAt(), OMENS, synergiesOf() (+21 more)

### Community 59 - "state.ts"
Cohesion: 0.10
Nodes (30): evaluate(), formatLog(), IT_LOG, LogArgs, LogFmt, LogKey, LogTable, Tpl (+22 more)

### Community 61 - "Card.tsx"
Cohesion: 0.11
Nodes (20): CardProps, HEART, RarityGem(), StatGem(), SWORD, TYPE_GLYPH, DEFAULT_ART, CardDef (+12 more)

### Community 62 - "profile/store.ts"
Cohesion: 0.12
Nodes (38): hasIllustration(), freeStyles(), custDone(), autoDeck(), countMap(), starterDecks(), starterOwned(), challengesFor() (+30 more)

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
- **216 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+211 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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