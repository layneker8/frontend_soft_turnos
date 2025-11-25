interface permission {
	id: number;
	nombre: string;
	descripcion?: string;
}

export interface FullRoles {
	id: number;
	nombre_rol: string;
	descripcion?: string;
	permissions: permission[];
	totalPermissions?: number;
	created_at?: string;
}

export interface CreateRolData {
	nombre_rol: string;
	descripcion?: string;
	permissions: string[];
}
export interface UpdateRolData {
	id: number;
	nombre_rol: string;
	descripcion?: string;
	permissions: string[];
}
