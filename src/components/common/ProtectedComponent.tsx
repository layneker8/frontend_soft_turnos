import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
/**
 * Componente que se renderiza solo si el usuario tiene el permiso requerido
 */
interface ProtectedComponentProps {
	permission: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
	permission,
	children,
	fallback = null,
}) => {
	const { loading, checkUserPermission } = usePermissions();

	const hasPermission = checkUserPermission(permission);

	if (loading) {
		return (
			<div className="animate-pulse">
				<div className="h-4 bg-gray-200 rounded w-3/4"></div>
			</div>
		);
	}

	if (!hasPermission) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

/**
 * Componente que requiere TODOS los permisos especificados (AND)
 */
interface ProtectedAllPermissionsProps {
	permissions: string[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
	loadingComponent?: React.ReactNode;
}

export const ProtectedAllPermissions: React.FC<
	ProtectedAllPermissionsProps
> = ({ permissions, children, fallback = null, loadingComponent }) => {
	const { hasAllPermissions, loading, permissionsLoaded } = usePermissions();

	// Mostrar loading si los permisos aún no se han cargado
	if (loading || !permissionsLoaded) {
		return (
			<>
				{loadingComponent || (
					<div className="animate-pulse">
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
					</div>
				)}
			</>
		);
	}

	// Verificación síncrona (desde caché)
	const hasAccess = hasAllPermissions(permissions);

	if (!hasAccess) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

/**
 * Componente que requiere AL MENOS UNO de los permisos especificados (OR)
 */
interface ProtectedAnyPermissionProps {
	permissions: string[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
	loadingComponent?: React.ReactNode;
}

export const ProtectedAnyPermission: React.FC<ProtectedAnyPermissionProps> = ({
	permissions,
	children,
	fallback = null,
	loadingComponent,
}) => {
	const { hasAnyPermission } = usePermissions();
	const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const checkPermissions = async () => {
			setLoading(true);
			try {
				const result = await hasAnyPermission(permissions);
				setHasAccess(result);
			} catch (error) {
				console.error("Error verificando permisos múltiples:", error);
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		};

		checkPermissions();
	}, [permissions, hasAnyPermission]);

	if (loading) {
		return (
			<>
				{loadingComponent || (
					<div className="animate-pulse">
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
					</div>
				)}
			</>
		);
	}

	if (!hasAccess) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

/**
 * Componente con lógica compleja de permisos (AND, OR, NOT)
 */
interface ProtectedComplexProps {
	config: {
		all?: string[]; // Todos estos permisos (AND)
		any?: string[]; // Cualquiera de estos permisos (OR)
		not?: string[]; // No debe tener estos permisos
	};
	children: React.ReactNode;
	fallback?: React.ReactNode;
	loadingComponent?: React.ReactNode;
}

export const ProtectedComplex: React.FC<ProtectedComplexProps> = ({
	config,
	children,
	fallback = null,
	loadingComponent,
}) => {
	const { checkComplexPermissions } = usePermissions();
	const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const checkPermissions = async () => {
			setLoading(true);
			try {
				const result = await checkComplexPermissions(config);
				setHasAccess(result);
			} catch (error) {
				console.error("Error verificando permisos complejos:", error);
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		};

		checkPermissions();
	}, [config, checkComplexPermissions]);

	if (loading) {
		return (
			<>
				{loadingComponent || (
					<div className="animate-pulse">
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
					</div>
				)}
			</>
		);
	}

	if (!hasAccess) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};
