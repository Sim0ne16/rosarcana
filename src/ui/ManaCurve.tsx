import {BYID} from '../engine';
import {useT} from '../i18n/lang';
import s from './manaCurve.module.css';

/** Carte per costo, da 0 a 7+ (l'ultima colonna raccoglie tutto ciò che costa 7 o più). */
export const curveOf = (cards: readonly string[]) => {
    const c = [0, 0, 0, 0, 0, 0, 0, 0];
    cards.forEach(id => c[Math.min(7, BYID[id].c)]++);
    return c;
};

/** Curva dei costi di un mazzo: barre compatte (`big` le ingrandisce e mostra il numero sopra ogni barra). */
export function ManaCurve({cards, big}: { cards: readonly string[]; big?: boolean }) {
    const t = useT();
    const c = curveOf(cards), mx = Math.max(1, ...c);
    return <div className={`${s.curve} ${big ? s.big : ''}`} aria-label={t('Curva dei costi', 'Cost curve')}>{c.map((v, i) =>
        <div key={i}><b style={{height: `${(v / mx) * 100}%`}}>{big && v ? <em>{v}</em> : null}</b>
            <span>{i === 7 ? '7+' : i}</span></div>)}</div>;
}
