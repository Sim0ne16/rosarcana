import {AnimatePresence, motion} from 'framer-motion';
import {BYID} from '../../engine';
import {Card} from '../../cards/Card';
import {useT} from '../../i18n/lang';
import {useBattle} from './store';
import s from './battle.module.css';

/** Rivelazione della mano: le carte si girano al centro del tavolo, poi restano scoperte in cima (o nella tua mano, se è l'avversario a guardare). */
export function Reveal() {
    const r = useBattle(st => st.reveal), close = useBattle(st => st.closeReveal);
    const t = useT();
    return (
        <AnimatePresence>
            {r && (
                <motion.div key={r.id} className={s.reveal} initial={{opacity: 0}} animate={{opacity: 1}}
                            exit={{opacity: 0}} onClick={close} role="dialog"
                            aria-label={t('Mano rivelata', 'Hand revealed')}>
                    <div className={s.revealBox}>
                        <h3>{r.p === 0 ? t('Occhio Vacuo: la mano dell\'avversario', "Hollow Eye: the opponent's hand") : t('L\'avversario ha visto la tua mano', 'The opponent has seen your hand')}</h3>
                        <p>{r.p === 0 ? (r.ids.length ? t('Queste carte restano scoperte in cima al tavolo finché non vengono giocate.', 'These cards stay face up on the table until they are played.') : t('La mano avversaria è vuota.', "The opponent's hand is empty.")) : t('Le tue carte in mano sono ora note all\'avversario.', 'Your cards in hand are now known to the opponent.')}</p>
                        <div className={s.revealCards}>
                            {r.ids.map((id, i) => (
                                <motion.div key={i} className={s.revealCard}
                                            initial={{rotateY: 180, y: -40, opacity: 0}}
                                            animate={{rotateY: 0, y: 0, opacity: 1}}
                                            transition={{delay: 0.15 + i * 0.12, duration: 0.5}}>
                                    <Card card={BYID[id]}/>
                                </motion.div>))}
                        </div>
                        <span className={s.revealHint}>{t('Tocca per chiudere', 'Tap to close')}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
