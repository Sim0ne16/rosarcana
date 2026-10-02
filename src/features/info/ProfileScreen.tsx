import {BYID, CARDS, type CustodeId, CUSTODI, type Faction, FACTIONS, RARITY} from '../../engine';
import {FACTION_GLYPH, Glyph, RarityGem} from '../../cards/glyphs';
import {CODEX_LEVEL} from '../../cards/secrets';
import {CRAFT_FRAMES, FRAMES, MASTERY_FRAMES, MASTERY_NAMES} from '../../cards/styles';
import {levelOf} from '../../economy/mastery';
import {BACK_PRICE, BACKS, IMAGE_BACKS, RANKS} from '../../economy/constants';
import {masteryOf, profileFrames, tierIdx, useProfile} from '../../profile/store';
import {Avatar} from './Avatar';
import {siteImg} from '../../cards/art/site';
import {toast} from '../../ui/toast';
import {askBuy} from '../../ui/confirmBuy';
import {PageHeader} from '../../ui/PageHeader';
import {lastReplay, useBattle} from '../battle/store';
import {CardBack} from '../battle/CardBack';
import {CustodePortrait} from '../custodi/CustodeCard';
import {useDraft} from '../modes/draft';
import {useExpedition} from '../modes/expedition';
import u from '../../ui/ui.module.css';
import {useLang, useT} from '../../i18n/lang';
import {cardName, factionName, custodeName, masteryName} from '../../i18n/names';
import {W} from '../../i18n/words';
import {EN_BACKS, EN_FRAMES, rankName} from '../../i18n/en/ui';
import s from './profile.module.css';

const pct = (w: number, n: number) => (n ? Math.round((w / n) * 100) : 0);
/** Colore del grado in classificata, dal Bronzo alla Leggenda, per dare al voto più peso visivo del semplice numero. */
const RANK_COLORS = ['#c98a52', '#c7cdd6', '#f0c35a', '#8fdff0', '#9db8ff', '#e2a6ff'];

