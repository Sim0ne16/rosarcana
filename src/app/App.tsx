import {motion, MotionConfig, useAnimationControls} from 'framer-motion';
import {useEffect, useState} from 'react';
import {SvgDefs} from '../cards/art/SvgDefs';
import {Icon} from '../cards/cardText';
import {FONT_SETS, useProfile} from '../profile/store';
import {Toast} from '../ui/Modal';
import {toast} from '../ui/toast';
import {Ambient} from '../ui/Ambient';
import {AnimatedNumber} from '../ui/AnimatedNumber';
import {useBattle} from '../features/battle/store';
import {BattleScreen} from '../features/battle/BattleScreen';
import {PlayScreen} from '../features/play/PlayScreen';
import {AdventureScreen} from '../features/adventure/AdventureScreen';
import {DecksScreen} from '../features/decks/DecksScreen';
import {CollectionScreen} from '../features/collection/CollectionScreen';
import {ShopScreen} from '../features/shop/ShopScreen';
import {PassScreen} from '../features/pass/PassScreen';
import {Logo} from './Logo';
import {ArenaScreen} from '../features/modes/ArenaScreen';
import {ExpeditionScreen} from '../features/modes/ModesScreens';
import {AuthorScreen} from '../features/author/AuthorScreen';
import {Credits} from '../features/info/Credits';
import {SettingsModal} from '../features/info/Settings';
import {ConfirmBuyHost} from '../ui/confirmBuy';
import {ProfileScreen} from '../features/info/ProfileScreen';
import {EventSync, useEvent} from '../features/adventure/stories';
import {WarSync} from '../features/war/war';
import {LESSONS} from '../features/modes/lessons';
import {sfx, type Sfx} from '../audio/sfx';
import {useT} from '../i18n/lang';
import {W} from '../i18n/words';
import s from './app.module.css';

const TABS = [['gioca', 'Gioca', 'Play'], ['avventura', 'Avventura', 'Adventure'], ['mazzi', 'Mazzi', 'Decks'], ['collezione', 'Collezione', 'Collection'], ['negozio', 'Negozio', 'Shop'], ['pass', 'Pass', 'Pass']] as const;
export type Tab = (typeof TABS)[number][0] | 'arena' | 'spedizione' | 'autore' | 'crediti' | 'profilo';

