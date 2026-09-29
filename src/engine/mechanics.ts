// Meccaniche della Rosa: Sincronie tra carte legate dalla lore, Presagi di corsia, Ultimo Rintocco, Ascesa.
import type { Faction, Game, Unit } from './types';

/* ---------- Sincronie: due carte legate dalla lore si potenziano se sono entrambe in gioco dalla tua parte ---------- */
export interface Synergy { id: string; name: string; a: string; b: string; bonus: Record<string, [number, number]>; text: string }
export const SYNERGIES: Synergy[] = [
  { id: 'madri', name: 'Madri del bosco', a: 'radice-u3', b: 'radice-r2', bonus: { 'radice-u3': [1, 0], 'radice-r2': [0, 1] }, text: 'Lupa Grigia ottiene +1 attacco, Orsa Madre +1 salute.' },
  { id: 'fucina', name: 'La fucina', a: 'brace-c1', b: 'brace-c2', bonus: { 'brace-c2': [1, 1] }, text: 'Lanciafiamme Novizio ottiene +1/+1.' },
  { id: 'cenere', name: 'Guardia di Cenere', a: 'brace-c4', b: 'brace-r2', bonus: { 'brace-c4': [1, 1], 'brace-r2': [1, 0] }, text: 'Guardia di Cenere +1/+1, Capitana dei Roghi +1 attacco.' },
  { id: 'rinascita', name: 'Rinascita', a: 'brace-l1', b: 'brace-r0', bonus: { 'brace-r0': [2, 0] }, text: 'Con Il Primo Fuoco su un tuo Sigillo, Fenice Minore ha +2 attacco.' },
  { id: 'scintilla', name: 'La prima scintilla', a: 'brace-l1', b: 'brace-c0', bonus: { 'brace-c0': [1, 1] }, text: 'Con Il Primo Fuoco su un tuo Sigillo, Scintilla Errante ha +1/+1.' },
  { id: 'rotta', name: 'Canto e rotta', a: 'marea-r2', b: 'marea-l0', bonus: { 'marea-r2': [1, 1], 'marea-l0': [1, 1] }, text: 'Ammiraglio Salmastro e Thalassa ottengono +1/+1.' },
  { id: 'profezia', name: 'La profezia', a: 'marea-u0', b: 'marea-l0', bonus: { 'marea-u0': [1, 1] }, text: 'Veggente delle Maree ottiene +1/+1.' },
  { id: 'atlantide', name: 'Guardiani di Atlantide', a: 'marea-c3', b: 'marea-u3', bonus: { 'marea-c3': [0, 2], 'marea-u3': [0, 2] }, text: 'Sentinella di Corallo e Custode del Golfo ottengono +2 salute.' },
  { id: 'querce', name: 'Voci della foresta', a: 'radice-c1', b: 'radice-u0', bonus: { 'radice-c1': [1, 1] }, text: 'Druida di Muschio ottiene +1/+1.' },
  { id: 'caccia', name: 'La caccia infinita', a: 'radice-c4', b: 'radice-c2', bonus: { 'radice-c4': [2, 0] }, text: 'Arciera del Sottobosco ottiene +2 attacco.' },
  { id: 'ago', name: "L'anima nell'ago", a: 'vuoto-u3', b: 'vuoto-r2', bonus: { 'vuoto-u3': [1, 0], 'vuoto-r2': [0, 1] }, text: "Ladro d'Anime ottiene +1 attacco, Sovrano Cavo +1 salute." },
  { id: 'lupi', name: 'Fratelli lupi', a: 'vuoto-r0', b: 'radice-u3', bonus: { 'vuoto-r0': [1, 0], 'radice-u3': [1, 0] }, text: 'Divoratore di Stelle e Lupa Grigia ottengono +1 attacco.' },
  { id: 'devoti', name: 'Candela nera', a: 'vuoto-c0', b: 'vuoto-l0', bonus: { 'vuoto-c0': [1, 1] }, text: 'Accolito Velato ottiene +1/+1.' },
  { id: 'orfeo', name: 'Non voltarti', a: 'vuoto-c3', b: 'vuoto-u0', bonus: { 'vuoto-c3': [1, 0] }, text: 'Spettro Ramingo ottiene +1 attacco finché la Mietitrice è in gioco.' },
];
export const synergiesOf = (id: string) => SYNERGIES.filter(s => s.a === id || s.b === id);
const inPlay = (G: Game, p: number, id: string) => G.p[p].board.some(B => B.some(u => u.id === id && !u.dead)) || G.p[p].relics.some((r, l) => r === id && G.p[p].seals[l] > 0);
/** Sincronie attive per un'unità in gioco. */
export function activeSynergies(G: Game, p: number, u: Unit) {
  return SYNERGIES.filter(s => s.bonus[u.id] && (s.a === u.id ? inPlay(G, p, s.b) : inPlay(G, p, s.a)));
}
export function synergyBonus(G: Game, p: number, u: Unit): [number, number] {
  let a = 0, h = 0; for (const s of activeSynergies(G, p, u)) { a += s.bonus[u.id][0]; h += s.bonus[u.id][1]; } return [a, h];
}

