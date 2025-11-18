export interface FullCubiculo {
	id: number;
	nombre: string;
	estado: boolean;
	sede_id: number;
	nombre_sede?: string;
	created_at?: string;
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
