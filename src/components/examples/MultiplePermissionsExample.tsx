import React from "react";
import {
	// ProtectedComponent,
	ProtectedAllPermissions,
	ProtectedAnyPermission,
	ProtectedComplex,
} from "@/components/common/ProtectedComponent";
import { usePermissions } from "@/hooks/usePermissions";
import { ALL_PERMISSIONS } from "@/constants/permissions";

/**
 * Ejemplo completo de uso de múltiples permisos
 * Demuestra todos los tipos de verificación disponibles
 */
const MultiplePermissionsExample: React.FC = () => {
	const { hasAllPermissions, hasAnyPermission, checkComplexPermissions } =
		usePermissions();

	// Ejemplos de verificación programática
	const handleAdvancedAction = async () => {
		// Verificar que tenga TODOS los permisos requeridos
		const canPerformAction = await hasAllPermissions([
			ALL_PERMISSIONS.USUARIOS.MANAGE,
			ALL_PERMISSIONS.ADMIN.MANAGE,
		]);

		if (!canPerformAction) {
			alert(
				"Necesitas permisos de edición, eliminación y administración de usuarios"
			);
			return;
		}

		console.log("Ejecutando acción avanzada...");
	};

	const handleFlexibleAction = async () => {
		// Verificar que tenga AL MENOS UNO de los permisos
		const canAccess = await hasAnyPermission([
			ALL_PERMISSIONS.USUARIOS.MANAGE,
			ALL_PERMISSIONS.USUARIOS.UPDATE,
			ALL_PERMISSIONS.USUARIOS.READ,
		]);

		if (!canAccess) {
			alert("Necesitas al menos permisos básicos de usuarios");
			return;
		}

		console.log("Ejecutando acción flexible...");
	};

	const handleComplexAction = async () => {
		// Verificación compleja con lógica AND, OR, NOT
		const canAccess = await checkComplexPermissions({
			all: ["usuarios.view", "turnos.view"], // Debe tener ambos
			any: ["admin.panel", "supervisor.panel"], // Y al menos uno de estos
			not: ["usuario.limitado"], // Pero no este
		});

		if (!canAccess) {
			alert("No cumples con los requisitos complejos de permisos");
			return;
		}

		console.log("Ejecutando acción compleja...");
	};

	return (
		<div className="p-6 space-y-8">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				Ejemplos de Múltiples Permisos
			</h1>

			{/* 1. PERMISO SIMPLE - Solo un permiso */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-blue-600">1. Permiso Simple</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					Requiere solo:{" "}
					<code className="bg-gray-100 px-2 py-1 rounded">usuarios.view</code>
				</p>

				<ProtectedAnyPermission
					permissions={[ALL_PERMISSIONS.USUARIOS.READ, ALL_PERMISSIONS.USUARIOS.MANAGE]}
					fallback={
						<div className="bg-red-50 text-red-700 p-3 rounded">
							❌ No tienes permiso para ver usuarios
						</div>
					}
				>
					<div className="bg-green-50 text-green-700 p-3 rounded">
						✅ Puedes ver la lista de usuarios
					</div>
				</ProtectedAnyPermission>
			</section>

			{/* 2. TODOS LOS PERMISOS - AND Logic */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-purple-600">
					2. Todos los Permisos (AND)
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					Requiere: <code className="bg-gray-100 px-2 py-1 rounded">usuarios.edit</code> Y{" "}
					<code className="bg-gray-100 px-2 py-1 rounded">usuarios.delete</code>
				</p>

				<ProtectedAllPermissions
					permissions={[ALL_PERMISSIONS.USUARIOS.UPDATE, ALL_PERMISSIONS.USUARIOS.DELETE]}
					fallback={
						<div className="bg-red-50 text-red-700 p-3 rounded">
							❌ Necesitas AMBOS permisos: edición Y eliminación
						</div>
					}
				>
					<div className="bg-green-50 text-green-700 p-3 rounded flex items-center justify-between">
						<span>✅ Tienes permisos completos de gestión</span>
						<button
							onClick={handleAdvancedAction}
							className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
						>
							Acción Avanzada
						</button>
					</div>
				</ProtectedAllPermissions>
			</section>

			{/* 3. CUALQUIER PERMISO - OR Logic */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-orange-600">
					3. Cualquier Permiso (OR)
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					Requiere: <code className="bg-gray-100 px-2 py-1 rounded">usuarios.view</code> O{" "}
					<code className="bg-gray-100 px-2 py-1 rounded">usuarios.edit</code> O{" "}
					<code className="bg-gray-100 px-2 py-1 rounded">usuarios.readonly</code>
				</p>

				<ProtectedAnyPermission
					permissions={[
						ALL_PERMISSIONS.USUARIOS.READ,
						ALL_PERMISSIONS.USUARIOS.UPDATE,
						ALL_PERMISSIONS.USUARIOS.MANAGE,
					]}
					fallback={
						<div className="bg-red-50 text-red-700 p-3 rounded">
							❌ Necesitas al menos uno de los permisos de usuarios
						</div>
					}
				>
					<div className="bg-green-50 text-green-700 p-3 rounded flex items-center justify-between">
						<span>✅ Tienes acceso básico a usuarios</span>
						<button
							onClick={handleFlexibleAction}
							className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
						>
							Acción Flexible
						</button>
					</div>
				</ProtectedAnyPermission>
			</section>

			{/* 4. LÓGICA COMPLEJA - AND + OR + NOT */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-red-600">
					4. Lógica Compleja (AND + OR + NOT)
				</h2>
				<div className="text-gray-600 dark:text-gray-400 mb-4 space-y-2">
					<p>
						<strong>Debe tener:</strong>{" "}
						<code className="bg-gray-100 px-2 py-1 rounded">usuarios.view</code> Y{" "}
						<code className="bg-gray-100 px-2 py-1 rounded">turnos.view</code>
					</p>
					<p>
						<strong>Y al menos uno:</strong>{" "}
						<code className="bg-gray-100 px-2 py-1 rounded">admin.panel</code> O{" "}
						<code className="bg-gray-100 px-2 py-1 rounded">supervisor.panel</code>
					</p>
					<p>
						<strong>Pero NO:</strong>{" "}
						<code className="bg-gray-100 px-2 py-1 rounded">usuario.limitado</code>
					</p>
				</div>

				<ProtectedComplex
					config={{
						all: [ALL_PERMISSIONS.USUARIOS.READ, ALL_PERMISSIONS.USUARIOS.UPDATE],
						any: [ALL_PERMISSIONS.USUARIOS.MANAGE],
						not: [ALL_PERMISSIONS.TURNO.CANCEL],
					}}
					fallback={
						<div className="bg-red-50 text-red-700 p-3 rounded">
							❌ No cumples con los requisitos complejos de permisos
						</div>
					}
				>
					<div className="bg-green-50 text-green-700 p-3 rounded flex items-center justify-between">
						<span>✅ Tienes acceso al panel administrativo avanzado</span>
						<button
							onClick={handleComplexAction}
							className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
						>
							Acción Compleja
						</button>
					</div>
				</ProtectedComplex>
			</section>

			{/* 5. EJEMPLO DE SIDEBAR CON MÚLTIPLES PERMISOS */}
			<section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
				<h2 className="text-lg font-semibold mb-4 text-indigo-600">
					5. Ejemplo de Navegación
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					Ejemplos de cómo se configurarían elementos del sidebar:
				</p>

				<div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded">
					<div className="text-sm">
						<strong>📋 Asignar Turnos:</strong> Requiere <code>turnos.view</code> Y{" "}
						<code>turnos.assign</code>
					</div>
					<div className="text-sm">
						<strong>⚙️ Servicios:</strong> Requiere <code>servicios.view</code> O{" "}
						<code>servicios.manage</code>
					</div>
					<div className="text-sm">
						<strong>🔧 Configuración:</strong> Requiere <code>configuracion.view</code> pero
						NO <code>usuario.limitado</code>
					</div>
				</div>

				<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
					<p className="text-sm text-blue-700 dark:text-blue-300">
						💡 <strong>Tip:</strong> En tu sidebar actual, "Asignar Turnos" ahora requiere
						AMBOS permisos, mientras que "Servicios" se muestra si tienes CUALQUIERA de los
						permisos especificados.
					</p>
				</div>
			</section>
		</div>
	);
};

export default MultiplePermissionsExample;
