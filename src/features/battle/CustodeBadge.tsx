import { useState } from 'react';
import { BELLS, CUSTODI, FACTIONS, type Game } from '../../engine';
import { Modal } from '../../ui/Modal';
import { CustodeCard, CustodePortrait } from '../custodi/CustodeCard';
import s from './battle.module.css';

/** Stato dei poteri "una volta per turno" dei Custodi. */
function usage(G: Game, p: number): string | null {
  const P = G.p[p], f = P.flags ?? {}, mine = G.active === p;
  switch (P.custode) {
    case 'vesta': return mine && f.unit ? 'Usato in questo turno' : 'Pronto';
    case 'ladro': return mine && f.spell ? 'Usato in questo turno' : 'Pronto';
    case 'nocchiero': return mine && f.move ? 'Usato in questo turno' : 'Pronto';
    case 'traghettatore': return f.ferry ? 'Usato in questo turno' : 'Pronto';
    default: return 'Sempre attivo';
  }
}

/** Il Custode di un giocatore in evidenza: ritratto, potere e Ultimo Rintocco. */
export function CustodeBadge({ G, p, row }: { G: Game; p: number; row?: boolean }) {
  const [open, setOpen] = useState(false);
  const P = G.p[p], cu = P.custode ? CUSTODI[P.custode] : null, bell = G.bell?.[p];
  const who = p === 0 ? 'Il tuo Custode' : 'Custode avversario';
  if (!cu) {
    if (!bell) return null;
    return (
      <div className={`${s.cBadge} ${p === 1 ? s.cOpp : s.cMe} ${row ? s.cRow : ''}`} style={{ ['--cf' as string]: FACTIONS[bell as keyof typeof FACTIONS]?.col }}>
        <div className={s.cHead}><span className={s.cWho}>{who}</span></div>
        <p className={s.cNone}>Nessun Custode. Rintocco di Casata: <b>{BELLS[bell as keyof typeof BELLS].name}</b></p>
      </div>
    );
  }
  const st = usage(G, p), used = st?.startsWith('Usato');
  return (
    <>
      <button className={`${s.cBadge} ${p === 1 ? s.cOpp : s.cMe} ${row ? s.cRow : ''}`} style={{ ['--cf' as string]: FACTIONS[cu.f].col }} onClick={() => setOpen(true)} aria-label={`${who}: ${cu.name}. ${cu.passive} Tocca per i dettagli.`}>
        <div className={s.cHead}>
          <CustodePortrait id={cu.id} className={s.cPortrait} />
          <div className={s.cTitle}><span className={s.cWho}>{who} · <i className={used ? s.cUsed : s.cReady}>{st}</i></span><b>{cu.name}</b></div>
        </div>
        <p className={s.cPassive}>{cu.passive}</p>
        <div className={s.cFoot}>
          <span className={s.cBell} title={cu.bell}>Rintocco: {cu.bellName}</span>
        </div>
      </button>
      <Modal open={open} onClose={() => setOpen(false)}><CustodeCard id={cu.id} /></Modal>
    </>
  );
}
