import type {CardDef, CardType, Faction, Keyword, Rarity} from './types';

export const FACTIONS: Record<Faction, { name: string; of: string; col: string; col2: string }> = {
    brace: {name: 'Brace', of: 'di Brace', col: '#c4502a', col2: '#6e1f10'},
    marea: {name: 'Marea', of: 'della Marea', col: '#2f8595', col2: '#10384a'},
    radice: {name: 'Radice', of: 'della Radice', col: '#5f8f3a', col2: '#223d14'},
    vuoto: {name: 'Vuoto', of: 'del Vuoto', col: '#7552a0', col2: '#241638'},
};
export const RARITY: Record<Rarity, { name: string; craft: number; dis: number; max: number; color: string }> = {
    c: {name: 'Comune', craft: 40, dis: 5, max: 2, color: '#8f8a7e'},
    u: {name: 'Non comune', craft: 100, dis: 20, max: 2, color: '#3f9a6f'},
    r: {name: 'Rara', craft: 400, dis: 100, max: 2, color: '#3f7ed6'},
    l: {name: 'Leggendaria', craft: 1600, dis: 400, max: 1, color: '#e39b1f'},
};
export const TYPES: Record<CardType, string> = {U: 'Unità', I: 'Incantesimo', R: 'Reliquia'};
export const KEYWORDS: Record<Keyword, string> = {
    Rapido: 'Può attaccare già nel turno in cui entra in gioco.',
    Guardiano: "Le tue unità nelle corsie accanto alla sua non possono essere bersaglio di incantesimi ed effetti dell'avversario. Non protegge la propria corsia né se stesso.",
    Scossa: 'Quando colpisce un Sigillo, infligge anche 1 danno a un Sigillo intatto accanto, scelto a caso.',
    Radicato: "Non può essere spostato in un'altra corsia, né da te né dall'avversario.",
    Eco: 'Quando muore, torna nella tua mano e costa 1 in più (il sovrapprezzo si somma a ogni ritorno).',
    Assedio: 'Infligge danni doppi quando colpisce un Sigillo.',
    Cresce: "All'inizio di ogni tuo turno ottiene +1 attacco e +1 salute.",
    Aggirare: 'Se nella sua corsia ci sono difensori, attacca invece il Sigillo di una corsia vicina che non ha difensori.',
    Offerta: 'Puoi giocarla pagando con i punti vita del tuo Sigillo più integro invece che con i Cristalli (il Sigillo non può scendere sotto 1).',
    Auspicio: 'Ha +1 attacco e +1 salute finché si trova in una corsia con un presagio.',
    Veleno: "Un'unità che riceve danni da questa unità in combattimento viene distrutta.",
    'Linfa vitale': 'Quando infligge danni, ripristina altrettanti punti vita al tuo Sigillo della sua corsia.',
};
/** Espansione a cui appartengono le carte. Il gioco nasce con il Set Base; i set futuri avranno le loro bustine. */
export const SET = {id: 'base', name: 'Set Base', symbol: '✦'};
export const LANES = 3;
export const SLOTS = 3;
export const LANE_NAME = ['sinistra', 'centrale', 'destra'];

