import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {useT} from '../../i18n/lang';
import {EMOTE_BY_ID, EMOTES, sendEmote, toggleMuteOpp, useEmotes} from './emoteStore';
import {useBattle} from './store';
import s from './emotes.module.css';

/** Fumetto con l'ultima emote del giocatore `p`, sopra (tu) o sotto (avversario) la sua barra. */
export function EmoteBubble({p}: { p: 0 | 1 }) {
    const b = useEmotes(st => st.bubbles[p]);
    const t = useT();
    const e = b && EMOTE_BY_ID[b.id];
    return (
        <div className={`${s.anchor} ${p === 0 ? s.me : s.op}`} aria-live="polite">
            <AnimatePresence>
                {e && <motion.div key={b.k} className={s.bubble} initial={{opacity: 0, scale: 0.6, y: p === 0 ? 10 : -10}}
                                  animate={{opacity: 1, scale: 1, y: 0}} exit={{opacity: 0, scale: 0.85}}
                                  transition={{type: 'spring', stiffness: 380, damping: 22}}>
                    <span aria-hidden="true">{e.icon}</span>{t(e.text)}
                </motion.div>}
            </AnimatePresence>
        </div>
    );
}

/** Selettore delle emote del giocatore: pulsante, griglia di frasi (tasti 1-6) e silenziamento dell'avversario. */
export function EmotePicker() {
    const [open, setOpen] = useState(false);
    const muted = useEmotes(st => st.muted), readyAt = useEmotes(st => st.readyAt);
    const over = useBattle(st => !!st.result || !!st.replay);
    const t = useT();
    const box = useRef<HTMLDivElement>(null);
    const cooling = readyAt > Date.now();
    const pick = (i: number) => {
        const e = EMOTES[i];
        if (e && sendEmote(e.id)) setOpen(false);
    };
    useEffect(() => {
        const key = (ev: KeyboardEvent) => {
            if ((ev.target as HTMLElement).closest('input,textarea')) return;
            if (ev.key === 'e' || ev.key === 'E') setOpen(o => !o);
            else if (ev.key === 'Escape') setOpen(false);
            else if (open && /^[1-9]$/.test(ev.key)) pick(Number(ev.key) - 1);
        };
        const outside = (ev: PointerEvent) => {
            if (!box.current?.contains(ev.target as Node)) setOpen(false);
        };
        window.addEventListener('keydown', key);
        if (open) window.addEventListener('pointerdown', outside);
        return () => {
            window.removeEventListener('keydown', key);
            window.removeEventListener('pointerdown', outside);
        };
    }, [open]);
    // readyAt non cambia allo scadere della pausa: un timer ridisegna per riabilitare i pulsanti.
    const [, tick] = useState(0);
    useEffect(() => {
        if (!cooling) return;
        const h = setTimeout(() => tick(n => n + 1), readyAt - Date.now() + 20);
        return () => clearTimeout(h);
    }, [cooling, readyAt]);
    if (over) return null;
    return (
        <div className={s.picker} ref={box}>
            <button className={s.toggle} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(o => !o)}
                    title={t('Emote (tasto E)', 'Emotes (E key)')} aria-label={t('Emote', 'Emotes')}>💬</button>
            <AnimatePresence>
                {open && <motion.div className={s.menu} role="menu" initial={{opacity: 0, y: 8, scale: 0.95}}
                                     animate={{opacity: 1, y: 0, scale: 1}} exit={{opacity: 0, y: 8, scale: 0.95}}
                                     transition={{duration: 0.15}}>
                    <div className={s.grid}>
                        {EMOTES.map((e, i) => <button key={e.id} role="menuitem" className={s.item} disabled={cooling}
                                                      onClick={() => pick(i)}>
                            <span aria-hidden="true">{e.icon}</span>{t(e.text)}<kbd>{i + 1}</kbd>
                        </button>)}
                    </div>
                    <button role="menuitemcheckbox" aria-checked={muted} className={s.mute} onClick={toggleMuteOpp}>
                        {muted ? t('Riattiva le emote dell\'avversario', 'Unmute opponent emotes') : t('Silenzia l\'avversario', 'Mute opponent')}
                    </button>
                </motion.div>}
            </AnimatePresence>
        </div>
    );
}
