import {cardInfo, type Game} from '../../engine';
import {Card} from '../../cards/Card';
import {lookOf, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import s from './battle.module.css';

/** Cimitero consultabile: le carte dalla più recente, con anteprima grande al passaggio. */
export function GraveView({G, p, onClose}: { G: Game; p: number | null; onClose: () => void }) {
    const profile = useProfile();
    const P = p == null ? null : G.p[p];
    const cards = P ? [...P.grave].reverse() : [];
    return (
        <Modal open={p != null} onClose={onClose} wide>
            <div className={s.graveBox}>
                <div className={s.graveHead}>
                    <h2>{P ? `Cimitero di ${p === 0 ? 'te' : P.name}` : ''}</h2>
                    <span>{cards.length === 1 ? '1 carta' : `${cards.length} carte`}, dalla più recente</span>
                    <button className={s.btn} onClick={onClose} autoFocus>Chiudi</button>
                </div>
                {cards.length
                    ? <div className={s.graveGrid}>{cards.map((id, i) => <div key={i} className={s.graveCard}><Card
                        card={cardInfo(id)} look={p === 0 ? lookOf(profile, id) : undefined}/></div>)}</div>
                    :
                    <p className={s.graveEmpty}>Ancora nessuna carta. Qui finiscono le unità distrutte, gli incantesimi
                        lanciati e le reliquie dei Sigilli spezzati.</p>}
            </div>
        </Modal>
    );
}
