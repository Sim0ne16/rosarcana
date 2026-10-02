import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import {useBattle} from '../battle/store';
import {TUTORIAL} from './script';
import {useLang, useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {EN_TUTORIAL} from '../../i18n/en/ui';
import s from './tutorial.module.css';

/** Pannello del tutorial con anelli luminosi attorno agli elementi da usare. */
export function TutorialOverlay() {
    const step = useBattle(st => st.tutStep), free = useBattle(st => st.tutFree), result = useBattle(st => st.result);
    const st = TUTORIAL.steps[step];
    const [rects, setRects] = useState<DOMRect[]>([]);
    const t = useT(), lang = useLang(), en = lang === 'en';
    useEffect(() => {
        let raf = 0;
        const tick = () => {
            const rs = (st?.anchors ?? []).map(a => document.querySelector(`[data-tut="${a}"]`)?.getBoundingClientRect()).filter((r): r is DOMRect => !!r);
            setRects(prev => (prev.length === rs.length && prev.every((p, i) => Math.abs(p.x - rs[i].x) < 1 && Math.abs(p.y - rs[i].y) < 1 && Math.abs(p.width - rs[i].width) < 1) ? prev : rs));
            raf = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(raf);
    }, [st]);
    if (!st || free || result) return null;
    const b = useBattle.getState;
    const tx = (en ? EN_TUTORIAL[step] : undefined) ?? st;
    return (
        <>
            {rects.map((r, i) => <motion.div key={step + '-' + i} className={s.ring} initial={{opacity: 0}}
                                             animate={{opacity: 1}}
                                             style={{
                                                 left: r.left - 8,
                                                 top: r.top - 8,
                                                 width: r.width + 16,
                                                 height: r.height + 16
                                             }}/>)}
            <AnimatePresence mode="wait">
                <motion.div key={step} className={s.panel} initial={{opacity: 0, y: -16}} animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}} role="status">
                    <div className={s.count}>{t(`Passo ${step + 1} di ${TUTORIAL.steps.length}`, `Step ${step + 1} of ${TUTORIAL.steps.length}`)}</div>
                    <h3>{tx.title}</h3>
                    <p>{tx.text}</p>
                    {(st.kind === 'info' || st.kind === 'free') &&
                        <button onClick={() => b().tutNext()}>{st.kind === 'free' ? t(W.play) : t('Avanti', 'Next')}</button>}
                </motion.div>
            </AnimatePresence>
        </>
    );
}
