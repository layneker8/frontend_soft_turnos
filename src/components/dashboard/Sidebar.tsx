

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

const Sidebar: React.FC = () => {
    const { sidebarOpen, toggleSidebar } = useAppStore();
    const location = useLocation();

    return (
        <>
            {/* Overlay para móvil */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 sm:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />
            <aside
                className={`
                    fixed z-50 top-0 left-0 h-full bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 p-4
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
                    sm:static sm:translate-x-0 sm:flex sm:col-span-2 md:col-span-3 sm:flex-col xl:col-span-2
                `}
            >
                <div className='mb-3 h-[60px] w-auto flex items-center justify-between sm:block'>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white px-2">Iturno</h1>
                    {/* Botón cerrar solo en móvil */}
                    <button
                        className="sm:hidden p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={toggleSidebar}
                        aria-label="Cerrar menú"
                    >
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>
                <div className="flex flex-col gap-8">
                    <nav className="flex flex-col gap-2">
                        <Link 
                            to="/dashboard"
                            className={`flex justify-start items-center gap-3 sm:justify-center md:justify-start md:items-center md:gap-3 rounded-lg px-3 py-2 transition-colors ${
                                location.pathname === '/dashboard' 
                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary' 
                                    : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => sidebarOpen && window.innerWidth < 640 && toggleSidebar()}
                        >
                            <span className='material-symbols-rounded'>dashboard</span>
                            <span className='sm:hidden md:block'>Inicio</span>
                        </Link>
                        <Link 
                            to="/dashboard/turnos"
                            className={`flex justify-start items-center gap-3 sm:justify-center md:justify-start md:items-center md:gap-3 rounded-lg px-3 py-2 transition-colors ${
                                location.pathname === '/dashboard/turnos' 
                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary' 
                                    : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => sidebarOpen && window.innerWidth < 640 && toggleSidebar()}
                        >
                            <span className='material-symbols-rounded'>schedule</span>
                            <span className='sm:hidden md:block'>Ver Turnos</span>
                        </Link>
                        <Link 
                            to="/dashboard/asignacion-turnos"
                            className={`flex justify-start items-center gap-3 sm:justify-center md:justify-start md:items-center md:gap-3 rounded-lg px-3 py-2 transition-colors ${
                                location.pathname === '/dashboard/asignacion-turnos' 
                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary' 
                                    : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => sidebarOpen && window.innerWidth < 640 && toggleSidebar()}
                        >
                            <span className='material-symbols-rounded'>assignment</span>
                            <span className='sm:hidden md:block'>Asignar Turnos</span>
                        </Link>
                        <Link 
                            to="/dashboard/usuarios"
                            className={`flex justify-start items-center gap-3 sm:justify-center md:justify-start md:items-center md:gap-3 rounded-lg px-3 py-2 transition-colors ${
                                location.pathname === '/dashboard/usuarios' 
                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary' 
                                    : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => sidebarOpen && window.innerWidth < 640 && toggleSidebar()}
                        >
                            <span className='material-symbols-rounded'>account_circle</span>
                            <span className='sm:hidden md:block'>Usuarios</span>
                        </Link>
                        <Link 
                            to="/dashboard/servicios"
                            className={`flex justify-start items-center gap-3 sm:justify-center md:justify-start md:items-center md:gap-3 rounded-lg px-3 py-2 transition-colors ${
                                location.pathname === '/dashboard/servicios' 
                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary' 
                                    : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => sidebarOpen && window.innerWidth < 640 && toggleSidebar()}
                        >
                            <span className='material-symbols-rounded'>home_repair_service</span>
                            <span className='sm:hidden md:block'>Servicios</span>
                        </Link>
                        <Link 
                            to="/dashboard/pacientes"
                            className={`flex justify-start items-center gap-3 sm:justify-center md:justify-start md:items-center md:gap-3 rounded-lg px-3 py-2 transition-colors ${
                                location.pathname === '/dashboard/pacientes' 
                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary' 
                                    : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => sidebarOpen && window.innerWidth < 640 && toggleSidebar()}
                        >
                            <span className='material-symbols-rounded'>group</span>
                            <span className='sm:hidden md:block'>Pacientes</span>
                        </Link>
                        <Link 
                            to="/dashboard/configuracion"
                            className={`flex justify-start items-center gap-3 sm:justify-center md:justify-start md:items-center md:gap-3 rounded-lg px-3 py-2 transition-colors ${
                                location.pathname === '/dashboard/configuracion' 
                                    ? 'bg-primary/20 dark:bg-primary/30 text-primary' 
                                    : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            onClick={() => sidebarOpen && window.innerWidth < 640 && toggleSidebar()}
                        >
                            <span className='material-symbols-rounded'>settings</span>
                            <span className='sm:hidden md:block'>Configuración</span>
                        </Link>
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;