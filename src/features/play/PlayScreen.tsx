import { defaultArt } from '../../cards/styles';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Confirm } from '../../ui/Confirm';
import { ASCEND_TEXT, BYID } from '../../engine';
import { Card } from '../../cards/Card';
import { CardArt } from '../../cards/art/CardArt';
import { deckIssues } from '../../economy/decks';
import { QUEST_POOL, RANKS } from '../../economy/constants';
import { lookOf, tierIdx, useProfile } from '../../profile/store';
import { Tilt } from '../../ui/Tilt';
import { toast } from '../../ui/toast';
import { Logo } from '../../app/Logo';
import { siteImg } from '../../cards/art/site';
import type { Tab } from '../../app/App';
import { useBattle } from '../battle/store';
import { DeckSelect } from '../decks/DeckSelect';
import { ADVENTURE } from '../adventure/nodes';
import { LESSON_REWARD, LESSONS, trainingOpponent } from '../modes/lessons';
import { startWeekly } from '../modes/weeklyStart';
import { rewardLabel } from '../../economy/constants';
import { daysToReset, weekIndex, WEEKLY_REWARD, WEEKLY_WINS, weeklyChallenges } from '../../economy/weekly';
import { useEvent } from '../adventure/stories';
import { FACTIONS, OMENS } from '../../engine';
import u from '../../ui/ui.module.css';
import s from './play.module.css';

const HERO = ['vuoto-l0', 'brace-l0', 'marea-l0'];

