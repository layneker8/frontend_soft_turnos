import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { useMiPuestoAtencion } from "@/hooks/useMiPuestoAtencion";
import Button from "../common/Button";

export default function ViewCallTurnos() {
	const { user } = useAuthStore();
	const {
		puestoActual,
		turnoActual,
		estadoCubiculo,
		tiempoTranscurrido,
		llamarTurno,
		rellamarTurno,
		finalizarTurno,
		cancelarTurno,
		pausarCubiculo,
		reanudarCubiculo,
		cargarPausasActual,
	} = useMiPuestoAtencion();

	const [horaActual, setHoraActual] = useState("");

	// Actualizar hora cada segundo
	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			let hours = now.getHours();
			const minutes = now.getMinutes();
			const ampm = hours >= 12 ? "PM" : "AM";
			hours = hours % 12;
			hours = hours ? hours : 12;
			const minutesStr = minutes < 10 ? "0" + minutes : minutes;
			setHoraActual(`${hours}:${minutesStr} ${ampm}`);
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
	}, []);

	// Cuando se carga el componente, cargar pausas actuales
	useEffect(() => {
		if (puestoActual?.id) {
			cargarPausasActual(puestoActual.id);
		}
	}, [puestoActual?.id, cargarPausasActual]);

	// Formatear tiempo transcurrido en MM:SS
	const formatearTiempo = (segundos: number): string => {
		const mins = Math.floor(segundos / 60);
		const secs = segundos % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const handleLlamarTurno = async () => {
		if (!puestoActual || !user?.id_sede) return;

		await llamarTurno({
			cubiculo_id: puestoActual.cubiculo_id,
			sede_id: user.id_sede,
		});
	};

	const handleRellamarTurno = async () => {
		if (!turnoActual) return;
		await rellamarTurno(turnoActual.id);
	};

	const handleCancelarTurno = async () => {
		await cancelarTurno("Turno cancelado por el usuario");
	};

	const handleFinalizarTurno = async () => {
		await finalizarTurno();
	};

	const handlePausarReanudar = async () => {
		if (estadoCubiculo) {
			await reanudarCubiculo();
		} else {
			await pausarCubiculo();
		}
	};

	const getEstadoColor = () => {
		switch (estadoCubiculo) {
			case "disponible":
				return {
					ping: "bg-green-400",
					dot: "bg-green-500",
					text: "text-green-600 dark:text-green-400",
				};
			case "pausado":
				return {
					ping: "bg-yellow-400",
					dot: "bg-yellow-500",
					text: "text-yellow-600 dark:text-yellow-400",
				};
			case "ocupado":
				return {
					ping: "bg-red-400",
					dot: "bg-red-500",
					text: "text-red-600 dark:text-red-400",
				};
			case "libre":
				return {
					ping: "bg-blue-400",
					dot: "bg-blue-500",
					text: "text-blue-600 dark:text-blue-400",
				};
			default:
				return {
					ping: "bg-gray-400",
					dot: "bg-gray-500",
					text: "text-gray-600 dark:text-gray-400",
				};
		}
	};

	const getEstadoTexto = () => {
		switch (estadoCubiculo) {
			case "disponible":
				return "Disponible";
			case "pausado":
				return "Pausado";
			case "ocupado":
				return "Ocupado";
			case "libre":
				return "Libre";
			default:
				return "Desconocido";
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:h-full xl:min-h-[650px]">
			<div className="lg:col-span-2 bg-white dark:bg-dark rounded-xl border border-black/10 dark:border-dark shadow-sm p-6 flex flex-col items-center justify-center relative">
				{/* Vista principal antes de llamar turno */}
				{!turnoActual && (
					<div className="w-full max-w-lg mx-auto flex flex-col gap-6">
						{/* boton de cerrar cubiculo */}
						<div className="absolute top-6 right-6">
							<Button variant="outline-secondary" className="flex gap-2">
								<span className="material-symbols-rounded text-2xl">
									exit_to_app
								</span>
								Cerrar Cubículo
							</Button>
						</div>
						<div className="text-center mb-6">
							<h3 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
								Puesto de Atención: {puestoActual?.nombre_cubiculo || "-"}
							</h3>
							<div className="flex items-center justify-center gap-2 mb-4">
								<p className="text-xl text-text-muted-light dark:text-text-muted-dark mr-4">
									Estado actual
								</p>
								<div className="flex items-center gap-2">
									<span className="relative flex h-3 w-3">
										<span
											className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
												getEstadoColor().ping
											} opacity-75`}
										></span>
										<span
											className={`relative inline-flex rounded-full h-3 w-3 ${
												getEstadoColor().dot
											}`}
										></span>
									</span>
									<span
										className={`font-bold ${getEstadoColor().text} text-xl`}
									>
										{getEstadoTexto()}
									</span>
								</div>
							</div>
						</div>
						<button
							onClick={handleLlamarTurno}
							disabled={estadoCubiculo !== "disponible"}
							className="w-full bg-primary text-white text-xl font-bold py-6 px-8 rounded-xl shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed! disabled:transform-none"
						>
							<span className="material-symbols-rounded text-3xl">
								campaign
							</span>
							Llamar Turno
						</button>
						<button
							onClick={handlePausarReanudar}
							className="w-full bg-secondary/20 text-text-light dark:text-text-dark text-xl font-bold py-6 px-8 rounded-xl hover:bg-secondary/30 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1"
						>
							<span className="material-symbols-rounded text-3xl">
								{estadoCubiculo === "pausado" ? "play_circle" : "pause_circle"}
							</span>
							{estadoCubiculo === "pausado" ? "Reanudar" : "Pausar"}
						</button>
					</div>
				)}

				{/* Vista después de haber llamado al turno o atendiendo */}
				{turnoActual && (
					<div className="w-full max-w-md text-center">
						<h2 className="text-gray-600 dark:text-gray-300 tracking-light text-2xl font-bold leading-tight">
							{turnoActual.estado === "llamado"
								? "Llamando al turno:"
								: "Atendiendo turno:"}
						</h2>
						<h1 className="text-primary tracking-tight text-8xl font-bold leading-tight py-6">
							{turnoActual.codigo_turno}
						</h1>
						<div className="flex items-center justify-center gap-2 -mt-4 mb-4">
							<span className="material-symbols-rounded text-secondary dark:text-gray-500">
								timer
							</span>
							<p className="text-lg font-medium text-secondary dark:text-gray-400">
								{formatearTiempo(tiempoTranscurrido)}
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 py-8 w-full">
							<button
								onClick={handleRellamarTurno}
								className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-bold leading-normal hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors gap-2"
							>
								<span className="material-symbols-rounded">replay</span>
								<span className="truncate">Llamar de Nuevo</span>
							</button>
							<button
								onClick={handleCancelarTurno}
								className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-transparent text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 text-base font-bold leading-normal hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors gap-2"
							>
								<span className="material-symbols-rounded">cancel</span>
								<span className="truncate">Cancelar</span>
							</button>
						</div>
						<div className="flex pt-4 justify-center">
							<button
								onClick={handleFinalizarTurno}
								className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary text-gray-900 dark:text-white text-lg font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors gap-2"
							>
								<span className="material-symbols-rounded">check_circle</span>
								<span className="truncate">Finalizar</span>
							</button>
						</div>
					</div>
				)}
			</div>

			<div className="lg:col-span-1 bg-white dark:bg-primary dark:text-white rounded-xl border border-black/10 dark:border-black/20 shadow-sm p-6 flex flex-col items-center justify-center">
				{/* Vista principal antes de llamar turno */}
				{!turnoActual && (
					<div className="text-center">
						<p className="text-sm text-secondary dark:text-white mb-2">
							Hora Actual
						</p>
						<p className="text-5xl font-extrabold text-text-light dark:text-white">
							{horaActual}
						</p>
					</div>
				)}

				{/* Vista de información cuando se ha llamado un turno */}
				{turnoActual && (
					<div>
						<h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8">
							Información del Turno
						</h3>
						<div className="space-y-6">
							<div>
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Nombre
								</p>
								<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
									{turnoActual.cliente.nombre}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Documento
								</p>
								<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
									{turnoActual.cliente.documento}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Tipo de atención
								</p>
								<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
									{turnoActual.prioridad}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Servicio
								</p>
								<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
									{turnoActual.servicio || "No especificado"}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Fecha y Hora de Llamado
								</p>
								<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
									{new Date(turnoActual.fecha_llamado).toLocaleString("es-ES", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
										hour12: true,
									})}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
