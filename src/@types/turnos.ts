/* Tipos para turnos */
export interface Turno {
	id: string;
	codigo_turno: string;
	cliente_id: number;
	servicio_id: number;
	sede_id: number;
	prioridad_id: number;
	fecha_creacion: string;
	estado: "esperando" | "llamado" | "atendiendo" | "finalizado" | "cancelado";
	observaciones?: string;
}
export interface CreateTurnoData {
	identificacion: string | number;
	nombre_cliente: string;
	telefono?: string;
	email?: string;
	servicio_id: number;
	prioridad_id: number;
	sede_id: number;
	observaciones?: string;
}

export interface LlamarTurnoData {
	cubiculo_id: number;
	sede_id: number;
}

export interface TurnoLlamado {
	id: string;
	codigo_turno: string;
	cliente_id: number;
	servicio_id: number;
	sede_id: number;
	cubiculo_id: number;
	usuario_id: number;
	estado: "esperando" | "llamado" | "atendiendo" | "finalizado" | "cancelado";
	prioridad_id: number;
	prioridad: string;
	fecha_creacion: string;
	fecha_llamado: string;
	fecha_atencion?: string;
	fecha_finalizado?: string;
	tiempo_espera?: number;
	tiempo_atencion?: number;
	observaciones?: string;
	calificacion?: number;
	cliente: {
		nombre: string;
		documento: string;
		telefono?: string;
		email?: string;
	};
	servicio: string;
	nombre_prioridad: string;
}

// Tipos para eventos de Socket.IO
export interface SocketEvents {
	"turno:actualizado": (turno: Turno) => void;
	"estado:inicial": (data: { turnos: Turno[] }) => void;
	"solicitar:actualizacion": () => void;
}
