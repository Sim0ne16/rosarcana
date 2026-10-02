import {AnimatePresence, motion} from 'framer-motion';
import {useT} from '../../i18n/lang';
import type {Fx} from './store';
import s from './battle.module.css';

export function Floaters({fx}: { fx: Fx[] }) {
    const t = useT();
    return (
        <AnimatePresence>
            {fx.filter(f => f.kind === 'ascend').map(f => (
                <motion.span key={f.id} className={s.ascFloat} initial={{opacity: 0, scale: 0.4, y: 0}}
                             animate={{opacity: [0, 1, 1, 0], scale: [0.4, 1.4, 1.1, 1], y: -40}}
                             transition={{duration: 1.8}}>{t('Ascesa!', 'Ascended!')}</motion.span>
            ))}
            {fx.filter(f => f.kind === 'dmg' || f.kind === 'heal').map(f => (
                <motion.span key={f.id} className={`${s.floater} ${f.kind === 'heal' ? s.heal : ''}`}
                             initial={{opacity: 0, y: 0, scale: 0.5}}
                             animate={{opacity: [0, 1, 1, 0], y: -54, scale: [0.5, 1.3, 1, 1]}}
                             transition={{duration: 1.2, times: [0, 0.2, 0.7, 1]}} exit={{opacity: 0}}>
                    {f.kind === 'heal' ? '+' : '-'}{f.n}
                </motion.span>
            ))}
        </AnimatePresence>
    );
}