/** Profilo del giocatore: statistiche, fazioni, Custodi, carte preferite e progressi. */
export function ProfileScreen({back}: { back: () => void }) {
    const p = useProfile(), frames = profileFrames(p), draftBest = useDraft(x => x.best),
        expBest = useExpedition(x => x.best);
    const cards = CARDS.filter(c => !c.token), total = cards.reduce((a, c) => a + RARITY[c.r].max, 0),
        have = cards.reduce((a, c) => a + Math.min(p.owned[c.id] || 0, RARITY[c.r].max), 0);
    const lv = cards.map(c => levelOf(masteryOf(p, c.id).xp)), codex = lv.filter(x => x >= CODEX_LEVEL).length;
    const fav = cards.map(c => [c.id, masteryOf(p, c.id).plays] as const).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const custs = (Object.entries(p.custProg ?? {}) as [CustodeId, {
        games: number;
        wins: number;
        bells: number
    }][]).sort((a, b) => b[1].games - a[1].games);
    const t = useT(), lang = useLang(), en = lang === 'en';
    const fr = (f: keyof typeof FRAMES) => (en && EN_FRAMES[f] ? {...FRAMES[f], ...EN_FRAMES[f]} : FRAMES[f]);
    const stat = (v: string | number, l: string, color?: string) => <div className={s.stat}>
        <b style={color ? {color} : undefined}>{v}</b><span>{l}</span>
    </div>;
    return (
        <section className={u.page}>
            <PageHeader title={t(W.profile)} sub={t('Le tue statistiche, i tuoi Custodi e le tue carte preferite.', 'Your stats, your Custodians and your favourite cards.')}>
                {lastReplay &&
                    <button className={u.btn} onClick={() => useBattle.getState().openReplay()}>{t('Rivedi l\'ultima partita', 'Watch the last match')}</button>}
                <button className={u.btn} onClick={back}>← {t(W.play)}</button>
            </PageHeader>
            <div className={s.me}>
                <Avatar width={120}/>
                <div className={s.pickers}>
                    <h2>{t('Ritratto', 'Portrait')}</h2>
                    <div
                        className={s.pickRow}>{[...Object.keys(CUSTODI), ...CARDS.filter(c => c.r === 'l' && p.owned[c.id]).map(c => c.id)].map(id => (
                        <button key={id} className={s.pick} aria-pressed={p.avatar === id}
                                onClick={() => p.setAvatar(id)} title={CUSTODI[id as CustodeId] ? custodeName(id as CustodeId, lang) : cardName(id, lang)}>
                            <Avatar width={44} avatar={id} frame={null}/></button>))}</div>
                    <h2>{t('Cornice del profilo', 'Profile frame')}</h2>
                    <div className={s.pickRow}>
                        <button className={s.pick} aria-pressed={!p.pframe} onClick={() => p.setPFrame(null)}><Avatar
                            width={44} frame={null}/><span>{t(W.noneFem)}</span></button>
                        {MASTERY_FRAMES.map((f, i) => {
                            const ok = frames.mastery.includes(f);
                            return (
                                <button key={f} className={`${s.pick} ${ok ? '' : s.locked}`}
                                        aria-pressed={p.pframe === f} disabled={!ok} onClick={() => p.setPFrame(f)}
                                        title={ok ? fr(f).name : t(`Porta una carta al grado ${MASTERY_NAMES[i]}`, `Bring a card to the ${masteryName(i, lang)} grade`)}>
                                    <Avatar width={44} frame={f}/><span>{masteryName(i, lang)}</span></button>);
                        })}
                        {CRAFT_FRAMES.filter(f => siteImg(`frame-${f}`)).map(f => {
                            const own = frames.owned.includes(f);
                            return (
                                <button key={f} className={s.pick} aria-pressed={p.pframe === f}
                                        onClick={() => (own ? p.setPFrame(f) : p.polvere < (FRAMES[f].cost ?? 0) ? toast(t(`Servono ${FRAMES[f].cost} polvere`, `You need ${FRAMES[f].cost} dust`)) : askBuy({
                                            title: t(`Sbloccare la cornice ${FRAMES[f].name}?`, `Unlock the ${fr(f).name} frame?`),
                                            text: t(`Spendi ${FRAMES[f].cost} polvere (ne hai ${p.polvere}).`, `Spend ${FRAMES[f].cost} dust (you have ${p.polvere}).`),
                                            label: t(`Sblocca per ${FRAMES[f].cost}`, `Unlock for ${FRAMES[f].cost}`),
                                            onConfirm: () => {
                                                if (p.buyPFrame(f)) toast(t(`Cornice ${FRAMES[f].name} sbloccata`, `${fr(f).name} frame unlocked`));
                                            }
                                        }))} data-sfx={own ? undefined : 'forge'} title={fr(f).desc}>
                                    <Avatar width={44}
                                            frame={f}/><span>{own ? fr(f).name : `${FRAMES[f].cost} ${t(W.dust)}`}</span>
                                </button>);
                        })}
                    </div>
                    <h2>{t('Dorsi delle carte', 'Card backs')}</h2>
                    <div className={s.pickRow}>{Object.entries(BACKS).filter(([k]) => !IMAGE_BACKS.includes(k) || siteImg(`back-${k}`)).map(([k, n0]) => {
                        const n = (en ? EN_BACKS[k] : undefined) ?? n0;
                        const own = p.backs.includes(k), shop = IMAGE_BACKS.includes(k);
                        return (
                            <button key={k} className={`${s.pick} ${own || shop ? '' : s.locked}`}
                                    aria-pressed={p.back === k} disabled={!own && !shop}
                                    onClick={() => own ? p.setBack(k) : shop && askBuy({
                                        title: t(`Comprare il dorso ${n}?`, `Buy the ${n} card back?`),
                                        text: t(`Spendi ${BACK_PRICE} oro (ne hai ${p.oro}).`, `Spend ${BACK_PRICE} gold (you have ${p.oro}).`),
                                        label: t(`Compra per ${BACK_PRICE}`, `Buy for ${BACK_PRICE}`),
                                        onConfirm: () => p.buyBack(k)
                                    })} data-sfx={own ? undefined : 'forge'}
                                    title={own ? n : shop ? `${BACK_PRICE} ${t(W.gold)}` : t('Si sblocca completando il Pass stagionale', 'Unlocks by completing the Season Pass')}>
                                <span style={{width: 44}}><CardBack back={k}/></span>
                                <span>{own ? n : shop ? `${BACK_PRICE} ${t(W.gold)}` : n}</span>
                            </button>);
                    })}</div>
                </div>
            </div>
            <div className={s.stats}>
                {stat(p.games, t(W.matches))}{stat(`${pct(p.wins, p.games)}%`, t('vittorie', 'wins'))}{stat(rankName(RANKS, tierIdx(p.rank), lang), t('grado in classificata', 'ranked tier'), RANK_COLORS[tierIdx(p.rank)])}
                {stat(`${pct(have, total)}%`, t('Set Base completato', 'Base Set completed'))}{stat(`${codex}/${cards.length}`, t('frammenti del Codex', 'Codex fragments'))}
                {stat(`${draftBest}/7`, t('record in Arena', 'Arena record'))}{stat(`${expBest}/7`, t('record in Spedizione', 'Expedition record'))}{stat(p.custLeg?.length ?? 0, t('Custodi leggendari', 'Legendary Custodians'))}
            </div>
            <div className={s.grid}>
                <article className={s.box}>
                    <h2>{t(W.factions)}</h2>
                    {(Object.keys(FACTIONS) as Faction[]).map(f => {
                        const r = p.facStats?.[f] ?? {games: 0, wins: 0};
                        return <div key={f} className={s.bar}><span
                            style={{color: FACTIONS[f].col}}><Glyph>{FACTION_GLYPH[f]}</Glyph>{factionName(f, lang)}</span><i><b
                            style={{
                                width: `${pct(r.wins, r.games)}%`,
                                background: FACTIONS[f].col
                            }}/></i><em>{r.games ? t(`${pct(r.wins, r.games)}% su ${r.games}`, `${pct(r.wins, r.games)}% of ${r.games}`) : t('mai giocata', 'never played')}</em></div>;
                    })}
                </article>
                <article className={`${s.box} ${s.wide}`}>
                    <h2>{t('Storico partite', 'Match history')}</h2>
                    {p.history?.length ? <div className={s.histWrap}><table className={s.hist}>
                            <thead>
                            <tr>
                                <th>{t('Esito', 'Result')}</th>
                                <th>{t(W.mode)}</th>
                                <th>{t(W.opponent)}</th>
                                <th>{t(W.deck)}</th>
                                <th>{t('Turni', 'Turns')}</th>
                                <th>{t('Quando', 'When')}</th>
                            </tr>
                            </thead>
                            <tbody>{p.history.map((r, i) => <tr key={i}>
                                <td className={`${r.win ? s.won : s.lost} ${s.esito}`}>{r.win ? t(W.victory) : t(W.defeat)}</td>
                                <td>{r.label || r.mode}</td>
                                <td>{r.foe}</td>
                                <td>{r.deck}{r.custode && CUSTODI[r.custode as CustodeId] ? ` · ${custodeName(r.custode as CustodeId, lang)}` : ''}</td>
                                <td>{r.turns}</td>
                                <td>{new Date(r.t).toLocaleString(en ? 'en-GB' : 'it-IT', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</td>
                            </tr>)}</tbody>
                        </table></div>
                        : <p className={u.muted}>{t('Nessuna partita giocata finora.', 'No matches played yet.')}</p>}
                </article>
                <article className={s.box}>
                    <h2>{t('Custodi', 'Custodians')}</h2>
                    {custs.length ? custs.map(([id, r]) => <div key={id} className={s.cust}><CustodePortrait id={id}/>
                            <div>
                                <b>{custodeName(id, lang)}</b><span>{t(`${r.games} partite, ${pct(r.wins, r.games)}% vittorie, ${r.bells} Rintocchi`, `${r.games} matches, ${pct(r.wins, r.games)}% wins, ${r.bells} Tolls`)}</span>
                            </div>
                        </div>)
                        : <p className={u.muted}>{t('Gioca con un Custode per vedere qui le sue statistiche.', 'Play with a Custodian to see its stats here.')}</p>}
                </article>
                <article className={s.box}>
                    <h2>{t('Carte preferite', 'Favourite cards')}</h2>
                    {fav.length ? fav.map(([id, n]) => {
                            const l = levelOf(masteryOf(p, id).xp), c = BYID[id];
                            return <div key={id} className={s.fav} style={{['--fc' as string]: FACTIONS[c.f].col}}>
                                <span className={s.favName}><RarityGem r={c.r} className={s.favGem}/><b>{cardName(id, lang)}</b></span>
                                <span>{t(`giocata ${n} volte`, `played ${n} times`)} · {l ? masteryName(l - 1, lang) : t('nessun grado', 'no grade')}</span>
                            </div>;
                        })
                        : <p className={u.muted}>{t('Nessuna carta giocata finora.', 'No cards played yet.')}</p>}
                    <h3>{t('Maestria', 'Mastery')}</h3>
                    <div className={s.levels}>{MASTERY_NAMES.map((n, i) => <span
                        key={n}><b>{lv.filter(x => x > i).length}</b>{masteryName(i, lang)}</span>)}</div>
                </article>
            </div>
        </section>
    );
}