export function App() {
    const [tab, setTab] = useState<Tab>('gioca');
    const inBattle = useBattle(st => st.G != null);
    const p = useProfile();
    const t = useT();
    const bump = useAnimationControls();
    useEffect(() => {
        const on = () => void bump.start({scale: [1, 1.35, 1], rotate: [0, -6, 0], transition: {duration: 0.45}});
        window.addEventListener('pack-bump', on);
        return () => window.removeEventListener('pack-bump', on);
    }, [bump]);
    useEffect(() => {
        window.scrollTo({top: 0});
    }, [tab]);
    const st = useProfile(x => x.settings), [opts, setOpts] = useState(false);
    // Le carte vive cambiano i dati delle carte sul posto: al cambio (raro) si rimonta il contenuto, così anche
    // le carte già disegnate (componenti memo) mostrano la nuova versione.
    const live = useEvent(x => x.variants.map(v => v.variant).join());
    const onboarded = useProfile(x => x.onboardSkip || (x.tutorialDone && LESSONS.every(l => x.lessons?.includes(l.id))));
    useEffect(() => {
        const r = document.documentElement;
        r.style.setProperty('--text-scale', String(st?.textScale ?? 1));
        const fs = FONT_SETS.find(f => f.id === (st?.font ?? 'classico')) ?? FONT_SETS[0];
        r.style.setProperty('--display', fs.display);
        r.style.setProperty('--body', fs.body);
        r.classList.toggle('rm', !!st?.reduceMotion);
        r.classList.toggle('hc', !!st?.highContrast);
    }, [st]);
    useEffect(() => {
        // suono per ogni pulsante; data-sfx sceglie un suono diverso ("none" per nessuno)
        const on = (e: MouseEvent) => {
            const b = (e.target as Element).closest?.('button, [role="button"], [role="tab"], [role="radio"]') as HTMLElement | null;
            if (!b || (b as HTMLButtonElement).disabled) return;
            const k = b.dataset.sfx;
            if (k === 'none') return;
            sfx((k as Sfx) || 'click');
        };
        document.addEventListener('click', on, true);
        return () => document.removeEventListener('click', on, true);
    }, []);
    const coin = (k: string, v: number, title: string) => (
        <span className={`${s.cur} ${s[k]}`} title={title}><Icon k={`cur-${k}`} className={s.curIcon}/><AnimatedNumber
            value={v}/></span>
    );
    return (
        <MotionConfig reducedMotion={st?.reduceMotion ? 'always' : 'user'}>
            <SvgDefs/>
            <EventSync/>
            <WarSync/>
            {inBattle ? <BattleScreen/> : (
                <>
                    <Ambient/>
                    <header className={s.header}>
                        <button className={s.brandBtn} onClick={() => setTab('gioca')}
                                aria-label={t('Rosarcana, torna a Gioca', 'Rosarcana, back to Play')}><Logo/></button>
                        <nav className={s.nav} aria-label={t('Sezioni', 'Sections')}>
                            {TABS.map(([k, l, le]) => (
                                <button key={k} className={s.tab} aria-current={tab === k ? 'page' : undefined}
                                        onClick={() => {
                                            if (['avventura', 'negozio', 'pass'].includes(k) && !onboarded) {
                                                toast(t('Si sblocca dopo il tutorial e le tre Prove della Rosa', 'Unlocks after the tutorial and the three Trials of the Rose'));
                                                return;
                                            }
                                            setTab(k);
                                        }}>
                                    {tab === k && <motion.span layoutId="tab-pill" className={s.pill} transition={{
                                        type: 'spring',
                                        stiffness: 420,
                                        damping: 34
                                    }}/>}
                                    <Icon k={`nav-${k}`} className={s.tabIcon}/><span
                                    className={s.tabLabel}>{t(l, le)}</span>
                                </button>
                            ))}
                        </nav>
                        <div className={s.wallet} aria-label={t('Valute', 'Currencies')}>
                            <button className={s.gear} onClick={() => setTab('profilo')} aria-label={t(W.profile)}
                                    title={t(W.profile)}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor"
                                          d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.3-8 5.2V21h16v-1.8c0-2.9-3.6-5.2-8-5.2Z"/>
                                </svg>
                            </button>
                            <button className={s.gear} onClick={() => setOpts(true)}
                                    aria-label={t(W.options)}
                                    title={t(W.options)}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="currentColor"
                                          d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.2 5.1-1.8-.3a6.8 6.8 0 0 1-.7 1.7l1.1 1.5-1.8 1.8-1.5-1.1c-.5.3-1.1.6-1.7.7l-.3 1.8h-2.6l-.3-1.8c-.6-.1-1.2-.4-1.7-.7l-1.5 1.1-1.8-1.8 1.1-1.5c-.3-.5-.6-1.1-.7-1.7l-1.8-.3v-2.6l1.8-.3c.1-.6.4-1.2.7-1.7L4.6 6.7l1.8-1.8 1.5 1.1c.5-.3 1.1-.6 1.7-.7l.3-1.8h2.6l.3 1.8c.6.1 1.2.4 1.7.7l1.5-1.1 1.8 1.8-1.1 1.5c.3.5.6 1.1.7 1.7l1.8.3Z"/>
                                </svg>
                            </button>

                            {coin('oro', p.oro, t('Oro: si guadagna giocando', 'Gold: earned by playing'))}
                            {coin('polvere', p.polvere, t('Polvere: per creare carte e stili', 'Dust: for crafting cards and styles'))}
                            {coin('gemme', p.gemme, t('Gemme: valuta premium', 'Gems: premium currency'))}
                            {coin('gettoni', p.gettoni, t('Gettoni stile: sbloccano uno stile per una carta', 'Style tokens: unlock a style for a card'))}
                            <motion.button id="packs-pill" className={s.packs} animate={bump}
                                           onClick={() => setTab('negozio')}
                                           aria-label={t(`${p.packs} bustine, vai al negozio`, `${p.packs} packs, go to the shop`)}>
                                <span className={s.packIcon} aria-hidden="true"/><AnimatedNumber value={p.packs}/>
                            </motion.button>
                        </div>
                    </header>
                    <main className={s.main}>
                        <motion.div key={`${tab}|${live}`} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.25}}>
                            {tab === 'gioca' && <PlayScreen goDecks={() => setTab('mazzi')} goTab={setTab}/>}
                            {tab === 'avventura' && <AdventureScreen/>}
                            {tab === 'mazzi' && <DecksScreen/>}
                            {tab === 'collezione' && <CollectionScreen/>}
                            {tab === 'negozio' && <ShopScreen/>}
                            {tab === 'pass' && <PassScreen/>}
                            {tab === 'arena' && <ArenaScreen back={() => setTab('gioca')}/>}
                            {tab === 'spedizione' && <ExpeditionScreen back={() => setTab('gioca')}/>}
                            {tab === 'autore' && <AuthorScreen back={() => setTab('gioca')}/>}
                            {tab === 'crediti' && <Credits back={() => setTab('gioca')}/>}
                            {tab === 'profilo' && <ProfileScreen back={() => setTab('gioca')}/>}
                        </motion.div>
                    </main>
                    <SettingsModal open={opts} onClose={() => setOpts(false)}/>
                    <ConfirmBuyHost/>
                    <footer className={s.footer}>
                        <button onClick={() => setOpts(true)}>{t(W.options)}</button>
                        <button onClick={() => setTab('crediti')}>{t('Crediti e note legali', 'Credits and legal notices')}</button>
                        <span>{t('Rosarcana, prototipo. Icone game-icons.net (CC BY 3.0).', 'Rosarcana, prototype. Icons by game-icons.net (CC BY 3.0).')}</span>
                    </footer>
                </>
            )}
            <Toast/>
        </MotionConfig>
    );
}
