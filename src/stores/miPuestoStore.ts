import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
	MiPuesto,
	// TurnoLlamado,
	AsignacionesCubiculo,
	pausaAtencion,
	TurnoLlamado,
} from "@/@types";
import env from "@/config/env";

interface MiPuestoState {
	puestoActual: MiPuesto | null;
	cubiculosDisponibles: AsignacionesCubiculo[];
	turnoActual: TurnoLlamado | null;
	estadoCubiculo: "Ocupado" | "Disponible" | "Pausado" | "Finalizado";
	tiempoTranscurrido: number;
	pausaActual: pausaAtencion | null;

	// Actions
	setPuestoActual: (puesto: MiPuesto | null) => void;
	setCubiculosDisponibles: (cubiculos: AsignacionesCubiculo[]) => void;
	setTurnoActual: (turno: TurnoLlamado | null) => void;
	setEstadoCubiculo: (
		estado: "Ocupado" | "Disponible" | "Pausado" | "Finalizado"
	) => void;
	setTiempoTranscurrido: (tiempo: number) => void;
	setPausaActual: (pausas: pausaAtencion | null) => void;
	resetTiempo: () => void;
	reset: () => void;
}

export const useMiPuestoStore = create<MiPuestoState>()(
	devtools(
		persist(
			(set) => ({
				puestoActual: null,
				cubiculosDisponibles: [],
				turnoActual: null,
				estadoCubiculo: "Disponible",
				tiempoTranscurrido: 0,
				pausaActual: null,

				setPuestoActual: (puesto) =>
					set({ puestoActual: puesto }, false, "setPuestoActual"),
				setCubiculosDisponibles: (cubiculos) =>
					set(
						{ cubiculosDisponibles: cubiculos },
						false,
						"setCubiculosDisponibles"
					),
				setTurnoActual: (turno) =>
					set({ turnoActual: turno }, false, "setTurnoActual"),
				setEstadoCubiculo: (estado) =>
					set({ estadoCubiculo: estado }, false, "setEstadoCubiculo"),
				setTiempoTranscurrido: (tiempo) =>
					set({ tiempoTranscurrido: tiempo }, false, "setTiempoTranscurrido"),
				setPausaActual: (pausas) =>
					set({ pausaActual: pausas }, false, "setPausaActual"),
				resetTiempo: () => set({ tiempoTranscurrido: 0 }, false, "resetTiempo"),
				reset: () =>
					set({
						puestoActual: null,
						cubiculosDisponibles: [],
						// turnoActual: null,
						estadoCubiculo: "Disponible",
						tiempoTranscurrido: 0,
						pausaActual: null,
					}),
			}),
			{
				name: "mi-puesto-store",
				partialize(state) {
					return {
						puestoActual: state.puestoActual,
						// turnoActual: state.turnoActual,
						estadoCubiculo: state.estadoCubiculo,
						tiempoTranscurrido: state.tiempoTranscurrido,
						pausaActual: state.pausaActual,
					};
				},
			}
		),
		{
			name: "mi-puesto-store",
			enabled: env.isDevelopment,
		}
	)
);
