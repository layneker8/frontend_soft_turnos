import type { DataCitaPrevia } from "./clientes";

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
	cita?: DataCitaPrevia;
}

export interface LlamarTurnoData {
	cubiculo_id: number;
	sede_id: number;
}

export interface DataTurnoCompleto {
	id: number;
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
	} | null;
	servicio: string;
	nombre_prioridad: string;
	is_cita: boolean;
	cita?: {
		cantidad_citas: number;
		especialista_documento: string;
		especialista_nombre: string;
		estado_cita: string;
		fecha_asignacion: string;
		id_cita: number;
		id_paciente: number;
		lugar_cita: string;
		servicio: string;
		turno_id: number;
	} | null;
}

export interface CambiarEstadoTurnoData {
	estado: "esperando" | "llamado" | "atendiendo" | "finalizado" | "cancelado";
}

export interface FinalizarData {
	turno_id: string;
	observaciones?: string;
}

export interface CancelarTurno {
	turno_id: number;
	motivo_id: number;
	observaciones?: string;
}

export interface UseTurnosRealtimeOptions {
	sedeId: number | null;
	autoConnect?: boolean;
}

export interface TurnoDisplayData {
	id: string | number;
	codigo_turno: string;
	cubiculo_id: number;
	nombre_cubiculo?: string;
	estado: "esperando" | "llamado" | "atendiendo" | "finalizado" | "cancelado";
}

// Tipos para eventos de Socket.IO
// Solo eventos personalizados, no incluir eventos reservados (connect, disconnect, etc.)
export interface TurnoSocketEvents {
	"estado:inicial": (data: TurnoDisplayData[]) => void;
	"turno:creado": (turno: TurnoDisplayData) => void;
	"turno:actualizado": (turno: TurnoDisplayData) => void;
	"turno:llamado": (turno: TurnoDisplayData) => void;
	"turno:rellamar": (turno: TurnoDisplayData) => void;
	"turno:atendiendo": (turno: TurnoDisplayData) => void;
	"turno:finalizado": (turno: TurnoDisplayData) => void;
	"turno:cancelado": (turno: TurnoDisplayData) => void;
}

// Eventos que el cliente puede emitir al servidor
export interface ClientToServerEvents {
	"join:sede": (sedeId: number) => void;
	"leave:sede": (sedeId: number) => void;
}
