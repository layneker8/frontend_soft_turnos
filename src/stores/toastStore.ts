import { create } from 'zustand';
import type { Toast } from '@/@types';

interface ToastState {
    toasts: Toast[];

    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],

    addToast: (toast) => {
        const id = Date.now().toString();
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000,
        };

        set((state) => ({
            toasts: [...state.toasts, newToast]
        }));

        // Auto remove after duration
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter(t => t.id !== id)
                }));
            }, newToast.duration);
        }
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter(t => t.id !== id)
        }));
    },

    clearToasts: () => {
        set({ toasts: [] });
    },
}));