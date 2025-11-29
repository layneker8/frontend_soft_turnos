export interface AsignacionServicio {
	id: number;
	cubiculo_id: number;
	cubiculo_nombre: string;
	id_sede: number;
	nombre_sede: string;
	id_servicio: number;
	servicio_nombre: string;
	codigo_servicio: string;
	descripcion_servicio?: string;
	estado: boolean;
}

export interface CreateAsignacionServicioData {
	cubiculo_id: number;
	servicio_id: number;
}
