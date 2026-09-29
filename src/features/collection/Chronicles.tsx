import {type Faction, FACTIONS} from '../../engine';
import {FACTION_GLYPH, Glyph} from '../../cards/glyphs';
import {FACTION_LORE, WORLD} from '../../cards/lore';
import {Modal} from '../../ui/Modal';
import u from '../../ui/ui.module.css';
import {siteImg} from '../../cards/art/site';
import s from './collection.module.css';

/** Le Cronache: la storia del mondo e delle quattro Casate. */
export function Chronicles({open, onClose}: { open: boolean; onClose: () => void }) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className={s.chron}>
                <h2 className={u.title}>{WORLD.title}</h2>
                {WORLD.text.map((t, i) => <p key={i} className={s.chronP}>{t}</p>)}
                <div className={s.houses}>
                    {(Object.keys(FACTIONS) as Faction[]).map(f => (
                        <article key={f} className={s.house} style={{['--fc' as string]: FACTIONS[f].col}}>
                            {siteImg(`casata-${f}`) &&
                                <img className={s.houseImg} src={siteImg(`casata-${f}`)} alt=""/>}
                            <div className={s.houseHead}><span
                                className={s.houseCrest}><Glyph>{FACTION_GLYPH[f]}</Glyph></span>
                                <div><h3>Casata {FACTIONS[f].of.replace(/^(di|della|del) /, m => m)}</h3>
                                    <em>«{FACTION_LORE[f].motto}»</em></div>
                            </div>
                            <p>{FACTION_LORE[f].text}</p>
                            <small>Ispirata a: {FACTION_LORE[f].insp}.</small>
                        </article>
                    ))}
                </div>
                <p className={`${u.small} ${u.muted}`}>Ogni carta ha la sua storia e i suoi legami con le altre: aprila
                    dalla Collezione e scegli la scheda Storia.</p>
                <button className={u.btn} onClick={onClose}>Chiudi</button>
            </div>
        </Modal>
    );
}
