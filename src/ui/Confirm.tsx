import {Modal} from './Modal';
import {useT} from '../i18n/lang';
import {W} from '../i18n/words';
import u from './ui.module.css';

/** Conferma dentro l'app: window.confirm è bloccato nelle pagine incorporate. */
export function Confirm({open, title, text, confirmLabel, onConfirm, onClose}: {
    open: boolean;
    title: string;
    text: string;
    confirmLabel: string;
    onConfirm: () => void;
    onClose: () => void
}) {
    const t = useT();
    return (
        <Modal open={open} onClose={onClose}>
            <div className={u.confirm}>
                <h2 className={u.title} style={{fontSize: 32}}>{title}</h2>
                <p>{text}</p>
                <div className={u.row} style={{justifyContent: 'flex-end'}}>
                    <button className={u.btn} onClick={onClose} autoFocus>{t(W.cancel)}</button>
                    <button className={`${u.btn} ${u.wax}`} onClick={() => {
                        onClose();
                        onConfirm();
                    }}>{confirmLabel}</button>
                </div>
            </div>
        </Modal>
    );
}
