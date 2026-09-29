import { motion } from 'framer-motion';
import { BYID, CUSTODI, FACTIONS, RARITY, type Faction } from '../../engine';
import { Card } from '../../cards/Card';
import { FACTION_GLYPH, Glyph } from '../../cards/glyphs';
import { rewardLabel } from '../../economy/constants';
import { countMap } from '../../economy/decks';
import { lookOf, useProfile } from '../../profile/store';
import { PageHeader } from '../../ui/PageHeader';
import { askBuy } from '../../ui/confirmBuy';
import { toast } from '../../ui/toast';
import { useBattle } from '../battle/store';
import { CustodeCard, CustodePortrait } from '../custodi/CustodeCard';
import { DRAFT_COST, DRAFT_MAX_L, DRAFT_MAX_W, DRAFT_PICKS, draftOpponent, draftOver, draftReward, useDraft } from './draft';
import { EXP_BLESSING, expOpponent, expOver, expReward, useExpedition } from './expedition';
import u from '../../ui/ui.module.css';
import s from './modes.module.css';

function Pips({ n, max, cls }: { n: number; max: number; cls: string }) {
  return <span className={s.pips}>{Array.from({ length: max }, (_, i) => <i key={i} className={i < n ? cls : ''} />)}</span>;
}
function DeckList({ ids }: { ids: string[] }) {
  const cnt = countMap(ids), rows = Object.keys(cnt).sort((a, b) => BYID[a].c - BYID[b].c || BYID[a].n.localeCompare(BYID[b].n));
  return <div className={s.list}>{rows.map(id => <div key={id} className={s.row} style={{ ['--fc' as string]: FACTIONS[BYID[id].f].col }}><b>{BYID[id].c}</b><span>{BYID[id].n}</span><em style={{ color: RARITY[BYID[id].r].color }}>{cnt[id] > 1 ? `×${cnt[id]}` : ''}</em></div>)}</div>;
}

