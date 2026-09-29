import { BYID, CARDS, CUSTODI, FACTIONS, RARITY, type CustodeId, type Faction } from '../../engine';
import { FACTION_GLYPH, Glyph } from '../../cards/glyphs';
import { CODEX_LEVEL } from '../../cards/secrets';
import { MASTERY_NAMES } from '../../cards/styles';
import { levelOf } from '../../economy/mastery';
import { RANKS } from '../../economy/constants';
import { masteryOf, profileFrames, tierIdx, useProfile } from '../../profile/store';
import { Avatar } from './Avatar';
import { siteImg } from '../../cards/art/site';
import { CRAFT_FRAMES, FRAMES, MASTERY_FRAMES } from '../../cards/styles';
import { toast } from '../../ui/toast';
import { askBuy } from '../../ui/confirmBuy';
import { PageHeader } from '../../ui/PageHeader';
import { lastReplay, useBattle } from '../battle/store';
import { CustodePortrait } from '../custodi/CustodeCard';
import { useDraft } from '../modes/draft';
import { useExpedition } from '../modes/expedition';
import u from '../../ui/ui.module.css';
import s from './profile.module.css';

const pct = (w: number, n: number) => (n ? Math.round((w / n) * 100) : 0);
/** Profilo del giocatore: statistiche, fazioni, Custodi, carte preferite e progressi. */
export function ProfileScreen({ back }: { back: () => void }) {
  const p = useProfile(), frames = profileFrames(p), draftBest = useDraft(x => x.best), expBest = useExpedition(x => x.best);
  const cards = CARDS.filter(c => !c.token), total = cards.reduce((a, c) => a + RARITY[c.r].max, 0), have = cards.reduce((a, c) => a + Math.min(p.owned[c.id] || 0, RARITY[c.r].max), 0);
  const lv = cards.map(c => levelOf(masteryOf(p, c.id).xp)), codex = lv.filter(x => x >= CODEX_LEVEL).length;
  const fav = cards.map(c => [c.id, masteryOf(p, c.id).plays] as const).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const custs = (Object.entries(p.custProg ?? {}) as [CustodeId, { games: number; wins: number; bells: number }][]).sort((a, b) => b[1].games - a[1].games);
  const stat = (v: string | number, l: string) => <div className={s.stat}><b>{v}</b><span>{l}</span></div>;
  return (
    <section className={u.page}>
      <PageHeader title="Profilo" sub="Le tue statistiche, i tuoi Custodi e le tue carte preferite.">
        {lastReplay && <button className={u.btn} onClick={() => useBattle.getState().openReplay()}>Rivedi l'ultima partita</button>}
        <button className={u.btn} onClick={back}>← Gioca</button>
      </PageHeader>
      <div className={s.me}>
        <Avatar width={120} />
        <div className={s.pickers}>
          <h2>Ritratto</h2>
          <div className={s.pickRow}>{[...Object.keys(CUSTODI), ...CARDS.filter(c => c.r === 'l' && p.owned[c.id]).map(c => c.id)].map(id => (
            <button key={id} className={s.pick} aria-pressed={p.avatar === id} onClick={() => p.setAvatar(id)} title={CUSTODI[id as CustodeId]?.name ?? BYID[id].n}><Avatar width={44} avatar={id} frame={null} /></button>))}</div>
          <h2>Cornice del profilo</h2>
          <div className={s.pickRow}>
            <button className={s.pick} aria-pressed={!p.pframe} onClick={() => p.setPFrame(null)}><Avatar width={44} frame={null} /><span>Nessuna</span></button>
            {MASTERY_FRAMES.map((f, i) => { const ok = frames.mastery.includes(f); return (
              <button key={f} className={`${s.pick} ${ok ? '' : s.locked}`} aria-pressed={p.pframe === f} disabled={!ok} onClick={() => p.setPFrame(f)} title={ok ? FRAMES[f].name : `Porta una carta al grado ${MASTERY_NAMES[i]}`}><Avatar width={44} frame={f} /><span>{MASTERY_NAMES[i]}</span></button>); })}
            {CRAFT_FRAMES.filter(f => siteImg(`frame-${f}`)).map(f => { const own = frames.owned.includes(f); return (
              <button key={f} className={s.pick} aria-pressed={p.pframe === f} onClick={() => (own ? p.setPFrame(f) : p.polvere < (FRAMES[f].cost ?? 0) ? toast(`Servono ${FRAMES[f].cost} polvere`) : askBuy({ title: `Sbloccare la cornice ${FRAMES[f].name}?`, text: `Spendi ${FRAMES[f].cost} polvere (ne hai ${p.polvere}).`, label: `Sblocca per ${FRAMES[f].cost}`, onConfirm: () => { if (p.buyPFrame(f)) toast(`Cornice ${FRAMES[f].name} sbloccata`); } }))} data-sfx={own ? undefined : 'forge'} title={FRAMES[f].desc}>
                <Avatar width={44} frame={f} /><span>{own ? FRAMES[f].name : `${FRAMES[f].cost} polvere`}</span></button>); })}
          </div>
        </div>
      </div>
      <div className={s.stats}>
        {stat(p.games, 'partite')}{stat(`${pct(p.wins, p.games)}%`, 'vittorie')}{stat(RANKS[tierIdx(p.rank)], 'grado in classificata')}
        {stat(`${pct(have, total)}%`, 'Set Base completato')}{stat(`${codex}/${cards.length}`, 'frammenti del Codex')}
        {stat(`${draftBest}/7`, 'record in Arena')}{stat(`${expBest}/7`, 'record in Spedizione')}{stat(p.custLeg?.length ?? 0, 'Custodi leggendari')}
      </div>
      <div className={s.grid}>
        <article className={s.box}>
          <h2>Fazioni</h2>
          {(Object.keys(FACTIONS) as Faction[]).map(f => { const r = p.facStats?.[f] ?? { games: 0, wins: 0 };
            return <div key={f} className={s.bar}><span style={{ color: FACTIONS[f].col }}><Glyph>{FACTION_GLYPH[f]}</Glyph>{FACTIONS[f].name}</span><i><b style={{ width: `${pct(r.wins, r.games)}%`, background: FACTIONS[f].col }} /></i><em>{r.games ? `${pct(r.wins, r.games)}% su ${r.games}` : 'mai giocata'}</em></div>; })}
        </article>
        <article className={`${s.box} ${s.wide}`}>
          <h2>Storico partite</h2>
          {p.history?.length ? <table className={s.hist}><thead><tr><th>Esito</th><th>Modalità</th><th>Avversario</th><th>Mazzo</th><th>Turni</th><th>Quando</th></tr></thead>
            <tbody>{p.history.map((r, i) => <tr key={i}><td className={r.win ? s.won : s.lost}>{r.win ? 'Vittoria' : 'Sconfitta'}</td><td>{r.label || r.mode}</td><td>{r.foe}</td><td>{r.deck}{r.custode && CUSTODI[r.custode as CustodeId] ? ` · ${CUSTODI[r.custode as CustodeId].name}` : ''}</td><td>{r.turns}</td><td>{new Date(r.t).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td></tr>)}</tbody></table>
            : <p className={u.muted}>Nessuna partita giocata finora.</p>}
        </article>
        <article className={s.box}>
          <h2>Custodi</h2>
          {custs.length ? custs.map(([id, r]) => <div key={id} className={s.cust}><CustodePortrait id={id} /><div><b>{CUSTODI[id].name}</b><span>{r.games} partite, {pct(r.wins, r.games)}% vittorie, {r.bells} Rintocchi</span></div></div>)
            : <p className={u.muted}>Gioca con un Custode per vedere qui le sue statistiche.</p>}
        </article>
        <article className={s.box}>
          <h2>Carte preferite</h2>
          {fav.length ? fav.map(([id, n]) => { const l = levelOf(masteryOf(p, id).xp); return <div key={id} className={s.fav}><b>{BYID[id].n}</b><span>giocata {n} volte · {l ? MASTERY_NAMES[l - 1] : 'nessun grado'}</span></div>; })
            : <p className={u.muted}>Nessuna carta giocata finora.</p>}
          <h3>Maestria</h3>
          <div className={s.levels}>{MASTERY_NAMES.map((n, i) => <span key={n}><b>{lv.filter(x => x > i).length}</b>{n}</span>)}</div>
        </article>
      </div>
    </section>
  );
}
