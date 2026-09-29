import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { activeSynergies, ASCEND_FIGHTS, BYID, cardInfo, FACTIONS, findU, KEYWORDS, LANE_NAME, omenAt, OMENS, RARITY, synergiesOf, TYPES, uAtk, uMax, type Game, type Keyword } from '../../engine';
import { Card } from '../../cards/Card';
import { FACTION_GLYPH, Glyph, RarityGem } from '../../cards/glyphs';
import { loreOf } from '../../cards/lore';
import { lookOf, useProfile } from '../../profile/store';
import { useBattle } from './store';
import s from './battle.module.css';

/** Pulsante lente: attiva la modalità dettaglio (anche con il tasto L). */
export function LensButton() {
  const lens = useBattle(st => st.lens); const b = useBattle.getState;
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.key === 'l' || e.key === 'L') && !(e.target as HTMLElement).closest('input,textarea')) b().toggleLens(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [b]);
  return (
    <button data-sfx="none" className={`${s.lens} ${lens ? s.lensOn : ''}`} onClick={() => b().toggleLens()} aria-pressed={lens} title="Lente: tocca una carta per vederla in dettaglio (tasto L, o clic destro su una carta)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="m15 15 6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      <span>{lens ? 'Lente attiva' : 'Lente'}</span>
    </button>
  );
}

/** Modalità dettaglio: la carta a grande formato con regole complete, stato in partita e storia. */
export function InspectOverlay({ G }: { G: Game }) {
  const x = useBattle(st => st.inspected), profile = useProfile(); const b = useBattle.getState;
  useEffect(() => { if (!x) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') b().inspect(null); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [x, b]);
  const c = x ? cardInfo(x.id) : null, f = x?.uid != null ? findU(G, x.uid) : null, lore = x ? loreOf(x.id) : undefined;
  const kws = c ? (Object.keys(KEYWORDS) as Keyword[]).filter(k => new RegExp(`\\b${k}\\b`).test(c.tx) || (f?.u.kw.includes(k) ?? false)) : [];
  return (
    <AnimatePresence>
      {x && c && (
        <motion.div className={s.inspectBack} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) b().inspect(null); }} role="dialog" aria-modal="true" aria-label={`Dettaglio: ${c.n}`}>
          <motion.div className={s.inspect} initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
            <motion.div className={s.inspectCard} initial={{ rotateY: -12 }} animate={{ rotateY: 0 }}>
              <Card card={c} cost={x.cost} look={x.p === 1 || c.token ? undefined : lookOf(profile, c.id)} atk={f ? uAtk(G, f.p, f.l, f.u) : undefined} hp={f ? uMax(G, f.p, f.l, f.u) - f.u.dmg : undefined} />
            </motion.div>
            <div className={s.inspectInfo}>
              <h2>{c.n}</h2>
              <div className={s.inspectMeta}>
                <span style={{ color: FACTIONS[c.f].col }}><Glyph>{FACTION_GLYPH[c.f]}</Glyph>{FACTIONS[c.f].name}</span>
                <span>{TYPES[c.t]}</span>
                <span style={{ color: RARITY[c.r].color }}><RarityGem r={c.r} />{RARITY[c.r].name}</span>
                <span>Costo base {c.c}{c.t === 'U' ? `, ${c.a}/${c.h}` : ''}</span>
              </div>
              {f && <section><h3>In partita</h3><p>{f.p === 0 ? 'Tua' : "Dell'avversario"}, corsia {LANE_NAME[f.l]}. Attacco {uAtk(G, f.p, f.l, f.u)}, salute {uMax(G, f.p, f.l, f.u) - f.u.dmg} su {uMax(G, f.p, f.l, f.u)}.
                {f.u.sick ? ' Appena entrata in gioco.' : ''}{f.u.stun ? ' Stordita: salta il prossimo attacco.' : ''} {f.u.asc ? 'Ascesa (+2/+2).' : `Ascesa: ${f.u.fights ?? 0}/${ASCEND_FIGHTS} combattimenti.`}</p>
                {omenAt(G, f.l) && <p><b>{OMENS[omenAt(G, f.l)!].name}</b>: {OMENS[omenAt(G, f.l)!].text}</p>}</section>}
              {(c.tx || kws.length > 0) && <section><h3>Regole</h3>{c.tx && <p>{c.tx}</p>}{kws.map(k => <p key={k}><b>{k}</b>: {KEYWORDS[k]}</p>)}</section>}
              {synergiesOf(c.id).length > 0 && <section><h3>Sincronie</h3>{synergiesOf(c.id).map(sy => { const on = f ? activeSynergies(G, f.p, f.u).some(z => z.id === sy.id) : false;
                return <p key={sy.id} className={on ? s.synOn : ''}><b>{sy.name}{on ? ' (attiva)' : ''}</b> con {BYID[sy.a === c.id ? sy.b : sy.a]?.n ?? ''}: {sy.text}</p>; })}</section>}
              {lore && <section><h3>Storia</h3><p className={s.inspectLore}>{lore.text}</p><p className={s.inspectInsp}>Ispirata a {lore.insp}.</p></section>}
              <button className={s.btn} onClick={() => b().inspect(null)} autoFocus>Chiudi</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
