import {motion} from 'framer-motion';
import {BYID, type Faction, FACTIONS} from '../../engine';
import {Card} from '../../cards/Card';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {rewardLabel} from '../../economy/constants';
import {lookOf, useProfile} from '../../profile/store';
import {PageHeader} from '../../ui/PageHeader';
import {useBattle} from '../battle/store';
import {CustodePortrait} from '../custodi/CustodeCard';
import {EXP_BLESSING, expOpponent, expOver, expReward, useExpedition} from './expedition';
import u from '../../ui/ui.module.css';
import {useLang, useT} from '../../i18n/lang';
import {cardName, factionName, custodeName} from '../../i18n/names';
import {W} from '../../i18n/words';
import s from './modes.module.css';

/* ================= Spedizione (roguelike) ================= */
export function ExpeditionScreen({back}: { back: () => void }) {
    const E = useExpedition(), p = useProfile(), r = E.run;
    const t = useT(), lang = useLang();
    const play = () => {
        if (!r) return;
        const st = r.stages[r.at], op = expOpponent(st);
        useBattle.getState().startCustom({
            label: t(`Spedizione, tappa ${r.at + 1} di ${r.stages.length}`, `Expedition, stage ${r.at + 1} of ${r.stages.length}`),
            me: {deck: r.deck, custode: r.custode, seal: 10 + r.sealBonus},
            op: {...op, custode: st.boss ? 'ecate' : null},
            onEnd: win => {
                if (win) useExpedition.getState().win(); else useExpedition.getState().lose();
                return [win ? t(`Spedizione: tappa ${r.at + 1} superata`, `Expedition: stage ${r.at + 1} cleared`) : t('Spedizione: la corsa finisce qui', 'Expedition: the run ends here')];
            }
        });
    };
    return (
        <section className={u.page}>
            <PageHeader title={t(W.expedition)}
                        sub={t('Parti con un piccolo mazzo di una sola Casata e attraversa sette scontri fino a Nyxa. Dopo ogni vittoria scegli una carta nuova o una benedizione. Una sconfitta chiude la corsa.', 'Set out with a small single-House deck and cross seven battles all the way to Nyxa. After every win choose a new card or a blessing. One loss ends the run.')}>
                <button className={u.btn} onClick={back}>← {t(W.play)}</button>
            </PageHeader>
            {!r && <>
                <p className={u.muted}>{t(`Ricompense: 30 oro per ogni tappa superata; completando la Spedizione anche una bustina, un gettone e 200 polvere. Record: ${E.best} tappe.`,
                    `Rewards: 30 gold for every stage cleared; completing the Expedition also gives a pack, a token and 200 dust. Record: ${E.best} stages.`)}</p>
                <div className={s.facs}>{(Object.keys(FACTIONS) as Faction[]).map(f => (
                    <button key={f} className={s.fac} style={{['--fc' as string]: FACTIONS[f].col}}
                            onClick={() => E.start(f)}><Glyph>{FACTION_GLYPH[f]}</Glyph><b>{factionName(f, lang)}</b><span>{t('Parti con le comuni della Casata', 'Start with the House\'s commons')}</span>
                    </button>))}</div>
            </>}
            {r && <div className={s.drafting}>
                <div className={s.runBox}>
                    <ol className={s.track}>{r.stages.map((st, i) => <li key={i}
                                                                         className={i < r.at ? s.tDone : i === r.at && !r.dead ? s.tNow : ''}>
                        <b>{i + 1}</b><span>{st.foe}</span>{st.boss && <em>Boss</em>}</li>)}</ol>
                    {r.offer && <>
                        <h2 className={s.h2}>{t('Scegli la tua ricompensa', 'Choose your reward')}</h2>
                        <div className={s.options}>
                            {r.offer.map(id => <motion.button key={id} className={s.opt} onClick={() => E.take(id)}
                                                              whileHover={{y: -8}}><Card card={BYID[id]}
                                                                                         look={lookOf(p, id)}/>
                            </motion.button>)}
                            <button className={s.bless} onClick={() => E.take('bless')}><span>✚</span><b>{t('Benedizione della Rosa', 'Blessing of the Rose')}</b><em>{t(`I tuoi Sigilli hanno +${EXP_BLESSING} punti vita per il resto della Spedizione (ora ${10 + r.sealBonus}).`, `Your Seals have +${EXP_BLESSING} health for the rest of the Expedition (now ${10 + r.sealBonus}).`)}</em></button>
                        </div>
                        <p className={u.muted}>{t('Oppure tocca una carta nel mazzo a destra per toglierla (mazzo minimo 10 carte).', 'Or tap a card in the deck on the right to remove it (minimum deck of 10 cards).')}</p>
                    </>}
                    {!r.offer && !expOver(r) && <>
                        <h2 className={s.h2}>{t(W.stage)} {r.at + 1}: {r.stages[r.at].foe}</h2>
                        <p>{t(`Mazzo ${r.stages[r.at].facs.map(f => factionName(f, lang)).join(' e ')}, Sigilli da ${r.stages[r.at].seal}. I tuoi Sigilli: ${10 + r.sealBonus} punti vita.`,
                            `${r.stages[r.at].facs.map(f => factionName(f, lang)).join(' and ')} deck, ${r.stages[r.at].seal}-health Seals. Your Seals: ${10 + r.sealBonus} health.`)}</p>
                        <button className={`${u.btn} ${u.primary} ${s.big}`} onClick={play}>{t(W.face)}</button>
                    </>}
                    {expOver(r) && <>
                        <h2 className={s.h2}>{r.dead ? t('La Spedizione è finita', 'The Expedition is over') : t('Spedizione completata!', 'Expedition complete!')}</h2>
                        <p>{t(W.reward)}: {rewardLabel(expReward(r)) || t(W.noneLower)}.</p>
                        <button className={`${u.btn} ${u.primary} ${s.big}`} data-sfx="claim" onClick={() => {
                            p.grant(expReward(r), t(`Spedizione (${r.at} tappe)`, `Expedition (${r.at} stages)`));
                            E.clear();
                        }}>{t(W.claimClose)}
                        </button>
                    </>}
                </div>
                <aside className={s.side}>
                    <div className={s.sideHead}><CustodePortrait id={r.custode}/>
                        <div><b>{custodeName(r.custode, lang)}</b><span>{r.deck.length} {t(W.cards)}</span></div>
                    </div>
                    <div className={s.list}>{r.deck.map((id, i) => <button key={i} className={s.row}
                                                                           style={{['--fc' as string]: FACTIONS[BYID[id].f].col}}
                                                                           disabled={!r.offer || r.deck.length <= 10}
                                                                           onClick={() => E.remove(i)}
                                                                           title={r.offer ? t('Togli questa carta', 'Remove this card') : ''}>
                        <b>{BYID[id].c}</b><span>{cardName(id, lang)}</span><em/></button>)}</div>
                </aside>
            </div>}
        </section>
    );
}
