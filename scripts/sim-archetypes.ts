// Simulazione dei mazzi archetipo: ogni archetipo contro ogni altro, IA contro IA, con il proprio Custode.
// Uso: npm run sim:arch              (60 partite per scontro)
//      SIM_N=200 npm run sim:arch    (numeri più stabili)
// Stampa la percentuale di vittorie di ogni archetipo, la durata media e la tabella degli scontri diretti
// (riga contro colonna). Obiettivo di bilanciamento: tutti tra 45% e 55%.
import {aiChoose, aiGuards, apply, bestAction, BYID, combatLane, endTurnEffects, newGame, RARITY, startTurn} from '../src/engine';
import {ARCHETYPES} from '../src/economy/decks';

const N = Number(process.env.SIM_N ?? 60);
const A = ARCHETYPES;

// prima di simulare: ogni mazzo deve essere legale (30 carte, copie nei limiti, al massimo due fazioni)
for (const a of A) {
    const cnt: Record<string, number> = {};
    a.cards.forEach(id => (cnt[id] = (cnt[id] ?? 0) + 1));
    const bad = Object.entries(cnt).filter(([id, n]) => !BYID[id] || n > RARITY[BYID[id].r].max).map(([id, n]) => `${id}x${n}`);
    if (a.cards.length !== 30 || bad.length || new Set(a.cards.map(id => BYID[id]?.f)).size > 2)
        throw new Error(`${a.id} non valido: ${a.cards.length} carte ${bad.join(' ')}`);
}
const win: Record<string, number> = {}, games: Record<string, number> = {}, turns: Record<string, number> = {};
const vs: Record<string, Record<string, [number, number]>> = {};

for (const x0 of A) for (const y0 of A) {
    if (x0.id >= y0.id) continue;
    for (let i = 0; i < N; i++) {
        // lati alternati, così chi inizia non pesa sul risultato
        const [x, y] = i % 2 ? [x0, y0] : [y0, x0];
        const G = newGame({name: x.id, deck: x.cards}, {name: y.id, deck: y.cards}, {custodi: [x.custode ?? null, y.custode ?? null]});
        let p = G.first;
        for (let t = 0; t < 90 && G.winner == null; t++) {
            startTurn(G, p);
            aiChoose(G, p);
            for (let k = 0; k < 12 && G.winner == null; k++) {
                const act = bestAction(G, p, 0.15);
                if (!act) break;
                apply(G, p, act);
            }
            aiGuards(G, p);
            endTurnEffects(G, p);
            for (let l = 0; l < 3 && G.winner == null; l++) combatLane(G, p, l);
            p = 1 - p;
        }
        for (const [d, o, side] of [[x, y, 0], [y, x, 1]] as const) {
            games[d.id] = (games[d.id] ?? 0) + 1;
            turns[d.id] = (turns[d.id] ?? 0) + G.turn;
            const r = ((vs[d.id] ??= {})[o.id] ??= [0, 0]);
            r[1]++;
            if (G.winner === side) {
                win[d.id] = (win[d.id] ?? 0) + 1;
                r[0]++;
            }
        }
    }
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
console.log(`\n${N} partite per scontro\n`);
for (const a of [...A].sort((p, q) => (win[q.id] ?? 0) / games[q.id] - (win[p.id] ?? 0) / games[p.id])) {
    const w = pct(win[a.id] ?? 0, games[a.id]);
    console.log(`${a.archetype.padEnd(10)} ${a.name.padEnd(22)} ${String(w).padStart(3)}%  ${(turns[a.id] / games[a.id]).toFixed(1)} turni  ${w > 55 || w < 45 ? '<-- fuori' : ''}`);
}
console.log('\n' + ' '.repeat(10) + A.map(a => a.archetype.slice(0, 5).padStart(6)).join(''));
for (const a of A) console.log(a.archetype.slice(0, 9).padEnd(10) + A.map(b => (a.id === b.id ? '     -' : String(pct(...(vs[a.id]?.[b.id] ?? [0, 0]))).padStart(6))).join(''));
