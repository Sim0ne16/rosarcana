// Tutorial guidato: partita con mazzi e mani prestabiliti, avversario scriptato e passi da seguire.
export type TutExpect =
    | { type: 'play'; card: string; lane?: number; targetCard?: string }
    | { type: 'move'; card: string; to: number }
    | { type: 'end' };

export interface TutStep {
    kind: 'info' | 'do' | 'wait' | 'free';
    title: string;
    text: string;
    anchors?: string[];
    expect?: TutExpect
}

export interface OppScriptAction {
    play?: string;
    lane?: number
}

export const TUTORIAL = {
    playerHand: ['brace-c0', 'brace-c3', 'brace-c2', 'brace-c5'],
    // si pesca dalla fine dell'elenco
    playerDeck: ['radice-c0', 'radice-c2', 'brace-c4', 'radice-c5', 'radice-c4', 'brace-c0', 'brace-c2', 'brace-c1', 'brace-c4'],
    oppHand: ['marea-c5', 'marea-c3', 'marea-c1', 'marea-c0', 'marea-c2'],
    oppDeck: ['marea-c1', 'marea-c5', 'marea-c3', 'marea-c2', 'marea-c1', 'marea-c5', 'marea-c2', 'marea-c1'],
    oppSeal: 6,
    oppName: 'Maestra Brina',
    oppTurns: [
        [{play: 'marea-c2', lane: 1}],
        [{play: 'marea-c3', lane: 0}],
    ] as OppScriptAction[][],
    steps: [
        {
            kind: 'info',
            title: 'Benvenuto a Rosarcana',
            text: 'Il tavolo ha tre corsie. In alto ci sono i Sigilli dell\'avversario, in basso i tuoi. Vince chi spezza per primo due Sigilli su tre. Qui i Sigilli avversari hanno 6 punti vita, per fare prima. A ogni tuo turno ricevi da solo un Cristallo in più, fino a 10: da lì in poi peschi due carte per turno.',
            anchors: ['board']
        },
        {
            kind: 'do',
            title: 'Gioca un\'unità',
            text: 'Hai 2 Cristalli, il medaglione blu accanto a Fine turno. Trascina Scintilla Errante (costo 1) in una casella libera della corsia centrale: con Rapido attacca già in questo turno.',
            anchors: ['hand:brace-c0', 'lane:1'],
            expect: {type: 'play', card: 'brace-c0', lane: 1}
        },
        {
            kind: 'do',
            title: 'Fine turno e attacco',
            text: 'Premi Fine turno. Le tue unità attaccano nella propria corsia: se non c\'è nessuno davanti, colpiscono il Sigillo.',
            anchors: ['end'],
            expect: {type: 'end'}
        },
        {kind: 'wait', title: 'Turno avversario', text: 'Ora gioca l\'avversario. Osserva cosa fa.'},
        {
            kind: 'do',
            title: 'Incantesimi con bersaglio',
            text: "L'Anguilla blocca Scintilla. Trascina Fiammata verso il campo, poi punta l'Anguilla con la freccia e toccala: 2 danni bastano.",
            anchors: ['hand:brace-c3', 'unit:marea-c2'],
            expect: {type: 'play', card: 'brace-c3', targetCard: 'marea-c2'}
        },
        {
            kind: 'do',
            title: 'Apri un secondo fronte',
            text: 'Gioca Lanciafiamme Novizio nella corsia sinistra. Non ha Rapido, quindi attaccherà dal prossimo turno.',
            anchors: ['hand:brace-c2', 'lane:0'],
            expect: {type: 'play', card: 'brace-c2', lane: 0}
        },
        {
            kind: 'do',
            title: 'Fine turno',
            text: 'Premi Fine turno. Scintilla colpirà ancora il Sigillo centrale.',
            anchors: ['end'],
            expect: {type: 'end'}
        },
        {kind: 'wait', title: 'Turno avversario', text: 'L\'avversario risponde.'},
        {
            kind: 'do',
            title: 'Sposta le unità',
            text: 'La Sentinella di Corallo ha 5 salute e blocca Lanciafiamme. Trascina Lanciafiamme nella corsia centrale: spostarsi costa 1 Cristallo.',
            anchors: ['unit:brace-c2', 'lane:1'],
            expect: {type: 'move', card: 'brace-c2', to: 1}
        },
        {
            kind: 'do',
            title: 'Colpisci dove è scoperto',
            text: 'Gioca Corridore Ardente nella corsia destra: con Rapido colpisce subito il Sigillo senza difese.',
            anchors: ['hand:brace-c5', 'lane:2'],
            expect: {type: 'play', card: 'brace-c5', lane: 2}
        },
        {
            kind: 'do',
            title: 'Spezza il Sigillo',
            text: 'Premi Fine turno e guarda la corsia centrale.',
            anchors: ['end'],
            expect: {type: 'end'}
        },
        {kind: 'wait', title: 'Un Sigillo è caduto', text: 'Ne manca uno. L\'avversario ora gioca da solo.'},
        {
            kind: 'free',
            title: 'Tocca a te',
            text: 'Da qui giochi liberamente: spezza il secondo Sigillo per vincere. Il Sigillo destro ha solo 2 punti vita.'
        },
    ] as TutStep[],
};
