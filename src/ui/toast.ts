import {create} from 'zustand';

interface ToastState {
    msg: string | null;
    id: number;
    show: (m: string) => void
}

export const useToast = create<ToastState>(set => ({
    msg: null, id: 0,
    show: m => {
        const id = Date.now();
        set({msg: m, id});
        setTimeout(() => set(s => (s.id === id ? {msg: null} : s)), 2600);
    },
}));
export const toast = (m: string) => useToast.getState().show(m);
