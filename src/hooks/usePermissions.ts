import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

/**
 * Hook para manejar permisos de usuario de manera eficiente y segura
 * Utiliza caché de permisos cargados al hacer login con revalidación automática
 */
export const usePermissions = () => {
	const {
		checkPermission,
		checkCriticalPermission,
		getUserPermissions,
		isAuthenticated,
		permissionsLoaded,
		loadUserPermissions,
	} = useAuthStore();

	const [loading, setLoading] = useState(false);

	// Cargar permisos si no están disponibles
	useEffect(() => {
		if (isAuthenticated && !permissionsLoaded) {
			setLoading(true);
			loadUserPermissions().finally(() => setLoading(false));
		}
	}, [isAuthenticated, permissionsLoaded, loadUserPermissions]);

	/**
	 * Verificar un permiso específico (síncrono, desde caché)
	 * Usar para elementos de UI, navegación, etc.
	 */
	const checkUserPermission = (permission: string): boolean => {
		return checkPermission(permission);
	};

	/**
	 * Verificar múltiples permisos al mismo tiempo (síncrono)
	 */
	const checkMultiplePermissions = (
		permissions: string[]
	): Record<string, boolean> => {
		const results: Record<string, boolean> = {};
		permissions.forEach((permission) => {
			results[permission] = checkUserPermission(permission);
		});
		return results;
	};

	/**
	 * Verificar que el usuario tenga TODOS los permisos especificados (AND)
	 */
	const hasAllPermissions = (permissions: string[]): boolean => {
		if (!isAuthenticated || permissions.length === 0) {
			return false;
		}

		const results = checkMultiplePermissions(permissions);
		return Object.values(results).every((hasPermission) => hasPermission === true);
	};

	/**
	 * Verificar que el usuario tenga AL MENOS UNO de los permisos especificados (OR)
	 */
	const hasAnyPermission = (permissions: string[]): boolean => {
		if (!isAuthenticated || permissions.length === 0) {
			return false;
		}

		const results = checkMultiplePermissions(permissions);
		return Object.values(results).some((hasPermission) => hasPermission === true);
	};

	/**
	 * Verificar permisos con lógica compleja (síncrono)
	 * @param config - Configuración de permisos con operadores AND/OR/NOT
	 */
	const checkComplexPermissions = (config: {
		all?: string[]; // Todos estos permisos (AND)
		any?: string[]; // Cualquiera de estos permisos (OR)
		not?: string[]; // No debe tener estos permisos
	}): boolean => {
		if (!isAuthenticated) {
			return false;
		}

		try {
			// Verificar que tenga TODOS los permisos requeridos
			if (config.all && config.all.length > 0) {
				const hasAll = hasAllPermissions(config.all);
				if (!hasAll) return false;
			}

			// Verificar que tenga AL MENOS UNO de los permisos opcionales
			if (config.any && config.any.length > 0) {
				const hasAny = hasAnyPermission(config.any);
				if (!hasAny) return false;
			}

			// Verificer que NO tenga permisos prohibidos
			if (config.not && config.not.length > 0) {
				const prohibitedResults = checkMultiplePermissions(config.not);
				const hasProhibited = Object.values(prohibitedResults).some(
					(hasPermission) => hasPermission === true
				);
				if (hasProhibited) return false;
			}

			return true;
		} catch (error) {
			console.error("Error verificando permisos complejos:", error);
			return false;
		}
	};

	/**
	 * Verificar permiso crítico en tiempo real (para acciones sensibles)
	 * Siempre consulta al servidor para máxima seguridad
	 */
	const checkCriticalPermissionSafe = async (
		permission: string
	): Promise<boolean> => {
		if (!isAuthenticated) {
			return false;
		}

		try {
			return await checkCriticalPermission(permission);
		} catch (error) {
			console.error("Error en verificación crítica:", error);
			return false;
		}
	};

	/**
	 * Verificar si el usuario tiene acceso a un módulo completo
	 * Verifica si tiene al menos un permiso del módulo (cualquier acción)
	 */
	const hasModuleAccess = (module: string): boolean => {
		if (!isAuthenticated) {
			return false;
		}

		// Obtener todos los permisos del usuario
		const allUserPermissions = getUserPermissions();

		// Buscar permisos que empiecen con el módulo
		const modulePermissions = allUserPermissions.filter((perm) =>
			perm.startsWith(`${module}.`)
		);

		// Si tiene al menos un permiso del módulo, tiene acceso
		return modulePermissions.length > 0;
	};

	return {
		// Verificaciones básicas (síncronas, desde caché)
		checkUserPermission,
		hasAllPermissions,
		hasAnyPermission,
		checkComplexPermissions,
		hasModuleAccess,
		// Verificaciones críticas (asíncronas, consultan servidor)
		checkCriticalPermission: checkCriticalPermissionSafe,

		// Estados
		loading,
		isAuthenticated,
		permissionsLoaded,

		// Utilidades
		getUserPermissions,
	};
};
