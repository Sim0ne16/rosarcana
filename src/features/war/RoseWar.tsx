import {motion} from 'framer-motion';
import {FACTIONS} from '../../engine';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {daysToReset, weekIndex} from '../../economy/weekly';
import {useLang, useT} from '../../i18n/lang';
import {factionName, omenName} from '../../i18n/names';
import {leader, petals, WAR_FACTIONS, WAR_OMEN, WAR_PETALS, WAR_PLAY_PTS, WAR_WIN_PTS, useWar, weekTotals} from './war';
import u from '../../ui/ui.module.css';
import s from './war.module.css';

/** Petalo del rosone: una goccia che parte dal centro, ruotata di 360/12 gradi per ogni posizione. */
const PETAL = 'M0 -14 C 16 -30, 13 -70, 0 -88 C -13 -70, -16 -30, 0 -14 Z';
const FREE = 'rgba(255, 255, 255, .06)';

/** Guerra della Rosa: rosone della settimana, classifica delle Casate e presagio conquistato. */
export function RoseWar() {
    const t = useT(), lang = useLang();
    const war = useWar();
    const now = weekTotals(war), last = weekTotals(war, weekIndex() - 1);
    const rose = petals(now), champ = leader(last), mine = war.mine.week === weekIndex() ? war.mine.pts : {};
    const sum = WAR_FACTIONS.reduce((a, f) => a + (now[f] ?? 0), 0);
    return (
        <section className={`${u.page} ${s.war}`}>
            <div className={s.roseBox}>
                <svg viewBox="-100 -100 200 200" className={s.rose} role="img"
                     aria-label={t('Rosone della Guerra della Rosa', 'Rose window of the War of the Rose')}>
                    <circle r="96" className={s.rim}/>
                    {rose.map((f, i) => <motion.path key={i} d={PETAL} transform={`rotate(${(360 / WAR_PETALS) * i})`}
                                                     initial={false} animate={{fill: f ? FACTIONS[f].col : FREE}}
                                                     transition={{duration: 0.6, delay: i * 0.03}} className={s.petal}/>)}
                    <circle r="16" className={s.core}/>
                </svg>
            </div>
            <div className={s.body}>
                <h2>{t('Guerra della Rosa', 'War of the Rose')}</h2>
                <p className={u.muted}>{t(`Ogni partita dà ${WAR_PLAY_PTS} punto alla Casata principale del tuo mazzo, ${WAR_WIN_PTS} se vinci. Chi conquista più petali entro la fine della settimana porta il suo presagio sulla corsia centrale di tutte le partite della settimana dopo.`,
                    `Every match gives ${WAR_PLAY_PTS} point to your deck's main House, ${WAR_WIN_PTS} if you win. Whoever holds the most petals by the end of the week brings its omen to the center lane of every match the following week.`)}</p>
                <ul className={s.board}>{WAR_FACTIONS.map(f => {
                    const n = rose.filter(x => x === f).length;
                    return <li key={f} style={{['--fc' as string]: FACTIONS[f].col}}>
                        <Glyph>{FACTION_GLYPH[f]}</Glyph><b>{factionName(f, lang)}</b>
                        <span>{t(`${n} petali · ${now[f] ?? 0} punti`, `${n} petals · ${now[f] ?? 0} points`)}</span>
                        {mine[f] ? <em>{t(`tu +${mine[f]}`, `you +${mine[f]}`)}</em> : null}
                    </li>;
                })}</ul>
                <p className={s.omen}>{champ
                    ? t(`Settimana scorsa ha vinto la Casata ${factionName(champ, lang)}: questa settimana la corsia centrale ha il presagio ${omenName(WAR_OMEN[champ], lang)}.`,
                        `Last week the House of ${factionName(champ, lang)} won: this week the center lane has the ${omenName(WAR_OMEN[champ], lang)} omen.`)
                    : t('Nessuna Casata ha vinto la settimana scorsa: la corsia centrale è libera.', 'No House won last week: the center lane is free.')}</p>
                <small className={u.muted}>{t(`La settimana finisce tra ${daysToReset()} ${daysToReset() === 1 ? 'giorno' : 'giorni'}.`, `The week ends in ${daysToReset()} ${daysToReset() === 1 ? 'day' : 'days'}.`)} {war.online
                    ? t(`Punti di tutti i giocatori: ${sum}.`, `Points from all players: ${sum}.`)
                    : t('Anteprima locale: contano solo le tue partite.', 'Local preview: only your matches count.')}</small>
            </div>
        </section>
    );
}
