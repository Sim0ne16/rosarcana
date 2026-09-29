import {motion} from 'framer-motion';
import {useMemo} from 'react';
import {Rose} from '../cards/art/CardArt';
import {rose} from '../cards/art/rose';
import s from './app.module.css';

const PAL = ['#3a0f1a', '#8e2226', '#d9a943', '#ffe7a6'];

/** Marchio: rosone che gira lentamente e scritta incisa in foglia d'oro. */
export function Logo({size = 'sm'}: { size?: 'sm' | 'lg' }) {
    const svg = useMemo(() => rose(PAL, {n: 16, core: 13}), []);
    return (
        <div className={`${s.logoWrap} ${size === 'lg' ? s.logoLg : ''}`}>
            {size === 'lg' && <div className={s.logoRays} aria-hidden="true"/>}
            <motion.div className={s.logoRose} animate={{rotate: 360}}
                        transition={{duration: size === 'lg' ? 80 : 60, repeat: Infinity, ease: 'linear'}}><Rose
                svg={svg}/></motion.div>
            <div className={s.word}>
                <span className={s.wordmark}>Rosarcana</span>
                {size === 'lg' && <span className={s.tagline}>La guerra dei Sigilli</span>}
            </div>
        </div>
    );
}
