import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import { usePermissions } from "@/hooks/usePermissions";
import { ALL_PERMISSIONS } from "@/constants/permissions";
import env from "@/config/env";

// Definir la estructura de elementos del sidebar
interface SidebarItem {
	label: string;
	path: string;
	icon: string;
	module: string; // Para verificar permisos
	// Opciones de permisos (usar solo una)
	requiredPermission?: string; // Un solo permiso
	requiredPermissions?: {
		// Múltiples permisos
		all?: string[]; // Todos requeridos (AND)
		any?: string[]; // Cualquiera requerido (OR)
		not?: string[]; // No debe tener estos
	};
}

const sidebarItems: SidebarItem[] = [
	{
		label: "Turnos",
		path: "/dashboard/turnos",
		icon: "schedule",
		module: "turnos",
		requiredPermission: "turnos.view",
	},
	{
		label: "Usuarios",
		path: "/dashboard/usuarios",
		icon: "account_circle",
		module: "usuarios",
		requiredPermissions: {
			any: [ALL_PERMISSIONS.USUARIOS.READ, ALL_PERMISSIONS.USUARIOS.MANAGE],
		},
	},
	{
		label: "Sedes",
		path: "/dashboard/sedes",
		icon: "location_city",
		module: "sedes",
		requiredPermissions: {
			any: [ALL_PERMISSIONS.SEDES.READ, ALL_PERMISSIONS.SEDES.MANAGE],
		},
	},
	{
		label: "Servicios",
		path: "/dashboard/servicios",
		icon: "home_repair_service",
		module: "servicios",
		requiredPermissions: {
			any: [ALL_PERMISSIONS.SERVICIOS.READ, ALL_PERMISSIONS.SERVICIOS.MANAGE],
		},
	},
	{
		label: "Prioridades",
		path: "/dashboard/prioridades",
		icon: "priority_high",
		module: "prioridades",
		requiredPermissions: {
			any: [ALL_PERMISSIONS.PRIORIDAD.READ, ALL_PERMISSIONS.PRIORIDAD.MANAGE],
		},
	},
	{
		label: "Cubículos",
		path: "/dashboard/cubiculos",
		icon: "meeting_room",
		module: "cubiculos",
		requiredPermissions: {
			any: [ALL_PERMISSIONS.CUBICULOS.READ, ALL_PERMISSIONS.CUBICULOS.MANAGE],
		},
	},
	// {
	// 	label: "Pacientes",
	// 	path: "/dashboard/pacientes",
	// 	icon: "group",
	// 	module: "pacientes",
	// 	requiredPermissions: {
	// 		any: [ALL_PERMISSIONS.CLIENTES.READ, ALL_PERMISSIONS.CLIENTES.MANAGE],
	// 	},
	// },
	{
		label: "Roles",
		path: "/dashboard/roles",
		icon: "security",
		module: "roles",
		requiredPermissions: {
			all: [ALL_PERMISSIONS.ADMIN.MANAGE],
			any: [ALL_PERMISSIONS.ADMIN.MANAGE_ROLES],
		},
	},
	{
		label: "Crear Turnos",
		path: "/create-turnos",
		icon: "assignment",
		module: "turnos",
		requiredPermissions: {
			any: [ALL_PERMISSIONS.TURNO.CREATE],
		},
	},
	{
		label: "Mi puesto",
		path: "/dashboard/mi-puesto",
		icon: "person_pin",
		module: "turnos",
		requiredPermissions: {
			all: [
				ALL_PERMISSIONS.TURNO.CALL,
				ALL_PERMISSIONS.TURNO.FINISH,
				ALL_PERMISSIONS.TURNO.CANCEL,
				ALL_PERMISSIONS.TURNO.UPDATE,
			],
		},
	},
	// {
	// 	label: "Historial de Turnos",
	// 	path: "/dashboard/historial-turnos",
	// 	icon: "history",
	// 	module: "turnos",
	// 	requiredPermissions: {
	// 		all: [
	// 			ALL_PERMISSIONS.TURNO.CALL,
	// 			ALL_PERMISSIONS.TURNO.FINISH,
	// 			ALL_PERMISSIONS.TURNO.CANCEL,
	// 			ALL_PERMISSIONS.TURNO.UPDATE,
	// 		],
	// 	},
	// },
];

