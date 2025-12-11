/* Tipos para Mi Puesto */

export interface MiPuesto {
	id: number;
	usuario_id: number;
	nombre_usuario: string;
	cubiculo_id: number;
	nombre_cubiculo: string;
	sede_id: number;
	nombre_sede: string;
	estado: boolean;
	fecha_ingreso: string;
	fecha_salida?: string;
}

export interface pausasAtencion {
	id: number;
	id_atencion: number;
	pausa_id: number;
	nombre_pausa: string;
	hora_inicio: string;
	hora_fin?: string;
	observaciones?: string;
	created_at: string;
	updated_at: string;
}

export interface CubiculoDisponible {
	id: number;
	nombre: string;
	disponible: boolean;
	ocupado_por?: string;
}

export interface CambiarEstadoTurnoData {
	turno_id: string;
	estado: "atendiendo" | "finalizado" | "cancelado";
	observaciones?: string;
}
