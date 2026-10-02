import {defaultArt} from '../../cards/styles';
import {type CustodeId, CUSTODI, FACTIONS} from '../../engine';
import {CardArt} from '../../cards/art/CardArt';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {siteImg} from '../../cards/art/site';
import {EN_CUSTODI} from '../../i18n/en/mechanics';
import {useLang, useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {useProfile} from '../../profile/store';
import {CUST_MISSIONS, CUST_REWARD} from '../../economy/custodeMissions';
import s from './custodi.module.css';

const PORTRAIT: Partial<Record<CustodeId, string>> = {veggente: 'cassandra', guardaboschi: 'uomoverde'};

/** Ritratto rotondo di un Custode. */
export function CustodePortrait({id, className, title}: { id: CustodeId; className?: string; title?: string }) {
    const c = CUSTODI[id], leg = useProfile(p => p.custLeg?.includes(id));
    const lang = useLang();
    const name = lang === 'en' ? EN_CUSTODI[id].name : c.name, cTitle = lang === 'en' ? EN_CUSTODI[id].title : c.title;
    return (
        <span className={`${s.portrait} ${leg ? s.legendary : ''} ${className ?? ''}`}
              style={{['--fc' as string]: FACTIONS[c.f].col}} title={title ?? `${name}, ${cTitle}`}>
      {siteImg(`custode-${PORTRAIT[id] ?? id}`) ?
          <img src={siteImg(`custode-${PORTRAIT[id] ?? id}`)} alt="" draggable={false}/> :
          <CardArt id={c.art} style={defaultArt(c.art)} arch={false}/>}
            <i><Glyph>{FACTION_GLYPH[c.f]}</Glyph></i>
    </span>
    );
}

/** Scheda completa di un Custode: effetto sempre attivo, Ultimo Rintocco personale e storia. */
export function CustodeCard({id, compact}: { id: CustodeId; compact?: boolean }) {
    const c = CUSTODI[id], leg = useProfile(p => p.custLeg?.includes(id)), prog = useProfile(p => p.custProg?.[id]);
    const lang = useLang(), t = useT();
    const ec = EN_CUSTODI[id];
    const name = lang === 'en' ? ec.name : c.name, cTitle = lang === 'en' ? ec.title : c.title,
        passive = lang === 'en' ? ec.passive : c.passive, bellName = lang === 'en' ? ec.bellName : c.bellName,
        bell = lang === 'en' ? ec.bell : c.bell, lore = lang === 'en' ? ec.lore : c.lore;
    return (
        <div className={`${s.card} ${compact ? s.compact : ''}`} style={{['--fc' as string]: FACTIONS[c.f].col}}>
            <CustodePortrait id={id} className={s.big}/>
            <div className={s.body}>
                <h3>{name}{leg && <span className={s.legTag}>{t('Leggendario', 'Legendary')}</span>}</h3>
                <em>{cTitle}</em>
                <p><b>{t(W.alwaysActive)}:</b> {passive}</p>
                <p><b>{t(W.lastToll)}, {bellName}:</b> {bell}</p>
                {!compact && <p className={s.lore}>{lore} <span>{t('Ispirato a', 'Inspired by')} {c.insp}.</span></p>}
                {!compact && <div className={s.missions}><b>{t('Missioni leggendarie', 'Legendary missions')}</b>{CUST_MISSIONS.map(m => {
                    const v = Math.min(m.goal, prog?.[m.id] ?? 0);
                    return <div key={m.id} className={v >= m.goal ? s.mDone : ''}>
                        <span>{lang === 'en' ? m.txtEn(name) : m.txt(name)}</span><em>{v}/{m.goal}</em></div>;
                })}
                    <small>{leg ? t('Completate: ritratto leggendario sbloccato.', 'Completed: legendary portrait unlocked.') : t(`Ricompensa: ritratto leggendario, ${CUST_REWARD.gettoni} gettoni e ${CUST_REWARD.polvere} polvere.`, `Reward: legendary portrait, ${CUST_REWARD.gettoni} style tokens and ${CUST_REWARD.polvere} dust.`)}</small>
                </div>}
            </div>
        </div>
    );
}
