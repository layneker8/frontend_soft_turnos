import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
	MiPuesto,
	// TurnoLlamado,
	AsignacionesCubiculo,
	pausasAtencion,
	TurnoLlamado,
} from "@/@types";
import env from "@/config/env";

interface MiPuestoState {
	puestoActual: MiPuesto | null;
	cubiculosDisponibles: AsignacionesCubiculo[];
	turnoActual: TurnoLlamado | null;
	estadoCubiculo: "ocupado" | "disponible" | "pausado" | "libre";
	tiempoTranscurrido: number;
	pausasActual: pausasAtencion[];

	// Actions
	setPuestoActual: (puesto: MiPuesto | null) => void;
	setCubiculosDisponibles: (cubiculos: AsignacionesCubiculo[]) => void;
	setTurnoActual: (turno: TurnoLlamado | null) => void;
	setEstadoCubiculo: (
		estado: "ocupado" | "disponible" | "pausado" | "libre"
	) => void;
	setTiempoTranscurrido: (tiempo: number) => void;
	setPausasActual: (pausas: pausasAtencion[]) => void;
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
				estadoCubiculo: "disponible",
				tiempoTranscurrido: 0,
				pausasActual: [],

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
				setPausasActual: (pausas) =>
					set({ pausasActual: pausas }, false, "setPausasActual"),
				resetTiempo: () => set({ tiempoTranscurrido: 0 }, false, "resetTiempo"),
				reset: () =>
					set({
						puestoActual: null,
						cubiculosDisponibles: [],
						// turnoActual: null,
						estadoCubiculo: "disponible",
						tiempoTranscurrido: 0,
						pausasActual: [],
					}),
			}),
			{
				name: "mi-puesto-store",
				partialize(state) {
					return {
						puestoActual1: state.puestoActual,
						turnoActual: state.turnoActual,
						estadoCubiculo: state.estadoCubiculo,
						tiempoTranscurrido: state.tiempoTranscurrido,
						pausasActual: state.pausasActual,
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
