import {motion, useAnimationControls} from 'framer-motion';
import {useEffect, useState} from 'react';
import {Lane} from './Lane';
import {NightGauge} from './NightGauge';
import {Hand, OppHand} from './Hand';
import {PlayerBar, QuitButton, TurnBand, TurnControls, TurnHint} from './Hud';
import {useT} from '../../i18n/lang';
import {CustodeBadge} from './CustodeBadge';
import {Log, Preview} from './Preview';
import {StackZone} from './StackZone';
import {TargetArrow} from './TargetArrow';
import {MyAims, OppAim, OppAnnouncer} from './OppPlayFx';
import {Banner, Result} from './Overlays';
import {useBattle} from './store';
import {useHighlights} from './useHighlights';
import {InspectOverlay} from './Inspect';
import {Coach} from './Coach';
import {Reveal} from './Reveal';
import {LegendEntrance} from './Legend';
import {Mulligan} from './Mulligan';
import {CoinToss} from './CoinToss';
import {ReplayBar} from './Replay';
import {TutorialOverlay} from '../tutorial/TutorialOverlay';
import {siteImg} from '../../cards/art/site';
import s from './battle.module.css';

export function BattleScreen() {
    const G = useBattle(st => st.G), shake = useBattle(st => st.shake), mode = useBattle(st => st.mode);
    const h = useHighlights();
    const lens = useBattle(st => st.lens), replay = useBattle(st => st.replay);
    const board = useAnimationControls();
    const t = useT();
    // la colonna di destra si può chiudere per allargare il campo; la scelta resta tra una partita e l'altra
    const [side, setSide] = useState(() => {
        try {
            return localStorage.getItem('rosarcana-side-open') !== '0';
        } catch {
            return true;
        }
    });
    const toggleSide = () => setSide(v => {
        try {
            localStorage.setItem('rosarcana-side-open', v ? '0' : '1');
        } catch { /* senza memoria locale vale solo per questa partita */
        }
        return !v;
    });
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
        <div className={`${s.screen} ${lens ? s.lensMode : ''} ${side ? '' : s.sideClosed}`}
             style={siteImg('tavolo') ? {['--table' as string]: `url(${siteImg('tavolo')})`} : undefined}>
            {/* Fascia avversaria: targa (giocatore e Custode) a sinistra, mano coperta al centro. */}
            <header className={s.top}>
                <div className={s.plate}><PlayerBar G={G} p={1}/><CustodeBadge G={G} p={1} row/></div>
                <OppHand G={G}/>
                <span aria-hidden="true"/>
            </header>
            <div className={`${s.field} ${side ? '' : s.fieldWide}`}>
                <motion.main className={s.board} animate={board} data-tut="board">
                    {[0, 1, 2].map(l => <Lane key={l} G={G} l={l} h={h}/>)}
                </motion.main>
                {/* Colonna di destra: registro, suggerimento e strumenti. Si chiude per dare più spazio al campo. */}
                <button className={`${s.sideTab} ${side ? '' : s.sideTabClosed}`} onClick={toggleSide}
                        aria-expanded={side} aria-label={side ? t('Chiudi la colonna laterale', 'Close the side panel') : t('Apri la colonna laterale', 'Open the side panel')}
                        title={side ? t('Chiudi la colonna: più spazio al campo', 'Close the panel: more room for the board') : t('Apri registro e strumenti', 'Open log and tools')}>
                    {side ? '›' : '‹'}
                </button>
                {side && <aside className={s.right}>
                    <Log G={G}/>
                    <NightGauge G={G}/>
                    <TurnHint G={G}/>
                    {!replay && <div className={s.toolsRow}><QuitButton/></div>}
                </aside>}
            </div>
            {/* Fascia inferiore speculare a quella dell'avversario: la tua targa a sinistra, la mano al centro. */}
            <div className={s.bottom}>
                {/* in basso a sinistra: turno e tempo sopra la tua targa */}
                <div className={s.leftStack}>
                    <TurnBand G={G}/>
                    <div className={s.plate}><PlayerBar G={G} p={0}/><CustodeBadge G={G} p={0} row/></div>
                </div>
                <Hand G={G}/>
                <TurnControls G={G}/>
            </div>
            <Preview G={G}/>
            <InspectOverlay G={G}/>
            <Reveal/>
            <LegendEntrance/>
            <CoinToss/>
            <Mulligan G={G}/>
            <ReplayBar/>
            <StackZone/>
            <TargetArrow/>
            <OppAim/>
            <MyAims/>
            <OppAnnouncer/>
            <Banner/>
            {mode === 'tutorial' && <TutorialOverlay/>}
            <Coach/>
            <Result onExit={() => useBattle.getState().exit()}/>
        </div>
    );
}