/* ---------- Presagi di corsia: ogni partita, ogni corsia riceve una condizione ---------- */
export type OmenId = 'nebbia' | 'consacrata' | 'cenere' | 'eclissi' | 'radici' | 'campane';
export const OMENS: Record<OmenId, { name: string; text: string; icon: string; short: string }> = {
  nebbia:     { name: 'Nebbia',            text: 'Le unità in questa corsia non possono essere bersagliate da incantesimi ed effetti.', icon: '☁' , short: 'Unità non bersagliabili' },
  consacrata: { name: 'Terra consacrata',  text: 'Le unità in questa corsia hanno +1 salute.', icon: '✚' , short: '+1 salute alle unità' },
  cenere:     { name: 'Vento di cenere',   text: 'Le unità in questa corsia hanno +1 attacco.', icon: '🜂' , short: '+1 attacco alle unità' },
  eclissi:    { name: 'Eclissi',           text: 'I colpi ai Sigilli di questa corsia infliggono 1 danno in più.', icon: '◐' , short: '+1 danno ai Sigilli' },
  radici:     { name: 'Radici antiche',    text: 'Le unità non possono entrare in questa corsia né uscirne spostandosi.', icon: '⚘' , short: 'Niente spostamenti' },
  campane:    { name: 'Campane a morto',   text: 'Quando un\'unità muore in questa corsia, il Sigillo del suo proprietario in questa corsia recupera 1 punto vita.', icon: '🔔' , short: 'Ogni morte cura 1 il Sigillo' },
};
export const omenAt = (G: Game, l: number): OmenId | null => G.omens?.[l] ?? null;

/* ---------- Ultimo Rintocco: quando un tuo Sigillo si spezza, la tua fazione risponde una volta ---------- */
export const BELLS: Record<Faction, { name: string; text: string }> = {
  brace:  { name: 'Rogo finale',      text: 'Infligge 2 danni a ogni unità nemica nella corsia del Sigillo spezzato.' },
  marea:  { name: 'Ultima risacca',   text: "Riporta in mano all'avversario le sue unità nella corsia del Sigillo spezzato." },
  radice: { name: 'Radici profonde',  text: 'Ripristina 3 punti vita a ogni altro tuo Sigillo.' },
  vuoto:  { name: 'Patto finale',     text: 'Peschi 2 carte e ottieni subito 2 Cristalli.' },
};

/* ---------- Ascesa: un'unità che sopravvive a 3 combattimenti ascende ---------- */
export const ASCEND_FIGHTS = 2;
export const ASCEND_TEXT = "Un'unità che sopravvive a 2 combattimenti ascende: ottiene +2/+2 e un'aura dorata.";

