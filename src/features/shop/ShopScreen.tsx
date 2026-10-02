import {AnimatePresence, motion} from 'framer-motion';
import {useMemo, useState} from 'react';
import {simulateEconomy} from '../../economy/estimate';
import {createPortal} from 'react-dom';
import {RARITY, type Rarity} from '../../engine';
import {FIRST_LEG_BY, PACK_GEMME, PACK_ORO, PACK_QTY, packPrice, PITY_MAX} from '../../economy/constants';
import {packsToGuarantee} from '../../economy/packs';
import {Icon} from '../../cards/cardText';
import {sfx} from '../../audio/sfx';
import {askBuy} from '../../ui/confirmBuy';
import {useProfile} from '../../profile/store';
import {Tilt} from '../../ui/Tilt';
import {PackArt} from './PackArt';
import {SET} from '../../engine/cards';
import {siteImg} from '../../cards/art/site';
import {PackOpening} from './PackOpening';
import {useLang, useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {EN_RARITY_NAMES, EN_SET_NAME} from '../../i18n/en/mechanics';
import s from './shop.module.css';

interface Flight {
    id: number;
    x: number;
    y: number;
    tx: number;
    ty: number;
    delay: number
}

let fid = 0;

export function ShopScreen() {
    const p = useProfile();
    const [opening, setOpening] = useState(false);
    const [flights, setFlights] = useState<Flight[]>([]);
    const n = packsToGuarantee(p), filled = PITY_MAX - Math.min(PITY_MAX, n);
    const [qty, setQty] = useState(1);
    const t = useT(), lang = useLang(), en = lang === 'en', setName = en ? EN_SET_NAME : SET.name;
    const packs = (k: number) => (k === 1 ? t('1 bustina', '1 pack') : t(`${k} bustine`, `${k} packs`));
    const buy = (cur: 'oro' | 'gemme', e: React.MouseEvent) => {
        const from0 = (e.currentTarget as HTMLElement).getBoundingClientRect(),
            price = packPrice(cur === 'oro' ? PACK_ORO : PACK_GEMME, qty);
        askBuy({
            title: t(`Comprare ${packs(qty)}?`, `Buy ${packs(qty)}?`),
            text: t(`Spendi ${price} ${cur === 'oro' ? 'oro' : 'gemme'} (ne hai ${cur === 'oro' ? p.oro : p.gemme}).`, `Spend ${price} ${cur === 'oro' ? 'gold' : 'gems'} (you have ${cur === 'oro' ? p.oro : p.gemme}).`),
            label: t(`Compra per ${price}`, `Buy for ${price}`),
            onConfirm: () => doBuy(cur, from0)
        });
    };
    const doBuy = (cur: 'oro' | 'gemme', from: DOMRect) => {
        if (!p.buyPacks(cur, qty)) return;
        sfx('coin');
        const to = document.getElementById('packs-pill')?.getBoundingClientRect();
        if (!to) return;
        setFlights(f => [...f, ...Array.from({length: Math.min(qty, 6)}, (_, i) => ({
            id: ++fid,
            x: from.left + from.width / 2,
            y: from.top,
            tx: to.left + to.width / 2,
            ty: to.top + to.height / 2,
            delay: i * 0.07
        }))]);
    };
    const offer = (cur: 'oro' | 'gemme', unit: number) => {
        const price = packPrice(unit, qty), full = unit * qty, ok = p[cur] >= price, shown = Math.min(qty, 3);
        return (
            <motion.button key={cur + qty} className={s.offer} disabled={!ok} onClick={e => buy(cur, e)}
                           whileHover={ok ? {y: -4} : undefined} whileTap={ok ? {scale: 0.97} : undefined}
                           initial={{opacity: 0.6, scale: 0.97}} animate={{opacity: 1, scale: 1}}>
                {price < full && <span className={s.tag}>-{Math.round((1 - price / full) * 100)}%</span>}
                <span className={s.stack}>{Array.from({length: shown}, (_, i) => <span key={i}
                                                                                       style={{transform: `translateX(${(i - (shown - 1) / 2) * 26}%) rotate(${(i - (shown - 1) / 2) * 8}deg)`}}><PackArt
                    art={['vuoto-l0', 'brace-l0', 'marea-l0'][i]}/></span>)}</span>
                <span className={s.oName}>{packs(qty)}</span><span
                className={s.oSet}>{setName}</span>
                <span className={s.price}><Icon k={`cur-${cur}`}
                                                className={`${s.pIcon} ${s[cur]}`}/>{price}{price < full &&
                    <s className={s.old}>{full}</s>}</span>
            </motion.button>
        );
    };
    const odds: [Rarity, string, string][] = [['c', '71%', t(W.never)], ['u', '23%', t(W.never)], ['r', '5%', '92%'], ['l', '1%', '8%']];
    return (
        <section className={s.shop}
                 style={siteImg('negozio') ? {['--shopbg' as string]: `url(${siteImg('negozio')})`} : undefined}>
            <div className={s.stage}>
                <div className={s.hero}>
                    <motion.div className={s.heroPack} onClick={() => p.packs && setOpening(true)}
                                style={{cursor: p.packs ? 'pointer' : 'default'}}
                                animate={{y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5]}}
                                transition={{duration: 6, repeat: Infinity, ease: 'easeInOut'}}>
                        <div className={s.halo}/>
                        <Tilt max={18}><PackArt/></Tilt>
                    </motion.div>
                    <motion.button className={s.open} disabled={!p.packs} onClick={() => setOpening(true)}
                                   whileHover={p.packs ? {scale: 1.04} : undefined}
                                   whileTap={p.packs ? {scale: 0.96} : undefined}>
                        {p.packs ? (p.packs === 1 ? t('Apri la bustina', 'Open the pack') : t(`Apri le bustine (${p.packs})`, `Open the packs (${p.packs})`)) : t('Nessuna bustina da aprire', 'No packs to open')}
                    </motion.button>
                    <div className={s.pity} aria-label={t(`Leggendaria garantita entro ${n} bustine`, `Legendary guaranteed within ${n} packs`)}>
                        <div className={s.pityBar}>{Array.from({length: PITY_MAX}, (_, i) => <i key={i}
                                                                                                className={i < filled ? s.lit : ''}/>)}</div>
                        <span>{n === 1 ? t('Leggendaria garantita entro la prossima bustina', 'Legendary guaranteed in the next pack') : t(`Leggendaria garantita entro ${n} bustine`, `Legendary guaranteed within ${n} packs`)}</span>
                    </div>
                </div>
                <div className={s.side}>
                    <h1 className={s.h1}>{t('Il Reliquiario', 'The Reliquary')}</h1>
                    <p className={s.lede}>{en ? <>Packs of the <b>{setName}</b>: all 60 cards of the first expansion. Every pack has 5 cards, the last one always Rare or better. Every card has a 5% chance to come with the Holographic effect and a Golden frame.</>
                        : <>Bustine del <b>{setName}</b>: tutte le 60 carte della prima espansione. Ogni bustina ha 5 carte, l'ultima sempre Rara o migliore. Ogni carta ha il 5% di probabilità di uscire con effetto Olografico e cornice Dorata.</>}</p>
                    <div className={s.qty} role="radiogroup" aria-label={t('Quantità', 'Quantity')}>
                        {PACK_QTY.map(q => <button key={q.n} role="radio" aria-checked={qty === q.n}
                                                   onClick={() => setQty(q.n)}>×{q.n}{q.off ?
                            <small>-{q.off * 100}%</small> : null}</button>)}
                    </div>
                    <div className={s.offers}>
                        {offer('oro', PACK_ORO)}
                        {offer('gemme', PACK_GEMME)}
                    </div>
                    <button className={s.gems} onClick={() => askBuy({
                        title: t('Aggiungere 1.000 gemme?', 'Add 1,000 gems?'),
                        text: t('È un acquisto di prova: nessun pagamento reale.', 'This is a test purchase: no real payment.'),
                        label: t('Aggiungi', 'Add'),
                        onConfirm: () => p.buy('gem')
                    })}>{t('Aggiungi 1.000 gemme (acquisto di prova, nessun pagamento)', 'Add 1,000 gems (test purchase, no payment)')}
                    </button>
                    <details className={s.info}>
                        <summary>{t('Probabilità e garanzie', 'Odds and guarantees')}</summary>
                        <p>{t(`Protezione doppioni: se hai già tutte le copie di una rarità, lo slot sale alla rarità successiva; diventa polvere solo quando hai completato anche quella. Una Leggendaria al massimo ogni ${PITY_MAX} bustine, la prima entro ${FIRST_LEG_BY}.`,
                            `Duplicate protection: if you already have every copy of a rarity, the slot goes up to the next rarity; it turns into dust only once you have completed that one too. A Legendary at least every ${PITY_MAX} packs, the first within ${FIRST_LEG_BY}.`)}</p>
                        <table>
                            <thead>
                            <tr>
                                <th>{t('Rarità', 'Rarity')}</th>
                                <th>{t('Carte 1-4', 'Cards 1-4')}</th>
                                <th>{t('Carta 5', 'Card 5')}</th>
                            </tr>
                            </thead>
                            <tbody>{odds.map(([k, a, b]) => <tr key={k}>
                                <td><i style={{background: RARITY[k].color}}/>{en ? EN_RARITY_NAMES[k] : RARITY[k].name}</td>
                                <td>{a}</td>
                                <td>{b}</td>
                            </tr>)}</tbody>
                        </table>
                    </details>
                    <details className={s.info}>
                        <summary>{t('Quanto serve per completare il set', 'What it takes to complete the set')}</summary>
                        <EcoEstimate/>
                    </details>
                    <details className={s.info}>
                        <summary>{t(W.log)}</summary>
                        <ul>{p.log.slice(0, 30).map((l, i) => <li key={i}>
                            <span>{new Date(l.t).toLocaleTimeString(en ? 'en-GB' : 'it-IT', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span> {l.txt}</li>)}</ul>
                    </details>
                </div>
            </div>
            {createPortal(<AnimatePresence>
                {flights.map(f => (
                    <motion.div key={f.id} className={s.flight}
                                initial={{x: f.x - 30, y: f.y - 20, scale: 1, rotate: 0, opacity: 1}}
                                animate={{
                                    x: [f.x - 30, (f.x + f.tx) / 2 - 30, f.tx - 30],
                                    y: [f.y - 20, Math.min(f.y, f.ty) - 140, f.ty - 45],
                                    scale: [1, 1.2, 0.35],
                                    rotate: [0, -20, 12],
                                    opacity: [1, 1, 0.2]
                                }}
                                transition={{duration: 0.85, delay: f.delay, ease: 'easeInOut'}}
                                onAnimationComplete={() => {
                                    window.dispatchEvent(new Event('pack-bump'));
                                    setFlights(fl => fl.filter(x => x.id !== f.id));
                                }}>
                        <PackArt/>
                    </motion.div>
                ))}
            </AnimatePresence>, document.body)}
            {createPortal(<AnimatePresence>{opening &&
                <PackOpening onClose={() => setOpening(false)}/>}</AnimatePresence>, document.body)}
        </section>
    );
}

/** Stima trasparente: giorni per completare il Set Base giocando senza pagare. */
function EcoEstimate() {
    const est = useMemo(() => [4, 8, 15].map(g => [g, simulateEconomy({
        gamesPerDay: g,
        winRate: 0.5,
        questShare: 0.75
    }, 6).days] as const), []);
    const t = useT(), setName = useLang() === 'en' ? EN_SET_NAME : SET.name;
    return <><p>{t('Stima per un giocatore che non spende nulla e vince metà delle partite (missioni completate al 75%, pass gratuito incluso):', 'Estimate for a player who spends nothing and wins half their matches (75% of quests completed, free pass included):')}</p>
        <ul>{est.map(([g, d]) => <li key={g}>{t(`${g} partite al giorno: circa ${d ?? 'più di 365'} giorni per tutte le 112 copie del ${setName}`, `${g} matches a day: about ${d ?? 'more than 365'} days for all 112 copies of the ${setName}`)}</li>)}</ul>
        <p>{t('Tutto ciò che conta in partita si ottiene giocando: con le gemme si risparmia tempo, non si compra potere esclusivo.', 'Everything that matters in a match is earned by playing: gems save time, they don\'t buy exclusive power.')}</p></>;
}
