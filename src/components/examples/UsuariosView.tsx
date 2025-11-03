import React from "react";
import { usePermissions, PERMISSIONS } from "@/hooks/usePermissions";
import { ProtectedComponent } from "@/components/common/ProtectedComponent";

/**
 * Ejemplo de vista de usuarios que usa permisos granulares
 * Demuestra cómo mostrar/ocultar elementos según permisos específicos
 */
const UsuariosView: React.FC = () => {
	const { checkUserPermission, isLoading } = usePermissions();

	const handleCreateUser = async () => {
		// Verificar permiso antes de ejecutar acción
		const canCreate = await checkUserPermission(PERMISSIONS.USERS_CREATE);
		
		if (!canCreate) {
			alert("No tienes permisos para crear usuarios");
			return;
		}

		console.log("Creando usuario...");
		// Lógica para crear usuario
	};

	const handleDeleteUser = async (userId: string) => {
		// Verificar permiso antes de ejecutar acción crítica
		const canDelete = await checkUserPermission(PERMISSIONS.USERS_DELETE);
		
		if (!canDelete) {
			alert("No tienes permisos para eliminar usuarios");
			return;
		}

		console.log(`Eliminando usuario ${userId}...`);
		// Lógica para eliminar usuario
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-1/3"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Gestión de Usuarios
				</h1>
				
				{/* Botón de crear - solo visible con permisos */}
				<ProtectedComponent 
					permission={PERMISSIONS.USERS_CREATE}
					fallback={
						<div className="text-sm text-gray-500">
							No tienes permisos para crear usuarios
						</div>
					}
				>
					<button
						onClick={handleCreateUser}
						className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
					>
						<span className="material-symbols-rounded text-sm">add</span>
						Crear Usuario
					</button>
				</ProtectedComponent>
			</div>

			{/* Lista de usuarios - solo visible con permisos de vista */}
			<ProtectedComponent 
				permission={PERMISSIONS.USERS_VIEW}
				fallback={
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
						<div className="flex items-center gap-2 text-red-800 dark:text-red-200">
							<span className="material-symbols-rounded">block</span>
							<span>No tienes permisos para ver la lista de usuarios</span>
						</div>
					</div>
				}
			>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							Lista de Usuarios
						</h2>
					</div>
					
					<div className="divide-y divide-gray-200 dark:divide-gray-700">
						{/* Ejemplo de usuarios */}
						{[
							{ id: "1", name: "Juan Pérez", email: "juan@example.com", role: "Admin" },
							{ id: "2", name: "María García", email: "maria@example.com", role: "User" },
							{ id: "3", name: "Carlos López", email: "carlos@example.com", role: "Moderator" },
						].map((user) => (
							<div key={user.id} className="px-6 py-4 flex items-center justify-between">
								<div>
									<h3 className="text-sm font-medium text-gray-900 dark:text-white">
										{user.name}
									</h3>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{user.email} • {user.role}
									</p>
								</div>
								
								<div className="flex gap-2">
									{/* Botón editar - solo visible con permisos */}
									<ProtectedComponent permission={PERMISSIONS.USERS_EDIT}>
										<button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1">
											<span className="material-symbols-rounded text-sm">edit</span>
										</button>
									</ProtectedComponent>
									
									{/* Botón eliminar - solo visible con permisos */}
									<ProtectedComponent permission={PERMISSIONS.USERS_DELETE}>
										<button 
											onClick={() => handleDeleteUser(user.id)}
											className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
										>
											<span className="material-symbols-rounded text-sm">delete</span>
										</button>
									</ProtectedComponent>
								</div>
							</div>
						))}
					</div>
				</div>
			</ProtectedComponent>

			{/* Sección de configuración avanzada - solo para super admins */}
			<ProtectedComponent permission="usuarios.admin">
				<div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
					<h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
						Configuración Avanzada
					</h3>
					<p className="text-yellow-700 dark:text-yellow-300 text-sm">
						Esta sección solo es visible para administradores con permisos avanzados.
					</p>
					<div className="mt-3 flex gap-2">
						<button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
							Exportar Usuarios
						</button>
						<button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
							Configurar Roles
						</button>
					</div>
				</div>
			</ProtectedComponent>
		</div>
	);
};

export default UsuariosView;