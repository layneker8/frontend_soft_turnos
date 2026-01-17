import { useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useToastStore } from "@/stores/toastStore";
import { TURNO_PERMISSIONS } from "@/constants/permissions";
import type { CreateTurnoData, Turno } from "@/@types/turnos";
import { turnoService } from "@/services/turnosService";
import type { DataCitaPrevia, FullCliente } from "@/@types/clientes";
import { clientServices } from "@/services/clientServicies";

export const useTurnos = () => {
	const [loading, setLoading] = useState(false);
	// const [saving, setSaving] = useState(false);
	// const [error, setError] = useState<string | null>(null);

	const { hasAnyPermission, loading: permissionsLoading } = usePermissions();
	const { addToast } = useToastStore();

	const isRecord = (val: unknown): val is Record<string, unknown> =>
		val !== null && typeof val === "object";

	const parseBackendError = useCallback(
		(
			err: unknown
		): { message: string; fieldErrors?: Record<string, string> } => {
			let message = "Error en la operación";
			if (err instanceof Error && err.message) message = err.message;
			let fieldErrors: Record<string, string> | undefined;
			let payload: Record<string, unknown> | undefined;
			if (isRecord(err) && "payload" in err) {
				const maybePayload = (err as Record<string, unknown>)["payload"];
				if (isRecord(maybePayload))
					payload = maybePayload as Record<string, unknown>;
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

	const canRead = hasAnyPermission([TURNO_PERMISSIONS.READ]);
	const canCreate = hasAnyPermission([TURNO_PERMISSIONS.CREATE]);
	// const canUpdate = hasAnyPermission([TURNO_PERMISSIONS.UPDATE]);
	// const canDelete = hasAnyPermission([TURNO_PERMISSIONS.DELETE]);

	const createTurno = useCallback(
		async (
			data: CreateTurnoData
		): Promise<{
			ok: boolean;
			fieldErrors?: Record<string, string>;
			message?: string;
			data?: Turno;
		}> => {
			if (!canCreate) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message: "No puedes crear turnos",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setLoading(true);
			try {
				const created = await turnoService.create(data);

				return {
					ok: true,
					message: "Turno creado correctamente",
					data: created,
				};
			} catch (err) {
				const { message, fieldErrors } = parseBackendError(err);
				addToast({ type: "error", title: "Error", message });
				return { ok: false, message, fieldErrors };
			} finally {
				setLoading(false);
			}
		},
		[canCreate, addToast, parseBackendError]
	);

	const findClient = useCallback(
		async (
			identification: string
		): Promise<{
			ok: boolean;
			message?: string;
			paciente?: FullCliente;
		}> => {
			if (!canRead) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message:
						"No puedes ver información de clientes, por favor contacta al administrador",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setLoading(true);

			try {
				const clientData = await clientServices.findClientByIdentification(
					identification
				);
				return { ok: true, paciente: clientData};
			} catch (err) {
				const { message } = parseBackendError(err);
				return { ok: false, message };
			} finally {
				setLoading(false);
			}
		},
		[canRead, addToast, parseBackendError]
	);
	// BUscar cita previa en coneuroresultados
	const checkCitaPrevia = useCallback(
		async (
			identification: string
		): Promise<{ ok: boolean; message?: string; data?: DataCitaPrevia[] }> => {
			if (!canRead) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message:
						"No puedes ver información de clientes, por favor contacta al administrador",
				});
				return { ok: false, message: "Sin permisos" };
			}	
			setLoading(true);
			try {
				const citaData = await clientServices.checkCitaPrevia(identification);
				return { ok: true, data: citaData };
			} catch (err) {
				const { message } = parseBackendError(err);
				return { ok: false, message };
			} finally {
				setLoading(false);
			}
		},
		[canRead, addToast, parseBackendError]
	);
	// buscamos cliente en la base de datos local
	const findClientLocal = useCallback(
		async (
			identification: string
		): Promise<{ ok: boolean; message?: string; data?: FullCliente[] }> => {
			if (!canRead) {
				addToast({
					type: "error",
					title: "Sin permisos",
					message:
						"No puedes ver información de clientes, por favor contacta al administrador",
				});
				return { ok: false, message: "Sin permisos" };
			}
			setLoading(true);

			try {
				const clientData = await clientServices.findClientLocal(identification);
				return { ok: true, data: clientData };
			} catch (err) {
				const { message } = parseBackendError(err);
				return { ok: false, message };
			} finally {
				setLoading(false);
			}
		},
		[canRead, addToast, parseBackendError]
	);

	// const createCliente = useCallback(
	// 	async (
	// 		data: createClienteData
	// 	): Promise<{
	// 		ok: boolean;
	// 		fieldErrors?: Record<string, string>;
	// 		message?: string;
	// 		data?: FullCliente;
	// 	}> => {
	// 		if (!canCreate) {
	// 			addToast({
	// 				type: "error",
	// 				title: "Sin permisos",
	// 				message: "No puedes crear clientes",
	// 			});
	// 			return { ok: false, message: "Sin permisos" };
	// 		}
	// 		setLoading(true);
	// 		try {
	// 			const created = await clienteService.create(data);
	// 			return {
	// 				ok: true,
	// 				message: "Cliente creado correctamente",
	// 				data: created,
	// 			};
	// 		} catch (err) {
	// 			const { message, fieldErrors } = parseBackendError(err);
	// 			addToast({ type: "error", title: "Error", message });
	// 			return { ok: false, message, fieldErrors };
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	},
	// 	[canCreate, addToast, parseBackendError]
	// );

	return {
		// saving,
		createTurno,
		// error,
		loading,
		permissionsLoading,
		findClient,
		findClientLocal,
		checkCitaPrevia,
	};
};
