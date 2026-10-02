import {AnimatePresence, motion} from 'framer-motion';
import {BYID, type Game} from '../../engine';
import {Card} from '../../cards/Card';
import {useLang, useT} from '../../i18n/lang';
import {cardName} from '../../i18n/names';
import {lookOf, useProfile} from '../../profile/store';
import {myBack, useBattle} from './store';
import {CardBack} from './CardBack';
import s from './battle.module.css';

/** Mulligan: tocca le carte da sostituire, poi conferma. Una volta sola, prima del primo turno. */
export function Mulligan({G}: { G: Game }) {
    const m = useBattle(st => st.mull), profile = useProfile();
    const lang = useLang(), t = useT();
    const b = useBattle.getState;
    const name = (id: string) => cardName(id, lang);
    return (
        <AnimatePresence>
            {m && (
                <motion.div className={s.mull} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                            role="dialog" aria-label={t('Mano iniziale', 'Opening hand')}>
                    <h2>{t('La tua mano iniziale', 'Your opening hand')}</h2>
                    <p>{G.first === 0 ? t('Inizi tu.', 'You go first.') : t(`Inizia ${G.p[1].name}: tu parti con una carta in più.`, `${G.p[1].name} goes first: you start with one extra card.`)} {t('Tocca le carte che vuoi sostituire: torneranno nel mazzo e ne pescherai altrettante.', 'Tap the cards you want to replace: they will return to the deck and you will draw as many.')}</p>
                    <div className={s.mullCards}>
                        {G.p[0].hand.map((h, i) => {
                            const on = m.sel.includes(h.hid);
                            return (
                                <motion.button key={h.hid} className={`${s.mullCard} ${on ? s.mullOn : ''}`}
                                               onClick={() => b().toggleMull(h.hid)} aria-pressed={on}
                                               aria-label={t(`${name(h.id)}${on ? ', da sostituire' : ''}`, `${name(h.id)}${on ? ', to replace' : ''}`)}
                                               initial={{x: '60vw', y: '-30vh', rotate: 35, opacity: 0, scale: 0.6}}
                                               animate={{x: 0, y: on ? 18 : 0, rotate: 0, opacity: 1, scale: 1}}
                                               transition={{
                                                   delay: 0.35 + i * 0.22,
                                                   type: 'spring',
                                                   stiffness: 170,
                                                   damping: 20
                                               }} whileHover={{y: on ? 12 : -8}}>
                                    <Card card={BYID[h.id]} look={lookOf(profile, h.id)}/>
                                    {on && <span className={s.mullX}>{t('Da sostituire', 'To replace')}</span>}
                                </motion.button>);
                        })}
                    </div>
                    <motion.div className={s.mullDeck} initial={{opacity: 0, x: 60}} animate={{opacity: 1, x: 0}}
                                aria-hidden="true">{[0, 1, 2].map(k => <span key={k}
                                                                             style={{transform: `translate(${k * 2}px, ${-k * 2}px)`}}><CardBack
                        back={myBack}/></span>)}</motion.div>
                    <motion.button className={s.mullGo} onClick={() => b().confirmMull()} initial={{opacity: 0, y: 10}}
                                   animate={{opacity: 1, y: 0}}
                                   transition={{delay: 0.5 + G.p[0].hand.length * 0.22}}>{m.sel.length
                        ? t(`Sostituisci ${m.sel.length} ${m.sel.length === 1 ? 'carta' : 'carte'}`, `Replace ${m.sel.length} ${m.sel.length === 1 ? 'card' : 'cards'}`)
                        : t('Tengo questa mano', 'Keep this hand')}</motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
