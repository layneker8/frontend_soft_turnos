import type { AsignacionesCubiculo } from "@/@types/cubiculos";
import { TURNO_PERMISSIONS } from "@/constants/permissions";
import { cubiculoService } from "@/services/cubiculoService";
import { useAuthStore, useToastStore } from "@/stores";
import { useCallback, useEffect, useState } from "react";
import { usePermissions } from "./usePermissions";

const useMipuesto = () => {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [puestoData, setPuestoData] = useState<AsignacionesCubiculo | null>(
		null
	);

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
	// const canCreate = hasAnyPermission([
	// 	TURNO_PERMISSIONS.CREATE,
	// ]);
	// const canUpdate = hasAnyPermission([TURNO_PERMISSIONS.UPDATE]);
	// const canFinish = hasAnyPermission([TURNO_PERMISSIONS.FINISH]);
	// const canCall = hasAnyPermission([TURNO_PERMISSIONS.CALL]);
	// const canCancel = hasAnyPermission([TURNO_PERMISSIONS.CANCEL]);

	const getCubiculosByUser = useCallback(
		async (idUser: number) => {
			if (!canRead) {
				setError("No tienes permisos para ver los datos del puesto.");
				return null;
			}
			try {
				setLoading(true);
				setError(null);

				const result = await cubiculoService.getAsignacionByUser(idUser);
				setPuestoData(result);
			} catch (err) {
				const parsedError = parseBackendError(err);
				setError(parsedError.message);
				setPuestoData(null);
				addToast({
					type: "error",
					title: "Error",
					message: parsedError.message,
				});
			} finally {
				setLoading(false);
			}
		},
		[canRead, parseBackendError, addToast]
	);

	useEffect(() => {
		if (puestoData === null && !loading && !permissionsLoading) {
			const authStore = useAuthStore.getState();
			if (authStore.isAuthenticated && authStore.user) {
				getCubiculosByUser(authStore.user.id);
			}
		}
	}, [puestoData, loading, permissionsLoading, getCubiculosByUser]);

	return {
		loading,
		saving,
		error,
	};
};

export default useMipuesto;
