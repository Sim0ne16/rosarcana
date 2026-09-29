import { SET } from '../../engine/cards';
import { defaultArt, FRAMES, FX } from '../../cards/styles';
import { useState } from 'react';
import { CARDS, FACTIONS, RARITY, TOTAL_COPIES, type Faction, type Rarity } from '../../engine';
import { Card } from '../../cards/Card';
import { lookOf, useProfile } from '../../profile/store';
import { CardDetail } from './CardDetail';
import { Chronicles } from './Chronicles';
import { Codex } from './Codex';
import { PageHeader } from '../../ui/PageHeader';
import { FACTION_GLYPH, Glyph, RarityGem } from '../../cards/glyphs';
import u from '../../ui/ui.module.css';

export function CollectionScreen() {
  const p = useProfile();
  const [f, setF] = useState<Faction | 'all'>('all'), [r, setR] = useState<Rarity | 'all'>('all'), [o, setO] = useState<'all' | 'own' | 'miss'>('all');
  const [open, setOpen] = useState<string | null>(null), [chron, setChron] = useState(false), [codex, setCodex] = useState(false);
  const list = CARDS.filter(c => (f === 'all' || c.f === f) && (r === 'all' || c.r === r) && (o === 'all' || (o === 'own' ? p.owned[c.id] : (p.owned[c.id] || 0) < RARITY[c.r].max)));
  const copies = CARDS.reduce((s, c) => s + (p.owned[c.id] || 0), 0), unique = CARDS.filter(c => p.owned[c.id]).length;
  return (
    <section className={u.page}>
      <PageHeader title="Collezione" sub={`${SET.name}: ${unique} carte diverse su ${CARDS.length}, ${copies} copie su ${TOTAL_COPIES}. Tocca una carta per leggerne la storia, crearla o personalizzarla.`}>
        <button className={`${u.btn} ${u.primary}`} onClick={() => setChron(true)}>Cronache della Rosa</button>
        <button className={u.btn} onClick={() => setCodex(true)}>Codex</button>
      </PageHeader>
      <div className={u.chips}>
        <button className={u.chip} aria-pressed={f === 'all'} onClick={() => setF('all')}>Tutte le fazioni</button>
        {(Object.keys(FACTIONS) as Faction[]).map(k => <button key={k} className={u.chip} aria-pressed={f === k} onClick={() => setF(k)}><Glyph>{FACTION_GLYPH[k]}</Glyph>{FACTIONS[k].name}</button>)}
      </div>
      <div className={u.chips} style={{ marginTop: -6 }}>
        <button className={u.chip} aria-pressed={r === 'all'} onClick={() => setR('all')}>Ogni rarità</button>
        {(Object.keys(RARITY) as Rarity[]).map(k => <button key={k} className={u.chip} aria-pressed={r === k} onClick={() => setR(k)}><RarityGem r={k} />{RARITY[k].name}</button>)}
        <span style={{ width: 12 }} />
        {([['all', 'Tutte'], ['own', 'Possedute'], ['miss', 'Da completare']] as const).map(([k, l]) => <button key={k} className={u.chip} aria-pressed={o === k} onClick={() => setO(k)}>{l}</button>)}
      </div>
      {list.length ? (
        <div className={u.cards}>
          {list.map(c => { const n = p.owned[c.id] || 0, lk = lookOf(p, c.id);
            return <button key={c.id} className={`${u.cardBtn} ${n ? '' : u.none}`} onClick={() => setOpen(c.id)} aria-label={`${c.n}, possedute ${n} di ${RARITY[c.r].max}`}>
              <span className={u.count}>{n}/{RARITY[c.r].max}</span>
              <Card card={c} look={lk} /></button>; })}
        </div>
      ) : <p className={u.panel}>Nessuna carta corrisponde ai filtri. Togli un filtro o apri qualche bustina.</p>}
      <p className={`${u.muted} ${u.small}`} style={{ marginTop: 28 }}>Le figure delle vetrate e delle incisioni derivano dalle icone di game-icons.net (Lorc, Delapouite e altri autori), licenza CC BY 3.0.</p>
      <CardDetail id={open} onClose={() => setOpen(null)} onOpen={setOpen} />
      <Chronicles open={chron} onClose={() => setChron(false)} />
      <Codex open={codex} onClose={() => setCodex(false)} onOpen={id => { setCodex(false); setOpen(id); }} />
    </section>
  );
}
