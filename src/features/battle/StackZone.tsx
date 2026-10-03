import {AnimatePresence, motion, useMotionValue, useTransform} from 'framer-motion';
import {BYID} from '../../engine';
import {Card} from '../../cards/Card';
import {useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {lookOf, useProfile} from '../../profile/store';
import {useBattle} from './store';
import {CardBack} from './CardBack';
import s from './battle.module.css';

/** La "pila": la carta giocata si mostra grande prima di risolversi, come in Magic: The Gathering Arena. */
export function StackZone() {
    const stack = useBattle(st => st.stack), sel = useBattle(st => st.sel);
    const profile = useProfile();
    const t = useT();
    const b = useBattle.getState;
    // rotazione della carta in volo: oltre i 90 gradi si vede il dorso, sotto la faccia (senza dipendere dal 3D del CSS)
    const rot = useMotionValue(0);
    const frontOp = useTransform(rot, v => (Math.abs(v) > 90 ? 0 : 1)), backOp = useTransform(rot, v => (Math.abs(v) > 90 ? 1 : 0));
    return (
        <div className={s.stackZone}>
            <AnimatePresence>
                {stack && (
                    <motion.div key={stack.hid} layoutId={`card-${stack.hid}`} id="stack-card" className={s.stackCard}
                                onContextMenu={e => {
                                    e.preventDefault();
                                    b().inspect({id: stack.id, p: stack.p});
                                }} onClick={() => {
                        if (b().lens) b().inspect({id: stack.id, p: stack.p});
                    }}
                                initial={stack.p === 1 ? {scale: 0.5} : undefined}
                                animate={{scale: 1, opacity: 1}}
                                exit={stack.flyTo
                                    // incantesimi e reliquie dell'avversario volano verso il bersaglio prima di sparire
                                    ? {x: stack.flyTo.x, y: stack.flyTo.y, scale: 0.25, rotate: -8, opacity: 0, transition: {duration: 0.5, ease: [0.5, 0, 0.75, 0]}}
                                    : {opacity: 0, scale: 1.15, filter: 'brightness(2)', transition: {duration: 0.3}}}
                                // arrivo pulito: decelera fino al punto, senza rimbalzi
                                transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}>
                        {/* la rotazione sta su un elemento interno: su quello che si sposta (layoutId) verrebbe bloccata */}
                        <motion.div className={s.flip} style={{rotateY: rot}}
                                    initial={stack.p === 1 ? {rotateY: 180} : false} animate={{rotateY: 0}}
                                    transition={{duration: 0.75, ease: [0.3, 0.1, 0.2, 1]}}>
                            <motion.div style={{opacity: frontOp}}>
                                <Card card={BYID[stack.id]} look={stack.p === 0 ? lookOf(profile, stack.id) : undefined}/>
                            </motion.div>
                            {stack.p === 1 && <motion.div className={s.faceBack} style={{opacity: backOp}} aria-hidden="true"><CardBack back="cera"/></motion.div>}
                        </motion.div>
                        {stack.targeting && sel?.kind === 'hand' && (
                            <div className={s.stackActions}>
                                {sel.step === 'confirm' ? <button className={`${s.btn} ${s.gold}`}
                                                                  onClick={() => b().confirm()}>{t(W.play)}</button> :
                                    <span>{sel.step === 'dest' ? t('Scegli la corsia di arrivo', 'Choose the destination lane') : t('Scegli un bersaglio', 'Choose a target')}</span>}
                                {sel.skip &&
                                    <button className={s.btn} onClick={() => b().skip()}>{t('Salta effetto', 'Skip effect')}</button>}
                                <button className={s.btn} onClick={() => b().cancel()}>{t(W.cancel)}</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
