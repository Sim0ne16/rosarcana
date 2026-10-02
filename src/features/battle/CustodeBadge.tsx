import {useState} from 'react';
import {CUSTODI, type Faction, FACTIONS, type Game} from '../../engine';
import {EN_CUSTODI} from '../../i18n/en/mechanics';
import {bellInfo} from '../../i18n/names';
import {useLang, useT, type Translate} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {Modal} from '../../ui/Modal';
import {CustodeCard, CustodePortrait} from '../custodi/CustodeCard';
import s from './battle.module.css';

/** Stato dei poteri "una volta per turno" dei Custodi. */
function usage(G: Game, p: number, t: Translate): string | null {
    const P = G.p[p], f = P.flags ?? {}, mine = G.active === p;
    const used = t(W.usedThisTurn), ready = t('Pronto', 'Ready');
    switch (P.custode) {
        case 'vesta':
            return mine && f.unit ? used : ready;
        case 'ladro':
            return mine && f.spell ? used : ready;
        case 'nocchiero':
            return mine && f.move ? used : ready;
        case 'traghettatore':
            return f.ferry ? used : ready;
        default:
            return t(W.alwaysActive);
    }
}

/** Il Custode di un giocatore in evidenza: ritratto, potere e Ultimo Rintocco. */
export function CustodeBadge({G, p, row}: { G: Game; p: number; row?: boolean }) {
    const [open, setOpen] = useState(false);
    const lang = useLang(), t = useT();
    const P = G.p[p], cu = P.custode ? CUSTODI[P.custode] : null, bell = G.bell?.[p];
    const who = p === 0 ? t('Il tuo Custode', 'Your Custodian') : t('Custode avversario', "Opponent's Custodian");
    if (!cu) {
        if (!bell) return null;
        const house = bellInfo(null, bell as Faction, lang);
        return (
            <div className={`${s.cBadge} ${p === 1 ? s.cOpp : s.cMe} ${row ? s.cRow : ''}`}
                 style={{['--cf' as string]: FACTIONS[bell as keyof typeof FACTIONS]?.col}}>
                <div className={s.cHead}><span className={s.cWho}>{who}</span></div>
                <p className={s.cNone}>{t('Nessun Custode. Rintocco di Casata', 'No Custodian. House Toll')}: <b>{house.name}</b>
                </p>
            </div>
        );
    }
    // I testi inglesi del Custode hanno gli stessi campi di quelli italiani.
    const {name: cuName, passive: cuPassive, bell: cuBell, bellName: cuBellName} = lang === 'en' ? EN_CUSTODI[cu.id] : cu;
    const st = usage(G, p, t), used = st === t(W.usedThisTurn);
    return (
        <>
            <button className={`${s.cBadge} ${p === 1 ? s.cOpp : s.cMe} ${row ? s.cRow : ''}`}
                    style={{['--cf' as string]: FACTIONS[cu.f].col}} onClick={() => setOpen(true)}
                    aria-label={t(`${who}: ${cuName}. ${cuPassive} Tocca per i dettagli.`, `${who}: ${cuName}. ${cuPassive} Tap for details.`)}>
                <div className={s.cHead}>
                    <CustodePortrait id={cu.id} className={s.cPortrait}/>
                    <div className={s.cTitle}><span className={s.cWho}>{who} · <i
                        className={used ? s.cUsed : s.cReady}>{st}</i></span><b>{cuName}</b></div>
                </div>
                <p className={s.cPassive}>{cuPassive}</p>
                <div className={s.cFoot}>
                    <span className={s.cBell} title={cuBell}>{t('Rintocco', 'Toll')}: {cuBellName}</span>
                </div>
            </button>
            <Modal open={open} onClose={() => setOpen(false)}><CustodeCard id={cu.id}/></Modal>
        </>
    );
}
