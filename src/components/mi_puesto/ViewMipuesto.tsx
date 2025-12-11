import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { useMiPuestoAtencion } from "@/hooks/useMiPuestoAtencion";
import Loading from "../common/Loading";

interface Props {
	onPuestoSeleccionado: () => void;
}

export default function ViewMipuesto({ onPuestoSeleccionado }: Props) {
	const { user } = useAuthStore();
	const {
		cubiculosDisponibles,
		loading,
		cargarCubiculosDisponibles,
		seleccionarCubiculo,
	} = useMiPuestoAtencion();

	const [cubiculoSeleccionadoId, setCubiculoSeleccionadoId] = useState<
		number | null
	>(null);

	useEffect(() => {
		if (user?.id) {
			cargarCubiculosDisponibles(user.id);
		}
	}, [user, cargarCubiculosDisponibles]);

	const handleSeleccionarCubiculo = (cubiculo_id: number) => {
		setCubiculoSeleccionadoId(cubiculo_id);
	};

	const handleConfirmar = async () => {
		if (!cubiculoSeleccionadoId || !user?.id) return;

		const exito = await seleccionarCubiculo(cubiculoSeleccionadoId, user.id);
		if (exito) {
			onPuestoSeleccionado();
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="flex items-center justify-center min-h-[600px]">
			<div className="w-full max-w-4xl">
				<div className="text-center mb-10">
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
						Selecciona tu puesto de atención
					</h2>
					<p className="mt-2 text-base text-secondary">
						Elige un puesto disponible para comenzar a atender turnos.
					</p>
				</div>
				<div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{cubiculosDisponibles &&
							cubiculosDisponibles.map((cubiculo) => (
								<div
									key={cubiculo.id}
									onClick={() =>
										cubiculo.estado &&
										handleSeleccionarCubiculo(cubiculo.cubiculo_id)
									}
									className={`group rounded-xl border-2 p-5 text-center transition-all duration-300 ${
										cubiculoSeleccionadoId === cubiculo.cubiculo_id
											? "border-primary bg-primary/10"
											: cubiculo.estado
											? "border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 cursor-pointer hover:border-primary hover:bg-primary/5"
											: "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
									} ${cubiculoSeleccionadoId}`}
								>
									<div
										className={`flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full ${
											cubiculoSeleccionadoId === cubiculo.cubiculo_id
												? "bg-primary/20"
												: cubiculo.estado
												? "bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20"
												: "bg-gray-200 dark:bg-gray-700"
										}`}
									>
										<span
											className={`material-symbols-rounded text-4xl ${
												cubiculoSeleccionadoId === cubiculo.cubiculo_id
													? "text-primary"
													: cubiculo.estado
													? "text-secondary group-hover:text-primary"
													: "text-gray-400"
											}`}
										>
											meeting_room
										</span>
									</div>
									<h3
										className={`text-lg font-bold ${
											cubiculoSeleccionadoId === cubiculo.cubiculo_id
												? "text-gray-900 dark:text-white"
												: cubiculo.estado
												? "text-secondary group-hover:text-gray-900 dark:group-hover:text-white"
												: "text-gray-400"
										}`}
									>
										{cubiculo.cubiculo_nombre}
									</h3>
									{!cubiculo.estado && cubiculo.id_usuario && (
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											Ocupado por: {cubiculo.nombre_user}
										</p>
									)}
								</div>
							))}
					</div>
				</div>
				<div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
					<button
						onClick={handleConfirmar}
						disabled={!cubiculoSeleccionadoId || loading}
						className="w-full sm:w-auto flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white dark:text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span className="truncate">Confirmar Puesto</span>
					</button>
				</div>
			</div>
		</div>
	);
}
