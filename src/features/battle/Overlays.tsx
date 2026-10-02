import {AnimatePresence, motion} from 'framer-motion';
import {useMemo} from 'react';
import {Rose} from '../../cards/art/CardArt';
import {rose} from '../../cards/art/rose';
import {BACK_PAL, SEAL_PAL} from '../../cards/art/palettes';
import {useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {useBattle} from './store';
import s from './battle.module.css';

export function Banner() {
    const banner = useBattle(st => st.banner);
    return (
        <AnimatePresence>
            {banner && (
                <motion.div key={banner.id} className={s.banner} initial={{opacity: 0, scaleX: 0.2}}
                            animate={{opacity: 1, scaleX: 1}} exit={{opacity: 0, y: -20}} transition={{duration: 0.35}}>
                    <div>{banner.txt}</div>
                    {banner.sub && <small>{banner.sub}</small>}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function Result({onExit}: { onExit: () => void }) {
    const result = useBattle(st => st.result);
    const t = useT();
    const svg = useMemo(() => (result ? rose(result.win ? BACK_PAL.brace : SEAL_PAL[1], {
        n: 12,
        dead: !result.win,
        core: 14
    }) : ''), [result]);
    return (
        <AnimatePresence>
            {result && (
                <motion.div className={s.resultBack} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                    <motion.div className={s.result} initial={{scale: 0.6, rotateX: 40}}
                                animate={{scale: 1, rotateX: 0}}
                                transition={{type: 'spring', stiffness: 200, damping: 16}}>
                        <Rose svg={svg} className={s.resultRose}/>
                        <h2 className={result.win ? '' : s.lose}>{result.win ? t(W.victory) : t(W.defeat)}</h2>
                        <ul>{result.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
                        {result.cardLines.length > 0 && <details className={s.resultCards}>
                            <summary>{t('Progressi delle carte', 'Card progress')} ({result.cardLines.length})</summary>
                            <ul>{result.cardLines.map((l, i) => <li key={i}>{l}</li>)}</ul>
                        </details>}
                        <div className={s.resBtns}>{!result.win && useBattle.getState().mode === 'adv' &&
                            <button className={`${s.btn} ${s.gold}`} onClick={() => {
                                const st = useBattle.getState();
                                st.start('adv', st.node, st.advId);
                            }}>{t('Riprova', 'Retry')}</button>}
                            <button className={s.btn}
                                    onClick={() => useBattle.getState().openReplay()}>{t('Rivedi la partita', 'Watch the replay')}
                            </button>
                            <button className={`${s.btn} ${s.gold}`} onClick={onExit}
                                    autoFocus>{t('Torna al menu', 'Back to menu')}</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
