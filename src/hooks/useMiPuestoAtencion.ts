import { useState, useEffect, useCallback } from "react";
import type { CancelarTurno, LlamarTurnoData } from "@/@types";
import { miPuestoService } from "@/services/miPuestoService";
import { useMiPuestoStore, useToastStore } from "@/stores";
import { cubiculoService } from "@/services/cubiculoService";
import { turnoService } from "@/services/turnosService";
import { TURNO_PERMISSIONS } from "@/constants/permissions";
import { usePermissions } from "./usePermissions";
import { postApiCone } from "@/services/api";

export const useMiPuestoAtencion = () => {
	const {
		puestoActual,
		cubiculosDisponibles,
		turnoActual,
		estadoCubiculo,
		tiempoTranscurrido,
		pausaActual,
		setPuestoActual,
		setCubiculosDisponibles,
		setTurnoActual,
		setEstadoCubiculo,
		setTiempoTranscurrido,
		setPausaActual,
	} = useMiPuestoStore();

	const [loading, setLoading] = useState(false);

	const { addToast } = useToastStore();
	const { hasAnyPermission } = usePermissions();

	// Helpers para extraer errores del backend sin usar any
	const isRecord = (val: unknown): val is Record<string, unknown> =>
		val !== null && typeof val === "object";

	const parseBackendError = useCallback(
		(
			err: unknown
		): {
			message: string;
			fieldErrors?: Record<string, string>;
		} => {
			let message = "Error en la operación";
			if (err instanceof Error && err.message) message = err.message;
			let fieldErrors: Record<string, string> | undefined;
			let payload: Record<string, unknown> | undefined;
			if (isRecord(err) && "payload" in err) {
				const maybePayload = (err as Record<string, unknown>)["payload"];
				if (isRecord(maybePayload)) {
					payload = maybePayload as Record<string, unknown>;
				}
			}
			if (payload) {
				if (Array.isArray(payload.details)) {
					for (const d of payload.details) {
						if (isRecord(d)) {
							const field = typeof d.field === "string" ? d.field : undefined;
							const msg = typeof d.message === "string" ? d.message : undefined;
							if (field && msg) {
								fieldErrors = fieldErrors || {};
								fieldErrors[field] = msg;
							}
						}
					}
				}
				if (isRecord(payload.errors)) {
					fieldErrors = fieldErrors || {};
					Object.entries(payload.errors as Record<string, unknown>).forEach(
						([k, v]) => {
							if (typeof v === "string") fieldErrors![k] = v;
						}
					);
				}
			}
			return { message, fieldErrors };
		},
		[]
	);

	// const canRead = hasAnyPermission([TURNO_PERMISSIONS.READ]);
	const canUpdate = hasAnyPermission([TURNO_PERMISSIONS.UPDATE]);
	const canFinish = hasAnyPermission([TURNO_PERMISSIONS.FINISH]);
	const canCall = hasAnyPermission([TURNO_PERMISSIONS.CALL]);
	const canCancel = hasAnyPermission([TURNO_PERMISSIONS.CANCEL]);

	// Timer para calcular tiempo transcurrido
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (
			turnoActual &&
			(turnoActual.estado === "llamado" || turnoActual.estado === "atendiendo")
		) {
			interval = setInterval(() => {
				const inicio =
					turnoActual.estado === "llamado"
						? new Date(turnoActual.fecha_llamado).getTime()
						: new Date(turnoActual.fecha_atencion!).getTime();
				const ahora = new Date().getTime();
				const segundos = Math.floor((ahora - inicio) / 1000);
				setTiempoTranscurrido(segundos);
			}, 1000);
		} else {
			setTiempoTranscurrido(0);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [turnoActual, setTiempoTranscurrido]);

	// Cargar cubículos Disponibles
	const cargarCubiculosDisponibles = useCallback(
		async (usuario_id: number) => {
			setLoading(true);
			try {
				const cubiculos = await cubiculoService.getCubiculosAsignacionByUser(
					usuario_id
				);
				setCubiculosDisponibles(cubiculos ? [...cubiculos] : []);
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message,
				});
			} finally {
				setLoading(false);
			}
		},
		[addToast, parseBackendError, setCubiculosDisponibles]
	);

	// Seleccionar cubículo
	const seleccionarCubiculo = useCallback(
		async (cubiculo_id: number, usuario_id: number): Promise<boolean> => {
			setLoading(true);
			try {
				const puesto = await miPuestoService.seleccionarCubiculo(
					cubiculo_id,
					usuario_id
				);
				setPuestoActual(puesto);
				setEstadoCubiculo("Disponible");
				addToast({
					type: "success",
					title: "Puesto seleccionado",
					message: `Has seleccionado el puesto: ${puesto.nombre_cubiculo}`,
				});
				return true;
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message || "No se pudo seleccionar el cubículo",
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[addToast, parseBackendError, setPuestoActual, setEstadoCubiculo]
	);

	const cargarPausasActual = useCallback(
		async (id_atencion: number) => {
			setLoading(true);
			try {
				const pausa = await miPuestoService.getPausaActual(id_atencion);
				if (pausa) {
					setPausaActual(pausa);
					setEstadoCubiculo("Pausado");
				}
			} catch (error) {
				console.error("Error cargando pausas actuales:", error);
			} finally {
				setLoading(false);
			}
		},
		[setPausaActual, setEstadoCubiculo]
	);

	// Cargar puesto actual
	const cargarPuestoActual = useCallback(
		async (usuario_id: number): Promise<void> => {
			setLoading(true);
			try {
				const puesto = await miPuestoService.getMiPuestoActual(usuario_id);
				setPuestoActual(puesto);
				if (puesto) {
					setEstadoCubiculo("Disponible");
				}
			} catch (error) {
				console.error("Error cargando puesto actual:", error);
				setPuestoActual(null);
			} finally {
				setLoading(false);
			}
		},
		[setPuestoActual, setEstadoCubiculo]
	);

	// Llamar turno
	const llamarTurno = useCallback(
		async (data: LlamarTurnoData): Promise<boolean> => {
			if (!puestoActual) return false;
			if (!canCall) {
				addToast({
					type: "error",
					title: "Error",
					message: "No tienes permisos para llamar turnos.",
				});
				return false;
			}
			setLoading(true);
			try {
				const turno = await turnoService.llamarTurno(data);
				await miPuestoService.cambiarEstadoCubiculo(puestoActual.id, "Ocupado");
				setTurnoActual(turno);
				setTiempoTranscurrido(0);
				setEstadoCubiculo("Ocupado");
				addToast({
					type: "success",
					title: "Turno llamado",
					message: `Turno ${turno.codigo_turno} ha sido llamado`,
				});
				return true;
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message || "No hay turnos Disponibles para llamar",
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[
			canCall,
			addToast,
			setTurnoActual,
			setEstadoCubiculo,
			setTiempoTranscurrido,
			parseBackendError,
			puestoActual,
		]
	);

	// Rellamar turno
	const rellamarTurno = useCallback(
		async (turno_id: string): Promise<boolean> => {
			if (!canCall) {
				addToast({
					type: "error",
					title: "Error",
					message: "No tienes permisos para llamar turnos.",
				});
				return false;
			}
			setLoading(true);
			try {
				const turno = await turnoService.rellamarTurno(turno_id);
				setTurnoActual(turno);
				addToast({
					type: "info",
					title: "Turno rellamado",
					message: `Turno ${turno.codigo_turno} ha sido llamado nuevamente`,
				});
				return true;
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message || "No se pudo volver a llamar el turno",
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[canCall, addToast, setTurnoActual, parseBackendError]
	);

	// Atender turno
	const atenderTurno = useCallback(async (): Promise<boolean> => {
		if (!turnoActual || !puestoActual) return false;
		if (!canUpdate) {
			addToast({
				type: "error",
				title: "Error",
				message: "No tienes permisos para atender turnos.",
			});
			return false;
		}

		setLoading(true);
		try {
			const turno = await turnoService.cambiarEstadoTurno(turnoActual.id, {
				estado: "atendiendo",
			});
			await miPuestoService.cambiarEstadoCubiculo(puestoActual.id, "Ocupado");
			setTurnoActual(turno);
			setTiempoTranscurrido(0);
			addToast({
				type: "success",
				title: "Turno en atención",
				message: `Atendiendo turno ${turno.codigo_turno}`,
			});
			return true;
		} catch (error) {
			const { message } = parseBackendError(error);
			addToast({
				type: "error",
				title: "Error",
				message: message || "No se pudo cambiar el estado del turno",
			});
			return false;
		} finally {
			setLoading(false);
		}
	}, [
		canUpdate,
		turnoActual,
		puestoActual,
		addToast,
		setTurnoActual,
		parseBackendError,
		setTiempoTranscurrido,
	]);

	// Finalizar turno
	const finalizarTurno = useCallback(
		async (observaciones?: string): Promise<boolean> => {
			if (!turnoActual || !puestoActual) return false;
			if (!canFinish) {
				addToast({
					type: "error",
					title: "Error",
					message: "No tienes permisos para finalizar turnos.",
				});
				return false;
			}

			setLoading(true);
			try {
				await turnoService.finalizarTurno({
					turno_id: turnoActual.id.toString(),
					observaciones,
				});
				await miPuestoService.cambiarEstadoCubiculo(
					puestoActual.id,
					"Disponible"
				);
				// actualizamos el estado en coneuroresultados siempre y cuando sea una cita
				if (turnoActual.is_cita) {
					await postApiCone("/updateEstadoCita", {
						servicio: turnoActual.cita?.servicio || "",
						estado: "Atendida",
						documento_especialista:
							turnoActual.cita?.especialista_documento || "",
						id_paciente: turnoActual.cita?.id_paciente || 0,
						fecha_cita: turnoActual.cita?.fecha_asignacion || "",
						cantidad_citas: turnoActual.cita?.cantidad_citas || 0,
						id_cita: turnoActual.cita?.id_cita || 0,
						old_estado: turnoActual.cita?.estado_cita || "",
					});
				}
				setTurnoActual(null);
				setEstadoCubiculo("Disponible");
				setTiempoTranscurrido(0);
				addToast({
					type: "success",
					title: "Turno finalizado",
					message: "El turno ha sido finalizado correctamente",
				});
				return true;
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message || "No se pudo finalizar el turno",
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[
			canFinish,
			turnoActual,
			puestoActual,
			addToast,
			parseBackendError,
			setTurnoActual,
			setEstadoCubiculo,
			setTiempoTranscurrido,
		]
	);

	// Cancelar turno
	const cancelarTurno = useCallback(
		async (data: CancelarTurno): Promise<boolean> => {
			if (!turnoActual || !puestoActual) return false;
			if (!canCancel) {
				addToast({
					type: "error",
					title: "Error",
					message: "No tienes permisos para cancelar turnos.",
				});
				return false;
			}

			setLoading(true);
			try {
				await turnoService.cancelarTurno(data);
				setTurnoActual(null);
				setEstadoCubiculo("Disponible");
				setTiempoTranscurrido(0);

				addToast({
					type: "info",
					title: "Turno cancelado",
					message: "El turno ha sido cancelado",
				});
				return true;
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message || "No se pudo cancelar el turno",
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[
			canCancel,
			turnoActual,
			puestoActual,
			addToast,
			setTurnoActual,
			setEstadoCubiculo,
			setTiempoTranscurrido,
			parseBackendError,
		]
	);

	// Pausar cubículo con motivo
	const pausarCubiculo = useCallback(
		async (motivoId: number, descripcion?: string): Promise<boolean> => {
			if (!puestoActual) return false;

			setLoading(true);
			try {
				const pausa = await miPuestoService.crearPausa({
					atencion_id: puestoActual.id,
					pausa_id: motivoId,
					observaciones: descripcion,
				});

				await miPuestoService.cambiarEstadoCubiculo(puestoActual.id, "Pausado");

				setPausaActual(pausa);
				setEstadoCubiculo("Pausado");
				addToast({
					type: "info",
					title: "Puesto Pausado",
					message: "Tu puesto ha sido Pausado",
				});
				return true;
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message || "No se pudo pausar el puesto",
				});
				return false;
			} finally {
				setLoading(false);
			}
		},
		[
			puestoActual,
			addToast,
			setEstadoCubiculo,
			setPausaActual,
			parseBackendError,
		]
	);

	// Reanudar cubículo
	const reanudarCubiculo = useCallback(async (): Promise<boolean> => {
		if (!puestoActual || !pausaActual) return false;

		setLoading(true);
		try {
			await miPuestoService.finalizarPausa(pausaActual.id);

			setPausaActual(null);
			setEstadoCubiculo("Disponible");
			addToast({
				type: "success",
				title: "Puesto reanudado",
				message: "Tu puesto está disponible nuevamente",
			});
			return true;
		} catch (error) {
			const { message } = parseBackendError(error);
			addToast({
				type: "error",
				title: "Error",
				message: message || "No se pudo reanudar el puesto",
			});
			return false;
		} finally {
			setLoading(false);
		}
	}, [
		puestoActual,
		addToast,
		setEstadoCubiculo,
		setPausaActual,
		pausaActual,
		parseBackendError,
	]);

	// Liberar cubículo
	const liberarCubiculo = useCallback(async (): Promise<boolean> => {
		if (!puestoActual) return false;

		setLoading(true);
		try {
			await miPuestoService.liberarCubiculo(puestoActual.id);
			setPuestoActual(null);
			setTurnoActual(null);
			setPausaActual(null);
			setEstadoCubiculo("Finalizado");
			addToast({
				type: "info",
				title: "Puesto liberado",
				message: "Has cerrado sesión del puesto",
			});
			return true;
		} catch (error) {
			const { message } = parseBackendError(error);
			addToast({
				type: "error",
				title: "Error",
				message: message || "No se pudo liberar el puesto",
			});
			return false;
		} finally {
			setLoading(false);
		}
	}, [
		puestoActual,
		addToast,
		parseBackendError,
		setPuestoActual,
		setTurnoActual,
		setPausaActual,
		setEstadoCubiculo,
	]);

	// Turnos en cola por sede
	const cargarTurnosEnColaPorSede = useCallback(
		async (sede_id: number | undefined) => {
			setLoading(true);
			if (!sede_id) {
				addToast({
					type: "error",
					title: "Error",
					message: "No se ha especificado una sede válida",
				});
				setLoading(false);
				return [];
			}
			try {
				const turnos = await turnoService.getTurnosEnCola(sede_id);
				return turnos;
			} catch (error) {
				const { message } = parseBackendError(error);
				addToast({
					type: "error",
					title: "Error",
					message: message,
				});
				return [];
			} finally {
				setLoading(false);
			}
		},
		[addToast, parseBackendError]
	);

	// Efecto para cargar el turno actual cuando cambia el puestoActual
	useEffect(() => {
		let isMounted = true;

		const cargarTurno = async () => {
			if (!puestoActual) return;
			setLoading(true);
			try {
				const turno = await miPuestoService.getTurnoActual(puestoActual.id);
				if (isMounted) {
					setTurnoActual(turno);
				}
			} catch (error) {
				console.error("Error cargando turno actual del puesto:", error);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		cargarTurno();

		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [puestoActual?.id]);

	return {
		// Estado
		puestoActual,
		pausaActual,
		cubiculosDisponibles,
		turnoActual,
		loading,
		estadoCubiculo,
		tiempoTranscurrido,

		// Acciones
		cargarCubiculosDisponibles,
		cargarPausasActual,
		seleccionarCubiculo,
		cargarPuestoActual,
		llamarTurno,
		rellamarTurno,
		atenderTurno,
		finalizarTurno,
		cancelarTurno,
		pausarCubiculo,
		reanudarCubiculo,
		liberarCubiculo,
		cargarTurnosEnColaPorSede,
	};
};
