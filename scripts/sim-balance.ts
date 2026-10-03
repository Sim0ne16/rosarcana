// Simulazione di bilanciamento: partite IA contro IA con mazzi monofazione.
// Uso: npm run sim            (200 partite per scontro)
//      SIM_N=400 npm run sim  (più partite, numeri più stabili)
// Stampa la percentuale di vittorie per fazione, gli scontri diretti e, per ogni carta, quanto spesso vince
// chi la gioca. Quest'ultimo dato va letto rispetto alla media della fazione, e con cautela per le carte che si
// giocano quando si è in svantaggio (cure, difese), che risultano più basse di quanto valgano.
import {aiChoose, aiDeck, aiGuards, apply, bestAction, BYID, combatLane, endTurnEffects, type Faction, newGame, startTurn} from '../src/engine';

const F: Faction[] = ['brace', 'marea', 'radice', 'vuoto'];
const N = Number(process.env.SIM_N ?? 200);
const wins: Record<string, number> = {}, games: Record<string, number> = {};
const played: Record<string, [won: number, total: number]> = {};
let turns = 0, total = 0, draws = 0;

for (const a of F) for (const b of F) {
    if (a >= b) continue;
    for (let i = 0; i < N; i++) {
        // lati alternati, così chi inizia non pesa sul risultato
        const [x, y] = i % 2 ? [a, b] : [b, a];
        const G = newGame({name: x, deck: aiDeck([x], 2)}, {name: y, deck: aiDeck([y], 2)});
        let p = G.first ?? 0;
        for (let t = 0; t < 90 && G.winner == null; t++) {
            startTurn(G, p);
            aiChoose(G, p);
            for (let k = 0; k < 12 && G.winner == null; k++) {
                const act = bestAction(G, p, 0.15);
                if (!act) break;
                apply(G, p, act);
            }
            // come in partita: l'IA tiene in guardia chi morirebbe attaccando senza uccidere
            aiGuards(G, p);
            endTurnEffects(G, p);
            for (let l = 0; l < 3 && G.winner == null; l++) combatLane(G, p, l);
            p = 1 - p;
        }
        turns += G.turn;
        total++;
        if (G.winner == null) {
            draws++;
            continue;
        }
        const seen = [new Set<string>(), new Set<string>()];
        for (const line of G.log) if (line.k === 'play') {
            const [q, id] = line.a as [number, string];
            seen[q].add(id);
        }
        seen.forEach((ids, q) => ids.forEach(id => {
            const r = (played[id] ??= [0, 0]);
            r[1]++;
            if (G.winner === q) r[0]++;
        }));
        const w = G.winner === 0 ? x : y, l = w === a ? b : a;
        wins[`${w}>${l}`] = (wins[`${w}>${l}`] ?? 0) + 1;
        wins[w] = (wins[w] ?? 0) + 1;
        games[a] = (games[a] ?? 0) + 1;
        games[b] = (games[b] ?? 0) + 1;
    }
}

const pct = (n: number) => `${(100 * n).toFixed(1)}%`;
console.log(`partite ${total} (${draws} senza vincitore), turni medi ${(turns / total).toFixed(1)}\n`);
for (const f of F) console.log(`${f.padEnd(7)} ${pct((wins[f] ?? 0) / games[f])}`);
console.log('');
for (const a of F) for (const b of F) if (a < b) console.log(`${a} vs ${b}: ${wins[`${a}>${b}`] ?? 0}-${wins[`${b}>${a}`] ?? 0}`);
for (const f of F) {
    const rate = (wins[f] ?? 0) / games[f];
    const rows = Object.entries(played).filter(([id, [, n]]) => id.startsWith(f) && n >= 40)
        .map(([id, [w, n]]) => ({id, d: w / n - rate})).sort((x, y) => y.d - x.d);
    console.log(`\n${f} (scarto dalla media della fazione):`);
    console.log(rows.map(r => `${BYID[r.id].n} ${r.d >= 0 ? '+' : ''}${Math.round(100 * r.d)}`).join(' | '));
}
