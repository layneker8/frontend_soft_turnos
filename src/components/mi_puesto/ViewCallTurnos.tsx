import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import type { useMiPuestoAtencion } from "@/hooks/useMiPuestoAtencion";
import Button from "../common/Button";
import FinalizarModal from "./FinalizarModal";
import PausarModal from "./PausarModal";
import PausaActivaModal from "./PausaActivaModal";
import type { CancelarTurno, DataTurnoCompleto, FinalizarData } from "@/@types";
import CancelarModal from "./CancelarModal";
import { useTurnosRealtime } from "@/hooks/useTurnosRealtime";
import { TURNO_PERMISSIONS } from "@/constants/permissions";

interface ViewCallTurnosProps {
	miPuestoAtencion: ReturnType<typeof useMiPuestoAtencion>;
}

export default function ViewCallTurnos({ miPuestoAtencion }: ViewCallTurnosProps) {
	const { user, checkPermission } = useAuthStore();
	const {
		puestoActual,
		turnoActual,
		estadoCubiculo,
		tiempoTranscurrido,
		llamarTurno,
		pausaActual,
		rellamarTurno,
		finalizarTurno,
		cancelarTurno,
		pausarCubiculo,
		reanudarCubiculo,
		cargarPausasActual,
		atenderTurno,
		liberarCubiculo,
		cargarTurnosEnColaPorSede,
	} = miPuestoAtencion;

	// hook de turnos en tiempo real
	const { turnosCola } = useTurnosRealtime({
		sedeId: user?.id_sede || null,
		autoConnect: true,
		playSound: false, // No reproducir sonido en el puesto de atención
	});

	// const [horaActual, setHoraActual] = useState("");
	const [showFinalizarModal, setShowFinalizarModal] = useState(false);
	const [showCancelarModal, setShowCancelarModal] = useState(false);
	const [showPausarModal, setShowPausarModal] = useState(false);
	const [showPausaActivaModal, setShowPausaActivaModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [turnosEnCola, setTurnosEnCola] = useState<{
		data: DataTurnoCompleto[];
		total: number;
	}>({ data: [], total: 0 });

	// actualizadmos el state de cola de turnos
	useEffect(() => {
		let filteredTurnos = [];
		// validamos si el usuario tiene el permiso de turno especialista
		if (checkPermission(TURNO_PERMISSIONS.ESPECIALISTA)) {
			// filtramos la cola de turnos para mostrar los turnos del especialista
			const turnosCitas = turnosCola.turnos.filter((turno) => turno.is_cita);
			const turnosAsignados = [];
			for (const turno of turnosCitas) {
				if (turno.cita?.especialista_documento === user?.identificacion) {
					turnosAsignados.push(turno);
				}
			}
			filteredTurnos = turnosAsignados;
		} else {
			// Quitamos las citas de la lista de turnos
			const turnosSinCitas = turnosCola.turnos.filter(
				(turno) => !turno.is_cita
			);
			filteredTurnos = turnosSinCitas;
		}
		setTurnosEnCola({
			data: filteredTurnos,
			total: filteredTurnos.length,
		});
	}, [turnosCola, checkPermission, user?.identificacion]);
	// Actualizar hora cada segundo
	// useEffect(() => {
	// 	const updateTime = () => {
	// 		const now = new Date();
	// 		let hours = now.getHours();
	// 		const minutes = now.getMinutes();
	// 		const ampm = hours >= 12 ? "PM" : "AM";
	// 		hours = hours % 12;
	// 		hours = hours ? hours : 12;
	// 		const minutesStr = minutes < 10 ? "0" + minutes : minutes;
	// 		setHoraActual(`${hours}:${minutesStr} ${ampm}`);
	// 	};

	// 	updateTime();
	// 	const interval = setInterval(updateTime, 1000);

	// 	return () => clearInterval(interval);
	// }, []);

	// Cuando se carga el componente, cargar pausas actuales
	useEffect(() => {
		const loadData = async () => {
			if (puestoActual?.id) {
				cargarPausasActual(puestoActual.id);
			}
			if (user?.id_sede) {
				const turnos = await cargarTurnosEnColaPorSede(user.id_sede);
				if (
					turnos &&
					typeof turnos === "object" &&
					"data" in turnos &&
					"total" in turnos
				) {
					setTurnosEnCola(turnos);
				} else {
					setTurnosEnCola({ data: [], total: 0 });
				}
			}
		};
		loadData();
		if (estadoCubiculo === "Pausado") {
			setShowPausaActivaModal(true);
		}
	}, [
		puestoActual?.id,
		cargarPausasActual,
		estadoCubiculo,
		cargarTurnosEnColaPorSede,
		user?.id_sede,
	]);

	// Formatear tiempo transcurrido en MM:SS
	const formatearTiempo = (segundos: number): string => {
		const mins = Math.floor(segundos / 60);
		const secs = segundos % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	// calcular tiempo de espera desde la fecha de creacion del turno
	const calculateTimeInQueue = (fechaCreacion: string): number => {
		const createdAt = new Date(fechaCreacion).getTime();
		const now = Date.now();
		const diffInSeconds = Math.floor((now - createdAt) / 1000);
		return diffInSeconds;
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
		await rellamarTurno(turnoActual.id.toString());
	};

	const handleOpenModalCancelar = () => {
		setShowCancelarModal(true);
	};

	const handleCancelarTurno = async (data: CancelarTurno) => {
		setIsSubmitting(true);
		const success = await cancelarTurno(data);
		setIsSubmitting(false);
		return success;
	};

	const handleFinalizarTurno = async (data: FinalizarData) => {
		setIsSubmitting(true);
		const success = await finalizarTurno(data.observaciones);
		setIsSubmitting(false);
		return success;
	};

	const handleOpenFinalizarModal = () => {
		setShowFinalizarModal(true);
	};

	const handleCloseFinalizarModal = () => {
		setShowFinalizarModal(false);
	};

	const handleIniciarAtencion = async () => {
		setIsSubmitting(true);
		const success = await atenderTurno();
		if (success) {
			setIsSubmitting(false);
		}
		return success;
	};

	const handlePausarClick = () => {
		if (estadoCubiculo === "Pausado") {
			setShowPausaActivaModal(true);
		} else {
			setShowPausarModal(true);
		}
	};

	const handlePausar = async (motivoId: number, descripcion: string) => {
		setIsSubmitting(true);
		const success = await pausarCubiculo(motivoId, descripcion);
		setIsSubmitting(false);
		if (success) {
			setShowPausaActivaModal(true);
		}
		return success;
	};

	const handleReanudar = async () => {
		setIsSubmitting(true);
		const success = await reanudarCubiculo();
		setIsSubmitting(false);
		return success;
	};

	const handleLiberarPuesto = async () => {
		if (!puestoActual) return;
		setIsSubmitting(true);
		await liberarCubiculo();
		setIsSubmitting(false);
	};

	const getEstadoColor = () => {
		switch (estadoCubiculo) {
			case "Disponible":
				return {
					ping: "bg-green-400",
					dot: "bg-green-500",
					text: "text-green-600 dark:text-green-400",
				};
			case "Pausado":
				return {
					ping: "bg-yellow-400",
					dot: "bg-yellow-500",
					text: "text-yellow-600 dark:text-yellow-400",
				};
			case "Ocupado":
				return {
					ping: "bg-red-400",
					dot: "bg-red-500",
					text: "text-red-600 dark:text-red-400",
				};
			case "Finalizado":
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

	const getAnimation = () => {
		if (turnoActual) {
			switch (turnoActual.estado) {
				case "llamado":
					return "animate__headShake";
				case "atendiendo":
					return "animate__flash";
				default:
					return "";
			}
		}
		return "";
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:h-full xl:min-h-162.5">
			<div className="lg:col-span-6 bg-white dark:bg-dark rounded-xl border border-black/10 dark:border-dark shadow-sm p-6 flex flex-col items-center justify-center relative">
				{/* Vista principal antes de llamar turno */}
				{!turnoActual && (
					<div className="w-full max-w-lg mx-auto flex flex-col gap-6">
						{/* boton de cerrar cubiculo */}
						<div className="absolute top-6 right-6">
							{estadoCubiculo === "Disponible" && (
								<Button
									onClick={handleLiberarPuesto}
									variant="outline-secondary"
									className="flex gap-2"
								>
									<span className="material-symbols-rounded text-2xl">
										exit_to_app
									</span>
									Cerrar Cubículo
								</Button>
							)}
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
										{estadoCubiculo || "Desconocido"}
									</span>
								</div>
							</div>
						</div>
						<button
							onClick={handleLlamarTurno}
							disabled={estadoCubiculo !== "Disponible"}
							className="w-full bg-primary text-white text-xl font-bold py-6 px-8 rounded-xl shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed! disabled:transform-none"
						>
							<span className="material-symbols-rounded text-3xl!">
								campaign
							</span>
							Llamar Turno
						</button>
						<button
							onClick={handlePausarClick}
							className="w-full bg-secondary/20 text-text-light dark:text-text-dark text-xl font-bold py-6 px-8 rounded-xl hover:bg-secondary/30 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1"
						>
							<span className="material-symbols-rounded text-3xl!">
								{estadoCubiculo === "Pausado" ? "play_circle" : "pause_circle"}
							</span>
							{estadoCubiculo === "Pausado" ? "Reanudar" : "Pausar"}
						</button>
					</div>
				)}

				{/* Vista después de haber llamado al turno o atendiendo */}
				{turnoActual && (
					<div
						className={`w-full max-w-md text-center animate__animated ${getAnimation()}`}
					>
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
								onClick={
									turnoActual.estado === "llamado"
										? handleRellamarTurno
										: undefined
								}
								disabled={turnoActual.estado !== "llamado"}
								className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-bold leading-normal hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors gap-2 disabled:opacity-50 disabled:cursor-not-allowed!"
							>
								<span className="material-symbols-rounded">replay</span>
								<span className="truncate">Llamar de Nuevo</span>
							</button>
							<button
								onClick={
									turnoActual.estado === "llamado"
										? handleOpenModalCancelar
										: undefined
								}
								disabled={turnoActual.estado === "atendiendo"}
								className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-transparent text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 text-base font-bold leading-normal hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors gap-2 disabled:opacity-50 disabled:cursor-not-allowed!"
							>
								<span className="material-symbols-rounded">cancel</span>
								<span className="truncate">Cancelar</span>
							</button>
						</div>
						<div className="flex pt-4 justify-center">
							<button
								onClick={
									turnoActual.estado === "llamado"
										? handleIniciarAtencion
										: handleOpenFinalizarModal
								}
								className="flex min-w-50 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary text-gray-900 dark:text-white text-lg font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors gap-2"
							>
								<span className="material-symbols-rounded">
									{turnoActual.estado === "llamado"
										? "play_circle"
										: "check_circle"}
								</span>
								<span className="truncate">
									{turnoActual.estado === "llamado"
										? "Iniciar Atención"
										: "Finalizar"}
								</span>
							</button>
						</div>
					</div>
				)}
			</div>
			<div className="lg:col-span-6 bg-white dark:bg-primary dark:text-white rounded-xl border border-black/10 dark:border-black/20 shadow-sm flex flex-col items-center">
				{/* Vista principal antes de llamar turno */}
				{!turnoActual && (
					<>
						<div className="w-full border-b border-black/10 dark:border-border-dark flex items-center justify-between sticky top-0 z-10 px-6 py-4">
							<div className="flex items-center gap-3">
								<span className="material-symbols-rounded text-primary">
									group
								</span>
								<h3 className="text-xl font-bold text-text-light dark:text-text-dark">
									Turnos en Espera
								</h3>
							</div>
							<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
								{turnosEnCola.total} en cola
							</span>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-4 w-full">
							<div className="space-y-4">
								{turnosEnCola.data.length === 0 && (
									<div className="text-center">
										<p className="text-lg text-gray-600 dark:text-gray-400">
											No hay turnos en espera por el momento.
										</p>
									</div>
								)}
								{
									/* Mapeo de turnos en cola */
									turnosEnCola &&
										turnosEnCola.data.map((turno) => (
											<div
												key={turno.id}
												className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark/50 rounded-xl border border-black/10 dark:border-border-dark hover:border-primary/50 transition-colors"
											>
												<div className="flex items-center gap-6">
													<div className="text-2xl font-black text-primary bg-primary/10 w-24 h-13 flex items-center justify-center rounded-lg border border-primary/20">
														{turno.codigo_turno}
													</div>
													<div>
														<p className="font-bold text-md text-text-light dark:text-text-dark">
															Servicio: {turno.servicio || "-"}
														</p>
														<p className="text-sm text-secondary-500 dark:text-text-muted-dark">
															Tipo de atención: {turno.prioridad}
														</p>
														<p className="text-sm text-secondary-500 dark:text-text-muted-dark flex items-center gap-1">
															<span className="material-symbols-rounded text-sm!">
																person
															</span>
															{turno.cliente?.nombre || "-"}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm text-text-secondary-100 dark:text-text-muted-dark font-medium">
														Tiempo de espera
													</p>
													<p className="text-xl font-bold text-text-light dark:text-text-dark">
														{formatearTiempo(
															calculateTimeInQueue(turno.fecha_creacion || "")
														)}
													</p>
												</div>
											</div>
										))
								}
							</div>
						</div>
					</>
				)}

				{/* Vista de información cuando se ha llamado un turno */}
				{turnoActual && (
					<>
						<div className="w-full border-b border-black/10 dark:border-border-dark flex items-center justify-between sticky top-0 z-10 px-6 py-3">
							<div className="flex items-center gap-3">
								<span className="material-symbols-rounded text-primary">
									info
								</span>
								<h3 className="text-xl font-bold text-text-light dark:text-text-dark">
									Información del Turno
								</h3>
							</div>
						</div>
						<div className="flex-1 overflow-y-auto px-6 py-4 w-full">
							<div className="space-y-2">
								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Nombre
									</p>
									<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
										{turnoActual.cliente?.nombre || "-"}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Documento
									</p>
									<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
										{turnoActual.cliente?.documento || "-"}
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
										{new Date(turnoActual.fecha_llamado).toLocaleString(
											"es-ES",
											{
												day: "2-digit",
												month: "long",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
												hour12: true,
											}
										)}
									</p>
								</div>
							</div>
						</div>
						{turnoActual.is_cita && turnoActual.cita && (
							<>
								<div className="w-full border-b border-black/10 dark:border-border-dark flex items-center justify-between sticky top-0 z-10 px-6 py-3 shadow">
									<div className="flex items-center gap-3">
										<span className="material-symbols-rounded text-primary">
											event_available
										</span>
										<h3 className="text-xl font-bold text-text-light dark:text-text-dark">
											Información de la Cita
										</h3>
									</div>
								</div>
								<div className="flex-1 overflow-y-auto px-6 py-4 w-full">
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
												Servicio:
											</p>
											<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
												{turnoActual.cita.servicio || "No especificado"}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
												Estado:
											</p>
											<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
												{turnoActual.cita.estado_cita || "No especificado"}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
												fecha y hora de la cita
											</p>
											<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
												{new Date(
													turnoActual.cita.fecha_asignacion
												).toLocaleString("es-ES", {
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
							</>
						)}
					</>
				)}
			</div>
			{/* Modal de Finalizar */}
			{turnoActual && (
				<FinalizarModal
					isOpen={showFinalizarModal}
					onClose={handleCloseFinalizarModal}
					onSubmit={handleFinalizarTurno}
					turno={turnoActual}
					loading={isSubmitting}
				/>
			)}
			{/* Modal de Cancelar */}
			{turnoActual && (
				<CancelarModal
					isOpen={showCancelarModal}
					onClose={() => setShowCancelarModal(false)}
					onSubmit={handleCancelarTurno}
					turno={turnoActual}
					loading={isSubmitting}
				/>
			)}
			{/* Modal de Pausar */}
			<PausarModal
				isOpen={showPausarModal}
				onClose={() => setShowPausarModal(false)}
				onSubmit={handlePausar}
				loading={isSubmitting}
			/>
			{/* Modal de Pausa Activa */}
			<PausaActivaModal
				isOpen={showPausaActivaModal}
				onClose={() => setShowPausaActivaModal(false)}
				pausa={pausaActual}
				onReanudar={handleReanudar}
				loading={isSubmitting}
			/>
		</div>
	);
}
