import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { BYID, CARDS, CUSTODI, custodiOf, FACTIONS, RARITY, TYPES, type CardType, type Faction } from '../../engine';
import { CustodeCard, CustodePortrait } from '../custodi/CustodeCard';
import { Card } from '../../cards/Card';
import { CardArt } from '../../cards/art/CardArt';
import { FACTION_GLYPH, Glyph, RarityGem, StatGem, TYPE_GLYPH } from '../../cards/glyphs';
import { FACTION_LORE } from '../../cards/lore';
import { ARCHETYPES, countMap, type Deck, deckIssues, PRESETS } from '../../economy/decks';
import { decodeDeck, encodeDeck } from '../../economy/deckCode';
import { BACKS } from '../../economy/constants';
import { CardBack } from '../battle/CardBack';
import { lookOf, useProfile } from '../../profile/store';
import { Confirm } from '../../ui/Confirm';
import { PageHeader } from '../../ui/PageHeader';
import { toast } from '../../ui/toast';
import u from '../../ui/ui.module.css';
import { siteImg } from '../../cards/art/site';
import s from './decks.module.css';

const FACS = Object.keys(FACTIONS) as Faction[];
const champion = (d: Deck) => [...d.cards].sort((a, b) => BYID[b].c - BYID[a].c || 'lruc'.indexOf(BYID[a].r) - 'lruc'.indexOf(BYID[b].r))[0];
const curveOf = (cards: string[]) => { const c = [0, 0, 0, 0, 0, 0, 0, 0]; cards.forEach(id => c[Math.min(7, BYID[id].c)]++); return c; };

function Ring({ n, max = 30 }: { n: number; max?: number }) {
  const ok = n === max;
  return (
    <svg viewBox="0 0 44 44" className={s.ring} aria-label={`${n} carte su ${max}`}>
      <circle cx="22" cy="22" r="18" className={s.ringTrack} />
      <circle cx="22" cy="22" r="18" className={`${s.ringFill} ${ok ? s.ringOk : ''}`} style={{ strokeDasharray: `${(Math.min(n, max) / max) * 113} 113` }} />
      <text x="22" y="26.5" textAnchor="middle">{n}</text>
    </svg>
  );
}
function Curve({ cards, big }: { cards: string[]; big?: boolean }) {
  const c = curveOf(cards), mx = Math.max(1, ...c);
  return <div className={`${s.curve} ${big ? s.curveBig : ''}`} aria-label="Curva dei costi">{c.map((v, i) => <div key={i}><b style={{ height: `${(v / mx) * 100}%` }}>{big && v ? <em>{v}</em> : null}</b>{<span>{i === 7 ? '7+' : i}</span>}</div>)}</div>;
}

