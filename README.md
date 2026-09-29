# Rosarcana: la guerra dei Sigilli

Regole base: a ogni tuo turno ricevi automaticamente un Cristallo permanente in più (fino a 10) e peschi una carta; con 10 Cristalli peschi due carte per turno.

TCG per browser dal sapore di cattedrale gotica: tre corsie, tre Sigilli per lato, vince chi ne spezza due.

## Come avviarlo sul tuo PC

1. Installa **Node.js** (versione 20 o più recente) da nodejs.org.
2. Estrai lo zip in una cartella, per esempio `C:\Giochi\rosarcana`.
3. Apri un terminale in quella cartella (su Windows: tasto destro nella cartella, *Apri nel terminale*) e scrivi:
   ```
   npm install
   npm run dev
   ```
4. Apri nel browser l'indirizzo che compare (di solito http://localhost:5173). Ogni modifica ai file si vede subito.

Altri comandi:
- `npm run build:single` crea un unico file `dist/index.html` con tutto il gioco dentro, da aprire con doppio clic o da pubblicare.
- `npm run build` crea la versione classica per un sito web, nella cartella `dist`.

Il gioco è pensato per computer: sotto i 1100 pixel di larghezza la pagina scorre invece di riorganizzarsi.

## Avvio

```bash
npm install
npm run dev          # sviluppo con hot reload
npm run build        # sito statico in dist/
npm run build:single # un unico dist/index.html autonomo (demo, anteprime)
npm run typecheck
```

## Stack

- **Vite + React 18 + TypeScript**: componenti per funzionalità, tipi condivisi tra motore e interfaccia.
- **Framer Motion**: animazioni in stile MTG Arena. Ogni carta ha un `layoutId` stabile (`card-<id>`), quindi la stessa carta vola dalla mano alla pila, poi alla corsia, senza codice di animazione manuale. Trascinamento, uscite con `AnimatePresence`, attacchi a molla.
- **Zustand**: `profile/store.ts` (collezione, valute, mazzi, salvato nel browser) e `features/battle/store.ts` (partita + regista delle animazioni).
- **d3-delaunay**: tessere di vetro dello stile Vetrata. **Tone.js**: suoni sintetizzati.

## Struttura

```
src/
  engine/        motore puro, senza React: regole, effetti, IA (portabile su server)
  economy/       bustine, probabilità, pity, ricompense, mazzi
  profile/       stato del giocatore persistente
  cards/         componente Card, stili (vetrata, incisione, illustrata), arte procedurale
  audio/         effetti sonori
  ui/            modale, toast, stili condivisi
  features/
    battle/      tavolo, corsie, mano a ventaglio, pila, freccia di mira, HUD, regista
    tutorial/    script della partita guidata e overlay
    play/ adventure/ decks/ collection/ shop/ pass/
  app/           shell con navigazione
scripts/         estrazione icone, generazione arte AI
art/             prompt AI e mappa icone
```

## Lente in partita

Il pulsante Lente (o il tasto L, o il clic destro su una carta) apre la modalità dettaglio: la carta a grande formato con regole complete, stato in partita, sincronie e storia.

## Avventure

