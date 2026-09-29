import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { Rose } from '../../cards/art/CardArt';
import { rose } from '../../cards/art/rose';
import { BACK_PAL, SEAL_PAL } from '../../cards/art/palettes';
import { useBattle } from './store';
import s from './battle.module.css';

export function Banner() {
  const banner = useBattle(st => st.banner);
  return (
    <AnimatePresence>
      {banner && (
        <motion.div key={banner.id} className={s.banner} initial={{ opacity: 0, scaleX: 0.2 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
          <div>{banner.txt}</div>{banner.sub && <small>{banner.sub}</small>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Result({ onExit }: { onExit: () => void }) {
  const result = useBattle(st => st.result);
  const svg = useMemo(() => (result ? rose(result.win ? BACK_PAL.brace : SEAL_PAL[1], { n: 12, dead: !result.win, core: 14 }) : ''), [result]);
  return (
    <AnimatePresence>
      {result && (
        <motion.div className={s.resultBack} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className={s.result} initial={{ scale: 0.6, rotateX: 40 }} animate={{ scale: 1, rotateX: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
            <Rose svg={svg} className={s.resultRose} />
            <h2 className={result.win ? '' : s.lose}>{result.win ? 'Vittoria' : 'Sconfitta'}</h2>
            <ul>{result.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
            <div className={s.resBtns}>{!result.win && useBattle.getState().mode === 'adv' && <button className={`${s.btn} ${s.gold}`} onClick={() => { const st = useBattle.getState(); st.start('adv', st.node, st.advId); }}>Riprova</button>}<button className={s.btn} onClick={() => useBattle.getState().openReplay()}>Rivedi la partita</button><button className={`${s.btn} ${s.gold}`} onClick={onExit} autoFocus>Torna al menu</button></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