export function DecksScreen() {
  const p = useProfile();
  const [edit, setEdit] = useState<string | null>(null), [del, setDel] = useState<string | null>(null), [code, setCode] = useState('');
  const importCode = () => { const d = decodeDeck(code); if (!d) { toast('Codice non valido'); return; } if (p.decks.length >= 8) { toast('Hai già 8 mazzi'); return; }
    const id = p.deck.create(); p.deck.update(id, d); const miss = d.cards.filter((c, i) => d.cards.slice(0, i).filter(x => x === c).length >= (p.owned[c] || 0)).length;
    toast(miss ? `Mazzo importato: ti mancano ${miss} carte, puoi crearle dalla Collezione` : `Mazzo «${d.name}» importato`); setCode(''); };
  const copyCode = async (d: Deck) => { const c = encodeDeck(d); try { await navigator.clipboard.writeText(c); toast('Codice del mazzo copiato'); } catch { window.prompt('Copia questo codice:', c); } };
  if (edit && p.decks.some(d => d.id === edit)) return <DeckEditor id={edit} onDone={() => setEdit(null)} />;
  return (
    <section className={u.page}>
      <PageHeader title="Mazzi" sub="30 carte, al massimo due fazioni. Il mazzo in uso è quello con il sigillo dorato." />
      <div className={s.codeBox}><input value={code} onChange={e => setCode(e.target.value)} placeholder="Incolla un codice mazzo (RDECK1:…)" aria-label="Codice mazzo" /><button className={u.btn} disabled={!code.trim()} onClick={importCode}>Importa mazzo</button></div>
      <div className={s.boxes}>
        {p.decks.map((d, i) => { const iss = deckIssues(d, p.owned), ch = champion(d), facs = d.fac.length ? d.fac : [...new Set(d.cards.map(c => BYID[c].f))], active = d.id === p.activeDeck;
          return (
            <motion.article key={d.id} className={`${s.box} ${active ? s.active : ''}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ ['--f1' as string]: FACTIONS[facs[0] ?? 'brace'].col, ['--f2' as string]: FACTIONS[facs[1] ?? facs[0] ?? 'vuoto'].col }}>
              <button className={s.boxArt} onClick={() => setEdit(d.id)} aria-label={`Modifica ${d.name}`}>
                {ch ? <CardArt id={ch} style={lookOf(p, ch).art} arch={false} /> : facs[0] && siteImg(`casata-${facs[0]}`) ? <img src={siteImg(`casata-${facs[0]}`)} alt="" /> : <div className={s.emptyArt} />}
                <div className={s.crests}>{facs.map(f => <span key={f} className={s.crest} style={{ ['--fc' as string]: FACTIONS[f].col }} title={FACTIONS[f].name}><Glyph>{FACTION_GLYPH[f]}</Glyph></span>)}</div>
                {active && <span className={s.inUse}>In uso</span>}
                {d.custode && <span className={s.boxCust}><CustodePortrait id={d.custode} /></span>}
              </button>
              <div className={s.boxBody}>
                <div className={s.boxTop}><h3>{d.name}</h3><Ring n={d.cards.length} /></div>
                <Curve cards={d.cards} />
                {iss.length > 0 ? <p className={s.warn}>{iss.join(', ')}</p> : <p className={s.okTxt}>{facs.map(f => FACTIONS[f].name).join(' e ')}{d.custode ? `, custode ${CUSTODI[d.custode].name}` : ch ? `, guidato da ${BYID[ch].n}` : ''}</p>}
                <div className={s.boxActions}>
                  <button className={`${u.btn} ${u.sm} ${u.primary}`} onClick={() => setEdit(d.id)}>Modifica</button>
                  {!active && !iss.length && <button className={`${u.btn} ${u.sm}`} onClick={() => p.deck.setActive(d.id)}>Usa</button>}
                  <button className={`${u.btn} ${u.sm}`} onClick={() => void copyCode(d)}>Codice</button>
                  {p.decks.length > 1 && <button className={`${u.btn} ${u.sm}`} onClick={() => setDel(d.id)}>Elimina</button>}
                </div>
              </div>
            </motion.article>);
        })}
        {p.decks.length < 8 && <button className={s.newBox} onClick={() => setEdit(p.deck.create())}><span>+</span>Nuovo mazzo</button>}
      </div>
      <details className={s.suggest}>
        <summary><span>Mazzi suggeriti</span><em>{PRESETS.length} mazzi base e {ARCHETYPES.length} mazzi per archetipo, pronti da copiare</em></summary>
      <h3 className={s.suggestSub}>Mazzi base</h3>
      <p className={u.muted}>Quattro mazzi pronti, ciascuno con il suo Custode del Sigillo. Si giocano con la collezione iniziale: aggiungine una copia e modificala come vuoi.</p>
      <div className={s.presets}>
        {PRESETS.map(pr => (
          <article key={pr.id} className={s.preset} style={{ ['--f1' as string]: FACTIONS[pr.fac[0]].col, ['--f2' as string]: FACTIONS[pr.fac[1]].col }}>
            {pr.custode && <CustodePortrait id={pr.custode} className={s.presetPortrait} />}
            <div>
              <h3>{pr.name}</h3>
              <div className={s.presetMeta}>{pr.fac.map(f => <span key={f} style={{ color: FACTIONS[f].col }}><Glyph>{FACTION_GLYPH[f]}</Glyph>{FACTIONS[f].name}</span>)}{pr.custode && <em>Custode: {CUSTODI[pr.custode].name}</em>}</div>
              <p>{pr.blurb}</p>
              <button className={`${u.btn} ${u.sm}`} disabled={p.decks.length >= 8} onClick={() => { const m = p.deck.addPreset(pr.id); toast(m || `${pr.name} aggiunto ai tuoi mazzi`); }}>{p.decks.some(d => d.id === pr.id) ? 'Aggiungi un\'altra copia' : 'Aggiungi ai miei mazzi'}</button>
            </div>
          </article>
        ))}
      </div>
      <h3 className={s.suggestSub}>Mazzi per archetipo</h3>
      <p className={u.muted}>Un modello per ogni stile di gioco. Aggiungine una copia: le carte che non possiedi restano segnate e puoi crearle dalla Collezione o sostituirle.</p>
      <div className={s.presets}>
        {ARCHETYPES.map(ar => { const cnt = countMap(ar.cards), miss = Object.entries(cnt).reduce((a, [id, n]) => a + Math.max(0, n - (p.owned[id] || 0)), 0);
          return (
            <article key={ar.id} className={s.preset} style={{ ['--f1' as string]: FACTIONS[ar.fac[0]].col, ['--f2' as string]: FACTIONS[ar.fac[ar.fac.length - 1]].col }}>
              {ar.custode && <CustodePortrait id={ar.custode} className={s.presetPortrait} />}
              <div>
                <span className={s.archTag}>{ar.archetype}</span>
                <h3>{ar.name}</h3>
                <div className={s.presetMeta}>{ar.fac.map(f => <span key={f} style={{ color: FACTIONS[f].col }}><Glyph>{FACTION_GLYPH[f]}</Glyph>{FACTIONS[f].name}</span>)}{ar.custode && <em>Custode: {CUSTODI[ar.custode].name}</em>}</div>
                <p>{ar.blurb}</p>
                <p className={miss ? s.missing : s.complete}>{miss ? `Ti mancano ${miss} carte su 30` : 'Hai tutte le carte'}</p>
                <button className={`${u.btn} ${u.sm}`} disabled={p.decks.length >= 8} onClick={() => { const m = p.deck.addPreset(ar.id); toast(m || `${ar.name} aggiunto ai tuoi mazzi`); }}>Aggiungi ai miei mazzi</button>
              </div>
            </article>);
        })}
      </div>
      </details>
      <Confirm open={!!del} title="Eliminare il mazzo?" text={`"${p.decks.find(d => d.id === del)?.name ?? ''}" verrà eliminato. Le carte restano nella collezione.`} confirmLabel="Elimina" onConfirm={() => del && p.deck.remove(del)} onClose={() => setDel(null)} />
    </section>
  );
}

function DeckEditor({ id, onDone }: { id: string; onDone: () => void }) {
  const p = useProfile(); const d = p.decks.find(x => x.id === id)!;
  const [q, setQ] = useState(''), [cost, setCost] = useState<number | null>(null), [type, setType] = useState<CardType | null>(null);
  const cnt = countMap(d.cards), iss = deckIssues(d, p.owned);
  const pool = useMemo(() => CARDS.filter(c => p.owned[c.id] && (!d.fac.length || d.fac.includes(c.f)) && (cost == null || (cost === 7 ? c.c >= 7 : c.c === cost)) && (!type || c.t === type) && (!q || (c.n + ' ' + c.tx).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => a.c - b.c || a.n.localeCompare(b.n)), [p.owned, d.fac, cost, type, q]);
  const rows = Object.keys(cnt).sort((a, b) => BYID[a].c - BYID[b].c || BYID[a].n.localeCompare(BYID[b].n));
  const msg = (m: string | void) => { if (m) toast(m); };
  return (
    <section className={`${u.page} ${s.editorPage}`}>
      <div className={s.editorHead}>
        <button className={u.btn} onClick={onDone}>← Mazzi</button>
        <input className={s.name} value={d.name} maxLength={32} aria-label="Nome del mazzo" onChange={e => p.deck.update(id, { name: e.target.value })} />
        <div className={s.facPick} role="group" aria-label="Fazioni del mazzo">
          {FACS.map(f => (
            <button key={f} className={s.facBtn} aria-pressed={d.fac.includes(f)} style={{ ['--fc' as string]: FACTIONS[f].col }} onClick={() => msg(p.deck.toggleFaction(id, f))} title={`${FACTIONS[f].name}: ${FACTION_LORE[f].motto}`}>
              <Glyph>{FACTION_GLYPH[f]}</Glyph><span>{FACTIONS[f].name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={s.custodi}>
        <div className={s.custodiHead}><h2>Custode del Sigillo</h2><span>L'eroe del mazzo: un effetto sempre attivo e un Ultimo Rintocco personale.</span></div>
        <div className={s.custodiList}>
          <button className={s.custOpt} aria-pressed={!d.custode} onClick={() => p.deck.update(id, { custode: null })}>
            <span className={s.noneCust}>–</span><span><b>Nessun Custode</b><small>Usa l'Ultimo Rintocco della fazione principale.</small></span>
          </button>
          {(d.fac.length ? d.fac : FACS).flatMap(f => custodiOf(f)).map(cu => (
            <button key={cu.id} className={s.custOpt} aria-pressed={d.custode === cu.id} onClick={() => p.deck.update(id, { custode: cu.id })}>
              <CustodePortrait id={cu.id} /><span><b>{cu.name}</b><small>{cu.passive}</small></span>
            </button>
          ))}
        </div>
        {d.custode && <CustodeCard id={d.custode} />}
      </div>
      <div className={s.backPick}>
        <div className={s.custodiHead}><h2>Dorso del mazzo</h2><span>{p.backMode === 'deck' ? 'Ogni mazzo usa il proprio dorso.' : 'Stai usando un dorso unico per tutti i mazzi: cambialo nel Pass, oppure passa ai dorsi per mazzo.'}</span>
          <button className={`${u.btn} ${u.sm}`} onClick={() => p.setBackMode(p.backMode === 'deck' ? 'global' : 'deck')}>{p.backMode === 'deck' ? 'Usa un dorso per tutti' : 'Scegli un dorso per ogni mazzo'}</button></div>
        {p.backMode === 'deck' && <div className={s.backRow}>{p.backs.map(k => <button key={k} className={s.backOpt} aria-pressed={(d.back ?? p.back) === k} onClick={() => p.deck.update(id, { back: k })} title={BACKS[k]}><CardBack back={k} /></button>)}</div>}
      </div>
      <div className={s.editor}>
        <div>
          <div className={s.filters}>
            <input className={s.search} placeholder="Cerca per nome o testo…" value={q} onChange={e => setQ(e.target.value)} aria-label="Cerca carte" />
            <div className={s.costs} role="group" aria-label="Filtra per costo">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(c => <button key={c} aria-pressed={cost === c} onClick={() => setCost(cost === c ? null : c)}>{c === 7 ? '7+' : c}</button>)}
            </div>
            <div className={u.row}>
              {(['U', 'I', 'R'] as CardType[]).map(t => <button key={t} className={u.chip} aria-pressed={type === t} onClick={() => setType(type === t ? null : t)}><Glyph>{TYPE_GLYPH[t]}</Glyph>{TYPES[t]}</button>)}
            </div>
          </div>
          {!d.fac.length && <p className={s.hintBox}>Scegli fino a due fazioni in alto, oppure tocca una carta qualsiasi: la sua fazione verrà aggiunta.</p>}
          <div className={s.pool}>
            {pool.map(c => { const n = cnt[c.id] || 0, lim = Math.min(p.owned[c.id] || 0, RARITY[c.r].max), full = n >= lim;
              return (
                <motion.button key={c.id} className={`${s.poolCard} ${full ? s.full : ''}`} onClick={() => msg(p.deck.add(id, c.id))} whileHover={{ y: -6 }} whileTap={{ scale: 0.96 }} aria-label={`Aggiungi ${c.n}, ${n} di ${lim}`}>
                  <span className={s.have}>{n}/{lim}</span><Card card={c} look={lookOf(p, c.id)} />
                </motion.button>);
            })}
            {!pool.length && <p className={u.muted}>Nessuna carta con questi filtri.</p>}
          </div>
        </div>
        <aside className={s.side}>
          <div className={s.sideTop}><Ring n={d.cards.length} /><div>{iss.length ? <span className={s.warn}>{iss[0]}</span> : <span className={s.okTxt}>Mazzo pronto</span>}<div className={u.small + ' ' + u.muted}>Tocca una riga per togliere la carta</div></div></div>
          <Curve cards={d.cards} big />
          <div className={s.rows}>
            <AnimatePresence initial={false}>
              {rows.map(cid => { const c = BYID[cid];
                return (
                  <motion.button key={cid} layout className={s.rowBtn} style={{ ['--fc' as string]: FACTIONS[c.f].col }} onClick={() => p.deck.removeCard(id, cid)} aria-label={`Togli ${c.n}`}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                    <span className={s.rowArt}><CardArt id={cid} style={lookOf(p, cid).art} arch={false} /></span>
                    <StatGem kind="cost" value={c.c} className={s.rowCost} />
                    <span className={s.rowName}>{c.n}</span>
                    <RarityGem r={c.r} className={s.rowGem} />
                    <span className={s.rowN}>{cnt[cid] > 1 ? `×${cnt[cid]}` : ''}</span>
                  </motion.button>);
              })}
            </AnimatePresence>
            {!rows.length && <p className={u.muted}>Il mazzo è vuoto.</p>}
          </div>
          <div className={u.row}>
            <button className={`${u.btn} ${u.sm}`} disabled={d.cards.length >= 30 || !d.fac.length} onClick={() => p.deck.fill(id)}>Completa automaticamente</button>
            <button className={`${u.btn} ${u.sm}`} disabled={!d.cards.length} onClick={() => p.deck.update(id, { cards: [] })}>Svuota</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
