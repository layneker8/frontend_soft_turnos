/* Tipos para Mi Puesto */

export interface MiPuesto {
	id: number;
	usuario_id: number;
	nombre_usuario: string;
	cubiculo_id: number;
	nombre_cubiculo: string;
	sede_id: number;
	nombre_sede: string;
	available: boolean;
	estado_cubiculo: "Ocupado" | "Disponible" | "Pausado" | "Finalizado";
	fecha_ingreso: string;
	fecha_salida?: string;
}

export interface pausaAtencion {
	id: number;
	atencion_id: number;
	pausa_id: number;
	nombre_pausa: string;
	fecha_pausa: string;
	hora_inicio: string;
	hora_fin?: string;
	observaciones?: string;
}

export interface CubiculoDisponible {
	id: number;
	nombre: string;
	disponible: boolean;
	ocupado_por?: string;
}

export interface MotivoPausa {
	id_pausa: number;
	nombre_pausa: string;
	tiempo_pausa: number; // en minutos
	tiempo_limite_pausa: number; // en minutos
}

export interface MotivoCancelacion {
	motivo_id: number;
	motivo: string;
}

export interface CrearPausaData {
	atencion_id: number;
	pausa_id: number;
	observaciones?: string;
}
