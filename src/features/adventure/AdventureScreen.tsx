import { useState } from 'react';
import { CARDS, CUSTODI, FACTIONS, type CustodeId, type Faction } from '../../engine';
import { CardArt } from '../../cards/art/CardArt';
import { siteImg } from '../../cards/art/site';
import { FACTION_GLYPH, Glyph } from '../../cards/glyphs';
import { defaultArt } from '../../cards/styles';
import { rewardLabel } from '../../economy/constants';
import { deckIssues } from '../../economy/decks';
import { useProfile } from '../../profile/store';
import { Confirm } from '../../ui/Confirm';
import { Modal } from '../../ui/Modal';
import { PageHeader } from '../../ui/PageHeader';
import { toast } from '../../ui/toast';
import { useBattle } from '../battle/store';
import { DeckSelect } from '../decks/DeckSelect';
import { type Adventure, type AdvStage, CHAPTER_1, DIFFS, type Difficulty, emptyStage, encode, newAdventure, OFFICIAL_EXTRA, stageReward } from './model';
import { useAdventures } from './store';
import { CommunityStories } from './CommunityStories';
import u from '../../ui/ui.module.css';
import s from './adventure.module.css';

type Tab = 'rosa' | 'community';
const copy = async (text: string, ok: string) => { try { await navigator.clipboard.writeText(text); toast(ok); } catch { window.prompt('Copia questo codice:', text); } };

export function AdventureScreen() {
  const [tab, setTab] = useState<Tab>('rosa');
  const A = useAdventures();
  const [edit, setEdit] = useState<Adventure | null>(null), [del, setDel] = useState<Adventure | null>(null), [code, setCode] = useState('');
  const official = [CHAPTER_1, ...OFFICIAL_EXTRA, ...(A.authorMode ? A.drafts : [])];
  return (
    <section className={u.page}>
      <PageHeader title="Avventure" sub="Due modi di viaggiare: la campagna della Rosa, scritta dall'autore del gioco, e i racconti della community, in cui i giocatori votano come prosegue la storia." />
      <div className={s.tabs} role="tablist">
        <button role="tab" aria-selected={tab === 'rosa'} onClick={() => setTab('rosa')}>Avventura della Rosa</button>
        <button role="tab" aria-selected={tab === 'community'} onClick={() => setTab('community')}>Racconti della community</button>
      </div>
      <div style={{ maxWidth: 420 }}><DeckSelect /></div>

      {tab === 'rosa' && <>
        {official.map(a => <Chapter key={a.id} a={a} onEdit={a.draft ? () => setEdit(a) : undefined} onExport={a.draft ? () => copy(JSON.stringify(a, null, 1), 'Capitolo copiato: incollalo a chi pubblica il gioco') : undefined} />)}
        <div className={s.author}>
          <label><input type="checkbox" checked={A.authorMode} onChange={e => A.setAuthor(e.target.checked)} /> Modalità autore</label>
          <span>Scrivi nuovi capitoli ufficiali. Le bozze restano sul tuo dispositivo finché non le esporti per la pubblicazione.</span>
          {A.authorMode && <button className={`${u.btn} ${u.sm} ${u.primary}`} onClick={() => setEdit(newAdventure(true))}>Nuovo capitolo</button>}
        </div>
      </>}

      {tab === 'community' && <CommunityStories />}

      {edit && <Editor initial={edit} onClose={() => setEdit(null)} />}
      <Confirm open={!!del} title="Eliminare l'avventura?" text={`"${del?.title ?? ''}" verrà rimossa da questo dispositivo.`} confirmLabel="Elimina" onConfirm={() => del && A.remove(del.id)} onClose={() => setDel(null)} />
    </section>
  );
}