type Raw = [string, CardType, number, number, number, string, Keyword[]?];
const RAW: Record<Faction, Record<Rarity, Raw[]>> = {
    brace: {
        c: [['Scintilla Errante', 'U', 1, 2, 1, 'Rapido.', ['Rapido']], ['Fabbro di Tizzoni', 'U', 2, 2, 2, "Quando entra: un'altra tua unità ottiene +1 attacco."], ['Lanciafiamme Novizio', 'U', 2, 3, 1, ''], ['Fiammata', 'I', 1, 0, 0, "Infliggi 2 danni a un'unità a tua scelta, tua o nemica."], ['Guardia di Cenere', 'U', 3, 3, 3, 'Guardiano.', ['Guardiano']], ['Corridore Ardente', 'U', 3, 4, 2, 'Rapido.', ['Rapido']], ['Grifone di Cenere', 'U', 3, 2, 2, 'Aggirare.', ['Aggirare']], ['Tamburina di Guerra', 'U', 2, 1, 2, "Quando entra: un'altra tua unità di Brace ottiene +1 attacco."], ['Scheggia Ardente', 'I', 1, 0, 0, "Infliggi 2 danni a un'unità nemica e 1 danno al Sigillo della sua corsia."], ['Fanatico del Rogo', 'U', 2, 2, 1, 'Offerta 2.', ['Offerta']], ['Sentinella Fumante', 'U', 2, 2, 3, 'Rintocco: infligge 2 danni a ogni unità nemica nella sua corsia.']],
        u: [['Ariete Rovente', 'U', 4, 3, 5, 'Assedio.', ['Assedio']], ['Pioggia di Braci', 'I', 2, 0, 0, 'Infliggi 1 danno a ogni unità nemica.'], ['Stendardo Incandescente', 'R', 1, 0, 0, 'Finché questo Sigillo è intatto, le tue unità nella sua corsia hanno +1 attacco.'], ['Duellante di Brace', 'U', 3, 3, 2, 'Scossa.', ['Scossa']], ['Incendiaria', 'U', 3, 2, 3, 'Quando entra: infligge 1 danno a ogni Sigillo nemico.'], ['Berserker di Cenere', 'U', 3, 2, 2, 'Rapido. Offerta 3.', ['Rapido', 'Offerta']], ['Pira Votiva', 'R', 2, 0, 0, "All'inizio del tuo turno, finché questo Sigillo è intatto: infliggi 1 danno all'unità nemica con meno salute."], ['Veterano delle Braci', 'U', 4, 3, 4, 'Auspicio.', ['Auspicio']]],
        r: [['Fenice Minore', 'U', 5, 4, 3, 'Rapido. Eco.', ['Rapido', 'Eco']], ['Colata Lavica', 'I', 3, 0, 0, 'Infliggi 4 danni a un Sigillo nemico a tua scelta.'], ['Capitana dei Roghi', 'U', 5, 4, 4, 'Le tue altre unità di Brace hanno Rapido.'], ['Signore delle Braci', 'U', 5, 3, 4, 'Le tue altre unità di Brace hanno +1 attacco.'], ['Drago di Brace', 'U', 6, 5, 5, "Aggirare. Quando entra: infligge 1 danno a ogni unità nemica.", ['Aggirare']], ['Eruzione', 'I', 4, 0, 0, 'Infliggi 3 danni a ogni unità nemica in una corsia e 2 danni al Sigillo nemico di quella corsia.'], ['Araldo del Fuoco', 'U', 4, 3, 2, 'Rapido. Quando entra: le tue altre unità di Brace ottengono +1 attacco.', ['Rapido']]],
        l: [['Vulkara, Cuore del Monte', 'U', 8, 8, 8, 'Assedio. Quando entra: infligge 3 danni a ogni altra unità nella sua corsia, sia tue sia nemiche.', ['Assedio']], ['Il Primo Fuoco', 'R', 6, 0, 0, "All'inizio del tuo turno, finché questo Sigillo è intatto: infliggi 1 danno a ogni Sigillo nemico."], ['Surtr, il Gigante Nero', 'U', 7, 6, 6, 'Offerta 4. Assedio.', ['Offerta', 'Assedio']], ['Fornace Eterna', 'R', 5, 0, 0, 'Finché questo Sigillo è intatto, le tue carte di Brace costano 1 in meno.']],
    },
    marea: {
        c: [['Spruzzo', 'I', 1, 0, 0, "Riporta in mano al proprietario un'unità che costa 2 o meno. Le unità evocate vengono rimosse."], ['Pescatore di Nebbie', 'U', 2, 2, 4, ''], ['Anguilla Guizzante', 'U', 1, 2, 2, "Quando entra: sposta un'unità nemica non Radicata in una corsia vicina con spazio libero."], ['Sentinella di Corallo', 'U', 3, 2, 5, 'Guardiano.', ['Guardiano']], ['Risacca', 'I', 2, 0, 0, "Sposta un'unità non Radicata in una corsia vicina con spazio libero. Pesca 1 carta."], ['Medusa Pallida', 'U', 2, 2, 4, "Se muore in combattimento, l'unità che l'ha uccisa salta il suo prossimo attacco."], ['Gabbiano delle Secche', 'U', 1, 2, 2, 'Aggirare.', ['Aggirare']], ['Onda Anomala', 'I', 1, 0, 0, "Riporta in mano all'avversario un'unità nemica che costa 3 o meno."], ['Granchio Corazzato', 'U', 2, 2, 4, 'Guardiano.', ['Guardiano']], ['Pescatore di Perle', 'U', 2, 2, 2, 'Quando entra: se la sua corsia ha un presagio, pesca 1 carta.'], ['Nebbia Salmastra', 'I', 1, 0, 0, "Un'unità nemica salta il suo prossimo attacco. Pesca 1 carta."]],
        u: [['Veggente delle Maree', 'U', 3, 3, 3, 'Quando entra: pesca 1 carta.'], ['Corrente Contraria', 'I', 2, 0, 0, "Riporta in mano al proprietario un'unità. Le unità evocate vengono rimosse."], ['Faro Sommerso', 'R', 1, 0, 0, "All'inizio del tuo turno, finché questo Sigillo è intatto: se la prima carta del tuo mazzo costa più di 1 oltre i tuoi Cristalli massimi, mettila in fondo al mazzo."], ['Custode del Golfo', 'U', 4, 4, 6, 'Radicato. Guardiano.', ['Radicato', 'Guardiano']], ['Alta Marea', 'R', 4, 0, 0, "Finché questo Sigillo è intatto, le carte dell'avversario costano 1 in più."], ['Tritone Esploratore', 'U', 3, 3, 4, 'Aggirare.', ['Aggirare']], ['Ancora Spezzata', 'R', 2, 0, 0, 'Finché questo Sigillo è intatto, le unità nemiche nella sua corsia hanno -1 attacco.'], ['Maga delle Correnti', 'U', 4, 3, 5, 'Rintocco: pesca 2 carte.']],
        r: [['Maelstrom', 'I', 5, 0, 0, "Riporta in mano all'avversario tutte le sue unità in una corsia."], ['Leviatana Giovane', 'U', 5, 6, 5, 'Quando entra: sposta ogni unità nemica non Radicata della sua corsia in una corsia vicina con spazio libero.'], ['Ammiraglio Salmastro', 'U', 4, 3, 4, 'Finché è in gioco, spostare le tue unità non costa Cristalli.'], ['Sirena Ammaliatrice', 'U', 4, 3, 4, "Aggirare. Quando entra: un'unità nemica salta il suo prossimo attacco.", ['Aggirare']], ['Kraken Dormiente', 'U', 7, 6, 8, 'Radicato. Quando entra: ogni unità nemica salta il suo prossimo attacco.', ['Radicato']], ['Contromarea', 'I', 2, 0, 0, 'Scegli una corsia: le unità nemiche lì saltano il loro prossimo attacco. Pesca 1 carta.'], ['Signora delle Secche', 'U', 4, 3, 4, 'Le tue altre unità di Marea hanno +1 salute.']],
        l: [['Thalassa, Voce degli Abissi', 'U', 7, 7, 7, "Quando entra: riporta in mano all'avversario tutte le sue unità con costo base 3 o meno."], ['Marea Eterna', 'I', 8, 0, 0, "Riporta in mano all'avversario tutte le sue unità. Pesca 2 carte."], ['Scilla', 'U', 8, 6, 7, "Quando entra: riporta in mano all'avversario le unità nemiche nella sua corsia; le tue unità nella sua corsia ottengono +1/+1."], ['Faro di Alessandria', 'R', 5, 0, 0, "All'inizio del tuo turno, finché questo Sigillo è intatto: pesca 1 carta."]],
    },
    radice: {
        c: [['Germoglio Tenace', 'U', 1, 1, 1, 'Cresce.', ['Cresce']], ['Druida di Muschio', 'U', 2, 1, 3, 'Alla fine del tuo turno: ripristina 1 punto vita al tuo Sigillo della sua corsia (senza superare il massimo).'], ['Cinghiale di Rovo', 'U', 3, 3, 3, 'Radicato.', ['Radicato']], ['Scorza', 'I', 1, 0, 0, "Un'unità a tua scelta ottiene +3 salute permanente."], ['Arciera del Sottobosco', 'U', 2, 2, 2, "Quando entra: infligge 1 danno a un'unità nemica a tua scelta."], ['Linfa', 'I', 2, 0, 0, "Un'unità a tua scelta ottiene +2 attacco e +2 salute permanenti."], ['Custode delle Sorgenti', 'U', 2, 1, 3, 'Quando entra: ottieni un Cristallo massimo in più (fino a 10).'], ['Muschio Rampicante', 'U', 1, 0, 3, 'Cresce. Radicato.', ['Cresce', 'Radicato']], ['Seme Errante', 'I', 3, 0, 0, 'Ottieni un Cristallo massimo in più (fino a 10).'], ['Lupo Giovane', 'U', 2, 2, 2, 'Auspicio.', ['Auspicio']], ['Erborista', 'U', 2, 1, 3, 'Quando entra: ripristina 2 punti vita a un tuo Sigillo intatto.']],
        u: [['Quercia Vigile', 'U', 4, 2, 7, 'Guardiano. Radicato.', ['Guardiano', 'Radicato']], ['Sciame di Spore', 'I', 3, 0, 0, 'Evoca due Germogli 1/1 con Cresce nella corsia che scegli; se è piena, nelle corsie vicine.'], ['Cerchio di Pietre', 'R', 3, 0, 0, 'Finché questo Sigillo è intatto, le tue unità nella sua corsia hanno +2 salute.'], ['Lupa Grigia', 'U', 3, 2, 3, 'Cresce.', ['Cresce']], ['Vipera del Sottobosco', 'U', 2, 1, 2, 'Veleno.', ['Veleno']], ['Treant Custode', 'U', 4, 2, 6, 'Guardiano. Linfa vitale.', ['Guardiano', 'Linfa vitale']], ['Cerchio delle Fate', 'R', 3, 0, 0, "All'inizio del tuo turno, finché questo Sigillo è intatto: evoca un Germoglio nella sua corsia, se c'è spazio."], ['Cinghiale Furioso', 'U', 4, 4, 3, 'Rintocco: ottiene +3/+3.']],
        r: [['Antico Rampicante', 'U', 5, 4, 6, 'Guardiano. Cresce.', ['Guardiano', 'Cresce']], ['Rinascita Verde', 'I', 3, 0, 0, 'Ripristina fino a 5 punti vita a un tuo Sigillo intatto (senza superare il massimo).'], ['Orsa Madre', 'U', 6, 5, 5, 'Quando entra: evoca un Cucciolo 2/2 in ogni corsia vicina con spazio libero.'], ['Cervo Bianco', 'U', 5, 4, 5, 'Linfa vitale.', ['Linfa vitale']], ['Driade Antica', 'U', 5, 4, 5, 'Quando entra: ottieni un Cristallo massimo in più e ripristina 2 punti vita a ogni tuo Sigillo.'], ['Richiamo della Foresta', 'I', 4, 0, 0, 'Le tue unità ottengono +1 attacco e +2 salute. Pesca 1 carta.'], ['Signore dei Cervi', 'U', 4, 3, 4, 'Le tue altre unità di Radice hanno Linfa vitale.']],
        l: [["Yggrin, l'Albero che Cammina", 'U', 8, 7, 12, "Radicato. All'inizio del tuo turno: ottiene +2/+2 e ripristina 2 punti vita a ogni tuo Sigillo.", ['Radicato']], ['Seme del Mondo', 'R', 6, 0, 0, "All'inizio del tuo turno, finché questo Sigillo è intatto: le tue unità in gioco ottengono +1/+1."], ['Titano di Quercia', 'U', 9, 9, 9, 'Radicato. Guardiano. Linfa vitale.', ['Radicato', 'Guardiano', 'Linfa vitale']], ['Primavera Eterna', 'I', 7, 0, 0, 'Cura completamente le tue unità, ripristina 4 punti vita a ogni tuo Sigillo e pesca 2 carte.']],
    },
    vuoto: {
        c: [['Accolito Velato', 'U', 1, 2, 1, 'Quando muore: pesca 1 carta.'], ['Ombra Affamata', 'U', 2, 3, 2, ''], ['Patto di Sangue', 'I', 2, 0, 0, "Sacrifica una tua unità in gioco. Pesca 2 carte."], ['Spettro Ramingo', 'U', 2, 2, 1, 'Eco.', ['Eco']], ['Occhio Vacuo', 'U', 3, 2, 4, "Quando entra: rivela la mano dell'avversario. Le carte rivelate restano scoperte finché non vengono giocate."], ['Sussurro', 'I', 2, 0, 0, "Un'unità nemica ottiene -2 attacco permanente (non scende sotto 0)."], ['Scriba del Nulla', 'U', 3, 2, 3, 'Quando entra: cerca nel tuo mazzo un incantesimo e mettilo in mano.'], ['Novizia del Velo', 'U', 1, 1, 2, 'Quando muore: infligge 1 danno a un Sigillo nemico casuale.'], ['Tributo', 'I', 1, 0, 0, 'Sacrifica una tua unità: ottieni 1 Cristallo in questo turno e pesca 1 carta.'], ['Scheletro Rianimato', 'U', 2, 2, 2, 'Eco.', ['Eco']], ['Sussurro del Pozzo', 'I', 2, 0, 0, "Cerca nel tuo mazzo un'unità che costa 3 o meno e mettila in mano."]],
        u: [['Mietitrice', 'U', 4, 3, 3, "Quando un'altra unità muore, tua o nemica: ottiene +1/+1."], ['Richiamo dalla Fossa', 'I', 3, 0, 0, "Riporta in mano l'unità più costosa del tuo cimitero."], ['Altare Crepato', 'R', 1, 0, 0, "Quando sacrifichi un'unità, finché questo Sigillo è intatto: infliggi 1 danno a un Sigillo nemico casuale."], ["Ladro d'Anime", 'U', 3, 3, 3, "Quando entra: puoi sacrificare un'altra tua unità; aggiunge il suo attacco e la sua salute rimasta."], ['Pipistrello di Cripta', 'U', 3, 2, 2, 'Aggirare. Veleno.', ['Aggirare', 'Veleno']], ['Negromante', 'U', 4, 4, 3, "Quando entra: rimette in gioco dal tuo cimitero un'unità che costa 2 o meno."], ['Reliquiario Oscuro', 'R', 2, 0, 0, 'Finché questo Sigillo è intatto: la prima volta che una tua unità muore in ogni turno, pesca 1 carta.'], ['Sacerdotessa del Nulla', 'U', 3, 2, 4, 'Rintocco: rimette in gioco dal tuo cimitero la tua unità più costosa.']],
        r: [['Divoratore di Stelle', 'U', 6, 6, 6, 'Costa 1 in meno per ogni unità nel tuo cimitero, fino a 4 in meno.'], ['Eclissi', 'I', 5, 0, 0, "Distruggi un'unità a tua scelta."], ['Sovrano Cavo', 'U', 5, 4, 4, 'Eco. Assedio.', ['Eco', 'Assedio']], ['Grande Eclisse', 'I', 4, 0, 0, 'Distruggi tutte le unità con 3 o meno di attacco, tue e nemiche.'], ['Divoratore di Anime', 'U', 5, 4, 4, "Quando entra: puoi sacrificare un'altra tua unità; se lo fai ottiene +3/+3."], ['Patto delle Ombre', 'I', 2, 0, 0, "Distruggi un'unità nemica. Infliggi 3 danni a un tuo Sigillo casuale."], ['Arcivescovo del Silenzio', 'U', 5, 4, 5, 'Le tue altre unità di Vuoto hanno Eco.']],
        l: [['Nyxa, Regina del Nulla', 'U', 7, 5, 5, "Quando entra: rimette in gioco dal tuo cimitero la tua unità più costosa, nella sua corsia o nella più vicina con spazio."], ['Il Silenzio', 'I', 7, 0, 0, 'Distruggi tutte le unità. Per ognuna, infliggi 1 danno a un Sigillo nemico casuale.'], ['Hel, Regina dei Morti', 'U', 8, 6, 8, 'Quando entra: rimette in gioco dal tuo cimitero le tue due unità più costose.'], ['Il Grande Patto', 'R', 7, 0, 0, "All'inizio del tuo turno, finché questo Sigillo è intatto: sacrifica la tua unità più debole e infliggi 2 danni a un Sigillo nemico casuale."]],
    },
};

