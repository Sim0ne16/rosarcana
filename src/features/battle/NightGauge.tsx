import {motion} from 'framer-motion';
import {type Game, NIGHT_PER_BREAK, NIGHT_PER_ROUND, NIGHT_PER_SACRIFICE, nightSegment} from '../../engine';
import {useLang, useT} from '../../i18n/lang';
import {nightText} from '../../i18n/names';
import s from './night.module.css';

/** Notte Incatenata: catene allentate, prossimo colpo della Notte e come si arriva alla soglia. */
export function NightGauge({G}: { G: Game }) {
    const t = useT(), lang = useLang();
    if (!G.night) return null;
    const chains = G.night.chains, next = nightSegment(chains);
    const pct = Math.min(100, ((chains - next.from) / (next.at - next.from)) * 100);
    const txt = nightText(next.id, lang);
    return (
        <section className={s.gauge} aria-label={t(`Catene: ${chains}. Prossimo colpo a ${next.at}`, `Chains: ${chains}. Next strike at ${next.at}`)}>
            <header><b>{t('Catene di Nyxa', 'Nyxa\'s Chains')}</b><span>{chains} / {next.at}</span></header>
            <div className={s.bar}><motion.i animate={{width: `${pct}%`}} transition={{type: 'spring', stiffness: 120, damping: 18}}/></div>
            <p><em>{txt.name}</em>: {txt.text}</p>
            <small>{t(`+${NIGHT_PER_ROUND} a ogni round, +${NIGHT_PER_BREAK} per ogni Sigillo spezzato, +${NIGHT_PER_SACRIFICE} per ogni sacrificio. La Notte colpisce entrambi.`,
                `+${NIGHT_PER_ROUND} each round, +${NIGHT_PER_BREAK} for every broken Seal, +${NIGHT_PER_SACRIFICE} for every sacrifice. The Night strikes both players.`)}</small>
        </section>
    );
}
