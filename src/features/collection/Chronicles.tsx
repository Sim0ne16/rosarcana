import {type Faction, FACTIONS} from '../../engine';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {FACTION_LORE, WORLD} from '../../cards/lore';
import {Modal} from '../../ui/Modal';
import u from '../../ui/ui.module.css';
import {siteImg} from '../../cards/art/site';
import {useLang, useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {EN_FACTION_LORE} from '../../i18n/en/mechanics';
import {EN_FACTION_OF, EN_WORLD} from '../../i18n/en/ui';
import s from './collection.module.css';

/** Le Cronache: la storia del mondo e delle quattro Casate. */
export function Chronicles({open, onClose}: { open: boolean; onClose: () => void }) {
    const t = useT(), lang = useLang(), en = lang === 'en', world = en ? EN_WORLD : WORLD;
    const lore = (f: Faction) => (en ? EN_FACTION_LORE[f] : FACTION_LORE[f]);
    return (
        <Modal open={open} onClose={onClose}>
            <div className={s.chron}>
                <h2 className={u.title}>{world.title}</h2>
                {world.text.map((x, i) => <p key={i} className={s.chronP}>{x}</p>)}
                <div className={s.houses}>
                    {(Object.keys(FACTIONS) as Faction[]).map(f => (
                        <article key={f} className={s.house} style={{['--fc' as string]: FACTIONS[f].col}}>
                            {siteImg(`casata-${f}`) &&
                                <img className={s.houseImg} src={siteImg(`casata-${f}`)} alt=""/>}
                            <div className={s.houseHead}><span
                                className={s.houseCrest}><Glyph>{FACTION_GLYPH[f]}</Glyph></span>
                                <div><h3>{en ? `House ${EN_FACTION_OF[f]}` : `Casata ${FACTIONS[f].of}`}</h3>
                                    <em>«{lore(f).motto}»</em></div>
                            </div>
                            <p>{lore(f).text}</p>
                            <small>{t(W.inspiredBy)}: {lore(f).insp}.</small>
                        </article>
                    ))}
                </div>
                <p className={`${u.small} ${u.muted}`}>{t('Ogni carta ha la sua storia e i suoi legami con le altre: aprila dalla Collezione e scegli la scheda Storia.', 'Every card has its own story and ties to the others: open it from the Collection and choose the Story tab.')}</p>
                <button className={u.btn} onClick={onClose}>{t(W.close)}</button>
            </div>
        </Modal>
    );
}