export function PlayScreen({ goDecks, goTab }: { goDecks: () => void; goTab: (t: Tab) => void }) {
  const p = useProfile(); const t = tierIdx(p.rank);
  const [askReset, setAskReset] = useState(false);
  const [queue, setQueue] = useState<'ranked' | 'casual'>('ranked');
  const tutDone = p.tutorialDone || p.onboardSkip, unlocked = p.onboardSkip || (p.tutorialDone && LESSONS.every(l => p.lessons.includes(l.id)));
  const ev = useEvent(x => x.ev);
  const activeDeck = () => { const d = p.decks.find(x => x.id === p.activeDeck); return d && !deckIssues(d, p.owned).length ? d : null; };
  const start = (mode: 'ranked' | 'casual' | 'tutorial') => {
    if (mode !== 'tutorial' && !unlocked) { toast(tutDone ? 'Completa prima le tre Prove della Rosa' : 'Inizia dal tutorial'); return; }
    if (mode !== 'tutorial') { const d = p.decks.find(x => x.id === p.activeDeck); if (!d || deckIssues(d, p.owned).length) { toast('Scegli un mazzo completo'); goDecks(); return; } }
    useBattle.getState().start(mode);
  };
  const advDone = p.adv.length;
  return (
    <div>
      <section className={s.hero} style={siteImg('home-hero') ? { ['--hero' as string]: `url(${siteImg('home-hero')})` } : undefined}>
        <div className={s.heroText}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}>
            <Logo size="lg" />
          </motion.div>
          <p className={s.lede}>Tre corsie, tre Sigilli per parte. Spezzane due prima del tuo avversario.</p>
          <div className={s.ctas}>
            {!p.tutorialDone
              ? <><button className={s.cta} onClick={() => start('tutorial')}>Impara a giocare</button><button className={s.ghost} onClick={() => start(queue)}>Cerca partita</button></>
              : <><button className={s.cta} onClick={() => start(queue)}>Cerca partita</button><button className={s.ghost} onClick={() => (unlocked ? goTab('avventura') : toast('L\'Avventura si sblocca dopo il tutorial e le Prove della Rosa'))}>Avventura</button></>}
          </div>
        </div>
        <div className={s.fan} aria-hidden="true">
          {HERO.map((id, i) => (
            <motion.div key={id} className={s.fanCard} style={{ zIndex: i === 1 ? 3 : 1 }}
              initial={{ opacity: 0, y: 80, rotate: 0 }} animate={{ opacity: 1, y: i === 1 ? -24 : 0, rotate: (i - 1) * 12, x: `${(i - 1) * 58}%` }}
              transition={{ delay: 0.25 + i * 0.12, type: 'spring', stiffness: 120, damping: 16 }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}>
                <Tilt className={s.tiltCard}><Card card={BYID[id]} look={lookOf(p, id)} /></Tilt>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={`${u.page} ${s.modes}`}>
        <article className={s.tile}>
          <div className={s.tileArt}>{siteImg(`modo-${queue === 'ranked' ? 'classificata' : 'casual'}`) ? <img src={siteImg(`modo-${queue === 'ranked' ? 'classificata' : 'casual'}`)} alt="" /> : <CardArt id="brace-r2" style={defaultArt('brace-r2')} arch={false} />}</div>
          <div className={s.tileBody}>
            <div className={s.seg} role="radiogroup" aria-label="Modalità">
              {([['ranked', 'Classificata'], ['casual', 'Casual']] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={queue === k} onClick={() => setQueue(k)}>{l}</button>)}
            </div>
            {queue === 'ranked' ? <>
              <div className={s.rank}><span>{RANKS[t]}</span><small>{t >= 5 ? `${p.rank - 500} punti` : `${p.rank % 100} / 100 punti`}</small></div>
              {t < 5 && <div className={u.bar}><b style={{ width: `${p.rank % 100}%` }} /></div>}
            </> : <p>Partite libere: niente punti in gioco, ma missioni, pass e maestria delle carte avanzano lo stesso.</p>}
            <DeckSelect />
            {unlocked ? <button className={s.cta} onClick={() => start(queue)}>Cerca partita</button>
              : <><button className={s.cta} onClick={() => start('tutorial')} disabled={tutDone}>{tutDone ? 'Completa le Prove della Rosa' : 'Prima il tutorial'}</button><p className={s.fine}>La classificata si sblocca dopo il tutorial e le tre Prove della Rosa: circa un'ora di gioco guidato.</p></>}
            <p className={s.fine}>{queue === 'ranked' ? 'Vittoria +25 punti e 15 oro, più 50 oro alla prima del giorno. Sconfitta -15 punti.' : 'Vittoria 10 oro e 90 XP, sconfitta 3 oro e 50 XP.'}</p>
          </div>
        </article>
        <article className={s.tile}>
          <div className={s.tileArt}>{siteImg('avventura-mappa') ? <img src={siteImg('avventura-mappa')} alt="" /> : <CardArt id="vuoto-r2" style={defaultArt('vuoto-r2')} arch={false} />}</div>
          <div className={s.tileBody}>
            <h2>Avventura</h2>
            <p>Capitolo 1: Il Risveglio. Cinque avversari fino a Nyxa, Regina del Nulla.</p>
            <div className={s.nodes}>{ADVENTURE.map((_, i) => <i key={i} className={p.adv.includes(i) ? s.done : ''} />)}</div>
            <button className={s.ghost} disabled={!unlocked} onClick={() => goTab('avventura')}>{!unlocked ? 'Dopo le Prove della Rosa' : `${advDone ? 'Continua' : 'Inizia'} (${advDone}/${ADVENTURE.length})`}</button>
            {p.tutorialDone && <button className={s.link} onClick={() => start('tutorial')}>Rifai il tutorial</button>}
          </div>
        </article>
        <article className={`${s.tile} ${s.quests}`}>
          <div className={s.tileBody}>
            <h2>Missioni del giorno</h2>
            {p.quests.map((q, i) => { const d = QUEST_POOL.find(x => x.id === q.id)!, done = q.prog >= d.goal;
              return <div key={q.id} className={s.quest}>
                <div className={s.qTop}><strong>{d.txt}</strong><span>{q.claimed ? 'Riscossa' : `${d.oro} oro`}</span></div>
                <div className={u.bar}><b style={{ width: `${(q.prog / d.goal) * 100}%` }} /></div>
                {!q.claimed && done && <motion.button data-sfx="claim" className={s.claim} onClick={() => p.claimQuest(i)} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>Riscuoti {d.oro} oro</motion.button>}
              </div>; })}
            <p className={s.fine}>Partite: {p.games}, vittorie: {p.wins}.</p>
          </div>
        </article>
      </section>

      {ev && <section className={`${u.page} ${s.event}`}>
        <div className={s.eventBox}>
          <span className={s.eventTag}>Evento della community</span>
          <h2>{ev.ev.title}</h2>
          <p>La community ha scelto «{ev.option}» in {ev.story}. {ev.ev.desc ?? ''} {ev.ev.omen ? `Nelle partite la corsia centrale ha il presagio ${OMENS[ev.ev.omen].name}. ` : ''}{ev.ev.faction ? `Vincendo con carte ${FACTIONS[ev.ev.faction].name} nel mazzo ricevi 15 oro in più.` : ''}</p>
          <small>Termina tra {Math.max(1, Math.ceil((ev.until - Date.now()) / 86400000))} giorni.</small>
        </div>
      </section>}
      {tutDone && <section className={`${u.page} ${s.lessons}`}>
        <h2>Prove della Rosa</h2>
        <p className={s.fine}>Tre partite guidate contro un allievo, una per ogni meccanica avanzata. Prima vittoria: 60 oro e un gettone.</p>
        <div className={s.lessonGrid}>
          {LESSONS.map((l, i) => { const done = p.lessons.includes(l.id), open = i === 0 || p.lessons.includes(LESSONS[i - 1].id);
            return (
              <article key={l.id} className={`${s.lesson} ${done ? s.lDone : ''} ${open ? '' : s.lLock}`}>
                <span className={s.lNum}>{done ? '✓' : i + 1}</span>
                <div><h3>{l.title}</h3><p>{l.goal}</p></div>
                <button className={`${u.btn} ${u.sm} ${done ? '' : u.primary}`} disabled={!open} onClick={() => { const op = l.op();
                  useBattle.getState().startCustom({ label: l.title, me: { deck: l.deck(), custode: l.custode }, op: { ...op, custode: null }, omens: l.omens, coach: { title: l.title, tips: l.tips }, timed: false,
                    onEnd: win => (win ? useProfile.getState().lessonDone(l.id, LESSON_REWARD) : ['Riprova: il Maestro ti aspetta.']) }); }}>{done ? 'Rigioca' : open ? 'Inizia' : 'Bloccata'}</button>
              </article>);
          })}
        </div>
      </section>}

      {unlocked && <section className={`${u.page} ${s.lessons}`}>
        <h2>Sfide della settimana</h2>
        <p className={s.fine}>Tre partite a regole speciali, nuove ogni lunedì (tra {daysToReset()} {daysToReset() === 1 ? 'giorno' : 'giorni'}). Vinci {WEEKLY_WINS} volte per ottenere {rewardLabel(WEEKLY_REWARD)}.</p>
        <div className={s.lessonGrid}>
          {weeklyChallenges().map(ch => { const w = p.weekly?.week === weekIndex() ? p.weekly.wins[ch.id] ?? 0 : 0, claimed = p.weekly?.week === weekIndex() && p.weekly.claimed.includes(ch.id), ready = w >= WEEKLY_WINS && !claimed;
            return (
              <article key={ch.id} className={`${s.lesson} ${claimed ? s.lDone : ''}`}>
                <span className={s.lNum}>{claimed ? '✓' : `${Math.min(w, WEEKLY_WINS)}/${WEEKLY_WINS}`}</span>
                <div><h3>{ch.title}</h3><p>{ch.desc}</p></div>
                {ready ? <button className={`${u.btn} ${u.sm} ${u.primary}`} data-sfx="claim" onClick={() => { const m = p.weeklyClaim(ch.id); if (m) toast(m); }}>Riscuoti</button>
                  : <button className={`${u.btn} ${u.sm} ${claimed ? '' : u.primary}`} onClick={() => { const d = activeDeck(); if (!d) { toast('Scegli un mazzo completo'); goDecks(); return; } startWeekly(ch, d); }}>{claimed ? 'Rigioca' : 'Gioca'}</button>}
              </article>);
          })}
        </div>
      </section>}

      <section className={`${u.page} ${s.more}`}>
        <h2>Altre modalità</h2>
        <div className={s.moreGrid}>
          {([
            ['arena', 'Arena delle Rose', 'Draft: scegli una carta su tre e costruisci un mazzo al momento.', 3],
            ['spedizione', 'Spedizione', 'Una corsa roguelike di sette scontri: il mazzo cresce vittoria dopo vittoria.', 5],
            ['allenamento', 'Allenamento', 'Prova il tuo mazzo contro un manichino, senza rischi e senza ricompense.', 0],
          ] as const).map(([k, t, d, need]) => { const lock = k === 'allenamento' ? !tutDone : !unlocked || p.games < need;
            return (
              <button key={k} className={`${s.moreTile} ${lock ? s.lLock : ''}`} onClick={() => {
                if (lock) { toast(!tutDone ? 'Completa prima il tutorial' : !unlocked ? 'Si sblocca dopo le Prove della Rosa' : `Si sblocca dopo ${need} partite (ne hai giocate ${p.games})`); return; }
                if (k === 'allenamento') { const d = activeDeck(); if (!d) { toast('Scegli un mazzo completo'); goDecks(); return; }
                  useBattle.getState().startCustom({ label: 'Allenamento', me: { deck: d.cards, custode: d.custode ?? null }, op: { ...trainingOpponent(), custode: null }, timed: false, onEnd: () => ['Allenamento: nessuna ricompensa, solo pratica.'] }); return; }
                goTab(k);
              }}>
                <b>{t}</b><span>{d}</span>{lock && <em>{!tutDone ? 'Dopo il tutorial' : !unlocked ? 'Dopo le Prove della Rosa' : `Dopo ${need} partite`}</em>}
              </button>);
          })}
        </div>
      </section>

      <section className={`${u.page} ${s.rules}`}>
        <h2>Le leggi della Rosa</h2>
        <div className={s.ruleGrid}>
          <article><h3>Sincronie</h3><p>Alcune carte sono legate dalla loro storia. Se le hai in gioco insieme, si potenziano: lo indica la scritta blu sulla carta e il simbolo di catena sul tavolo.</p></article>
          <article><h3>Presagi di corsia</h3><p>A ogni partita le tre corsie ricevono un presagio diverso, come Nebbia, Eclissi o Terra consacrata. Lo leggi sotto il nome della corsia.</p></article>
          <article><h3>Ultimo Rintocco</h3><p>Quando un tuo Sigillo si spezza, la fazione principale del tuo mazzo risponde con un effetto: Rogo finale, Ultima risacca, Radici profonde o Patto finale.</p></article>
          <article><h3>Ascesa</h3><p>{ASCEND_TEXT}</p></article>
        </div>
      </section>

      <details className={`${u.page} ${s.dev}`}>
        <summary>Strumenti di test</summary>
        <div className={u.row}>
          <button className={`${u.btn} ${u.sm}`} onClick={() => goTab('autore')}>Pannello autore</button>
          <button className={`${u.btn} ${u.sm}`} onClick={() => goTab('crediti')}>Crediti e note legali</button>
          {([['oro', '+1000 oro'], ['polvere', '+2000 polvere'], ['xp', '+1500 XP pass'], ['rank', '+100 punti classificata'], ['maestria', '+300 XP maestria a tutte le carte'], ['unlock', 'Sblocca tutte le modalità'], ['allcards', 'Sblocca tutte le carte'], ['day', 'Giorno successivo'], ['sound', `Suoni: ${p.sound ? 'attivi' : 'spenti'}`]] as const).map(([k, l]) => <button key={k} className={`${u.btn} ${u.sm}`} onClick={() => p.dev(k)}>{l}</button>)}
          <button className={`${u.btn} ${u.sm}`} onClick={() => setAskReset(true)}>Azzera progressi</button>
          <Confirm open={askReset} title="Azzerare i progressi?" text="Collezione, valute, mazzi e progressi torneranno all'inizio. Non si può annullare." confirmLabel="Azzera" onConfirm={() => p.dev('reset')} onClose={() => setAskReset(false)} />
        </div>
      </details>
    </div>
  );
}
