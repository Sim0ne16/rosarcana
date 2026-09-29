import { defaultArt } from '../../cards/styles';
import { CUSTODI, FACTIONS, type CustodeId } from '../../engine';
import { CardArt } from '../../cards/art/CardArt';
import { FACTION_GLYPH, Glyph } from '../../cards/glyphs';
import { siteImg } from '../../cards/art/site';
import { useProfile } from '../../profile/store';
import { CUST_MISSIONS, CUST_REWARD } from '../../economy/custodeMissions';
import s from './custodi.module.css';

const PORTRAIT: Partial<Record<CustodeId, string>> = { veggente: 'cassandra', guardaboschi: 'uomoverde' };

/** Ritratto rotondo di un Custode. */
export function CustodePortrait({ id, className, title }: { id: CustodeId; className?: string; title?: string }) {
  const c = CUSTODI[id], leg = useProfile(p => p.custLeg?.includes(id));
  return (
    <span className={`${s.portrait} ${leg ? s.legendary : ''} ${className ?? ''}`} style={{ ['--fc' as string]: FACTIONS[c.f].col }} title={title ?? `${c.name}, ${c.title}`}>
      {siteImg(`custode-${PORTRAIT[id] ?? id}`) ? <img src={siteImg(`custode-${PORTRAIT[id] ?? id}`)} alt="" draggable={false} /> : <CardArt id={c.art} style={defaultArt(c.art)} arch={false} />}
      <i><Glyph>{FACTION_GLYPH[c.f]}</Glyph></i>
    </span>
  );
}
/** Scheda completa di un Custode: effetto sempre attivo, Ultimo Rintocco personale e storia. */
export function CustodeCard({ id, compact }: { id: CustodeId; compact?: boolean }) {
  const c = CUSTODI[id], leg = useProfile(p => p.custLeg?.includes(id)), prog = useProfile(p => p.custProg?.[id]);
  return (
    <div className={`${s.card} ${compact ? s.compact : ''}`} style={{ ['--fc' as string]: FACTIONS[c.f].col }}>
      <CustodePortrait id={id} className={s.big} />
      <div className={s.body}>
        <h3>{c.name}{leg && <span className={s.legTag}>Leggendario</span>}</h3><em>{c.title}</em>
        <p><b>Sempre attivo:</b> {c.passive}</p>
        <p><b>Ultimo Rintocco, {c.bellName}:</b> {c.bell}</p>
        {!compact && <p className={s.lore}>{c.lore} <span>Ispirato a {c.insp}.</span></p>}
        {!compact && <div className={s.missions}><b>Missioni leggendarie</b>{CUST_MISSIONS.map(m => { const v = Math.min(m.goal, prog?.[m.id] ?? 0); return <div key={m.id} className={v >= m.goal ? s.mDone : ''}><span>{m.txt(c.name)}</span><em>{v}/{m.goal}</em></div>; })}
          <small>{leg ? 'Completate: ritratto leggendario sbloccato.' : `Ricompensa: ritratto leggendario, ${CUST_REWARD.gettoni} gettoni e ${CUST_REWARD.polvere} polvere.`}</small></div>}
      </div>
    </div>
  );
}