/** Un capitolo: intestazione e percorso di tappe da sbloccare in ordine. */
function Chapter({ a, onEdit, onShare, onDelete, onExport }: { a: Adventure; onEdit?: () => void; onShare?: () => void; onDelete?: () => void; onExport?: () => void }) {
  const p = useProfile(), prog = useAdventures(st => st.progress[a.id]) ?? [];
  const done = (i: number) => (a.id === 'cap1' ? p.adv.includes(i) : prog.includes(i));
  const go = (i: number) => { const d = p.decks.find(x => x.id === p.activeDeck); if (!d || deckIssues(d, p.owned).length) { toast('Scegli un mazzo completo'); return; } useBattle.getState().start('adv', i, a.id); };
  const n = a.stages.filter((_, i) => done(i)).length;
  return (
    <article className={s.chapter}>
      <header className={s.chHead}>
        <div><h2>{a.title}{a.draft && <span className={s.badge}>Bozza</span>}{!a.official && <span className={s.badgeC}>Community</span>}</h2><p>{a.intro}</p></div>
        <div className={s.chActions}>
          <span className={s.prog}>{n}/{a.stages.length}</span>
          {onEdit && <button className={`${u.btn} ${u.sm}`} onClick={onEdit}>Modifica</button>}
          {onShare && <button className={`${u.btn} ${u.sm}`} onClick={onShare}>Condividi</button>}
          {onExport && <button className={`${u.btn} ${u.sm}`} onClick={onExport}>Esporta per la pubblicazione</button>}
          {onDelete && <button className={`${u.btn} ${u.sm}`} onClick={onDelete}>Elimina</button>}
        </div>
      </header>
      {a.id === 'cap1' && siteImg('avventura-mappa') && <div className={s.map} style={{ backgroundImage: `url(${siteImg('avventura-mappa')})` }} role="img" aria-label="Mappa del capitolo" />}
      <ol className={s.path}>
        {a.stages.map((st, i) => { const ok = done(i), open = i === 0 || done(i - 1);
          return (
            <li key={i} className={`${s.node} ${ok ? s.done : open ? s.open : s.lock}`}>
              <span className={s.num}>{st.portrait && siteImg(st.portrait) ? <img src={siteImg(st.portrait)} alt="" /> : <CardArt id={st.art} style={defaultArt(st.art)} arch={false} />}<i>{i + 1}</i></span>
              <div><h3>{st.n}</h3><p><strong>{st.foe}</strong>, mazzo {st.facs.map(f => FACTIONS[f].name).join(' e ')} · {DIFFS[st.diff].name}{st.seal !== 10 ? ` · Sigilli da ${st.seal}` : ''}</p>
                {st.txt && <p className={u.muted}>{st.txt}</p>}<p className={u.muted}>{ok ? 'Completata' : `Ricompensa: ${rewardLabel(stageReward(a, st))}`}</p></div>
              <div>{open ? <button className={`${u.btn} ${ok ? '' : u.primary}`} onClick={() => go(i)}>{ok ? 'Rigioca' : 'Affronta'}</button> : <span className={u.muted}>Bloccata</span>}</div>
            </li>);
        })}
      </ol>
    </article>
  );
}

