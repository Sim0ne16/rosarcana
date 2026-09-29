import { memo } from 'react';
import { cardInfo, FACTIONS, KEYWORDS, RARITY, TYPES } from '../engine/cards';
import { synergiesOf } from '../engine/mechanics';
import type { CardDef } from '../engine/types';
import { CardArt } from './art/CardArt';
import { hasIllustration } from './art/illustrations';
import { Icon, kwIcon, RichText, splitText } from './cardText';
import { EffectLayer } from './CardFx';
import { FACTION_GLYPH, Glyph, HEART, RarityGem, SWORD, TYPE_GLYPH } from './glyphs';
import { loreOf } from './lore';
import { DEFAULT_ART, defaultArt, type CardLook } from './styles';
import s from './card.module.css';

export interface CardProps { card: CardDef; look?: CardLook; cost?: number; atk?: number; hp?: number; className?: string; mini?: boolean; kws?: string[] }

function track(e: React.PointerEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect(), st = e.currentTarget.style;
  st.setProperty('--px', ((e.clientX - r.left) / r.width).toFixed(3)); st.setProperty('--py', ((e.clientY - r.top) / r.height).toFixed(3));
}
function reset(e: React.PointerEvent<HTMLDivElement>) { e.currentTarget.style.setProperty('--px', '.5'); e.currentTarget.style.setProperty('--py', '.5'); }

/** Costo: una scheggia di cristallo con il numero, il segno distintivo di Rosarcana. */
function CostShard({ v, delta }: { v: number; delta: number }) {
  return (
    <span className={s.shard} data-delta={delta < 0 ? 'up' : delta > 0 ? 'down' : undefined} aria-label={`Costo ${v}`}>
      <svg viewBox="0 0 20 28" aria-hidden="true"><path d="M10 .8 18.6 8v12L10 27.2 1.4 20V8Z" /><path d="M10 .8V27.2M1.4 8 10 11.5 18.6 8" className={s.facet} /></svg>
      <b>{v}</b>
    </span>
  );
}

/**
 * Modello unico per tutte le carte (a tutta illustrazione, per ogni stile):
 * barra del titolo con nome, costo e stemma; in basso la riga del tipo, un riquadro di testo alto quanto basta
 * e la targa di attacco e salute.
 */
export const Card = memo(function Card({ card: c, look, cost, atk, hp, className, mini, kws: miniKws }: CardProps) {
  const art = look?.art === 'illustrata' && !hasIllustration(c.id) ? DEFAULT_ART : look?.art ?? defaultArt(c.id);
  const cc = cost ?? c.c, a = atk ?? c.a, h = hp ?? c.h;
  const F = FACTIONS[c.f], { kws, rest } = splitText(c.tx, c.kw);
  const flavor = !rest && !kws.length ? loreOf(c.id)?.flavor : undefined;
  const syn = synergiesOf(c.id).map(x => cardInfo(x.a === c.id ? x.b : x.a).n);
  const len = rest.length + kws.length * 12 + (flavor ? flavor.length : 0) + (syn.length ? 20 : 0);
  const dense = len > 110 ? s.dense : len > 70 ? s.mid : '';
  return (
    <div className={`${s.cw} ${className ?? ''}`}>
      <div className={`${s.card} ${s['r' + c.r]} ${mini ? s.mini : ''}`} data-style={art} data-type={c.t}
        style={{ ['--rar' as string]: RARITY[c.r].color, ['--fac' as string]: F.col, ['--fac2' as string]: F.col2 }}
        onPointerMove={look?.effect ? track : undefined} onPointerLeave={look?.effect ? reset : undefined}>
        <div className={s.art}><CardArt id={c.id} style={art} arch={false} /></div>
        <div className={`${s.name} ${c.n.length > 22 ? s.longer : c.n.length > 16 ? s.long : ''}`}>
          <span className={s.nm}>{c.n}</span>
          {!mini && <CostShard v={cc} delta={cc - c.c} />}
          <span className={s.tFac} title={`Fazione: ${F.name}`}><Glyph>{FACTION_GLYPH[c.f]}</Glyph></span>
        </div>
        {mini && miniKws && miniKws.length > 0 && <div className={s.miniKw}>{miniKws.map(k => <span key={k} title={k}><Icon k={`kw-${k}`} /></span>)}</div>}
        {!mini && <div className={s.bottom}>
          <div className={s.type}>
            <Glyph className={s.tIcon}>{TYPE_GLYPH[c.t]}</Glyph>
            <span className={s.tName}>{TYPES[c.t]} · <em>{F.name}</em></span>
            <span title={`Rarità: ${RARITY[c.r].name}`}><RarityGem r={c.r} className={s.gem} /></span>
          </div>
          {(kws.length > 0 || rest || flavor || syn.length > 0) && <div className={`${s.body} ${dense}`}>
            {kws.length > 0 && <div className={s.kw}>{kws.map((k, i) => <span key={k} data-tip={KEYWORDS[k as keyof typeof KEYWORDS]} data-tip-title={k === 'Offerta' && c.offer ? `Offerta ${c.offer}` : k} className={s.tipped}>{i > 0 && ' · '}<Icon k={kwIcon(k)} className={s.kwIcon} /><b>{k === 'Offerta' && c.offer ? `Offerta ${c.offer}` : k}</b></span>)}</div>}
            {rest && <div className={s.text}><RichText text={rest} /></div>}
            {flavor && <div className={s.flavor}>{flavor}</div>}
            {syn.length > 0 && <div className={`${s.syn} ${s.tipped}`} data-tip-title="Sincronia" data-tip={synergiesOf(c.id).map(x => `${x.name}: ${x.text}`).join(' ')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5 14.5 9.5M8 11l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>{syn.join(', ')}</div>}
          </div>}
        </div>}
        {c.t === 'U' && (
          <div className={s.pt} aria-label={`Attacco ${a}, salute ${h}`}>
            <span className={s.ptA} data-delta={a > c.a ? 'up' : a < c.a ? 'down' : undefined}><Glyph>{SWORD}</Glyph>{a}</span>
            <i />
            <span className={s.ptH} data-delta={h > c.h ? 'up' : h < c.h ? 'down' : undefined}><Glyph>{HEART}</Glyph>{h}</span>
          </div>
        )}
        <EffectLayer effect={look?.effect ?? null} />
      </div>
    </div>
  );
});
