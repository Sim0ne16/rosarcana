import {deckIssues} from '../../economy/decks';
import {useProfile} from '../../profile/store';
import {useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import s from './decks.module.css';

export function DeckSelect() {
    const decks = useProfile(p => p.decks), active = useProfile(p => p.activeDeck), owned = useProfile(p => p.owned),
        setActive = useProfile(p => p.deck.setActive);
    const t = useT();
    return (
        <label className={s.selectWrap}>
            <span>{t(W.deck)}</span>
            <select value={active} onChange={e => setActive(e.target.value)}>
                {decks.map(d => {
                    const bad = deckIssues(d, owned).length > 0;
                    return <option key={d.id} value={d.id} disabled={bad}>{d.name}{bad ? t(' (incompleto)', ' (incomplete)') : ''}</option>;
                })}
            </select>
        </label>
    );
}
