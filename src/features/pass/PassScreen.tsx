import {useState} from 'react';
import {Card} from '../../cards/Card';
import type {Reward} from '../../economy/constants';
import {
    BACK_PRICE,
    BACKS,
    IMAGE_BACKS,
    PASS_FREE,
    PASS_GEMME,
    PASS_LEVELS,
    PASS_PREM,
    rewardLabel,
    XP_LVL
} from '../../economy/constants';
import {legendaryChoices, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import {PageHeader} from '../../ui/PageHeader';
import {askBuy} from '../../ui/confirmBuy';
import {siteImg} from '../../cards/art/site';
import {Icon} from '../../cards/cardText';
import {toast} from '../../ui/toast';
import {CardBack} from '../battle/CardBack';
import u from '../../ui/ui.module.css';
import s from './pass.module.css';

export function PassScreen() {
    const p = useProfile();
    const [pick, setPick] = useState(false);
    const lvl = Math.min(PASS_LEVELS, Math.floor(p.xp / XP_LVL)), into = p.xp % XP_LVL;
    const claimable = Array.from({length: lvl}, (_, i) => i + 1).some(L => !p.cf.includes(L) || (p.premium && !p.cp.includes(L)));
    const claim = (L: number, prem: boolean) => {
        if (p.claimPass(L, prem) === 'legChoice') setPick(true);
    };
    return (
        <section className={u.page}>
            <PageHeader title="Stagione 1: Il Risveglio"
                        sub="Si sale giocando qualsiasi modalità, anche perdendo. 20 livelli nel prototipo, 50 nel gioco completo.">
                <div className={s.lvlBox}><span className={s.lvl}>{lvl}</span>
                    <div>
                        <div className={u.bar} style={{width: 170}}><b
                            style={{width: `${lvl >= PASS_LEVELS ? 100 : (into / XP_LVL) * 100}%`}}/></div>
                        <div
                            className={`${u.muted} ${u.small}`}>{lvl >= PASS_LEVELS ? 'Pass completato' : `${into} di ${XP_LVL} XP`}</div>
                    </div>
                </div>
            </PageHeader>
            <div className={u.row} style={{margin: '0 0 14px'}}>
                {p.premium ?
                    <span className={s.premOn}>Traccia premium attiva: le sue gemme ripagano il pass successivo.</span>
                    : <>
                        <button className={`${u.btn} ${u.primary}`} disabled={p.gemme < PASS_GEMME}
                                onClick={() => askBuy({
                                    title: 'Sbloccare il pass premium?',
                                    text: `Spendi ${PASS_GEMME} gemme (ne hai ${p.gemme}).`,
                                    label: `Sblocca per ${PASS_GEMME}`,
                                    onConfirm: () => p.buyPremium()
                                })}>Sblocca premium · {PASS_GEMME} gemme
                        </button>
                        <span className={u.muted}>Premium: gettoni, dorsi, bustine e 525 gemme.</span></>}
                <button data-sfx="claim" className={u.btn} disabled={!claimable} onClick={() => {
                    if (p.claimAllPass()) setPick(true); else toast('Ricompense riscosse');
                }}>Riscuoti tutto
                </button>
            </div>
            <div className={s.trackWrap}>
                <div className={s.rowLabels}><span>Gratuita</span><span className={s.premLabel}>Premium</span></div>
                <div className={s.track}>
                    {Array.from({length: PASS_LEVELS}, (_, i) => {
                        const L = i + 1, ok = lvl >= L, fD = p.cf.includes(L), pD = p.cp.includes(L),
                            cur = L === lvl + 1;
                        const cell = (rw: typeof PASS_FREE[number], done: boolean, can: boolean, prem: boolean) => (
                            <div
                                className={`${s.rw} ${prem ? s.prem : ''} ${ok && (!prem || p.premium) ? s.open : s.locked} ${done ? s.done : ''}`}>
                                <RewardIcon rw={rw}/>
                                <span className={s.rwTxt}>{rewardLabel(rw)}</span>
                                {done ? <span className={s.check}>✓</span> :
                                    <button className={`${u.btn} ${u.sm} ${can ? u.primary : ''}`} disabled={!can}
                                            data-sfx="claim" onClick={() => claim(L, prem)}>Riscuoti</button>}
                            </div>);
                        return (
                            <div key={L} className={`${s.col} ${ok ? s.reached : ''} ${cur ? s.cur : ''}`}>
                                <div className={s.tl}><span>{L}</span></div>
                                {cell(PASS_FREE[i], fD, ok, false)}
                                {cell(PASS_PREM[i], pD, ok && p.premium, true)}
                            </div>);
                    })}
                </div>
            </div>
            <div className={u.panel} style={{marginTop: 20}}>
                <h3 style={{marginTop: 0}}>Dorsi delle carte</h3>
                <div
                    className={u.row}>{Object.entries(BACKS).filter(([k]) => !IMAGE_BACKS.includes(k) || siteImg(`back-${k}`)).map(([k, n]) => {
                    const own = p.backs.includes(k), shop = IMAGE_BACKS.includes(k);
                    return (
                        <div key={k} style={{textAlign: 'center', fontSize: 14}}>
                            <button className={s.backOpt} aria-pressed={p.back === k} disabled={!own}
                                    onClick={() => p.setBack(k)} aria-label={n}><CardBack back={k}/></button>
                            <div className={u.muted}>{n}</div>
                            {!own && shop &&
                                <button className={`${u.btn} ${u.sm}`} data-sfx="forge" disabled={p.oro < BACK_PRICE}
                                        onClick={() => askBuy({
                                            title: `Comprare il dorso ${n}?`,
                                            text: `Spendi ${BACK_PRICE} oro (ne hai ${p.oro}).`,
                                            label: `Compra per ${BACK_PRICE}`,
                                            onConfirm: () => p.buyBack(k)
                                        })}>{BACK_PRICE} oro</button>}
                        </div>);
                })}</div>
            </div>
            <Modal open={pick} onClose={() => setPick(false)} wide>
                <div style={{textAlign: 'center'}}>
                    <h2 className={u.title} style={{marginBottom: 16}}>Scegli la tua Leggendaria</h2>
                    <div className={u.cards}>
                        {legendaryChoices(p).map(c => <button key={c.id} className={u.cardBtn} onClick={() => {
                            p.pickLegendary(c.id);
                            setPick(false);
                            toast(`${c.n} aggiunta alla collezione`);
                        }}><Card card={c}/></button>)}
                    </div>
                    {!legendaryChoices(p).length && <button className={`${u.btn} ${u.primary}`} onClick={() => {
                        p.pickLegendary('');
                        setPick(false);
                    }}>Hai già tutto: ricevi 1600 polvere</button>}
                </div>
            </Modal>
        </section>
    );
}

/** Icona della ricompensa principale di un livello. */
function RewardIcon({rw}: { rw: Reward }) {
    if (rw.legChoice) return <span className={`${s.ri} ${s.riLeg}`}>★</span>;
    if (rw.back) return <span className={s.riBack}><CardBack back={rw.back}/></span>;
    if (rw.pack) return <span className={`${s.ri} ${s.riPack}`}/>;
    const k = rw.gettoni ? 'gettoni' : rw.gemme ? 'gemme' : rw.polvere ? 'polvere' : 'oro';
    return <span className={`${s.ri} ${s['ri-' + k]}`}><Icon k={`cur-${k}`}/></span>;
}
