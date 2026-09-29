import {AnimatePresence} from 'framer-motion';
import {type Game, LANE_NAME, omenAt, OMENS, SLOTS} from '../../engine';
import {toast} from '../../ui/toast';
import {SealView} from './SealView';
import {UnitCard} from './UnitCard';
import {useBattle} from './store';
import type {useHighlights} from './useHighlights';
import s from './battle.module.css';

type H = ReturnType<typeof useHighlights>;

export function Lane({G, l, h}: { G: Game; l: number; h: H }) {
    const fighting = useBattle(st => st.laneHl === l);
    const b = useBattle.getState;
    const laneTarget = h.laneTargets.has(l), omen = omenAt(G, l);
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
    return (
        <div
            className={`${s.lane} ${fighting ? s.fight : ''} ${laneTarget ? s.targetable : ''} ${omen ? s['om-' + omen] : ''}`}
            data-tut={`lane:${l}`}
            onClickCapture={laneTarget ? e => {
                e.stopPropagation();
                b().clickLane(l);
            } : undefined}>
            <SealView G={G} p={1} l={l} targetable={h.seals.has(`1-${l}`)}/>
            {row(1)}
            <div className={s.laneBand}>
                <span className={s.laneTitle}>Corsia {LANE_NAME[l]}</span>
                {omen ? <button className={s.omen} onClick={() => toast(`${OMENS[omen].name}: ${OMENS[omen].text}`)}
                                title={OMENS[omen].text}>
                    <i aria-hidden="true">{OMENS[omen].icon}</i><span><b>{OMENS[omen].name}</b><small>{OMENS[omen].short}</small></span>
                </button> : <span className={s.noOmen}>Nessun presagio</span>}
            </div>
            {row(0)}
            <SealView G={G} p={0} l={l} targetable={h.seals.has(`0-${l}`)}/>
        </div>
    );
}