// Componente para renderizar un elemento del sidebar
const SidebarLink: React.FC<{
	open: boolean;
	item: SidebarItem;
	isActive: boolean;
	onClick: () => void;
}> = ({ open, item, isActive, onClick }) => {
	const { checkUserPermission, checkComplexPermissions } = usePermissions();
	const [hasPermission, setHasPermission] = React.useState<boolean | null>(
		null
	);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const checkPermission = async () => {
			setLoading(true);
			try {
				let result = false;

				if (item.requiredPermissions) {
					// Usar verificación compleja si se especifican múltiples permisos
					result = await checkComplexPermissions(item.requiredPermissions);
				} else {
					// Usar verificación simple si solo hay un permiso
					const permission = item.requiredPermission || `${item.module}.read`;
					result = await checkUserPermission(permission);
				}

				setHasPermission(result);
			} catch (error) {
				console.error(`Error verificando permisos para ${item.label}:`, error);
				setHasPermission(false);
			} finally {
				setLoading(false);
			}
		};

		checkPermission();
	}, [item, checkUserPermission, checkComplexPermissions]);

	// No mostrar mientras carga
	if (loading) {
		return (
			<div
				className={`flex items-center gap-3 rounded-lg px-3 py-2 animate-pulse ${
					open ? "justify-start" : "md:justify-center"
				}`}
			>
				<div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
				{open && (
					<div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
				)}
			</div>
		);
	}

	// No mostrar si no tiene permisos
	if (!hasPermission) {
		return null;
	}

	return (
		<Link
			to={item.path}
			className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
				open ? "justify-start" : "md:justify-center"
			} ${
				isActive
					? "bg-primary/20 dark:bg-primary/30 text-primary"
					: "text-secondary hover:bg-slate-100 dark:hover:bg-slate-800"
			}`}
			title={!open ? item.label : ""}
			onClick={onClick}
		>
			<span className="material-symbols-rounded">{item.icon}</span>
			{open && <span className="whitespace-nowrap">{item.label}</span>}
		</Link>
	);
};

const Sidebar: React.FC = () => {
	const { sidebarOpen, toggleSidebar } = useAppStore();
	const location = useLocation();

	return (
		<>
			{/* Overlay para móvil */}
			<div
				className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden ${
					sidebarOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={toggleSidebar}
			/>
			<aside
				className={`
                    fixed top-0 left-0 h-screen bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 p-4
                    transition-all duration-300 ease-in-out overflow-y-auto
                    z-50 md:z-40
                    ${
											/* En móvil: mostrar/ocultar completamente */
											sidebarOpen
												? "translate-x-0 w-64"
												: "-translate-x-full md:translate-x-0"
										}
                    ${
											/* En desktop (md+): contraer/expandir */
											sidebarOpen ? "md:w-64" : "md:w-20"
										}
                `}
			>
				<div className="mb-3 h-[60px] w-auto flex items-center justify-between md:justify-center">
					{/* imagen de iturno */}
					<img
						src={`${env.PUBLIC_URL}/images/${
							sidebarOpen ? "iturno-logo" : "iturno-logo-small"
						}.png`}
						alt="iTurno Logo"
						className={`h-10 transition-opacity duration-300 opacity-100`}
					/>
					{/* Botón cerrar solo en móvil */}
					<button
						className="md:hidden p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
						onClick={toggleSidebar}
						aria-label="Cerrar menú"
					>
						<span className="material-symbols-rounded">close</span>
					</button>
				</div>
				<div className="flex flex-col gap-8">
					<nav className="flex flex-col gap-2">
						{/* Enlace al Dashboard principal - siempre visible */}
						<Link
							to="/dashboard"
							className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
								sidebarOpen ? "justify-start" : "md:justify-center"
							} ${
								location.pathname === "/dashboard"
									? "bg-primary/20 dark:bg-primary/30 text-primary"
									: "text-secondary hover:bg-slate-100 dark:hover:bg-slate-800"
							}`}
							title={!sidebarOpen ? "Dashboard" : ""}
							onClick={() =>
								sidebarOpen && window.innerWidth < 768 && toggleSidebar()
							}
						>
							<span className="material-symbols-rounded">dashboard</span>
							{sidebarOpen && (
								<span className="whitespace-nowrap">Dashboard</span>
							)}
						</Link>

						{/* Enlaces con permisos dinámicos */}
						{sidebarItems.map((item) => (
							<SidebarLink
								open={sidebarOpen}
								key={item.path}
								item={item}
								isActive={location.pathname === item.path}
								onClick={() =>
									sidebarOpen && window.innerWidth < 768 && toggleSidebar()
								}
							/>
						))}
					</nav>
				</div>
			</aside>
		</>
	);
};

export default Sidebar;
