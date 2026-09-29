import { AnimatePresence, motion } from 'framer-motion';
import { cardInfo, FACTIONS } from '../../engine';
import { Card } from '../../cards/Card';
import { loreOf } from '../../cards/lore';
import { lookOf, useProfile } from '../../profile/store';
import { useBattle } from './store';
import s from './battle.module.css';

/** Entrata in scena delle leggendarie: la carta appare al centro con un'esplosione di luce nel colore della fazione. */
export function LegendEntrance() {
  const L = useBattle(st => st.legend), profile = useProfile();
  return (
    <AnimatePresence>
      {L && (() => { const c = cardInfo(L.id), F = FACTIONS[c.f];
        return (
          <motion.div key={L.k} className={s.legend} style={{ ['--lc' as string]: F.col, ['--lc2' as string]: F.col2 }} onClick={() => useBattle.setState({ legend: null })}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }} aria-live="polite">
            <motion.div className={s.legendRays} initial={{ scale: 0.2, rotate: 0, opacity: 0 }} animate={{ scale: 1.4, rotate: 40, opacity: 1 }} transition={{ duration: 1.8, ease: 'easeOut' }} />
            <motion.div className={s.legendBurst} initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3.2, opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
            <motion.div className={s.legendCard} initial={{ scale: 0.3, y: 80, rotateY: 90 }} animate={{ scale: 1, y: 0, rotateY: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.1 }}>
              <Card card={c} look={L.p === 0 ? lookOf(profile, c.id) : undefined} />
            </motion.div>
            <motion.div className={s.legendText} initial={{ opacity: 0, y: 20, letterSpacing: '0.4em' }} animate={{ opacity: 1, y: 0, letterSpacing: '0.04em' }} transition={{ delay: 0.35, duration: 0.7 }}>
              <span>{L.p === 0 ? 'Evochi una leggenda' : "L'avversario evoca una leggenda"}</span>
              <b>{c.n}</b>
              <em>{loreOf(c.id)?.flavor}</em>
            </motion.div>
          </motion.div>);
      })()}
    </AnimatePresence>
  );
}
