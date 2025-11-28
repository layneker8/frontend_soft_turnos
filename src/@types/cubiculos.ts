export interface FullCubiculo {
	id: number;
	nombre: string;
	estado: boolean;
	sede_id: number;
	nombre_sede?: string;
	created_at?: string;
}

export interface AsignacionesCubiculo {
	id: number;
	id_sede: number;
	nombre_sede: string;
	id_usuario: number;
	nombre_user: string;
	cubiculo_id: number;
	cubiculo_nombre: string;
	estado: boolean;
	created_at?: string;
}

export interface dataAsignacion {
	id_usuario: number;
	cubiculo_id: number;
}

export interface CreateCubiculoData {
	nombre: string;
	id_sede: number;
	estado: boolean;
}

export interface UpdateCubiculoData {
	id: number;
	nombre: string;
	id_sede: number;
	estado: boolean;
}
