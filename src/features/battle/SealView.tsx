import {AnimatePresence, motion} from 'framer-motion';
import {useMemo} from 'react';
import {type Game} from '../../engine';
import {Rose} from '../../cards/art/CardArt';
import {rose} from '../../cards/art/rose';
import {SEAL_PAL} from '../../cards/art/palettes';
import {useLang, useT} from '../../i18n/lang';
import {cardName} from '../../i18n/names';
import {Floaters} from './Floaters';
import {Icon} from '../../cards/cardText';
import {useBattle} from './store';
import s from './battle.module.css';

export function SealView({G, p, l, targetable}: { G: Game; p: number; l: number; targetable: boolean }) {
    const P = G.p[p], hp = P.seals[l], relic = P.relics[l];
    const fx = useBattle(st => st.fx).filter(f => f.p === p && f.l === l);
    const broke = fx.find(f => f.kind === 'break');
    const svg = useMemo(() => rose(SEAL_PAL[p], {n: P.sealMax, lit: hp, dead: hp <= 0, core: 12}), [p, P.sealMax, hp]);
    const b = useBattle.getState;
    const lang = useLang(), t = useT();
    const relicName = relic ? (cardName(relic, lang)) : '';
    const showRelic = (el: Element) => {
        if (!relic) return;
        const r = el.getBoundingClientRect();
        b().setPreview({id: relic, rect: {x: r.left, y: r.top, w: r.width, h: r.height}});
    };
    return (
        <motion.button
            className={`${s.seal} ${p === 0 ? s.mine : s.theirs} ${hp <= 0 ? s.broken : hp <= 3 ? s.low : ''} ${targetable ? s.targetable : ''}`}
            data-drop={`seal:${p}-${l}`}
            onClick={() => b().clickSeal(p, l)}
            aria-label={t(`Sigillo di ${P.name}: ${hp <= 0 ? 'spezzato' : `${hp} su ${P.sealMax}`}`, `${p === 0 ? 'Your' : `${P.name}'s`} Seal: ${hp <= 0 ? 'broken' : `${hp} of ${P.sealMax}`}`)}
            title={hp > 0 ? t(`${hp} / ${P.sealMax} punti vita`, `${hp} / ${P.sealMax} health`) : undefined}
            animate={fx.some(f => f.kind === 'dmg') ? {x: [0, -5, 5, -2, 0]} : {x: 0}} transition={{duration: 0.4}}>
      <span className={s.medal}>
        <svg className={s.gauge} viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" className={s.gaugeTrack}/>
          <circle cx="50" cy="50" r="46" className={s.gaugeFill}
                  style={{strokeDasharray: `${(Math.max(0, hp) / P.sealMax) * 289} 289`}}/>
        </svg>
        <Rose svg={svg} className={s.rose}/>
        <b className={s.sealHp}>{hp > 0 ? hp : ''}</b>
      </span>
            {hp <= 0 && <span className={s.sLabel}>{t('Spezzato', 'Broken')}</span>}
            {/* Reliquia: una piccola targa accanto al rosone, con l'anteprima al passaggio del mouse. */}
            {relic && <span className={s.relic} data-relic title={relicName}
                            onMouseEnter={e => showRelic(e.currentTarget)}
                            onMouseLeave={() => b().setPreview(null)} onClick={e => {
                e.stopPropagation();
                if (b().lens) b().inspect({id: relic, p}); else showRelic(e.currentTarget);
            }} onContextMenu={e => {
                e.preventDefault();
                b().inspect({id: relic, p});
            }}><Icon k="type-R"/><span>{relicName}</span></span>}
            <Floaters fx={fx}/>
            <AnimatePresence>{broke && <Shatter key={broke.id} colors={SEAL_PAL[p]}/>}</AnimatePresence>
        </motion.button>
    );
}

function Shatter({colors}: { colors: string[] }) {
    const shards = useMemo(() => Array.from({length: 18}, (_, i) => ({
        a: Math.random() * Math.PI * 2,
        d: 60 + Math.random() * 110,
        r: Math.random() * 540 - 270,
        c: colors[i % colors.length]
    })), [colors]);
    return <span className={s.shatter} aria-hidden="true">{shards.map((sh, i) => (
        <motion.span key={i} className={s.shard} style={{background: sh.c}}
                     initial={{x: 0, y: 0, opacity: 1, rotate: 0}}
                     animate={{x: Math.cos(sh.a) * sh.d, y: Math.sin(sh.a) * sh.d + 50, opacity: 0, rotate: sh.r}}
                     transition={{duration: 1.1, ease: 'easeOut'}}/>
    ))}</span>;
}