const UNITS = CARDS.filter(c => c.t === 'U').sort((x, y) => x.n.localeCompare(y.n));
/** Editor di avventure: titolo, introduzione e fino a 8 tappe. */
function Editor({ initial, onClose }: { initial: Adventure; onClose: () => void }) {
  const [a, setA] = useState<Adventure>(() => JSON.parse(JSON.stringify(initial)));
  const save = useAdventures(st => st.save);
  const setSt = (i: number, patch: Partial<AdvStage>) => setA(x => ({ ...x, stages: x.stages.map((st, j) => (j === i ? { ...st, ...patch } : st)) }));
  const move = (i: number, d: number) => setA(x => { const st = [...x.stages]; const j = i + d; if (j < 0 || j >= st.length) return x; [st[i], st[j]] = [st[j], st[i]]; return { ...x, stages: st }; });
  const toggleFac = (i: number, f: Faction) => { const st = a.stages[i]; const has = st.facs.includes(f); if (has && st.facs.length === 1) return; setSt(i, { facs: has ? st.facs.filter(x => x !== f) : st.facs.length >= 2 ? [st.facs[1], f] : [...st.facs, f] }); };
  return (
    <Modal open onClose={onClose}>
      <div className={s.editor}>
        <h2 className={u.title} style={{ fontSize: 36 }}>{a.official ? 'Capitolo ufficiale' : 'La tua avventura'}</h2>
        <label className={s.field}><span>Titolo</span><input value={a.title} maxLength={60} onChange={e => setA({ ...a, title: e.target.value })} /></label>
        <label className={s.field}><span>Introduzione</span><textarea value={a.intro} maxLength={400} rows={3} onChange={e => setA({ ...a, intro: e.target.value })} /></label>
        {a.stages.map((st, i) => (
          <fieldset key={i} className={s.stage}>
            <legend>Tappa {i + 1}</legend>
            <div className={s.stageTop}>
              <span className={s.stageArt}><CardArt id={st.art} style={defaultArt(st.art)} arch={false} /></span>
              <div className={s.grid2}>
                <label className={s.field}><span>Nome della tappa</span><input value={st.n} maxLength={50} onChange={e => setSt(i, { n: e.target.value })} /></label>
                <label className={s.field}><span>Avversario</span><input value={st.foe} maxLength={40} onChange={e => setSt(i, { foe: e.target.value })} /></label>
                <label className={s.field}><span>Ritratto (carta)</span><select value={st.art} onChange={e => setSt(i, { art: e.target.value })}>{CARDS.map(c => <option key={c.id} value={c.id}>{c.n}</option>)}</select></label>
                <label className={s.field}><span>Difficoltà</span><select value={st.diff} onChange={e => setSt(i, { diff: Number(e.target.value) as Difficulty })}>{([1, 2, 3, 4] as Difficulty[]).map(d => <option key={d} value={d}>{DIFFS[d].name}</option>)}</select></label>
                <label className={s.field}><span>Punti vita dei Sigilli avversari</span><input type="number" min={6} max={16} value={st.seal} onChange={e => setSt(i, { seal: Math.min(16, Math.max(6, Number(e.target.value) || 10)) })} /></label>
                <label className={s.field}><span>Custode avversario</span><select value={st.custode ?? ''} onChange={e => setSt(i, { custode: (e.target.value || null) as CustodeId | null })}><option value="">Casuale</option>{Object.values(CUSTODI).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              </div>
            </div>
            <div className={s.facRow}><span>Fazioni del mazzo avversario</span>{(Object.keys(FACTIONS) as Faction[]).map(f => <button key={f} className={u.chip} aria-pressed={st.facs.includes(f)} onClick={() => toggleFac(i, f)}><Glyph>{FACTION_GLYPH[f]}</Glyph>{FACTIONS[f].name}</button>)}</div>
            <label className={s.field}><span>Carta garantita nel mazzo avversario (facoltativa)</span>
              <select value={st.force?.[0] ?? ''} onChange={e => setSt(i, { force: e.target.value ? [e.target.value] : [] })}><option value="">Nessuna</option>{UNITS.filter(c => st.facs.includes(c.f)).map(c => <option key={c.id} value={c.id}>{c.n}</option>)}</select></label>
            <label className={s.field}><span>Descrizione</span><textarea value={st.txt} maxLength={240} rows={2} onChange={e => setSt(i, { txt: e.target.value })} placeholder="Cosa aspetta il giocatore in questa tappa?" /></label>
            <div className={u.row}>
              <button className={`${u.btn} ${u.sm}`} disabled={i === 0} onClick={() => move(i, -1)}>Su</button>
              <button className={`${u.btn} ${u.sm}`} disabled={i === a.stages.length - 1} onClick={() => move(i, 1)}>Giù</button>
              <button className={`${u.btn} ${u.sm}`} disabled={a.stages.length <= 1} onClick={() => setA({ ...a, stages: a.stages.filter((_, j) => j !== i) })}>Togli tappa</button>
            </div>
          </fieldset>
        ))}
        <div className={u.row} style={{ justifyContent: 'space-between' }}>
          <button className={u.btn} disabled={a.stages.length >= 8} onClick={() => setA({ ...a, stages: [...a.stages, emptyStage()] })}>Aggiungi tappa ({a.stages.length}/8)</button>
          <div className={u.row}>
            <button className={u.btn} onClick={onClose}>Annulla</button>
            <button className={`${u.btn} ${u.primary}`} disabled={!a.title.trim()} onClick={() => { save(a); toast('Avventura salvata'); onClose(); }}>Salva</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
