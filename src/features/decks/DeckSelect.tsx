import {deckIssues} from '../../economy/decks';
import {useProfile} from '../../profile/store';
import s from './decks.module.css';

export function DeckSelect() {
    const decks = useProfile(p => p.decks), active = useProfile(p => p.activeDeck), owned = useProfile(p => p.owned),
        setActive = useProfile(p => p.deck.setActive);
    return (
        <label className={s.selectWrap}>
            <span>Mazzo</span>
            <select value={active} onChange={e => setActive(e.target.value)}>
                {decks.map(d => {
                    const bad = deckIssues(d, owned).length > 0;
                    return <option key={d.id} value={d.id} disabled={bad}>{d.name}{bad ? ' (incompleto)' : ''}</option>;
                })}
            </select>
        </label>
    );
}
