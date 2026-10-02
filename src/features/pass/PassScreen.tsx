import {useState} from 'react';
import {Card} from '../../cards/Card';
import type {Reward} from '../../economy/constants';
import {PASS_FREE, PASS_GEMME, PASS_LEVELS, PASS_PREM, rewardLabel, XP_LVL} from '../../economy/constants';
import {legendaryChoices, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import {PageHeader} from '../../ui/PageHeader';
import {askBuy} from '../../ui/confirmBuy';
import {Icon} from '../../cards/cardText';
import {toast} from '../../ui/toast';
import {CardBack} from '../battle/CardBack';
import u from '../../ui/ui.module.css';
import {useLang, useT} from '../../i18n/lang';
import {cardName} from '../../i18n/names';
import {W} from '../../i18n/words';

import s from './pass.module.css';

export function PassScreen() {
    const p = useProfile();
    const [pick, setPick] = useState(false);
    const t = useT(), lang = useLang();
    const lvl = Math.min(PASS_LEVELS, Math.floor(p.xp / XP_LVL)), into = p.xp % XP_LVL;
    const claimable = Array.from({length: lvl}, (_, i) => i + 1).some(L => !p.cf.includes(L) || (p.premium && !p.cp.includes(L)));
    const claim = (L: number, prem: boolean) => {
        if (p.claimPass(L, prem) === 'legChoice') setPick(true);
    };
    return (
        <section className={u.page}>
            <PageHeader title={t('Stagione 1: Il Risveglio', 'Season 1: The Awakening')}
                        sub={t('Si sale giocando qualsiasi modalità, anche perdendo. 20 livelli nel prototipo, 50 nel gioco completo.', 'You level up by playing any mode, even when you lose. 20 levels in the prototype, 50 in the full game.')}>
                <div className={s.lvlBox}><span className={s.lvl}>{lvl}</span>
                    <div>
                        <div className={u.bar} style={{width: 170}}><b
                            style={{width: `${lvl >= PASS_LEVELS ? 100 : (into / XP_LVL) * 100}%`}}/></div>
                        <div
                            className={`${u.muted} ${u.small}`}>{lvl >= PASS_LEVELS ? t('Pass completato', 'Pass complete') : t(`${into} di ${XP_LVL} XP`, `${into} of ${XP_LVL} XP`)}</div>
                    </div>
                </div>
            </PageHeader>
            <div className={u.row} style={{margin: '0 0 14px'}}>
                {p.premium ?
                    <span className={s.premOn}>{t('Traccia premium attiva: le sue gemme ripagano il pass successivo.', 'Premium track active: its gems pay for the next pass.')}</span>
                    : <>
                        <button className={`${u.btn} ${u.primary}`} disabled={p.gemme < PASS_GEMME}
                                onClick={() => askBuy({
                                    title: t('Sbloccare il pass premium?', 'Unlock the premium pass?'),
                                    text: t(`Spendi ${PASS_GEMME} gemme (ne hai ${p.gemme}).`, `Spend ${PASS_GEMME} gems (you have ${p.gemme}).`),
                                    label: t(`Sblocca per ${PASS_GEMME}`, `Unlock for ${PASS_GEMME}`),
                                    onConfirm: () => p.buyPremium()
                                })}>{t(`Sblocca premium · ${PASS_GEMME} gemme`, `Unlock premium · ${PASS_GEMME} gems`)}
                        </button>
                        <span className={u.muted}>{t('Premium: gettoni, dorsi, bustine e 525 gemme.', 'Premium: tokens, card backs, packs and 525 gems.')}</span></>}
                <button data-sfx="claim" className={u.btn} disabled={!claimable} onClick={() => {
                    if (p.claimAllPass()) setPick(true); else toast(t(W.rewardsClaimed));
                }}>{t('Riscuoti tutto', 'Claim all')}
                </button>
            </div>
            <div className={s.trackWrap}>
                <div className={s.rowLabels}><span>{t('Gratuita', 'Free')}</span><span className={s.premLabel}>Premium</span></div>
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
                                            data-sfx="claim" onClick={() => claim(L, prem)}>{t(W.claim)}</button>}
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
            <Modal open={pick} onClose={() => setPick(false)} wide>
                <div style={{textAlign: 'center'}}>
                    <h2 className={u.title} style={{marginBottom: 16}}>{t('Scegli la tua Leggendaria', 'Choose your Legendary')}</h2>
                    <div className={u.cards}>
                        {legendaryChoices(p).map(c => <button key={c.id} className={u.cardBtn} onClick={() => {
                            p.pickLegendary(c.id);
                            setPick(false);
                            toast(t(`${c.n} aggiunta alla collezione`, `${cardName(c.id, lang)} added to your collection`));
                        }}><Card card={c}/></button>)}
                    </div>
                    {!legendaryChoices(p).length && <button className={`${u.btn} ${u.primary}`} onClick={() => {
                        p.pickLegendary('');
                        setPick(false);
                    }}>{t('Hai già tutto: ricevi 1600 polvere', 'You already have everything: get 1600 dust')}</button>}
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