- **Avventura della Rosa**: i capitoli ufficiali. Il Capitolo 1 è incluso; l'autore ne scrive altri in *Modalità autore* e li esporta per la pubblicazione (vanno aggiunti a `OFFICIAL_EXTRA` in `features/adventure/model.ts`).
- **Mazzi preimpostati**: 4 mazzi pronti con Custode (Fiamma e Radice, Maree del Vuoto, Bosco Sommerso, Ceneri della Notte) in `economy/decks.ts`, dati a ogni nuovo giocatore.
- **Set Base**: tutte le 60 carte attuali formano il Set Base, venduto nelle bustine omonime (`SET` in `engine/cards.ts`).
- **Racconti della community**: i moderatori (Editor e proprietario dell'artefatto) scrivono racconti a capitoli; alla fine di ogni capitolo la community vota tra 2-4 opzioni e il moderatore chiude la votazione proclamando la scelta. Dati nel database condiviso dell'artefatto: `stories/<id>` (scrivono solo i moderatori) e `ballots/<id-utente>` (ognuno scrive solo la propria scheda). Senza database funziona in locale.
- **Arena delle Rose** (Draft), **Spedizione** (roguelike), **Allenamento** e **Prove della Rosa** (tre partite guidate) in `features/modes`.
- **Missioni leggendarie dei Custodi** (`economy/custodeMissions.ts`), **Pannello autore** con simulazioni di bilanciamento ed economia (`features/author`), **Crediti e note legali** (`features/info`).

## Mulligan, codici mazzo, accessibilità

- **Mulligan**: prima del primo turno scegli le carte da sostituire (una volta sola); l'IA sostituisce quelle da 5 o più.
- **Codici mazzo**: `RDECK1:` (`economy/deckCode.ts`), da copiare e importare in Mazzi.
- **Opzioni e accessibilità** (ingranaggio in alto o in fondo alla pagina): dimensione del testo, riduci animazioni, alto contrasto, scelta tra tre caratteri (Gotico, Leggibile, Elegante), volume.
- **Eventi della community**: ogni opzione di un racconto può avere un evento (fazione favorita, presagio della corsia centrale); quando il moderatore chiude la votazione l'evento dura 7 giorni.
- **Codex della Rosa**: storie delle carte possedute e frammenti nascosti (`cards/secrets.ts`) che si sbloccano al grado di maestria Adepto.
- **Dorsi illustrati e cornici da immagine**: file `back-<id>` e `frame-<id>` in `src/assets/site` sostituiscono automaticamente le versioni disegnate dal codice (prompt in `art/PROMPT-CORNICI-DORSI.txt`).

## Replay, sfide settimanali, profilo

- **Replay**: ogni partita viene registrata mossa per mossa; a fine partita "Rivedi la partita" (o dal Profilo) apre la barra del replay (frecce, spazio, cursore).
- **Sfide della settimana** (`economy/weekly.ts`): tre sfide a regole speciali che ruotano ogni lunedì; 3 vittorie danno 100 oro e un gettone.
- **Profilo** (icona in alto): statistiche, fazioni, Custodi, carte preferite, maestria, record di Arena e Spedizione.
- **Cornici di maestria e dorsi illustrati**: immagini in `src/assets/site` (`frame-maestria-N.webp` con centro trasparente, `back-<id>.webp`).

## Carte e modello (ottobre 2026)

- **Modello unico**: tutte le carte sono a tutta illustrazione, in ogni stile (Illustrata, Dipinta, Vetrata, Incisione); barra del titolo con nome, costo a scheggia di cristallo e stemma; in basso tipo, testo compatto e targa di attacco e salute.
- **Effetti**: Oro fuso, Alone, Luce radente. Alone e Oro fuso si ottengono anche con la maestria (Custode e Leggenda).
- **Cornici**: non più sulle carte ma sul **ritratto del profilo** (Profilo > Cornice del profilo); quelle di maestria si sbloccano quando una tua carta raggiunge il grado.
- **Nuove parole chiave** Volo, Veleno, Linfa vitale e **12 carte** per gli archetipi mancanti (tribale, ramp, tutor, prison, sweeper, evasione). Set Base: 72 carte.
- **Partite**: si parte da 1 Cristallo; mulligan; lente rimossa (dettaglio con clic destro, hover o pressione prolungata); dorso per mazzo o unico; storico partite nel Profilo; "Riprova" nelle avventure.
- **Prima ora guidata**: Avventura, Negozio, Pass e modalità competitive si sbloccano dopo il tutorial e le tre Prove della Rosa.
- **Unity**: il motore è stato portato in C# (progetto separato `rosarcana-unity`).

## 120 carte e meccaniche uniche

- **Set Base: 120 carte** (44 comuni, 32 non comuni, 28 rare, 16 leggendarie), 30 per Casata, bilanciate con simulazioni IA (fazioni tra 48% e 53% a ogni livello di mazzo).
- **Meccaniche proprie di Rosarcana**: *Aggirare* (se la corsia è difesa colpisce un Sigillo vicino scoperto), *Offerta N* (si paga con i punti vita del proprio Sigillo più integro), *Auspicio* (+1/+1 nelle corsie con presagio), *Rintocco:* (effetto quando un tuo Sigillo si spezza). Restano Veleno e Linfa vitale; Volo è stato tolto.
- **Signori di Casata** (tribale): Brace +1 attacco, Marea +1 salute, Radice Linfa vitale, Vuoto Eco.
- **Mazzi dell'IA** con quote di rarità realistiche per livello.
- Partite con meno di 5 mosse del giocatore non danno ricompense; ogni acquisto chiede conferma.

## Leggendarie

Quando una leggendaria entra in gioco (tua o dell'avversario) compare al centro con raggi e bagliore nel colore della fazione, nome e frase, e un motivo sonoro proprio per ognuna delle 16 leggendarie (`LEGEND_VOICE` in `audio/sfx.ts`). Si chiude toccando lo schermo; con "Riduci le animazioni" i raggi spariscono.

## Mazzi per archetipo

In `economy/decks.ts` (`ARCHETYPES`) ci sono 10 mazzi modello: Aggro, Burn, Tribale, Tempo, Prison, Control, Ramp, Midrange, Combo, Rintocco. Si aggiungono dalla schermata Mazzi; le carte mancanti restano segnate. A inizio partita la mano viene distribuita con un'animazione e il suono di pescata.

## Mano rivelata

Occhio Vacuo rivela la mano avversaria: le carte rivelate (`HandCard.known`) restano scoperte in cima al tavolo finché non vengono giocate; se è l'avversario a guardare, le tue carte note mostrano un occhio.

## Tempo del turno

Ogni turno dura 75 secondi; finiti quelli si consuma una riserva di 60 secondi valida per tutta la partita. Esaurita anche la riserva, il turno passa da solo. Le animazioni non consumano tempo. Tutorial, Prove della Rosa e Allenamento non sono a tempo. Valori in `TURN_SECONDS` e `RESERVE_SECONDS` (`features/battle/store.ts`).

## Meccaniche della Rosa

- **Sincronie** (`engine/mechanics.ts`): 14 coppie di carte legate dalla lore si danno bonus quando sono in gioco insieme dalla stessa parte (es. Lupa Grigia e Orsa Madre, Il Primo Fuoco e Fenice Minore).
- **Presagi di corsia**: a inizio partita tre presagi casuali tra Nebbia, Terra consacrata, Vento di cenere, Eclissi, Radici antiche, Campane a morto.
- **Ultimo Rintocco**: quando un Sigillo si spezza, la fazione principale del mazzo del proprietario risponde una volta (Rogo finale, Ultima risacca, Radici profonde, Patto finale).
- **Ascesa**: un'unità che sopravvive a 2 combattimenti ottiene +2/+2 e un'aura dorata.
- **Custodi del Sigillo** (l'eroe del mazzo): 8 custodi, due per fazione, ispirati a figure del mito (Vesta, Prometeo, Cassandra, Odisseo, l'Uomo Verde, Demetra, Caronte, Ecate). Ognuno ha un effetto sempre attivo e un Ultimo Rintocco personale; si scelgono nell'editor del mazzo.
- **Maestria**: le carte salgono di grado giocandole e completando sfide; ogni grado sblocca una cornice ornata.

Il tutorial disattiva Presagi, Rintocco e Custodi per restare prevedibile. Le bustine hanno una protezione doppioni migliorata: se una rarità è completa, lo slot sale alla rarità successiva.

## Interfaccia

Home con rosone animato e ventaglio di leggendarie inclinabili, navigazione con indicatore animato (barra in basso su telefono), valute che scorrono quando cambiano, sfondo con fasci di luce e pulviscolo. Negozio "Il Reliquiario": bustina 3D che segue il puntatore, bustine acquistate che volano nel contatore, apertura in quattro fasi (crepe nel sigillo, esplosione di luce, carte coperte con aura di rarità, rivelazione con fascio di luce; per le leggendarie raggi dorati, scintille e scossa). Tutte le animazioni rispettano la preferenza di movimento ridotto.

## Personalizzazione delle carte

Ogni carta combina tre scelte cosmetiche indipendenti, dalla Collezione (schede Stile, Effetti, Cornice).

| Categoria | Opzioni | Come si ottengono |
|---|---|---|
| Stile | Dipinta, Vetrata, Incisione, Illustrata (AI), Senza bordi | Dipinta e Vetrata gratis; Incisione 150 polvere o 1 gettone; Illustrata gratis quando esiste l'immagine |
| Effetti | Olografico, Aurora, Scintille, Acquaforte, Galassia, Prismatico, Oro fuso | Olografico: 5% per carta nelle bustine o 2× il costo di creazione; Braci 200, Aurora 300, Scintille 400 polvere; oppure 1 gettone |
| Cornice (vive) | Fiamme vive, Marea di luce, Rovi in fiore, Nebbia del Nulla, Brina, Miniatura d'oro | 150, 300, 800 polvere (le carte olografiche delle bustine arrivano con la Dorata) |
| Cornice di grado | Bronzo, Argento, Oro, Platino, Diamante, Leggenda | Si sbloccano per tutte le carte raggiungendo il grado in classificata |

I salvataggi precedenti vengono convertiti: la vecchia finitura dorata diventa effetto Olografico più cornice Dorata.

### Arte AI

```bash
OPENAI_API_KEY=... npm run art                       # tutte le 60 carte
ART_PROVIDER=stability STABILITY_API_KEY=... npm run art
npm run art -- brace-c0 vuoto-l0                     # solo alcune
npm run build
```

I prompt sono in `art/prompts.json` (stile comune + soggetto + ambientazione di fazione; nessun nome di artista, testo o logo). Le immagini finiscono in `src/assets/art/<id>.png` e vengono incluse da `import.meta.glob`. Senza immagine, lo stile Illustrata non è acquistabile e le carte ripiegano sulla Vetrata.

Nota legale: in molte giurisdizioni (per esempio negli USA) le immagini generate interamente da AI non sono tutelate dal diritto d'autore, quindi altri potrebbero riusarle. Controlla anche i termini del provider scelto.

## Licenze

Le figure procedurali usano icone di [game-icons.net](https://game-icons.net) (Lorc, Delapouite e altri), licenza CC BY 3.0: l'attribuzione è nella schermata Collezione. Per aggiornarle: modifica `art/icon-map.json` ed esegui `npm run icons`.
