import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { activeSynergies, ASCEND_FIGHTS, cardInfo, findU, KEYWORDS, LANE_NAME, omenAt, OMENS, synergiesOf, uAtk, uMax, type Game, type Keyword } from '../../engine';
import { Card } from '../../cards/Card';
import { useProfile, lookOf } from '../../profile/store';
import { useBattle } from './store';
import s from './battle.module.css';

/** Anteprima al passaggio (o al tocco) su un'unità o una reliquia: compare accanto all'elemento e sparisce appena lo lasci. */
export function Preview({ G }: { G: Game }) {
  const pv = useBattle(st => st.preview), profile = useProfile();
  useEffect(() => {
    if (!pv?.rect) return;
    const off = (e: PointerEvent) => { const t = e.target as Element; if (!t.closest('[data-drop^="unit:"], [data-relic]')) useBattle.getState().setPreview(null); };
    window.addEventListener('pointerdown', off); return () => window.removeEventListener('pointerdown', off);
  }, [pv]);
  const f = pv?.uid != null ? findU(G, pv.uid) : null;
  const show = !!pv?.rect && (pv.uid == null || !!f);
  const c = pv ? cardInfo(pv.id) : null;
  const vw = window.innerWidth, vh = window.innerHeight, narrow = vw < 700;
  const W = narrow ? Math.min(200, vw * 0.5) : 240, H = W * 1.4, total = narrow ? W : W + 240;
  let left = 0, top = 0;
  if (pv?.rect) {
    const r = pv.rect, cx = r.x + r.w / 2;
    left = narrow ? (vw - W) / 2 : cx < vw / 2 ? Math.min(r.x + r.w + 18, vw - total - 8) : Math.max(8, r.x - total - 18);
    top = narrow ? 60 : Math.min(Math.max(70, r.y + r.h / 2 - H / 2), vh - H - 16);
  }
  const kws = c ? (Object.keys(KEYWORDS) as Keyword[]).filter(k => new RegExp(`\\b${k}\\b`).test(c.tx)) : [];
  return (
    <AnimatePresence>
      {show && c && (
        <motion.div key={pv!.id + (pv!.uid ?? '')} className={s.hoverPv} style={{ left, top, width: total, ['--pw' as string]: `${W}px` }} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }} transition={{ duration: 0.16 }}>
          <Card card={c} cost={pv!.cost} look={f?.p === 1 ? undefined : lookOf(profile, c.id)} atk={f ? uAtk(G, f.p, f.l, f.u) : undefined} hp={f ? uMax(G, f.p, f.l, f.u) - f.u.dmg : undefined} />
          <div className={s.pvInfo}>
            {f && <p>{f.p === 0 ? 'Tua' : 'Avversaria'}, corsia {LANE_NAME[f.l]}.{f.u.sick ? ' Appena entrata in gioco.' : ''}{f.u.stun ? ' Stordita.' : ''}
              {f.u.asc ? ' Ascesa: +2/+2.' : c.t === 'U' ? ` Ascesa: ${f.u.fights ?? 0}/${ASCEND_FIGHTS} combattimenti.` : ''}</p>}
            {f && omenAt(G, f.l) && <p><b>{OMENS[omenAt(G, f.l)!].name}</b>: {OMENS[omenAt(G, f.l)!].text}</p>}
            {synergiesOf(c.id).map(sy => { const on = f ? activeSynergies(G, f.p, f.u).some(x => x.id === sy.id) : false;
              return <p key={sy.id} className={on ? s.synOn : ''}><b>Sincronia {sy.name}{on ? ' (attiva)' : ''}</b>: con {cardInfo(sy.a === c.id ? sy.b : sy.a).n}. {sy.text}</p>; })}
            {kws.map(k => <p key={k}><b>{k}</b>: {KEYWORDS[k]}</p>)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Log({ G }: { G: Game }) {
  return <details className={s.log}><summary>Registro</summary><ul>{[...G.log].reverse().slice(0, 50).map((l, i) => <li key={i} className={s[l.cls || 'plain']}>{l.txt}</li>)}</ul></details>;
}
