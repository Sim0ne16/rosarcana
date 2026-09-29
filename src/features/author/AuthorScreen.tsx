import {useMemo, useState} from 'react';
import {
    aiDeck,
    apply,
    attackers,
    attackOne,
    bestAction,
    BYID,
    CARDS,
    custodiOf,
    endTurnEffects,
    type Faction,
    FACTIONS,
    mainFaction,
    newGame,
    startTurn,
    SYNERGIES
} from '../../engine';
import {simulateEconomy} from '../../economy/estimate';
import {PageHeader} from '../../ui/PageHeader';
import u from '../../ui/ui.module.css';
import s from './author.module.css';

type Row = [string, number, number];

interface Report {
    games: number;
    first: number;
    turns: number;
    facs: Row[];
    cards: Row[];
    syn: Row[]
}

const pct = (w: number, n: number) => (n ? Math.round((w / n) * 100) : 0);

/** Una partita IA contro IA con statistiche; stessa logica delle simulazioni usate per il bilanciamento. */
function simGame(tier: number, acc: {
    fw: Record<string, number[]>;
    cw: Record<string, number[]>;
    sw: Record<string, number[]>
}) {
    const all = Object.keys(FACTIONS) as Faction[], pick = () => [...all].sort(() => Math.random() - 0.5).slice(0, 2);
    const fa = pick(), fb = pick(), da = aiDeck(fa, tier), db = aiDeck(fb, tier);
    const ca = custodiOf(mainFaction(da)), cb = custodiOf(mainFaction(db));
    const G = newGame({name: 'A', deck: da}, {
        name: 'B',
        deck: db
    }, {custodi: [ca[Math.floor(Math.random() * 2)].id, cb[Math.floor(Math.random() * 2)].id]});
    const played = [new Set<string>(), new Set<string>()], syn = [new Set<string>(), new Set<string>()];
    let p = G.first;
    while (G.winner == null && G.turn < 80) {
        startTurn(G, p);
        if (G.winner != null) break;
        for (let k = 0; k < 12; k++) {
            const a = bestAction(G, p, 1);
            if (!a) break;
            apply(G, p, a);
            if (G.winner != null) break;
        }
        if (G.winner != null) break;
        endTurnEffects(G, p);
        for (let l = 0; l < 3; l++) for (const x of attackers(G, p, l)) attackOne(G, p, l, x);
        for (const e of G.ev) if (e.t === 'play') played[e.p].add(e.id);
        for (let q = 0; q < 2; q++) {
            const ids = G.p[q].board.flat().map(x => x.id).concat(G.p[q].relics.filter(Boolean) as string[]);
            for (const sy of SYNERGIES) if (ids.includes(sy.a) && ids.includes(sy.b)) syn[q].add(sy.id);
        }
        G.ev = [];
        p = 1 - p;
    }
    if (G.winner == null) return null;
    [fa, fb].forEach((fs, q) => fs.forEach(f => {
        const r = (acc.fw[f] ??= [0, 0]);
        r[1]++;
        if (G.winner === q) r[0]++;
    }));
    for (let q = 0; q < 2; q++) {
        played[q].forEach(id => {
            const r = (acc.cw[id] ??= [0, 0]);
            r[1]++;
            if (G.winner === q) r[0]++;
        });
        syn[q].forEach(id => {
            const r = (acc.sw[id] ??= [0, 0]);
            r[1]++;
            if (G.winner === q) r[0]++;
        });
    }
    return {first: G.winner === G.first, turns: G.turn};
}

