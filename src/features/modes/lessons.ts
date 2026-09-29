// Prove della Rosa: tre partite guidate dopo il tutorial, una per ogni meccanica avanzata.
import {aiDeck, type CustodeId} from './deps';
import {PRESETS} from '../../economy/decks';
import type {OmenId} from '../../engine';

export interface Lesson {
    id: string;
    title: string;
    goal: string;
    deck: () => string[];
    custode: CustodeId;
    op: () => { name: string; deck: string[]; noise: number; seal: number };
    omens?: OmenId[];
    tips: string[]
}

const deckOf = (id: string) => [...PRESETS.find(p => p.id === id)!.cards];
export const LESSONS: Lesson[] = [
    {
        id: 'presagi',
        title: 'Presagi e Ultimo Rintocco',
        goal: 'Vinci sfruttando i presagi delle corsie.',
        deck: () => deckOf('p-fiamma-radice'),
        custode: 'vesta',
        omens: ['cenere', 'eclissi', 'consacrata'],
        op: () => ({name: 'Allievo della Rosa', deck: aiDeck(['marea', 'radice'], 0), noise: 10, seal: 7}),
        tips: ['Ogni corsia ha un presagio: lo leggi al centro della corsia. Qui: Vento di cenere (+1 attacco), Eclissi (+1 danno ai Sigilli), Terra consacrata (+1 salute).', "Metti le unità d'attacco nelle corsie che le potenziano.", "Quando un Sigillo si spezza suona l'Ultimo Rintocco: il Custode del proprietario risponde con un effetto. Tienilo a mente prima di spezzare un Sigillo avversario."]
    },
    {
        id: 'sincronie',
        title: 'Sincronie e Custodi',
        goal: 'Metti in gioco due carte legate e usa il potere del tuo Custode.',
        custode: 'vesta',
        deck: () => {
            const d = deckOf('p-fiamma-radice');
            return [...d.slice(0, 22), 'brace-r2', 'brace-r2', 'brace-c4', 'radice-r2', 'radice-u3', 'radice-r2', 'brace-c1', 'brace-c2'];
        },
        op: () => ({name: 'Allievo della Rosa', deck: aiDeck(['vuoto', 'marea'], 0), noise: 10, seal: 7}),
        tips: ['Le carte con la scritta blu "Sincronia con…" si potenziano quando la compagna è in gioco dalla tua parte: sul tavolo compare il simbolo della catena.', 'In questo mazzo: Fabbro e Lanciafiamme, Guardia di Cenere e Capitana dei Roghi, Lupa Grigia e Orsa Madre.', 'Il tuo Custode, Vesta, dà +1 attacco alla prima unità che giochi ogni turno. Tocca il suo ritratto per rileggerlo.']
    },
    {
        id: 'ascesa',
        title: 'Ascesa e Lente',
        goal: 'Fai ascendere almeno una unità.',
        deck: () => deckOf('p-bosco-sommerso'),
        custode: 'guardaboschi',
        op: () => ({name: 'Allievo della Rosa', deck: aiDeck(['brace', 'vuoto'], 0), noise: 10, seal: 7}),
        tips: ["Un'unità che sopravvive a 2 combattimenti ascende: +2/+2 e un'aura dorata. Le unità con tanta salute sono le candidate migliori.", "La corsia centrale è protetta dall'Uomo Verde (+1 salute): è il posto giusto per far crescere un'unità.", 'Usa la Lente (tasto L) per leggere lo stato di ogni unità: combattimenti superati, presagio e sincronie.']
    },
];
export const LESSON_REWARD = {oro: 60, gettoni: 1};
export const trainingOpponent = () => ({
    name: 'Manichino della Rosa',
    deck: aiDeck(['brace', 'radice'], 0),
    noise: 14,
    seal: 8
});
