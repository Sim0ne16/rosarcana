import { CARDS, FACTIONS, type Faction } from '../../engine';
import { CardArt } from '../../cards/art/CardArt';
import { FACTION_GLYPH, Glyph } from '../../cards/glyphs';
import { FACTION_LORE, LORE } from '../../cards/lore';
import { CODEX_LEVEL, SECRETS } from '../../cards/secrets';
import { MASTERY_NAMES, defaultArt } from '../../cards/styles';
import { levelOf } from '../../economy/mastery';
import { masteryOf, useProfile } from '../../profile/store';
import { Modal } from '../../ui/Modal';
import u from '../../ui/ui.module.css';
import s from './collection.module.css';

/** Codex della Rosa: storie delle carte possedute e frammenti nascosti sbloccati con la maestria. */
export function Codex({ open, onClose, onOpen }: { open: boolean; onClose: () => void; onOpen: (id: string) => void }) {
  const p = useProfile();
  const cards = CARDS.filter(c => !c.token);
  const stories = cards.filter(c => p.owned[c.id]).length, secrets = cards.filter(c => levelOf(masteryOf(p, c.id).xp) >= CODEX_LEVEL).length;
  return (
    <Modal open={open} onClose={onClose} wide>
      <div className={s.codex}>
        <div className={s.codexHead}>
          <div><h2 className={u.title} style={{ fontSize: 40 }}>Codex della Rosa</h2>
            <p>Ogni carta che possiedi ti racconta la sua storia. Portandola al grado {MASTERY_NAMES[CODEX_LEVEL - 1]} sblocchi il suo frammento nascosto.</p></div>
          <div className={s.codexProg}><b>{stories}/{cards.length}</b><span>storie</span><b>{secrets}/{cards.length}</b><span>frammenti nascosti</span></div>
          <button className={u.btn} onClick={onClose}>Chiudi</button>
        </div>
        {(Object.keys(FACTIONS) as Faction[]).map(f => (
          <section key={f} className={s.codexFac} style={{ ['--fc' as string]: FACTIONS[f].col }}>
            <h3><Glyph>{FACTION_GLYPH[f]}</Glyph>{FACTIONS[f].name} <em>«{FACTION_LORE[f].motto}»</em></h3>
            {cards.filter(c => c.f === f).map(c => { const own = !!p.owned[c.id], lvl = levelOf(masteryOf(p, c.id).xp), sec = lvl >= CODEX_LEVEL;
              return (
                <button key={c.id} className={`${s.codexRow} ${own ? '' : s.codexLock}`} onClick={() => own && onOpen(c.id)} disabled={!own}>
                  <span className={s.codexArt}>{own ? <CardArt id={c.id} style={defaultArt(c.id)} arch={false} /> : <i>?</i>}</span>
                  <span className={s.codexText}>
                    <b>{own ? c.n : 'Carta sconosciuta'}</b>
                    <span>{own ? LORE[c.id]?.text : 'Trova questa carta in una bustina o creala con la polvere per leggerne la storia.'}</span>
                    {own && (sec ? <em className={s.secret}>Frammento nascosto: {SECRETS[c.id]}</em> : <em className={s.secretLock}>Frammento nascosto: porta la carta ad {MASTERY_NAMES[CODEX_LEVEL - 1]}.</em>)}
                  </span>
                </button>);
            })}
          </section>
        ))}
      </div>
    </Modal>
  );
}