/** Pannello autore: bilanciamento (partite simulate) ed economia (tempo per completare il set). */
export function AuthorScreen({back}: { back: () => void }) {
    const [n, setN] = useState(200), [tier, setTier] = useState(2), [prog, setProg] = useState(0), [rep, setRep] = useState<Report | null>(null), [busy, setBusy] = useState(false);
    const [gpd, setGpd] = useState(8);
    const eco = useMemo(() => simulateEconomy({
        gamesPerDay: gpd,
        winRate: 0.5,
        questShare: 0.75,
        maxDays: 365
    }, 8), [gpd]);
    const run = () => {
        setBusy(true);
        setRep(null);
        setProg(0);
        const acc = {fw: {}, cw: {}, sw: {}} as {
            fw: Record<string, number[]>;
            cw: Record<string, number[]>;
            sw: Record<string, number[]>
        };
        let done = 0, first = 0, turns = 0, i = 0;
        const step = () => {
            const t0 = performance.now();
            while (i < n && performance.now() - t0 < 40) {
                const r = simGame(tier, acc);
                i++;
                if (r) {
                    done++;
                    turns += r.turns;
                    if (r.first) first++;
                }
            }
            setProg(i / n);
            if (i < n) {
                setTimeout(step, 0);
                return;
            }
            const rows = (m: Record<string, number[]>, min: number) => Object.entries(m).filter(([, v]) => v[1] >= min).map(([k, v]) => [k, pct(v[0], v[1]), v[1]] as Row).sort((a, b) => b[1] - a[1]);
            setRep({
                games: done,
                first: pct(first, done),
                turns: done ? turns / done : 0,
                facs: rows(acc.fw, 1),
                cards: rows(acc.cw, Math.max(8, n / 25)),
                syn: rows(acc.sw, 3)
            });
            setBusy(false);
        };
        setTimeout(step, 0);
    };
    const name = (id: string) => BYID[id]?.n ?? SYNERGIES.find(x => x.id === id)?.name ?? FACTIONS[id as Faction]?.name ?? id;
    const flag = (v: number) => (v >= 56 ? s.hot : v <= 44 ? s.cold : '');
    return (
        <section className={u.page}>
            <PageHeader title="Pannello autore"
                        sub="Strumenti per bilanciare il gioco: partite simulate tra IA e stima dell'economia. I risultati hanno qualche punto di rumore: con più partite sono più affidabili.">
                <button className={u.btn} onClick={back}>← Gioca</button>
            </PageHeader>
            <div className={s.grid}>
                <article className={s.box}>
                    <h2>Bilanciamento</h2>
                    <div className={u.row}>
                        <label>Partite <select value={n}
                                               onChange={e => setN(Number(e.target.value))}>{[100, 200, 500, 1000].map(x =>
                            <option key={x}>{x}</option>)}</select></label>
                        <label>Mazzi <select value={tier} onChange={e => setTier(Number(e.target.value))}>
                            <option value={0}>Comuni e non comuni</option>
                            <option value={1}>Con qualche rara</option>
                            <option value={2}>Rare e leggendarie</option>
                        </select></label>
                        <button className={`${u.btn} ${u.primary}`} disabled={busy}
                                onClick={run}>{busy ? `Simulo… ${Math.round(prog * 100)}%` : 'Avvia simulazione'}</button>
                    </div>
                    {busy && <div className={u.bar}><b style={{width: `${prog * 100}%`}}/></div>}
                    {rep && <>
                        <p className={s.sum}>{rep.games} partite, {rep.turns.toFixed(1)} turni in media. Chi inizia
                            vince il <b>{rep.first}%</b>.</p>
                        <h3>Fazioni</h3>
                        <div className={s.bars}>{rep.facs.map(([k, v]) => <div key={k}><span>{name(k)}</span><i
                            style={{width: `${v}%`, background: FACTIONS[k as Faction].col}}/><b
                            className={flag(v)}>{v}%</b></div>)}</div>
                        <h3>Carte (percentuale di vittoria quando giocate)</h3>
                        <div className={s.cols}>
                            <table>
                                <thead>
                                <tr>
                                    <th>Più forti</th>
                                    <th>%</th>
                                    <th>n</th>
                                </tr>
                                </thead>
                                <tbody>{rep.cards.slice(0, 10).map(([k, v, c]) => <tr key={k}>
                                    <td>{name(k)}</td>
                                    <td className={flag(v)}>{v}</td>
                                    <td>{c}</td>
                                </tr>)}</tbody>
                            </table>
                            <table>
                                <thead>
                                <tr>
                                    <th>Più deboli</th>
                                    <th>%</th>
                                    <th>n</th>
                                </tr>
                                </thead>
                                <tbody>{rep.cards.slice(-10).reverse().map(([k, v, c]) => <tr key={k}>
                                    <td>{name(k)}</td>
                                    <td className={flag(v)}>{v}</td>
                                    <td>{c}</td>
                                </tr>)}</tbody>
                            </table>
                        </div>
                        <h3>Sincronie</h3>
                        <table>
                            <tbody>{rep.syn.map(([k, v, c]) => <tr key={k}>
                                <td>{name(k)}</td>
                                <td className={flag(v)}>{v}%</td>
                                <td>{c} partite</td>
                            </tr>)}</tbody>
                        </table>
                        <p className={s.note}>Le carte giocate più spesso in partite lunghe tendono ad avere percentuali
                            alte anche solo perché compaiono quando si sta già vincendo: usa questi dati come indizi,
                            non come verdetti. Carte mai giocate
                            dall'IA: {CARDS.filter(c => !rep.cards.some(r => r[0] === c.id)).length}.</p>
                    </>}
                </article>
                <article className={s.box}>
                    <h2>Economia</h2>
                    <label>Partite al giorno <input type="range" min={2} max={20} value={gpd}
                                                    onChange={e => setGpd(Number(e.target.value))}/>
                        <b>{gpd}</b></label>
                    <p className={s.sum}>Un giocatore che non paga e vince metà delle partite completa il Set Base in
                        circa <b>{eco.days ?? 'più di 365'} giorni</b>. Nei primi 30 giorni apre
                        circa {eco.packsFirst30} bustine.</p>
                    <p className={s.note}>La stima include oro delle partite, prima vittoria del giorno, missioni (75%
                        completate), pass gratuito, polvere dei doppioni e creazione delle carte mancanti. Con 60 carte
                        il set si completa in fretta: per un obiettivo di circa due mesi servirà un set più ampio
                        (almeno 150 carte) oppure ricompense più basse.</p>
                </article>
            </div>
        </section>
    );
}
