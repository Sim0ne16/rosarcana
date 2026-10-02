import {cardInfo, type Game} from '../../engine';
import {Card} from '../../cards/Card';
import {useLang, useT} from '../../i18n/lang';
import {cardName} from '../../i18n/names';
import {W} from '../../i18n/words';
import {lookOf, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import {useBattle} from './store';
import s from './battle.module.css';

/** Cimitero consultabile: le carte dalla più recente, con anteprima grande al passaggio. Si toccano per aprirne il dettaglio. */
export function GraveView({G, p, onClose}: { G: Game; p: number | null; onClose: () => void }) {
    const profile = useProfile();
    const lang = useLang(), t = useT();
    const P = p == null ? null : G.p[p];
    const cards = P ? [...P.grave].reverse() : [];
    const name = (id: string) => cardName(id, lang);
    return (
        <Modal open={p != null} onClose={onClose} wide>
            <div className={s.graveBox}>
                <div className={s.graveHead}>
                    <h2>{P ? t(`Cimitero di ${p === 0 ? 'te' : P.name}`, `${p === 0 ? 'Your' : `${P.name}'s`} graveyard`) : ''}</h2>
                    <span>{t(cards.length === 1 ? '1 carta' : `${cards.length} carte`, cards.length === 1 ? '1 card' : `${cards.length} cards`)}, {t('dalla più recente', 'most recent first')}</span>
                    <button className={s.btn} onClick={onClose} autoFocus>{t(W.close)}</button>
                </div>
                {cards.length
                    ? <div className={s.graveGrid}>{cards.map((id, i) => <button key={i} className={s.graveCard}
                                                                                  onClick={() => {
                                                                                      // Chiude il cimitero: l'overlay del dettaglio sta sotto quello del Modal nello z-index.
                                                                                      onClose();
                                                                                      useBattle.getState().inspect({id, p: p!});
                                                                                  }}
                                                                                  aria-label={t(`Dettaglio: ${name(id)}`, `Detail: ${name(id)}`)}>
                        <Card card={cardInfo(id)} look={p === 0 ? lookOf(profile, id) : undefined}/></button>)}</div>
                    :
                    <p className={s.graveEmpty}>{t('Ancora nessuna carta. Qui finiscono le unità distrutte, gli incantesimi lanciati e le reliquie dei Sigilli spezzati.', 'No cards yet. Destroyed units, cast spells, and relics of broken Seals end up here.')}</p>}
            </div>
        </Modal>
    );
}
