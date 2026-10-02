import {defaultArt} from '../../cards/styles';
import {motion} from 'framer-motion';
import {type ReactNode, useState} from 'react';
import {Confirm} from '../../ui/Confirm';
import {ASCEND_TEXT, BYID, FACTIONS, OMENS} from '../../engine';
import {Card} from '../../cards/Card';
import {CardArt} from '../../cards/art/CardArt';
import {deckIssues} from '../../economy/decks';
import {QUEST_POOL, RANKS, rewardLabel} from '../../economy/constants';
import {lookOf, tierIdx, useProfile} from '../../profile/store';
import {Tilt} from '../../ui/Tilt';
import {toast} from '../../ui/toast';
import {Logo} from '../../app/Logo';
import {siteImg} from '../../cards/art/site';
import type {Tab} from '../../app/App';
import {useBattle} from '../battle/store';
import {DeckSelect} from '../decks/DeckSelect';
import {ADVENTURE} from '../adventure/nodes';
import {LESSON_REWARD, LESSONS, trainingOpponent} from '../modes/lessons';
import {startWeekly} from '../modes/weeklyStart';
import {daysToReset, weekIndex, WEEKLY_REWARD, WEEKLY_WINS, weeklyChallenges} from '../../economy/weekly';
import {useEvent} from '../adventure/stories';
import {DRAFT_MAX_L, DRAFT_MAX_W, DRAFT_MIN_GAMES, draftOver, useDraft} from '../modes/draft';
import {EXP_MIN_GAMES} from '../modes/expedition';
import {NIGHT_MIN_GAMES, startNight} from '../modes/night';
import {RoseWar} from '../war/RoseWar';
import {useLang, useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {EN_ASCEND_TEXT, EN_LESSONS, EN_QUESTS, EN_WEEKLY, rankName} from '../../i18n/en/ui';
import {EN_FACTION_NAMES, EN_OMENS} from '../../i18n/en/mechanics';
import u from '../../ui/ui.module.css';
import s from './play.module.css';

const HERO = ['vuoto-l0', 'brace-l0', 'marea-l0'];

type Lock = { short: string; long: string } | null;

/** Scheda di una modalità: arte in alto, titolo, descrizione, stato e un solo pulsante. Tutte uguali, così la griglia si legge a colpo d'occhio. */
function ModeTile({art, card, title, desc, status, action, lock, onClick}: {
    art?: string; card: string; title: string; desc: string; status?: ReactNode; action: string; lock: Lock; onClick: () => void
}) {
    const img = art ? siteImg(art) : undefined;
    return (
        <article className={`${s.mode} ${lock ? s.lLock : ''}`}>
            <div className={s.modeArt}>{img ? <img src={img} alt=""/> :
                <CardArt id={card} style={defaultArt(card)} arch={false}/>}</div>
            <div className={s.modeBody}>
                <h3>{title}</h3>
                <p>{desc}</p>
                {status && <div className={s.modeStatus}>{status}</div>}
                <button className={`${u.btn} ${u.sm} ${lock ? '' : u.primary}`}
                        onClick={() => (lock ? toast(lock.long) : onClick())}>{lock ? lock.short : action}</button>
            </div>
        </article>
    );
}

export function PlayScreen({goDecks, goTab}: { goDecks: () => void; goTab: (t: Tab) => void }) {
    const p = useProfile();
    const tier = tierIdx(p.rank);
    const t = useT(), lang = useLang(), en = lang === 'en';
    const [askReset, setAskReset] = useState(false);
    const [queue, setQueue] = useState<'ranked' | 'casual'>('ranked');
    const tutDone = p.tutorialDone || p.onboardSkip,
        unlocked = p.onboardSkip || (p.tutorialDone && LESSONS.every(l => p.lessons.includes(l.id)));
    const ev = useEvent(x => x.ev);
    const arena = useDraft(x => x.run), arenaBest = useDraft(x => x.best);
    /** Perché una modalità è ancora chiusa (`null` se è aperta): testo breve per la scheda e completo per l'avviso. */
    const lockOf = (need: number): Lock =>
        !tutDone ? {short: t('Dopo il tutorial', 'After the tutorial'), long: t('Completa prima il tutorial', 'Complete the tutorial first')}
            : !unlocked ? {short: t(W.afterTrials), long: t('Si sblocca dopo le Prove della Rosa', 'Unlocks after the Trials of the Rose')}
                : p.games < need ? {short: t(`Dopo ${need} partite`, `After ${need} matches`), long: t(`Si sblocca dopo ${need} partite (ne hai giocate ${p.games})`, `Unlocks after ${need} matches (you have played ${p.games})`)}
                    : null;
    /** Il mazzo attivo se è giocabile; altrimenti avvisa e porta ai mazzi. */
    const deckOrAsk = () => {
        const d = p.decks.find(x => x.id === p.activeDeck);
        if (d && !deckIssues(d, p.owned).length) return d;
        toast(t(W.chooseDeck));
        goDecks();
        return null;
    };
    const start = (mode: 'ranked' | 'casual' | 'tutorial') => {
        if (mode !== 'tutorial' && !unlocked) {
            toast(tutDone ? t('Completa prima le tre Prove della Rosa', 'Complete the three Trials of the Rose first') : t('Inizia dal tutorial', 'Start with the tutorial'));
            return;
        }
        if (mode !== 'tutorial' && !deckOrAsk()) return;
        useBattle.getState().start(mode);
    };
    const playLesson = (l: (typeof LESSONS)[number]) => {
        const lt = en ? EN_LESSONS[l.id] ?? l : l;
        useBattle.getState().startCustom({
            label: lt.title,
            me: {deck: l.deck(), custode: l.custode},
            op: {...l.op(), custode: null},
            omens: l.omens,
            coach: {title: lt.title, tips: lt.tips},
            timed: false,
            onEnd: win => (win ? useProfile.getState().lessonDone(l.id, LESSON_REWARD) : [t('Riprova: il Maestro ti aspetta.', 'Try again: the Master awaits you.')])
        });
    };
    const lessonList = (compact: boolean) => (
        <div className={compact ? s.rows : s.lessonGrid}>
            {LESSONS.map((l, i) => {
                const done = p.lessons.includes(l.id), open = i === 0 || p.lessons.includes(LESSONS[i - 1].id);
                const lt = en ? EN_LESSONS[l.id] ?? l : l;
                return (
                    <article key={l.id} className={`${s.lesson} ${done ? s.lDone : ''} ${open ? '' : s.lLock}`}>
                        <span className={s.lNum}>{done ? '✓' : i + 1}</span>
                        <div><h3>{lt.title}</h3>{!compact && <p>{lt.goal}</p>}</div>
                        <button className={`${u.btn} ${u.sm} ${done ? '' : u.primary}`} disabled={!open}
                                onClick={() => playLesson(l)}>{done ? t(W.replay) : open ? t(W.start) : t(W.locked)}</button>
                    </article>);
            })}
        </div>
    );
    const advDone = p.adv.length;
    const nextLesson = LESSONS.find(l => !p.lessons.includes(l.id));
    const days = daysToReset();

    // Pannello principale: una sola chiamata all'azione, che cambia col punto in cui si trova il giocatore.
    const panel = !p.tutorialDone && !p.onboardSkip ? (
        <div className={s.panel}>
            <span className={s.step}>{t('Primo passo', 'First step')}</span>
            <h2>{t('Impara a giocare', 'Learn to play')}</h2>
            <p>{t('Una partita guidata di pochi minuti: corsie, Sigilli e le prime carte.', 'A guided match of a few minutes: lanes, Seals and your first cards.')}</p>
            <button className={s.cta} onClick={() => start('tutorial')}>{t('Inizia il tutorial', 'Start the tutorial')}</button>
        </div>
    ) : !unlocked ? (
        <div className={s.panel}>
            <span className={s.step}>{t(`Prove della Rosa · ${p.lessons.length}/${LESSONS.length}`, `Trials of the Rose · ${p.lessons.length}/${LESSONS.length}`)}</span>
            <h2>{nextLesson ? (en ? EN_LESSONS[nextLesson.id]?.title ?? nextLesson.title : nextLesson.title) : ''}</h2>
            <p>{t('Tre partite guidate, una per ogni meccanica avanzata. Finite le Prove si aprono classificata, Avventura e negozio.', 'Three guided matches, one for each advanced mechanic. Once done, Ranked, Adventure and the shop open up.')}</p>
            {nextLesson && <button className={s.cta} onClick={() => playLesson(nextLesson)}>{t('Continua le Prove', 'Continue the Trials')}</button>}
        </div>
    ) : (
        <div className={s.panel}>
            <div className={s.seg} role="radiogroup" aria-label={t(W.mode)}>
                {([['ranked', t('Classificata', 'Ranked')], ['casual', 'Casual']] as const).map(([k, l]) => <button
                    key={k} role="radio" aria-checked={queue === k}
                    onClick={() => setQueue(k)}>{l}</button>)}
            </div>
            {queue === 'ranked' ? <>
                    <div className={s.rank}>
                        <span>{rankName(RANKS, tier, lang)}</span><small>{tier >= 5 ? `${p.rank - 500} ${t(W.points)}` : `${p.rank % 100} / 100 ${t(W.points)}`}</small>
                    </div>
                    {tier < 5 && <div className={u.bar}><b style={{width: `${p.rank % 100}%`}}/></div>}
                </> :
                <p>{t('Niente punti in gioco: missioni, pass e maestria avanzano lo stesso.', 'No points at stake: quests, the pass and mastery still progress.')}</p>}
            <DeckSelect/>
            <button className={s.cta} onClick={() => start(queue)}>{t(W.findMatch)}</button>
            <p className={s.fine}>{queue === 'ranked' ? t('Vittoria +25 punti e 15 oro (+50 alla prima del giorno). Sconfitta -15.', 'Win: +25 points and 15 gold (+50 for the first of the day). Loss: -15.') : t('Vittoria 10 oro e 90 XP, sconfitta 3 oro e 50 XP.', 'Win: 10 gold and 90 XP. Loss: 3 gold and 50 XP.')}</p>
        </div>
    );

    return (
        <div>
            <section className={s.hero}
                     style={siteImg('home-hero') ? {['--hero' as string]: `url(${siteImg('home-hero')})`} : undefined}>
                <div className={s.heroText}>
                    <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}
                                transition={{duration: 0.9, ease: [0.2, 0.8, 0.2, 1]}}>
                        <Logo size="lg"/>
                    </motion.div>
                    <p className={s.lede}>{t('Tre corsie, tre Sigilli per parte. Spezzane due prima del tuo avversario.', 'Three lanes, three Seals per side. Break two before your opponent does.')}</p>
                    {panel}
                </div>
                <div className={s.fan} aria-hidden="true">
                    {HERO.map((id, i) => (
                        <motion.div key={id} className={s.fanCard} style={{zIndex: i === 1 ? 3 : 1}}
                                    initial={{opacity: 0, y: 80, rotate: 0}} animate={{
                            opacity: 1,
                            y: i === 1 ? -24 : 0,
                            rotate: (i - 1) * 12,
                            x: `${(i - 1) * 58}%`
                        }}
                                    transition={{delay: 0.25 + i * 0.12, type: 'spring', stiffness: 120, damping: 16}}>
                            <motion.div animate={{y: [0, -8, 0]}} transition={{
                                duration: 5 + i,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.7
                            }}>
                                <Tilt className={s.tiltCard}><Card card={BYID[id]} look={lookOf(p, id)}/></Tilt>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Oggi: tutto ciò che scade (missioni, sfide della settimana, evento) in un solo posto. */}
            <section className={`${u.page} ${s.block}`}>
                <h2 className={s.blockTitle}>{t('Oggi', 'Today')}</h2>
                {ev && <div className={s.eventBox}>
                    <span className={s.eventTag}>{t('Evento della community', 'Community event')}</span>
                    <h3>{ev.ev.title}</h3>
                    <p>{t(`La community ha scelto «${ev.option}» in ${ev.story}.`, `The community chose “${ev.option}” in ${ev.story}.`)} {ev.ev.desc ?? ''} {ev.ev.omen ? t(`Nelle partite la corsia centrale ha il presagio ${OMENS[ev.ev.omen].name}. `, `In matches the center lane has the ${EN_OMENS[ev.ev.omen].name} omen. `) : ''}{ev.ev.faction ? t(`Vincendo con carte ${FACTIONS[ev.ev.faction].name} nel mazzo ricevi 15 oro in più.`, `Win with ${EN_FACTION_NAMES[ev.ev.faction]} cards in your deck to get 15 extra gold.`) : ''}</p>
                    <small>{t('Termina tra', 'Ends in')} {Math.max(1, Math.ceil((ev.until - Date.now()) / 86400000))} {t('giorni', 'days')}.</small>
                </div>}
                <div className={s.today}>
                    <article className={s.panelBox}>
                        <header className={s.boxHead}>
                            <h3>{t('Missioni del giorno', 'Daily quests')}</h3>
                            <small>{t(`${p.games} partite · ${p.wins} vittorie`, `${p.games} matches · ${p.wins} wins`)}</small>
                        </header>
                        {p.quests.map((q, i) => {
                            const d = QUEST_POOL.find(x => x.id === q.id)!, done = q.prog >= d.goal;
                            return <div key={q.id} className={s.quest}>
                                <div className={s.qTop}>
                                    <strong>{en ? EN_QUESTS[d.id] ?? d.txt : d.txt}</strong><span>{q.claimed ? t('Riscossa', 'Claimed') : `${d.oro} ${t(W.gold)}`}</span></div>
                                <div className={u.bar}><b style={{width: `${Math.min(1, q.prog / d.goal) * 100}%`}}/></div>
                                {!q.claimed && done &&
                                    <motion.button data-sfx="claim" className={s.claim} onClick={() => p.claimQuest(i)}
                                                   animate={{scale: [1, 1.05, 1]}} transition={{
                                        repeat: Infinity,
                                        duration: 1.4
                                    }}>{t(`Riscuoti ${d.oro} oro`, `Claim ${d.oro} gold`)}</motion.button>}
                            </div>;
                        })}
                    </article>
                    {unlocked && <article className={s.panelBox}>
                        <header className={s.boxHead}>
                            <h3>{t('Sfide della settimana', 'Weekly challenges')}</h3>
                            <small>{t(`Nuove tra ${days} ${days === 1 ? 'giorno' : 'giorni'}`, `New in ${days} ${days === 1 ? 'day' : 'days'}`)}</small>
                        </header>
                        <p className={s.fine}>{t(`Vinci ${WEEKLY_WINS} volte una sfida per ottenere ${rewardLabel(WEEKLY_REWARD)}.`, `Win a challenge ${WEEKLY_WINS} times to get ${rewardLabel(WEEKLY_REWARD)}.`)}</p>
                        <div className={s.rows}>
                            {weeklyChallenges().map(ch => {
                                const w = p.weekly?.week === weekIndex() ? p.weekly.wins[ch.id] ?? 0 : 0,
                                    claimed = p.weekly?.week === weekIndex() && p.weekly.claimed.includes(ch.id),
                                    ready = w >= WEEKLY_WINS && !claimed;
                                return (
                                    <article key={ch.id} className={`${s.lesson} ${claimed ? s.lDone : ''}`}>
                                        <span className={s.lNum}>{claimed ? '✓' : `${Math.min(w, WEEKLY_WINS)}/${WEEKLY_WINS}`}</span>
                                        <div><h3>{en ? EN_WEEKLY[ch.id]?.title ?? ch.title : ch.title}</h3><p>{en ? EN_WEEKLY[ch.id]?.desc ?? ch.desc : ch.desc}</p></div>
                                        {ready ? <button className={`${u.btn} ${u.sm} ${u.primary}`} data-sfx="claim"
                                                         onClick={() => {
                                                             const m = p.weeklyClaim(ch.id);
                                                             if (m) toast(m);
                                                         }}>{t(W.claim)}</button>
                                            : <button className={`${u.btn} ${u.sm} ${claimed ? '' : u.primary}`} onClick={() => {
                                                const d = deckOrAsk();
                                                if (d) startWeekly(ch, d);
                                            }}>{claimed ? t(W.replay) : t(W.play)}</button>}
                                    </article>);
                            })}
                        </div>
                    </article>}
                </div>
            </section>

            {/* Tutte le modalità in un'unica griglia, con lo stesso formato. */}
            <section className={`${u.page} ${s.block}`}>
                <h2 className={s.blockTitle}>{t('Modalità', 'Modes')}</h2>
                <div className={s.modeGrid}>
                    <ModeTile art="avventura-mappa" card="vuoto-r2" title={t(W.adventure)}
                              desc={t('Capitolo 1: Il Risveglio. Cinque avversari fino a Nyxa, Regina del Nulla.', 'Chapter 1: The Awakening. Five opponents all the way to Nyxa, Queen of Nothing.')}
                              status={<div className={s.nodes}>{ADVENTURE.map((_, i) => <i key={i} className={p.adv.includes(i) ? s.done : ''}/>)}</div>}
                              action={`${advDone ? t('Continua', 'Continue') : t(W.start)} (${advDone}/${ADVENTURE.length})`}
                              lock={lockOf(0)} onClick={() => goTab('avventura')}/>
                    <ModeTile art="modo-arena" card="marea-l2" title={t(W.arena)}
                              desc={t(`Scegli un Custode e costruisci il mazzo una carta alla volta: ${DRAFT_MAX_W} vittorie prima di ${DRAFT_MAX_L} sconfitte.`, `Pick a Custodian and build your deck one card at a time: ${DRAFT_MAX_W} wins before ${DRAFT_MAX_L} losses.`)}
                              status={arena && !draftOver(arena)
                                  ? t(`In corso: ${arena.wins}V · ${arena.losses}S`, `In progress: ${arena.wins}W · ${arena.losses}L`)
                                  : t(`Record: ${arenaBest} vittorie`, `Best: ${arenaBest} wins`)}
                              action={arena && !draftOver(arena) ? t('Continua la corsa', 'Continue the run') : t('Entra nell\'Arena', 'Enter the Arena')}
                              lock={lockOf(DRAFT_MIN_GAMES)} onClick={() => goTab('arena')}/>
                    <ModeTile card="radice-c3" title={t(W.expedition)}
                              desc={t('Una corsa roguelike di sette scontri: il mazzo cresce vittoria dopo vittoria.', 'A roguelike run of seven battles: your deck grows win after win.')}
                              action={t(W.start)} lock={lockOf(EXP_MIN_GAMES)} onClick={() => goTab('spedizione')}/>
                    <ModeTile card="vuoto-l0" title={t(W.chainedNight)}
                              desc={t('Nyxa gioca contro entrambi: ogni Sigillo spezzato allenta le sue Catene.', 'Nyxa plays against both of you: every broken Seal loosens her Chains.')}
                              action={t(W.play)} lock={lockOf(NIGHT_MIN_GAMES)} onClick={() => {
                        const d = deckOrAsk();
                        if (d) startNight(d);
                    }}/>
                    {/* L'allenamento chiede solo il tutorial: niente Prove né partite minime. */}
                    <ModeTile card="brace-r1" title={t(W.training)}
                              desc={t('Prova il tuo mazzo contro un manichino, senza rischi e senza ricompense.', 'Test your deck against a dummy, with no risks and no rewards.')}
                              action={t(W.play)} lock={tutDone ? null : lockOf(0)} onClick={() => {
                        const d = deckOrAsk();
                        if (!d) return;
                        useBattle.getState().startCustom({
                            label: t(W.training),
                            me: {deck: d.cards, custode: d.custode ?? null},
                            op: {...trainingOpponent(), custode: null},
                            timed: false,
                            onEnd: () => [t('Allenamento: nessuna ricompensa, solo pratica.', 'Training: no rewards, just practice.')]
                        });
                    }}/>
                </div>
            </section>

            {tutDone && !unlocked && <section className={`${u.page} ${s.block}`}>
                <h2 className={s.blockTitle}>{t('Prove della Rosa', 'Trials of the Rose')}</h2>
                <p className={s.fine}>{t('Prima vittoria di ogni Prova: 60 oro e un gettone.', 'First win of each Trial: 60 gold and a token.')}</p>
                {lessonList(false)}
            </section>}

            {tutDone && <RoseWar/>}

            {/* Guida: regole e ripasso, chiusa di default perché serve solo ogni tanto. */}
            <section className={`${u.page} ${s.block}`}>
                <details className={s.guide}>
                    <summary>{t('Le leggi della Rosa', 'The Laws of the Rose')}</summary>
                    <div className={s.ruleGrid}>
                        <article><h3>{t(W.synergies)}</h3><p>{t('Alcune carte sono legate dalla loro storia. Se le hai in gioco insieme, si potenziano: lo indica la scritta blu sulla carta e il simbolo di catena sul tavolo.',
                            'Some cards are bound by their story. If you have them in play together, they get stronger: the blue text on the card and the chain symbol on the board show it.')}</p></article>
                        <article><h3>{t('Presagi di corsia', 'Lane omens')}</h3><p>{t('A ogni partita le tre corsie ricevono un presagio diverso, come Nebbia, Eclissi o Terra consacrata. Lo leggi sotto il nome della corsia.',
                            'Every match, the three lanes receive a different omen, such as Fog, Eclipse or Hallowed Ground. You can read it under the lane name.')}</p></article>
                        <article><h3>{t(W.lastToll)}</h3><p>{t('Quando un tuo Sigillo si spezza, la fazione principale del tuo mazzo risponde con un effetto: Rogo finale, Ultima risacca, Radici profonde o Patto finale.',
                            'When one of your Seals breaks, the main faction of your deck answers with an effect: Final Pyre, Last Undertow, Deep Roots or Final Pact.')}</p></article>
                        <article><h3>{t(W.ascension)}</h3><p>{en ? EN_ASCEND_TEXT : ASCEND_TEXT}</p></article>
                    </div>
                    {p.tutorialDone && <div className={s.review}>
                        <h3>{t('Ripassa', 'Review')}</h3>
                        <button className={`${u.btn} ${u.sm}`} onClick={() => start('tutorial')}>{t('Rifai il tutorial', 'Replay the tutorial')}</button>
                        {unlocked && lessonList(true)}
                    </div>}
                </details>
            </section>

            <details className={`${u.page} ${s.dev}`}>
                <summary>{t('Strumenti di test', 'Test tools')}</summary>
                <div className={u.row}>
                    <button className={`${u.btn} ${u.sm}`} onClick={() => goTab('autore')}>{t(W.authorPanel)}</button>
                    <button className={`${u.btn} ${u.sm}`} onClick={() => goTab('crediti')}>{t(W.credits)}
                    </button>
                    {([['oro', t('+1000 oro', '+1000 gold')], ['polvere', t('+2000 polvere', '+2000 dust')], ['xp', '+1500 XP pass'], ['rank', t('+100 punti classificata', '+100 ranked points')], ['maestria', t('+300 XP maestria a tutte le carte', '+300 mastery XP to all cards')], ['unlock', t('Sblocca tutte le modalità', 'Unlock all modes')], ['allcards', t('Sblocca tutte le carte', 'Unlock all cards')], ['day', t('Giorno successivo', 'Next day')], ['sound', t(`Suoni: ${p.sound ? 'attivi' : 'spenti'}`, `Sound: ${p.sound ? 'on' : 'off'}`)]] as const).map(([k, l]) =>
                        <button key={k} className={`${u.btn} ${u.sm}`} onClick={() => p.dev(k)}>{l}</button>)}
                    <button className={`${u.btn} ${u.sm}`} onClick={() => setAskReset(true)}>{t('Azzera progressi', 'Reset progress')}</button>
                    <Confirm open={askReset} title={t('Azzerare i progressi?', 'Reset your progress?')}
                             text={t('Collezione, valute, mazzi e progressi torneranno all\'inizio. Non si può annullare.', 'Collection, currencies, decks and progress will go back to the start. This cannot be undone.')}
                             confirmLabel={t('Azzera', 'Reset')} onConfirm={() => p.dev('reset')} onClose={() => setAskReset(false)}/>
                </div>
            </details>
        </div>
    );
}
