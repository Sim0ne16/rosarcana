import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import u from './ui.module.css';
import { useToast } from './toast';

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className={u.modalBack} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
          <motion.div className={wide ? '' : u.modal} initial={{ y: 30, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} style={wide ? { width: '100%', maxWidth: 1100 } : undefined}>{children}</motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
export function Toast() {
  const msg = useToast(s => s.msg);
  return <AnimatePresence>{msg && <motion.div key={msg} className={u.toast} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status">{msg}</motion.div>}</AnimatePresence>;
}
