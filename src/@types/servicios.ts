export interface FullServicios {
	id: number;
	nombre: string;
	descripcion?: string;
	codigo_servicio: string;
	estado: boolean;
	created_at?: string;
}

export interface CreateServiciosData {
	nombre: string;
	descripcion?: string;
	codigo_servicio: string;
}

export interface UpdateServiciosData {
	nombre: string;
	descripcion?: string;
	codigo_servicio: string;
	estado: boolean;
}
