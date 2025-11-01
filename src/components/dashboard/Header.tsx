

import { useAppStore } from '@/stores/appStore';
import React from 'react';

interface HeaderProps {
    user: {
        username: string;
    } | null,
    darkMode: boolean;
    toggleDarkMode: () => void;
    handleLogout: () => void;
}


const Header: React.FC<HeaderProps> = ({ user, darkMode, toggleDarkMode, handleLogout }) => {

    const { toggleSidebar } = useAppStore();

    return (
        <>
            {/* Header */}
            <header className="flex items-center bg-white h-[70px] dark:bg-gray-800 shadow sticky top-0 z-10" >
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between sm:justify-end items-center py-2 md:py-6">
                        {/* Botón menú solo en móvil */}
                        <button
                            className="sm:hidden p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={toggleSidebar}
                            aria-label="Abrir menú"
                        >
                            <span className="material-symbols-rounded">menu</span>
                        </button>
                        <div className="flex items-center md:justify-between  space-x-4">
                            <span className="text-secondary">
                                Bienvenido, {user?.username || 'Usuario de prueba'}
                            </span>
                            <button
                                onClick={toggleDarkMode}
                                className="inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-background-dark dark:text-background-light bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                            >
                                <span className="material-symbols-rounded text-base">
                                    {darkMode ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-2 md:px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                <span className="material-symbols-rounded lg:mr-2 text-sm">
                                    logout
                                </span>
                                <p className='hidden lg:block'>Cerrar Sesión</p>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;