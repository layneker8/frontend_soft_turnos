import React, { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { ALL_PERMISSIONS } from "@/constants/permissions";

/**
 * Ejemplo de mejores prácticas de seguridad con permisos
 * Demuestra cuándo usar verificación básica vs crítica
 */
const SecurePermissionsExample: React.FC = () => {
	const {
		isAuthenticated,
		checkUserPermission,
		checkCriticalPermission,
		hasAllPermissions,
		hasAnyPermission,
		getUserPermissions,
		permissionsLoaded,
	} = usePermissions();

	const [criticalActionLoading, setCriticalActionLoading] = useState(false);
	const [lastCriticalCheck, setLastCriticalCheck] = useState<string>("");

	// ✅ EJEMPLO 1: Verificación básica para UI (desde caché)
	const canViewUsers = checkUserPermission(ALL_PERMISSIONS.USUARIOS.MANAGE);
	const canManageServices = hasAnyPermission([
		ALL_PERMISSIONS.SERVICIOS.CREATE,
		ALL_PERMISSIONS.SERVICIOS.MANAGE,
	]);
	const canFullUserManagement = hasAllPermissions([
		ALL_PERMISSIONS.USUARIOS.MANAGE,
	]);

	// ✅ EJEMPLO 2: Acción crítica con verificación del servidor
	const handleCriticalDelete = async () => {
		setCriticalActionLoading(true);

		try {
			// Para acciones críticas, SIEMPRE verificar en el servidor
			const canDelete = await checkCriticalPermission(
				ALL_PERMISSIONS.USUARIOS.DELETE
			);

			if (!canDelete) {
				alert("❌ Sin permisos para eliminar usuarios (verificado en servidor)");
				setLastCriticalCheck("❌ Denegado por servidor");
				return;
			}

			// Solo proceder si el servidor confirma el permiso
			setLastCriticalCheck("✅ Permitido por servidor");
			alert("✅ Acción crítica autorizada - procediendo...");

			// Aquí iría la lógica real de eliminación
			console.log("Ejecutando eliminación de usuario...");
		} catch (error) {
			console.error("Error en verificación crítica:", error);
			alert("❌ Error de conexión - acción cancelada");
			setLastCriticalCheck("❌ Error de conexión");
		} finally {
			setCriticalActionLoading(false);
		}
	};

	return (
		<div className="p-6 space-y-8">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				🔒 Ejemplos de Seguridad en Permisos
			</h1>

			{/* Estado del sistema */}
			<section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
				<h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">
					📊 Estado del Sistema de Permisos
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
					<div className="bg-white dark:bg-gray-800 p-3 rounded">
						<div className="font-semibold">Autenticado</div>
						<div className={isAuthenticated ? "text-green-600" : "text-red-600"}>
							{isAuthenticated ? "✅ Sí" : "❌ No"}
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 p-3 rounded">
						<div className="font-semibold">Permisos Cargados</div>
						<div className={permissionsLoaded ? "text-green-600" : "text-orange-600"}>
							{permissionsLoaded ? "✅ Sí" : "⏳ Cargando..."}
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 p-3 rounded">
						<div className="font-semibold">Total Permisos</div>
						<div className="text-blue-600">{getUserPermissions().length}</div>
					</div>
					<div className="bg-white dark:bg-gray-800 p-3 rounded">
						<div className="font-semibold">En localStorage</div>
						<div className="text-red-600">❌ No (Seguro)</div>
					</div>
				</div>
			</section>

			{/* Verificaciones básicas */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-green-600">
					✅ Verificaciones Básicas (Desde Caché)
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					Para elementos de UI, navegación, mostrar/ocultar componentes
				</p>

				<div className="space-y-4">
					<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
						<span>Ver Usuarios</span>
						<span className={canViewUsers ? "text-green-600" : "text-red-600"}>
							{canViewUsers ? "✅ Permitido" : "❌ Denegado"}
						</span>
					</div>

					<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
						<span>Gestión de Servicios (cualquier permiso)</span>
						<span className={canManageServices ? "text-green-600" : "text-red-600"}>
							{canManageServices ? "✅ Permitido" : "❌ Denegado"}
						</span>
					</div>

					<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
						<span>Gestión Completa de Usuarios (todos los permisos)</span>
						<span className={canFullUserManagement ? "text-green-600" : "text-red-600"}>
							{canFullUserManagement ? "✅ Permitido" : "❌ Denegado"}
						</span>
					</div>
				</div>

				<div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
					<p className="text-sm text-green-700 dark:text-green-300">
						💡 <strong>Estas verificaciones son síncronas</strong> - ideales para
						mostrar/ocultar elementos de UI sin esperas
					</p>
				</div>
			</section>

			{/* Verificaciones críticas */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-red-600">
					🔒 Verificaciones Críticas (Consulta Servidor)
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					Para acciones sensibles como eliminación, modificación de configuraciones
					críticas
				</p>

				<div className="space-y-4">
					<div className="p-4 border-2 border-red-200 dark:border-red-800 rounded-lg">
						<h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
							⚠️ Acción Crítica: Eliminar Usuario
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Esta acción SIEMPRE verifica permisos en el servidor antes de proceder
						</p>

						<button
							onClick={handleCriticalDelete}
							disabled={criticalActionLoading}
							className={`px-4 py-2 rounded font-medium ${
								criticalActionLoading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-red-600 hover:bg-red-700 text-white"
							}`}
						>
							{criticalActionLoading ? "🔄 Verificando..." : "🗑️ Eliminar Usuario"}
						</button>

						{lastCriticalCheck && (
							<div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
								<strong>Última verificación:</strong> {lastCriticalCheck}
							</div>
						)}
					</div>
				</div>

				<div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
					<p className="text-sm text-red-700 dark:text-red-300">
						🛡️ <strong>Máxima seguridad:</strong> Cada vez que ejecutes esta acción, se
						consulta al servidor para confirmar permisos actualizados
					</p>
				</div>
			</section>

			{/* Lista de permisos críticos */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-orange-600">
					🎯 Permisos Críticos Configurados
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					Estos permisos SIEMPRE requieren verificación del servidor:
				</p>
			</section>

			{/* Todos los permisos del usuario */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
					📋 Tus Permisos Actuales
				</h2>

				<div className="max-h-40 overflow-y-auto">
					{getUserPermissions().length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
							{getUserPermissions().map((permission) => (
								<div
									key={permission}
									className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
								>
									<span className="text-green-600 mr-2">✓</span>
									<code>{permission}</code>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500 text-center py-4">
							No hay permisos cargados o no estás autenticado
						</p>
					)}
				</div>

				<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						💾 <strong>Almacenamiento:</strong> Estos permisos están solo en memoria (RAM),
						no en localStorage. Se recargan en cada sesión desde el servidor.
					</p>
				</div>
			</section>

			{/* Comparación de métodos */}
			<section className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
				<h2 className="text-lg font-semibold mb-4 text-yellow-700 dark:text-yellow-300">
					⚖️ Comparación de Métodos
				</h2>

				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-yellow-200 dark:border-yellow-800">
								<th className="text-left p-2">Aspecto</th>
								<th className="text-left p-2">Verificación Básica</th>
								<th className="text-left p-2">Verificación Crítica</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-yellow-100 dark:border-yellow-900">
								<td className="p-2 font-medium">Velocidad</td>
								<td className="p-2 text-green-600">⚡ Instantáneo</td>
								<td className="p-2 text-orange-600">🐌 ~100-500ms</td>
							</tr>
							<tr className="border-b border-yellow-100 dark:border-yellow-900">
								<td className="p-2 font-medium">Seguridad</td>
								<td className="p-2 text-yellow-600">⚠️ Básica (caché)</td>
								<td className="p-2 text-green-600">🛡️ Máxima (servidor)</td>
							</tr>
							<tr className="border-b border-yellow-100 dark:border-yellow-900">
								<td className="p-2 font-medium">Uso recomendado</td>
								<td className="p-2">UI, navegación, elementos visuales</td>
								<td className="p-2">Eliminación, modificación crítica</td>
							</tr>
							<tr>
								<td className="p-2 font-medium">Actualización</td>
								<td className="p-2 text-blue-600">📅 Cada 5 minutos</td>
								<td className="p-2 text-green-600">🔄 En tiempo real</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
};

export default SecurePermissionsExample;
