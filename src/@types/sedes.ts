export interface FullSede {
	id_sede: number;
	nombre_sede: string;
	direccion: string;
	estado_sede: boolean;
	created_at?: string;
}

export interface CreateSedeData {
	nombre_sede: string;
	direccion?: string;
	estado_sede?: boolean;
}

export interface UpdateSedeData {
	id_sede: number;
	nombre_sede: string;
	direccion?: string;
	estado_sede: boolean;
}
