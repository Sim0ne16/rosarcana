import {useT} from '../../i18n/lang';
import {FONT_SETS, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import u from '../../ui/ui.module.css';
import s from './settings.module.css';

/** Opzioni di accessibilità: testo, movimento, contrasto, tempo, audio. */
export function SettingsModal({open, onClose}: { open: boolean; onClose: () => void }) {
    const p = useProfile(), st = p.settings;
    const t = useT();
    const row = (title: string, desc: string, control: JSX.Element) => <div className={s.row}>
        <div><b>{title}</b><span>{desc}</span></div>
        {control}</div>;
    const toggle = (k: 'reduceMotion' | 'highContrast' | 'noTimer') => <button role="switch" aria-checked={st[k]}
                                                                               className={s.sw}
                                                                               onClick={() => p.setSetting(k, !st[k])}>
        <i/></button>;
    return (
        <Modal open={open} onClose={onClose}>
            <div className={s.box}>
                <h2 className={u.title} style={{fontSize: 36}}>{t('Opzioni', 'Options')}</h2>
                {row(t('Dimensione del testo', 'Text size'), t('Ingrandisce il testo delle carte e dell\'interfaccia.', 'Enlarges card and interface text.'),
                    <div className={s.seg}
                         role="radiogroup">{[[1, t('Normale', 'Normal')], [1.15, t('Grande', 'Large')], [1.3, t('Molto grande', 'Very large')]].map(([v, l]) =>
                        <button key={v} role="radio" aria-checked={st.textScale === v}
                                onClick={() => p.setSetting('textScale', v as number)}>{l}</button>)}</div>)}
                {row(t('Carattere', 'Font'), t('Scegli lo stile del testo di tutto il gioco.', 'Choose the text style for the whole game.'),
                    <div className={s.seg} role="radiogroup">{FONT_SETS.map(f => <button key={f.id} role="radio"
                                                                                         aria-checked={(st.font ?? 'classico') === f.id}
                                                                                         onClick={() => p.setSetting('font', f.id)}
                                                                                         style={{fontFamily: f.body}}>{f.name}</button>)}</div>)}
                {row(t('Lingua', 'Language'), t('Lingua dell\'interfaccia, delle carte e delle storie.', 'Language of the interface, cards and stories.'),
                    <div className={s.seg} role="radiogroup">{([['it', 'Italiano'], ['en', 'English']] as const).map(([v, l]) =>
                        <button key={v} role="radio" aria-checked={(st.lang ?? 'it') === v}
                                onClick={() => p.setSetting('lang', v)}>{l}</button>)}</div>)}
                {row(t('Riduci le animazioni', 'Reduce motion'), t('Toglie scosse, riflessi e movimenti non necessari.', 'Removes shakes, glints and unnecessary movement.'), toggle('reduceMotion'))}
                {row(t('Alto contrasto', 'High contrast'), t('Testi più scuri, bordi più marcati e fazioni riconoscibili anche dal simbolo.', 'Darker text, bolder borders and factions recognisable by their symbol too.'), toggle('highContrast'))}
                {row(t('Partite senza tempo', 'Untimed matches'), t('Per i test: nessun limite al turno e nessuna riserva.', 'For testing: no turn limit and no reserve time.'), toggle('noTimer'))}
                {row(t('Suoni', 'Sound'), t('Attiva o disattiva tutti gli effetti sonori.', 'Turn all sound effects on or off.'), <button role="switch"
                                                                                      aria-checked={p.sound}
                                                                                      className={s.sw}
                                                                                      onClick={() => p.dev('sound')}>
                    <i/></button>)}
                {row(t('Volume', 'Volume'), `${Math.round(st.volume * 100)}%`, <input type="range" min={0} max={1} step={0.05}
                                                                         value={st.volume}
                                                                         onChange={e => p.setSetting('volume', Number(e.target.value))}
                                                                         aria-label="Volume"/>)}
                <button className={`${u.btn} ${u.primary}`} onClick={onClose}>{t('Fatto', 'Done')}</button>
            </div>
        </Modal>
    );
}
