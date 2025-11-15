/* Tipos para usuarios completos */
export interface FullUser {
	id_usuario: number;
	documento: string;
	nombre_user: string;
	usuario_user: string;
	status_user: boolean;
	correo_user?: string;
	id_rol: number;
	rol: string;
	id_sede: number;
	sede: string;
	area_user?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface CreateUserData {
	documento: string;
	nombre_user: string;
	usuario_user: string;
	correo_user: string;
	area_user?: string | null;
	id_rol: number;
	id_sede: number;
	status_user: boolean;
}

export interface UpdateUserData {
	id_usuario: number;
	documento: string;
	nombre_user: string;
	usuario_user: string;
	correo_user: string;
	area_user?: string | null;
	id_rol: number;
	id_sede: number;
	status_user: boolean;
}
