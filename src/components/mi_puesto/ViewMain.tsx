import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { useMiPuestoAtencion } from "@/hooks/useMiPuestoAtencion";
import ViewMipuesto from "./ViewMipuesto";
import ViewCallTurnos from "./ViewCallTurnos";
import Loading from "../common/Loading";

export default function ViewMain() {
	const { user } = useAuthStore();
	const miPuestoAtencion = useMiPuestoAtencion();
	const { puestoActual, cargarPuestoActual, loading } = miPuestoAtencion;
	const [vistaCargada, setVistaCargada] = useState(false);

	useEffect(() => {
		if (user?.id) {
			const cargarDatos = async () => {
				await cargarPuestoActual(user.id);
				setVistaCargada(true);
			};
			cargarDatos();
		}
	}, [user, cargarPuestoActual]);

	const handlePuestoSeleccionado = () => {
		// Forzar recarga del puesto actual
		if (user?.id) {
			cargarPuestoActual(user.id);
		}
	};

	if (!vistaCargada || loading) {
		return <Loading />;
	}

	// Si no hay puesto seleccionado, mostrar vista de selección
	if (!puestoActual) {
		return <ViewMipuesto onPuestoSeleccionado={handlePuestoSeleccionado} />;
	}

	// Si hay puesto seleccionado, mostrar vista de atención
	return <ViewCallTurnos miPuestoAtencion={miPuestoAtencion} />;
}
