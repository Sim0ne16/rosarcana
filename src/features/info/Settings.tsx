import { FONT_SETS, useProfile } from '../../profile/store';
import { Modal } from '../../ui/Modal';
import u from '../../ui/ui.module.css';
import s from './settings.module.css';

/** Opzioni di accessibilità: testo, movimento, contrasto, tempo, audio. */
export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const p = useProfile(), st = p.settings;
  const row = (title: string, desc: string, control: JSX.Element) => <div className={s.row}><div><b>{title}</b><span>{desc}</span></div>{control}</div>;
  const toggle = (k: 'reduceMotion' | 'highContrast' | 'noTimer') => <button role="switch" aria-checked={st[k]} className={s.sw} onClick={() => p.setSetting(k, !st[k])}><i /></button>;
  return (
    <Modal open={open} onClose={onClose}>
      <div className={s.box}>
        <h2 className={u.title} style={{ fontSize: 36 }}>Opzioni</h2>
        {row('Dimensione del testo', 'Ingrandisce il testo delle carte e dell\'interfaccia.',
          <div className={s.seg} role="radiogroup">{[[1, 'Normale'], [1.15, 'Grande'], [1.3, 'Molto grande']].map(([v, l]) => <button key={v} role="radio" aria-checked={st.textScale === v} onClick={() => p.setSetting('textScale', v as number)}>{l}</button>)}</div>)}
        {row('Carattere', 'Scegli lo stile del testo di tutto il gioco.',
          <div className={s.seg} role="radiogroup">{FONT_SETS.map(f => <button key={f.id} role="radio" aria-checked={(st.font ?? 'classico') === f.id} onClick={() => p.setSetting('font', f.id)} style={{ fontFamily: f.body }}>{f.name}</button>)}</div>)}
        {row('Riduci le animazioni', 'Toglie scosse, riflessi e movimenti non necessari.', toggle('reduceMotion'))}
        {row('Alto contrasto', 'Testi più scuri, bordi più marcati e fazioni riconoscibili anche dal simbolo.', toggle('highContrast'))}
        {row('Partite senza tempo', 'Per i test: nessun limite al turno e nessuna riserva.', toggle('noTimer'))}
        {row('Suoni', 'Attiva o disattiva tutti gli effetti sonori.', <button role="switch" aria-checked={p.sound} className={s.sw} onClick={() => p.dev('sound')}><i /></button>)}
        {row('Volume', `${Math.round(st.volume * 100)}%`, <input type="range" min={0} max={1} step={0.05} value={st.volume} onChange={e => p.setSetting('volume', Number(e.target.value))} aria-label="Volume" />)}
        <button className={`${u.btn} ${u.primary}`} onClick={onClose}>Fatto</button>
      </div>
    </Modal>
  );
}
