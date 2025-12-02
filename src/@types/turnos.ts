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

// Tipos para eventos de Socket.IO
export interface SocketEvents {
	"turno:actualizado": (turno: Turno) => void;
	"estado:inicial": (data: { turnos: Turno[] }) => void;
	"solicitar:actualizacion": () => void;
}
