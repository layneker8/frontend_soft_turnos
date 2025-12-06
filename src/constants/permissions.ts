// 🔐 Constantes de Permisos del Sistema

// Permisos de Usuarios
export const USER_PERMISSIONS = {
	CREATE: "usuarios.create",
	READ: "usuarios.read",
	UPDATE: "usuarios.update",
	DELETE: "usuarios.delete",
	MANAGE: "usuarios.manage",
};

// Permisos de Turnos
export const TURNO_PERMISSIONS = {
	CREATE: "turnos.create",
	READ: "turnos.read",
	UPDATE: "turnos.update",
	DELETE: "turnos.delete",
	ASSIGN: "turnos.assign",
	CALL: "turnos.call",
	FINISH: "turnos.finish",
	CANCEL: "turnos.cancel",
	MANAGE_QUEUE: "turnos.manage_queue",
};

// Permisos de Servicios
export const SERVICE_PERMISSIONS = {
	CREATE: "servicios.create",
	READ: "servicios.read",
	UPDATE: "servicios.update",
	DELETE: "servicios.delete",
	MANAGE: "servicios.manage",
	ASSIGN: "servicios.assign",
};

// Permisos de Cubículos
export const CUBICULO_PERMISSIONS = {
	CREATE: "cubiculos.create",
	ASSIGN: "cubiculos.assign",
	READ: "cubiculos.read",
	UPDATE: "cubiculos.update",
	DELETE: "cubiculos.delete",
	MANAGE: "cubiculos.manage",
};

// Permisos de Clientes
export const CLIENT_PERMISSIONS = {
	CREATE: "clientes.create",
	READ: "clientes.read",
	UPDATE: "clientes.update",
	DELETE: "clientes.delete",
	MANAGE: "clientes.manage",
};

// Permisos de Reportes
export const REPORT_PERMISSIONS = {
	VIEW: "reportes.view",
	GENERATE: "reportes.generate",
	EXPORT: "reportes.export",
	ADVANCED: "reportes.advanced",
};

// Permisos de Sistema/Administración
export const ADMIN_PERMISSIONS = {
	MANAGE: "admin.manage",
	SYSTEM_CONFIG: "admin.system_config",
	MANAGE_PERMISSIONS: "admin.manage_permissions",
	MANAGE_ROLES: "admin.manage_roles",
	VIEW_LOGS: "admin.view_logs",
	BACKUP: "admin.backup",
	FULL_ACCESS: "admin.full_access",
};

// Permisos de Sedes
export const SEDE_PERMISSIONS = {
	CREATE: "sedes.create",
	READ: "sedes.read",
	UPDATE: "sedes.update",
	DELETE: "sedes.delete",
	MANAGE: "sedes.manage",
};

export const PRIORIDADES_PERMISSIONS = {
	CREATE: "prioridad.create",
	READ: "prioridad.read",
	UPDATE: "prioridad.update",
	DELETE: "prioridad.delete",
	MANAGE: "prioridad.manage",
};

// Colección de todos los permisos para fácil acceso
export const ALL_PERMISSIONS = {
	USUARIOS: USER_PERMISSIONS,
	ADMIN: ADMIN_PERMISSIONS,
	SEDES: SEDE_PERMISSIONS,
	TURNO: TURNO_PERMISSIONS,
	SERVICIOS: SERVICE_PERMISSIONS,
	CUBICULOS: CUBICULO_PERMISSIONS,
	CLIENTES: CLIENT_PERMISSIONS,
	REPORT: REPORT_PERMISSIONS,
	PRIORIDAD: PRIORIDADES_PERMISSIONS,
};

export const ALL_PERMISSIONS_LIST: string[] = Object.values(
	ALL_PERMISSIONS
).flatMap((module) => Object.values(module));
