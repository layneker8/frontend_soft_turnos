import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

export const useDarkMode = () => {
    const { darkMode, toggleDarkMode } = useAppStore();

    useEffect(() => {
        // Aplicar el tema al documento
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return { darkMode, toggleDarkMode };
};