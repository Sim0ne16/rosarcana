import {CARDS, type Faction, FACTIONS} from '../../engine';
import {CardArt} from '../../cards/art/CardArt';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {FACTION_LORE, LORE} from '../../cards/lore';
import {CODEX_LEVEL, SECRETS} from '../../cards/secrets';
import {defaultArt, MASTERY_NAMES} from '../../cards/styles';
import {levelOf} from '../../economy/mastery';
import {masteryOf, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import u from '../../ui/ui.module.css';
import {useLang, useT} from '../../i18n/lang';
import {cardName, factionName} from '../../i18n/names';
import {W} from '../../i18n/words';
import {EN_FACTION_LORE} from '../../i18n/en/mechanics';
import {EN_LORE} from '../../i18n/en/lore';
import {EN_SECRETS} from '../../i18n/en/secrets';
import {EN_MASTERY_NAMES} from '../../i18n/en/ui';
import s from './collection.module.css';

/** Codex della Rosa: storie delle carte possedute e frammenti nascosti sbloccati con la maestria. */
export function Codex({open, onClose, onOpen}: { open: boolean; onClose: () => void; onOpen: (id: string) => void }) {
    const p = useProfile();
    const cards = CARDS.filter(c => !c.token);
    const stories = cards.filter(c => p.owned[c.id]).length,
        secrets = cards.filter(c => levelOf(masteryOf(p, c.id).xp) >= CODEX_LEVEL).length;
    const t = useT(), lang = useLang(), en = lang === 'en';
    const grade = (en ? EN_MASTERY_NAMES : MASTERY_NAMES)[CODEX_LEVEL - 1];
    return (
        <Modal open={open} onClose={onClose} wide>
            <div className={s.codex}>
                <div className={s.codexHead}>
                    <div><h2 className={u.title} style={{fontSize: 40}}>{t('Codex della Rosa', 'Codex of the Rose')}</h2>
                        <p>{t(`Ogni carta che possiedi ti racconta la sua storia. Portandola al grado ${grade} sblocchi il suo frammento nascosto.`, `Every card you own tells you its story. Bring it to the ${grade} grade to unlock its hidden fragment.`)}</p></div>
                    <div className={s.codexProg}>
                        <b>{stories}/{cards.length}</b><span>{t('storie', 'stories')}</span><b>{secrets}/{cards.length}</b><span>{t('frammenti nascosti', 'hidden fragments')}</span>
                    </div>
                    <button className={u.btn} onClick={onClose}>{t(W.close)}</button>
                </div>
                {(Object.keys(FACTIONS) as Faction[]).map(f => (
                    <section key={f} className={s.codexFac} style={{['--fc' as string]: FACTIONS[f].col}}>
                        <h3><Glyph>{FACTION_GLYPH[f]}</Glyph>{factionName(f, lang)} <em>«{en ? EN_FACTION_LORE[f].motto : FACTION_LORE[f].motto}»</em></h3>
                        {cards.filter(c => c.f === f).map(c => {
                            const own = !!p.owned[c.id], lvl = levelOf(masteryOf(p, c.id).xp), sec = lvl >= CODEX_LEVEL;
                            return (
                                <button key={c.id} className={`${s.codexRow} ${own ? '' : s.codexLock}`}
                                        onClick={() => own && onOpen(c.id)} disabled={!own}>
                                    <span className={s.codexArt}>{own ?
                                        <CardArt id={c.id} style={defaultArt(c.id)} arch={false}/> : <i>?</i>}</span>
                                    <span className={s.codexText}>
                    <b>{own ? cardName(c.id, lang) : t('Carta sconosciuta', 'Unknown card')}</b>
                    <span>{own ? (en ? EN_LORE[c.id]?.text : undefined) ?? LORE[c.id]?.text : t('Trova questa carta in una bustina o creala con la polvere per leggerne la storia.', 'Find this card in a pack or craft it with dust to read its story.')}</span>
                                        {own && (sec ?
                                            <em className={s.secret}>{t(W.hiddenFragment)}: {(en ? EN_SECRETS[c.id] : undefined) ?? SECRETS[c.id]}</em> :
                                            <em className={s.secretLock}>{t(`Frammento nascosto: porta la carta ad ${grade}.`, `Hidden fragment: bring the card to ${grade}.`)}</em>)}
                  </span>
                                </button>);
                        })}
                    </section>
                ))}
            </div>
        </Modal>
    );
}
