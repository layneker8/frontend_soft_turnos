import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Turno } from '@/@types';

interface AppState {
    // Estado de turnos
    turnos: Turno[];
    selectedTurno: Turno | null;

    // Estado de la UI
    darkMode: boolean;
    sidebarOpen: boolean;

    // Estado de carga
    isLoadingTurnos: boolean;

    // Acciones de turnos
    setTurnos: (turnos: Turno[]) => void;
    addTurno: (turno: Turno) => void;
    updateTurno: (id: string, updates: Partial<Turno>) => void;
    deleteTurno: (id: string) => void;
    selectTurno: (turno: Turno | null) => void;

    // Acciones de UI
    toggleDarkMode: () => void;
    toggleSidebar: () => void;

    // Acciones de carga
    setLoadingTurnos: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
    devtools(
        (set) => ({
            // Estado inicial
            turnos: [],
            selectedTurno: null,
            darkMode: false,
            sidebarOpen: false,
            isLoadingTurnos: false,

            // Acciones de turnos
            setTurnos: (turnos: Turno[]) => {
                set({ turnos }, false, 'setTurnos');
            },

            addTurno: (turno: Turno) => {
                set((state) => ({
                    turnos: [...state.turnos, turno]
                }), false, 'addTurno');
            },

            updateTurno: (id: string, updates: Partial<Turno>) => {
                set((state) => ({
                    turnos: state.turnos.map(turno =>
                        turno.id === id ? { ...turno, ...updates } : turno
                    )
                }), false, 'updateTurno');
            },

            deleteTurno: (id: string) => {
                set((state) => ({
                    turnos: state.turnos.filter(turno => turno.id !== id),
                    selectedTurno: state.selectedTurno?.id === id ? null : state.selectedTurno
                }), false, 'deleteTurno');
            },

            selectTurno: (turno: Turno | null) => {
                set({ selectedTurno: turno }, false, 'selectTurno');
            },

            // Acciones de UI
            toggleDarkMode: () => {
                set((state) => ({ darkMode: !state.darkMode }), false, 'toggleDarkMode');
            },

            toggleSidebar: () => {
                set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar');
            },

            // Acciones de carga
            setLoadingTurnos: (loading: boolean) => {
                set({ isLoadingTurnos: loading }, false, 'setLoadingTurnos');
            },
        }),
        {
            name: 'app-store', // nombre para las DevTools
        }
    )
);