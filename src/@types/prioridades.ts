export interface FullPrioridad {
	id: number;
	nombre_prioridad: string;
	descripcion?: string;
	nivel_prioridad: number;
	estado: boolean;
	created_at?: string;
}

export interface CreatePrioridadData {
	nombre_prioridad: string;
	descripcion?: string;
	nivel_prioridad?: number;
}

export interface UpdatePrioridadData {
	id: number;
	nombre_prioridad: string;
	descripcion?: string;
	nivel_prioridad: number;
}