/* ---------- Custodi del Sigillo: l'eroe del mazzo. Un effetto sempre attivo e un Ultimo Rintocco personale ---------- */
export type CustodeId = 'vesta' | 'ladro' | 'veggente' | 'nocchiero' | 'guardaboschi' | 'madre' | 'traghettatore' | 'ecate';
export interface Custode { id: CustodeId; f: Faction; name: string; title: string; art: string; passive: string; bell: string; bellName: string; lore: string; insp: string }
export const CUSTODI: Record<CustodeId, Custode> = {
  vesta: { id: 'vesta', f: 'brace', name: 'Vesta', title: 'Custode della Fiamma', art: 'brace-c4', insp: 'Vesta e le Vestali',
    passive: "La prima unità che giochi ogni turno ottiene +1 attacco.", bellName: 'Fiamma eterna', bell: 'Evoca una Scintilla Errante in ogni tua corsia con spazio.',
    lore: "La prima delle Vestali, che non ha mai lasciato spegnere il Primo Fuoco. Dicono che non dorma da mille anni." },
  ladro: { id: 'ladro', f: 'brace', name: 'Il Ladro senza Nome', title: 'Portatore del Fuoco', art: 'brace-l1', insp: 'Prometeo',
    passive: 'Il primo incantesimo che giochi ogni turno costa 1 Cristallo in meno.', bellName: 'Fuoco rubato', bell: 'Infligge 3 danni a un Sigillo nemico casuale.',
    lore: "Rubò la prima fiamma alla Notte e la regalò ai mortali. Per punizione fu incatenato, ma le catene si sciolsero al suo calore." },
  veggente: { id: 'veggente', f: 'marea', name: 'Cassandra delle Maree', title: 'La Voce non creduta', art: 'marea-u0', insp: 'Cassandra',
    passive: 'Inizi la partita con 1 carta in più.', bellName: 'Profezia', bell: 'Peschi 3 carte.',
    lore: "Ha visto ogni Sigillo cadere prima che accadesse. Nessuno le ha mai creduto, quindi ha smesso di avvertire e ha cominciato a prepararsi." },
  nocchiero: { id: 'nocchiero', f: 'marea', name: 'Il Nocchiero delle Secche', title: 'Guida tra gli scogli', art: 'marea-r2', insp: "Odisseo e i nocchieri dell'Odissea",
    passive: 'Il primo spostamento di ogni turno non costa Cristalli.', bellName: 'Mareggiata', bell: "Riporta in mano all'avversario tutte le sue unità che costano 3 o meno.",
    lore: "Conosce ogni corrente tra Scilla e Cariddi. Si dice che abbia portato a casa un re che il mare non voleva lasciar andare." },
  guardaboschi: { id: 'guardaboschi', f: 'radice', name: "L'Uomo Verde", title: 'Guardaboschi', art: 'radice-u0', insp: "L'Uomo Verde delle cattedrali europee",
    passive: 'Le tue unità nella corsia centrale hanno +1 salute.', bellName: 'Primavera', bell: 'Evoca due Germogli nella corsia del Sigillo spezzato e ripristina 2 punti vita agli altri tuoi Sigilli.',
    lore: "Il volto di foglie scolpito nelle chiese più antiche. Quando la pietra si crepa, è lui che ci fa crescere il muschio." },
  madre: { id: 'madre', f: 'radice', name: 'La Madre delle Stagioni', title: 'Signora del raccolto', art: 'radice-r1', insp: 'Demetra',
    passive: 'Alla fine del tuo turno ripristina 1 punto vita al tuo Sigillo più debole.', bellName: 'Raccolto', bell: 'Le tue unità in gioco ottengono +1/+1.',
    lore: "Cerca la figlia ogni inverno e la ritrova ogni primavera. Finché cerca, niente cresce; quando la trova, tutto rinasce." },
  traghettatore: { id: 'traghettatore', f: 'vuoto', name: 'Il Traghettatore', title: 'Nocchiero dei morti', art: 'vuoto-c3', insp: 'Caronte',
    passive: 'La prima tua unità che muore ogni turno infligge 1 danno al Sigillo nemico della sua corsia.', bellName: "L'obolo", bell: "Riporta in mano l'unità più costosa del tuo cimitero: costa 0.",
    lore: "Porta le anime sull'altra riva per una moneta. Chi non ha la moneta resta sulla riva, e chi resta, prima o poi, torna a combattere." },
  ecate: { id: 'ecate', f: 'vuoto', name: 'Ecate dei Crocevia', title: 'Signora delle soglie', art: 'vuoto-c0', insp: 'Ecate',
    passive: 'Inizi la partita con un Cristallo in più.', bellName: 'Crocevia', bell: "Distrugge l'unità nemica con più attacco.",
    lore: "Tiene le chiavi di ogni soglia tra i mondi. Fu lei a indicare al Ladro la strada per rubare il fuoco, e lei a chiudergli la porta alle spalle." },
};
export const custodiOf = (f: Faction) => (Object.values(CUSTODI) as Custode[]).filter(c => c.f === f);