/* ================= Arena delle Rose (Draft) ================= */
export function DraftScreen({ back }: { back: () => void }) {
  const D = useDraft(), p = useProfile(), r = D.run;
  const enter = () => { if (!D.freeUsed) { D.start(); return; } if (p.oro < DRAFT_COST) { toast(`Servono ${DRAFT_COST} oro`); return; }
    askBuy({ title: "Entrare nell'Arena?", text: `L'ingresso costa ${DRAFT_COST} oro (ne hai ${p.oro}).`, label: `Entra per ${DRAFT_COST}`, onConfirm: () => { p.grant({ oro: -DRAFT_COST }, 'Ingresso Arena'); D.start(); } }); };
  const play = () => { if (!r?.custode) return; const op = draftOpponent(r.wins);
    useBattle.getState().startCustom({ label: `Arena: ${r.wins} vittorie, ${r.losses} sconfitte`, me: { deck: r.picks, custode: r.custode }, op,
      onEnd: win => { useDraft.getState().result(win); const n = useDraft.getState().run!; return [win ? `Arena: vittoria ${n.wins} di ${DRAFT_MAX_W}` : `Arena: sconfitta ${n.losses} di ${DRAFT_MAX_L}`]; } }); };
  return (
    <section className={u.page}>
      <PageHeader title="Arena delle Rose" sub="Costruisci un mazzo al momento scegliendo una carta su tre, poi gioca finché arrivi a 7 vittorie o 3 sconfitte. Tutte le carte del Set Base sono disponibili, anche quelle che non possiedi, e non c'è il limite di due fazioni.">
        <button className={u.btn} onClick={back}>← Gioca</button>
      </PageHeader>
      {!r && <div className={s.intro}>
        <p>Ricompense: 25 oro per vittoria; da 3 vittorie una bustina, da 5 due bustine e un gettone, a 7 tre bustine, 300 polvere e due gettoni. Record personale: {D.best} vittorie.</p>
        <button className={`${u.btn} ${u.primary} ${s.big}`} onClick={enter}>{D.freeUsed ? `Entra per ${DRAFT_COST} oro` : 'Entra gratis (prima volta)'}</button>
      </div>}
      {r && !r.custode && <div>
        <h2 className={s.h2}>Scegli il tuo Custode</h2>
        <div className={s.custs}>{r.custodeChoices.map(id => <button key={id} className={s.custPick} onClick={() => D.chooseCustode(id)}><CustodeCard id={id} compact /></button>)}</div>
      </div>}
      {r && r.custode && r.picks.length < DRAFT_PICKS && <div className={s.drafting}>
        <div>
          <h2 className={s.h2}>Scelta {r.picks.length + 1} di {DRAFT_PICKS}</h2>
          <div className={s.options}>{r.options.map((id, i) => (
            <motion.button key={id + r.picks.length} className={s.opt} onClick={() => D.pick(id)} initial={{ opacity: 0, y: 30, rotate: (i - 1) * 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -8 }}>
              <Card card={BYID[id]} look={lookOf(p, id)} />
            </motion.button>))}</div>
        </div>
        <aside className={s.side}><div className={s.sideHead}><CustodePortrait id={r.custode} /><div><b>{CUSTODI[r.custode].name}</b><span>{r.picks.length}/{DRAFT_PICKS} carte</span></div></div><DeckList ids={r.picks} /></aside>
      </div>}
      {r && r.custode && r.picks.length >= DRAFT_PICKS && <div className={s.drafting}>
        <div className={s.runBox}>
          <h2 className={s.h2}>{draftOver(r) ? 'Arena conclusa' : 'Il tuo mazzo è pronto'}</h2>
          <div className={s.score}><span>Vittorie <Pips n={r.wins} max={DRAFT_MAX_W} cls={s.win} /></span><span>Sconfitte <Pips n={r.losses} max={DRAFT_MAX_L} cls={s.loss} /></span></div>
          {!draftOver(r) ? <button className={`${u.btn} ${u.primary} ${s.big}`} onClick={play}>Affronta il prossimo avversario</button>
            : <>
              <p>Ricompensa: {rewardLabel(draftReward(r.wins)) || 'nessuna'}.</p>
              <button className={`${u.btn} ${u.primary} ${s.big}`} data-sfx="claim" onClick={() => { if (!r.claimed) p.grant(draftReward(r.wins), `Arena delle Rose (${r.wins} vittorie)`); D.clear(); toast('Ricompense riscosse'); }}>Riscuoti e chiudi</button>
            </>}
          {!draftOver(r) && <button className={u.btn} onClick={() => { if (confirmLeave()) D.clear(); }}>Abbandona l'Arena</button>}
        </div>
        <aside className={s.side}><div className={s.sideHead}><CustodePortrait id={r.custode} /><div><b>{CUSTODI[r.custode].name}</b><span>30 carte</span></div></div><DeckList ids={r.picks} /></aside>
      </div>}
    </section>
  );
}
const confirmLeave = () => { const ok = (window as unknown as { __rosaLeave?: boolean }).__rosaLeave; (window as unknown as { __rosaLeave?: boolean }).__rosaLeave = !ok; if (!ok) toast('Tocca di nuovo per confermare: perderai la corsa senza ricompense'); return !!ok; };

/* ================= Spedizione (roguelike) ================= */
export function ExpeditionScreen({ back }: { back: () => void }) {
  const E = useExpedition(), p = useProfile(), r = E.run;
  const play = () => { if (!r) return; const st = r.stages[r.at], op = expOpponent(st);
    useBattle.getState().startCustom({ label: `Spedizione, tappa ${r.at + 1} di ${r.stages.length}`, me: { deck: r.deck, custode: r.custode, seal: 10 + r.sealBonus }, op: { ...op, custode: st.boss ? 'ecate' : null },
      onEnd: win => { if (win) useExpedition.getState().win(); else useExpedition.getState().lose(); return [win ? `Spedizione: tappa ${r.at + 1} superata` : 'Spedizione: la corsa finisce qui']; } }); };
  return (
    <section className={u.page}>
      <PageHeader title="Spedizione" sub="Parti con un piccolo mazzo di una sola Casata e attraversa sette scontri fino a Nyxa. Dopo ogni vittoria scegli una carta nuova o una benedizione. Una sconfitta chiude la corsa.">
        <button className={u.btn} onClick={back}>← Gioca</button>
      </PageHeader>
      {!r && <>
        <p className={u.muted}>Ricompense: 30 oro per ogni tappa superata; completando la Spedizione anche una bustina, un gettone e 200 polvere. Record: {E.best} tappe.</p>
        <div className={s.facs}>{(Object.keys(FACTIONS) as Faction[]).map(f => (
          <button key={f} className={s.fac} style={{ ['--fc' as string]: FACTIONS[f].col }} onClick={() => E.start(f)}><Glyph>{FACTION_GLYPH[f]}</Glyph><b>{FACTIONS[f].name}</b><span>Parti con le comuni della Casata</span></button>))}</div>
      </>}
      {r && <div className={s.drafting}>
        <div className={s.runBox}>
          <ol className={s.track}>{r.stages.map((st, i) => <li key={i} className={i < r.at ? s.tDone : i === r.at && !r.dead ? s.tNow : ''}><b>{i + 1}</b><span>{st.foe}</span>{st.boss && <em>Boss</em>}</li>)}</ol>
          {r.offer && <>
            <h2 className={s.h2}>Scegli la tua ricompensa</h2>
            <div className={s.options}>
              {r.offer.map(id => <motion.button key={id} className={s.opt} onClick={() => E.take(id)} whileHover={{ y: -8 }}><Card card={BYID[id]} look={lookOf(p, id)} /></motion.button>)}
              <button className={s.bless} onClick={() => E.take('bless')}><span>✚</span><b>Benedizione della Rosa</b><em>I tuoi Sigilli hanno +{EXP_BLESSING} punti vita per il resto della Spedizione (ora {10 + r.sealBonus}).</em></button>
            </div>
            <p className={u.muted}>Oppure tocca una carta nel mazzo a destra per toglierla (mazzo minimo 10 carte).</p>
          </>}
          {!r.offer && !expOver(r) && <>
            <h2 className={s.h2}>Tappa {r.at + 1}: {r.stages[r.at].foe}</h2>
            <p>Mazzo {r.stages[r.at].facs.map(f => FACTIONS[f].name).join(' e ')}, Sigilli da {r.stages[r.at].seal}. I tuoi Sigilli: {10 + r.sealBonus} punti vita.</p>
            <button className={`${u.btn} ${u.primary} ${s.big}`} onClick={play}>Affronta</button>
          </>}
          {expOver(r) && <>
            <h2 className={s.h2}>{r.dead ? 'La Spedizione è finita' : 'Spedizione completata!'}</h2>
            <p>Ricompensa: {rewardLabel(expReward(r)) || 'nessuna'}.</p>
            <button className={`${u.btn} ${u.primary} ${s.big}`} data-sfx="claim" onClick={() => { p.grant(expReward(r), `Spedizione (${r.at} tappe)`); E.clear(); }}>Riscuoti e chiudi</button>
          </>}
        </div>
        <aside className={s.side}>
          <div className={s.sideHead}><CustodePortrait id={r.custode} /><div><b>{CUSTODI[r.custode].name}</b><span>{r.deck.length} carte</span></div></div>
          <div className={s.list}>{r.deck.map((id, i) => <button key={i} className={s.row} style={{ ['--fc' as string]: FACTIONS[BYID[id].f].col }} disabled={!r.offer || r.deck.length <= 10} onClick={() => E.remove(i)} title={r.offer ? 'Togli questa carta' : ''}><b>{BYID[id].c}</b><span>{BYID[id].n}</span><em /></button>)}</div>
        </aside>
      </div>}
    </section>
  );
}
