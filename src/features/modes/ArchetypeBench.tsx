// Banco di prova: scegli un archetipo per te e uno per l'IA e gioca subito, senza possedere le carte.
import {useState} from 'react';
import {ARCHETYPES} from '../../economy/decks';
import {EN_PRESETS} from '../../i18n/en/ui';
import {useLang, useT} from '../../i18n/lang';
import {custodeName} from '../../i18n/names';
import {W} from '../../i18n/words';
import {Modal} from '../../ui/Modal';
import {startArchetypeTest} from './archetypeTest';
import u from '../../ui/ui.module.css';
import s from '../online/online.module.css';

export function ArchetypeBench({open, onClose}: { open: boolean; onClose: () => void }) {
    const t = useT(), lang = useLang();
    const [me, setMe] = useState(ARCHETYPES[0].id), [op, setOp] = useState('random');
    const txt = (id: string) => {
        const a = ARCHETYPES.find(x => x.id === id)!;
        return lang === 'en' && EN_PRESETS[a.id] ? {...a, ...EN_PRESETS[a.id]} : a;
    };
    const mine = txt(me);
    const option = (id: string) => {
        const a = txt(id);
        return <option key={id} value={id}>{a.archetype} · {a.name}</option>;
    };
    return (
        <Modal open={open} onClose={onClose}>
            <div className={s.box}>
                <h2 className={u.title} style={{fontSize: 30}}>{t('Banco di prova', 'Test bench')}</h2>
                <p className={s.blurb}>{t(`Un mazzo modello per ognuno dei ${ARCHETYPES.length} archetipi, giocabile subito contro l'IA anche senza le carte. Nessuna ricompensa.`,
                    `A template deck for each of the ${ARCHETYPES.length} archetypes, playable right away against the AI even without the cards. No rewards.`)}</p>
                <label className={s.field}>
                    <span>{t('Il tuo archetipo', 'Your archetype')}</span>
                    <select value={me} onChange={e => setMe(e.target.value)}>{ARCHETYPES.map(a => option(a.id))}</select>
                </label>
                <p className={s.blurb}>{mine.blurb}{mine.custode ? ` ${t(W.custodian)}: ${custodeName(mine.custode, lang)}.` : ''}</p>
                <label className={s.field}>
                    <span>{t('Avversario', 'Opponent')}</span>
                    <select value={op} onChange={e => setOp(e.target.value)}>
                        <option value="random">{t('Archetipo a caso', 'Random archetype')}</option>
                        {ARCHETYPES.map(a => option(a.id))}
                    </select>
                </label>
                <div className={u.row} style={{justifyContent: 'flex-end'}}>
                    <button className={u.btn} onClick={onClose}>{t(W.cancel)}</button>
                    <button className={`${u.btn} ${u.primary}`} onClick={() => {
                        onClose();
                        startArchetypeTest(me, op === 'random' ? undefined : op);
                    }}>{t(W.play)}</button>
                </div>
            </div>
        </Modal>
    );
}
