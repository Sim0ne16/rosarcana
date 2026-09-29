import { AnimatePresence, motion } from 'framer-motion';
import { BYID } from '../../engine';
import { Card } from '../../cards/Card';
import { useProfile, lookOf } from '../../profile/store';
import { useBattle } from './store';
import s from './battle.module.css';

/** La "pila": la carta giocata si mostra grande prima di risolversi, come in Magic: The Gathering Arena. */
export function StackZone() {
  const stack = useBattle(st => st.stack), sel = useBattle(st => st.sel);
  const profile = useProfile();
  const b = useBattle.getState;
  return (
    <div className={s.stackZone}>
      <AnimatePresence>
        {stack && (
          <motion.div key={stack.hid} layoutId={`card-${stack.hid}`} id="stack-card" className={s.stackCard} onContextMenu={e => { e.preventDefault(); b().inspect({ id: stack.id, p: stack.p }); }} onClick={() => { if (b().lens) b().inspect({ id: stack.id, p: stack.p }); }}
            initial={stack.p === 1 ? { rotateY: 90, scale: 0.6 } : undefined} animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 1.15, filter: 'brightness(2)', transition: { duration: 0.3 } }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
            <Card card={BYID[stack.id]} look={stack.p === 0 ? lookOf(profile, stack.id) : undefined} />
            {stack.targeting && sel?.kind === 'hand' && (
              <div className={s.stackActions}>
                {sel.step === 'confirm' ? <button className={`${s.btn} ${s.gold}`} onClick={() => b().confirm()}>Gioca</button> : <span>Scegli un bersaglio</span>}
                {sel.skip && <button className={s.btn} onClick={() => b().skip()}>Salta effetto</button>}
                <button className={s.btn} onClick={() => b().cancel()}>Annulla</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
