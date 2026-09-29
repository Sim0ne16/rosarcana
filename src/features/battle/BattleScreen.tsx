import {motion, useAnimationControls} from 'framer-motion';
import {useEffect} from 'react';
import {Lane} from './Lane';
import {Hand, OppHand} from './Hand';
import {PlayerBar, QuitButton, TurnControls} from './Hud';
import {CustodeBadge} from './CustodeBadge';
import {Log, Preview} from './Preview';
import {StackZone} from './StackZone';
import {TargetArrow} from './TargetArrow';
import {Banner, Result} from './Overlays';
import {useBattle} from './store';
import {useHighlights} from './useHighlights';
import {InspectOverlay} from './Inspect';
import {Coach} from './Coach';
import {Reveal} from './Reveal';
import {LegendEntrance} from './Legend';
import {Mulligan} from './Mulligan';
import {ReplayBar} from './Replay';
import {TutorialOverlay} from '../tutorial/TutorialOverlay';
import {siteImg} from '../../cards/art/site';
import s from './battle.module.css';

export function BattleScreen() {
    const G = useBattle(st => st.G), shake = useBattle(st => st.shake), mode = useBattle(st => st.mode);
    const h = useHighlights();
    const lens = useBattle(st => st.lens), replay = useBattle(st => st.replay);
    const board = useAnimationControls();
    // niente scosse del tavolo: la rottura di un Sigillo si vede con un lampo sul bordo, senza spostare l'interfaccia
    useEffect(() => {
        if (shake) void board.start({
            boxShadow: ['inset 0 0 0 0 rgba(255,80,60,0)', 'inset 0 0 80px 10px rgba(255,80,60,.55)', 'inset 0 0 0 0 rgba(255,80,60,0)'],
            transition: {duration: 0.7}
        });
    }, [shake, board]);
    useEffect(() => {
        const esc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') useBattle.getState().cancel();
        };
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, []);
    if (!G) return null;
    return (
        <div className={`${s.screen} ${lens ? s.lensMode : ''}`}
             style={siteImg('tavolo') ? {['--table' as string]: `url(${siteImg('tavolo')})`} : undefined}>
            <header className={s.top}><PlayerBar G={G} p={1}/><OppHand G={G}/><CustodeBadge G={G} p={1} row/></header>
            <div className={s.field}>
                <motion.main className={s.board} animate={board} data-tut="board">
                    {[0, 1, 2].map(l => <Lane key={l} G={G} l={l} h={h}/>)}
                </motion.main>
                <aside className={s.right}>
                    <CustodeBadge G={G} p={0}/>
                    <PlayerBar G={G} p={0}/>
                    <TurnControls G={G}/>
                    {!replay && <div className={s.toolsRow}><QuitButton/></div>}
                    <Log G={G}/>
                </aside>
            </div>
            <Hand G={G}/>
            <Preview G={G}/>
            <InspectOverlay G={G}/>
            <Reveal/>
            <LegendEntrance/>
            <Mulligan G={G}/>
            <ReplayBar/>
            <StackZone/>
            <TargetArrow/>
            <Banner/>
            {mode === 'tutorial' && <TutorialOverlay/>}
            <Coach/>
            <Result onExit={() => useBattle.getState().exit()}/>
        </div>
    );
}
