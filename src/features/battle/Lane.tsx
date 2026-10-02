import {AnimatePresence} from 'framer-motion';
import {type Game, LANE_NAME, omenAt, OMENS, SLOTS} from '../../engine';
import {EN_LANE_NAME, EN_OMENS} from '../../i18n/en/mechanics';
import {useLang, useT} from '../../i18n/lang';
import {toast} from '../../ui/toast';
import {SealView} from './SealView';
import {UnitCard} from './UnitCard';
import {useBattle} from './store';
import type {useHighlights} from './useHighlights';
import s from './battle.module.css';

type H = ReturnType<typeof useHighlights>;

/** Una navata dell'altare: Sigillo nemico in cima, le due file di unità e il presagio inciso al centro, il tuo Sigillo in fondo. */
export function Lane({G, l, h}: { G: Game; l: number; h: H }) {
    const fighting = useBattle(st => st.laneHl === l);
    const lang = useLang(), t = useT();
    const b = useBattle.getState;
    const laneTarget = h.laneTargets.has(l), omen = omenAt(G, l);
    const laneName = `${t('Corsia', 'Lane')} ${lang === 'en' ? EN_LANE_NAME[l] : LANE_NAME[l]}`;
    const row = (p: number) => (
        <div className={`${s.row} ${p === 0 && h.lanes.has(l) ? s.dropOk : ''}`}
             data-drop={p === 0 ? `lane:${l}` : undefined}
             onClick={p === 0 && h.lanes.has(l) ? () => b().clickLane(l) : undefined}>
            <AnimatePresence mode="popLayout">
                {G.p[p].board[l].map(u => <UnitCard key={u.uid} G={G} p={p} l={l} u={u}
                                                    targetable={h.units.has(u.uid)}/>)}
            </AnimatePresence>
            {Array.from({length: SLOTS - G.p[p].board[l].length}, (_, i) => <div key={'e' + i} className={s.slot}
                                                                                 aria-hidden="true"/>)}
        </div>
    );
    const o = omen ? (lang === 'en' ? EN_OMENS[omen] : OMENS[omen]) : null;
    return (
        <section
            className={`${s.lane} ${fighting ? s.fight : ''} ${laneTarget ? s.targetable : ''} ${omen ? s['om-' + omen] : s.noOmenLane}`}
            aria-label={o ? `${laneName}: ${o.name}` : laneName}
            data-tut={`lane:${l}`}
            onClickCapture={laneTarget ? e => {
                e.stopPropagation();
                b().clickLane(l);
            } : undefined}>
            {omen && <i className={s.omenMark} aria-hidden="true">{OMENS[omen].icon}</i>}
            <SealView G={G} p={1} l={l} targetable={h.seals.has(`1-${l}`)}/>
            {row(1)}
            <div className={s.laneBand}>
                {o && omen ? <button className={s.omen} onClick={() => toast(`${o.name}: ${o.text}`)} title={o.text}>
                        <i aria-hidden="true">{OMENS[omen].icon}</i><span><b>{o.name}</b><small>{o.short}</small></span>
                    </button>
                    : <span className={s.noOmen}>{t('Nessun presagio', 'No omen')}</span>}
            </div>
            {row(0)}
            <SealView G={G} p={0} l={l} targetable={h.seals.has(`0-${l}`)}/>
        </section>
    );
}
