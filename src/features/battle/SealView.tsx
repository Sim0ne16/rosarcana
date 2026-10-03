import {AnimatePresence, motion} from 'framer-motion';
import {useMemo} from 'react';
import {type Game} from '../../engine';
import {SEAL_PAL} from '../../cards/art/palettes';
import {useLang, useT} from '../../i18n/lang';
import {cardName} from '../../i18n/names';
import {Floaters} from './Floaters';
import {Icon} from '../../cards/cardText';
import {CardArt} from '../../cards/art/CardArt';
import {defaultArt} from '../../cards/styles';
import {useBattle} from './store';
import s from './battle.module.css';

export function SealView({G, p, l, targetable}: { G: Game; p: number; l: number; targetable: boolean }) {
    const P = G.p[p], hp = P.seals[l], relic = P.relics[l];
    const allFx = useBattle(st => st.fx), fx = allFx.filter(f => f.p === p && f.l === l);
    // la reliquia si illumina quando il suo effetto scatta
    const relicOn = !!relic && allFx.some(f => f.kind === 'relic' && f.p === p && f.card === relic);
    const broke = fx.find(f => f.kind === 'break');
    // il cero si consuma in cinque fasi, in proporzione alla vita rimasta (vale per Sigilli da 6 come da 16)
    const phase = hp <= 0 ? 0 : Math.max(1, Math.ceil((hp / P.sealMax) * 5));
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
            {/* cero votivo: si accorcia a ogni fase, la fiamma cala; spezzato resta un filo di fumo */}
            <span className={`${s.candle} ${s['ph' + phase]}`} aria-hidden="true">
                {phase > 0 ? <span className={s.flame}/> : <span className={s.smoke}/>}
                <span className={s.wax}>
                    <span className={s.drip}/>
                    {phase <= 3 && phase > 0 && <span className={s.drip2}/>}
                    {hp > 0 && <b className={s.sealHp}>{hp}</b>}
                </span>
                <span className={s.candleBase}/>
            </span>
            {/* Reliquia: un piccolo reliquiario accanto al cero (che resta al centro), con l'anteprima al passaggio del mouse. */}
            {relic && <span className={`${s.relic} ${relicOn ? s.relicOn : ''}`} data-relic title={relicName} aria-label={relicName}
                            onMouseEnter={e => showRelic(e.currentTarget)}
                            onMouseLeave={() => b().setPreview(null)} onClick={e => {
                e.stopPropagation();
                if (b().lens) b().inspect({id: relic, p}); else showRelic(e.currentTarget);
            }} onContextMenu={e => {
                e.preventDefault();
                b().inspect({id: relic, p});
            }}>
                <span className={s.relicArt}><CardArt id={relic} style={defaultArt(relic)} arch={false}/></span>
                <span className={s.relicIcon}><Icon k="type-R"/></span>
            </span>}
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
