export interface FullCliente {
	documento: string;
	nombre: string;
	telefono?: string;
	email: string;
}

export interface DataCitaPrevia {
	id_cita: number;
	id_paciente: number;
	servicio: string;
	fecha_asignacion: string;
	lugar_cita: string;
	especialista_documento: number;
	especialista_nombre?: string | null;
	estado_cita: string;
	cantidad_citas: number;
}
