import {AnimatePresence, motion} from 'framer-motion';
import {useState} from 'react';
import {useT} from '../../i18n/lang';
import {useBattle} from './store';
import s from './battle.module.css';

/** Consigli del Maestro durante le Prove della Rosa. */
export function Coach() {
    const coach = useBattle(st => st.coach), result = useBattle(st => st.result);
    const [open, setOpen] = useState(true);
    const t = useT();
    if (!coach || result) return null;
    return (
        <AnimatePresence>
            <motion.div className={s.coach} initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}>
                <button className={s.coachHead} onClick={() => setOpen(o => !o)}
                        aria-expanded={open}><b>{t('Il Maestro', 'The Master')}</b><span>{coach.title}</span><i>{open ? '−' : '+'}</i>
                </button>
                {open && <ul>{coach.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>}
            </motion.div>
        </AnimatePresence>
    );
}