export const CARDS: CardDef[] = [];
export const BYID: Record<string, CardDef> = {};
for (const f of Object.keys(RAW) as Faction[]) for (const r of ['c', 'u', 'r', 'l'] as Rarity[]) RAW[f][r].forEach((x, i) => {
    const c: CardDef = {
        id: `${f}-${r}${i}`,
        n: x[0],
        t: x[1],
        c: x[2],
        a: x[3],
        h: x[4],
        tx: x[5],
        kw: x[6] ?? [],
        f,
        r
    };
    CARDS.push(c);
    BYID[c.id] = c;
});
export const TOKENS: Record<string, CardDef> = {
    'tok-germoglio': {
        id: 'tok-germoglio',
        n: 'Germoglio',
        t: 'U',
        f: 'radice',
        r: 'c',
        c: 1,
        a: 1,
        h: 1,
        tx: 'Cresce. Evocato da una carta.',
        kw: ['Cresce'],
        token: true
    },
    'tok-cucciolo': {
        id: 'tok-cucciolo',
        n: 'Cucciolo',
        t: 'U',
        f: 'radice',
        r: 'c',
        c: 2,
        a: 2,
        h: 2,
        tx: 'Evocato da Orsa Madre.',
        kw: [],
        token: true
    },
};
for (const c of CARDS) {
    const m = /Offerta (\d)/.exec(c.tx);
    if (m) c.offer = Number(m[1]);
}
export const cardInfo = (id: string): CardDef => BYID[id] ?? TOKENS[id];
export const BY_RARITY: Record<Rarity, CardDef[]> = {c: [], u: [], r: [], l: []};
CARDS.forEach(c => BY_RARITY[c.r].push(c));
export const TOTAL_COPIES = CARDS.reduce((s, c) => s + RARITY[c.r].max, 0);
