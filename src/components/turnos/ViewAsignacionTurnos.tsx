import { useCallback, useEffect, useState } from "react";
import useStep from "@/hooks/useStep";
import { useAuthStore, useToastStore } from "@/stores";
import Header from "../dashboard/Header";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useServicios } from "@/hooks/useServicios";
import type { FullServicios } from "@/@types/servicios";
import { usePrioridades } from "@/hooks/usePrioridades";
import Loading from "../common/Loading";
import { useTurnos } from "@/hooks/useTurnos";
import type { Turno } from "../../@types/turnos";
import ClienteModal from "./ClienteModal";
import type { FullCliente } from "@/@types/clientes";
import { Link } from "react-router-dom";

interface stateAsignacionTurnos {
	identification: number | string;
	nombre_cliente: string;
	email?: string;
	telefono?: string;
	id_servicio: number;
	servicio: string;
	id_prioridad: number;
	prioridad: string;
	observaciones: string;
}

const ViewCrearTurnos: React.FC = () => {
	// Zustand stores
	const { user, logout } = useAuthStore();
	const { currentStep, setCurrentStep } = useStep();
	const { addToast } = useToastStore();
	const {
		createTurno,
		loading: turnosLoading,
		findClient,
		findClientLocal,
	} = useTurnos();

	// Custom hooks
	const { darkMode, toggleDarkMode } = useDarkMode();
	const { getServicesActive, loading: serviciosLoading } = useServicios();
	const { prioridades, loading: prioridadesLoading } = usePrioridades();

	const [services, setServices] = useState<FullServicios[]>([]);
	const [loading, setLoading] = useState(false);
	const [turnoCreado, setTurnoCreado] = useState<Turno | null>(null);
	// Modal para crear nuevo cliente
	const [openModal, setOpenModal] = useState(false);

	const loadServices = useCallback(async () => {
		const services = await getServicesActive(user?.id_sede || 0);
		if (!services) {
			addToast({
				type: "error",
				title: "Error cargando servicios",
				message:
					"No se pudieron cargar los servicios activos para la sede seleccionada.",
			});
			return;
		}
		setServices(services);
	}, [getServicesActive, user, addToast]);

	useEffect(() => {
		if (!serviciosLoading && !prioridadesLoading) {
			setLoading(true);
		}
		loadServices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadServices]);

	const [state, setState] = useState<stateAsignacionTurnos>({
		identification: "1234567",
		nombre_cliente: "",
		email: "",
		telefono: "",
		id_servicio: 0,
		servicio: "",
		id_prioridad: 0,
		prioridad: "",
		observaciones: "",
	});

	const digitarNumero = (num: number) => {
		const input = document.getElementById("identification") as HTMLInputElement;
		setState({
			...state,
			identification: input.value + num.toString(),
		});
	};

	const borrarUltimo = () => {
		const input = document.getElementById("identification") as HTMLInputElement;
		if (input) {
			input.value = input.value.slice(0, -1);
		}
		setState({
			...state,
			identification: Number(input.value),
		});
	};
	const limpiarCampo = () => {
		const input = document.getElementById("identification") as HTMLInputElement;
		if (input) {
			input.value = "";
		}
		setState({
			...state,
			identification: "",
		});
	};

	//validar que el numero de identificacion no este vacio antes de pasar al siguiente paso
	const handleNextStep = async () => {
		if (!state.identification) {
			addToast({
				type: "error",
				title: "Identificación requerida",
				message: "Por favor, ingrese un número de identificación.",
			});
			return;
		}

		const identificationStr = state.identification.toString();

		if (identificationStr.length < 6) {
			addToast({
				type: "error",
				title: "Identificación inválida",
				message: "El número de identificación debe tener al menos 6 dígitos.",
			});
			return;
		}

		// Buscar usuario primero en el sistema externo
		const infoClient = await findClient(identificationStr);

		let clientData = null;

		if (infoClient.ok && infoClient.data) {
			clientData = infoClient.data;
		} else {
			// Si no se encuentra externamente, buscar localmente
			const infoClientLocal = await findClientLocal(identificationStr);

			if (
				infoClientLocal.ok &&
				infoClientLocal.data !== undefined &&
				infoClientLocal.data?.length > 0
			) {
				clientData = infoClientLocal.data[0];
			}
		}

		if (!clientData) {
			addToast({
				type: "info",
				title: "Cliente no encontrado",
				message:
					"El cliente no existe en el sistema, por favor ingrese sus datos.",
			});
			setOpenModal(true);
			return;
		}

		setState({
			...state,
			nombre_cliente: clientData.nombre,
			email: clientData.email || "",
			telefono: clientData.telefono || "",
		});
		setCurrentStep(2);
	};

	const handleClienteSubmit = (data: FullCliente): boolean => {
		setState({
			...state,
			nombre_cliente: data.nombre,
			email: data.email || "",
			telefono: data.telefono || "",
		});
		setOpenModal(false);
		setCurrentStep(2);
		return true;
	};

	// funcion para crar turno
	const handleCrearTurno = async () => {
		const response = await createTurno({
			identificacion: state.identification,
			nombre_cliente: state.nombre_cliente,
			servicio_id: state.id_servicio,
			prioridad_id: state.id_prioridad,
			sede_id: user?.id_sede || 0,
			...(state.email ? { email: state.email } : null),
			...(state.telefono ? { telefono: state.telefono } : null),
			...(state.observaciones ? { observaciones: state.observaciones } : null),
		});
		if (response.ok) {
			// Solo si la creación fue exitosa, reiniciamos el formulario
			setTurnoCreado(response.data || null);
			setState({
				identification: "",
				nombre_cliente: "",
				email: "",
				telefono: "",
				id_servicio: 0,
				servicio: "",
				id_prioridad: 0,
				prioridad: "",
				observaciones: "",
			});
			setCurrentStep(1);
		}
	};

	// Mostrar loading mientras se cargan los servicios y prioridades
	if (!loading || turnosLoading) return <Loading />;

	return (
		<div className="bg-background-light dark:bg-background-dark h-screen">
			{/* Header */}
			<Header
				user={user}
				darkMode={darkMode}
				toggleDarkMode={toggleDarkMode}
				handleLogout={logout}
			/>
			<main className="flex-grow flex items-center justify-center py-12 px-4  h-[calc(100vh-5rem)] ">
				<div className="w-full max-w-xl space-y-8 overflow-y-auto">
					<div
						className={` ${
							turnoCreado ? "hidden" : ""
						} bg-surface-light dark:bg-surface-dark p-8 rounded-xl shadow-lg space-y-6 bg-white transition-all duration-300`}
						id="multi-step-form"
					>
						<div className="mb-6">
							<div className="flex justify-between text-sm font-medium text-secondary mb-2">
								<span>Paso {currentStep} de 4</span>
								<Link className="underline" to="/dashboard">
									Ir al panel
								</Link>
							</div>
							<div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2.5">
								<div
									className="bg-primary h-2.5 rounded-full transition-all duration-300"
									id="progress-bar"
									style={{ width: `${currentStep * 25}%` }}
								></div>
							</div>
						</div>

						{/* Step 1: identificar usuario */}
						<div
							className={`${
								currentStep === 1
									? "animate__animated animate__fadeIn"
									: "hidden"
							} space-y-6`}
							id="step-1"
						>
							<div className="text-center">
								<h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark">
									Identificación
								</h2>
								<p className="mt-2 text-sm text-secondary">
									Ingrese el número de identificación del paciente.
								</p>
							</div>
							<div className="flex flex-col px-4 items-center">
								<label htmlFor="identification" className="sr-only">
									Número de identificación
								</label>
								<input
									type="number"
									id="identification"
									value={state.identification}
									placeholder="Número de identificación"
									className="w-full sm:w-[80%] px-4 py-3 border border-border-light dark:border-border-dark rounded-lg mb-3 disabled:cursor-not-allowed"
									disabled
								/>
								{/* box de cuadricula para digitar el numero de identificacion */}
								<div className="grid grid-cols-3 gap-x-4 gap-y-3 mb-4">
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
										<button
											key={num}
											onClick={() => digitarNumero(num)}
											className="flex items-center justify-center h-[60px] w-[60px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer"
										>
											<h3 className="text-2xl font-medium text-text-light dark:text-text-dark">
												{num}
											</h3>
										</button>
									))}
									<button
										className="flex items-center justify-center h-[60px] w-[60px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer "
										onClick={limpiarCampo}
										title="Limpiar todo"
									>
										<span className="material-symbols-rounded text-2xl text-text-light dark:text-text-dark">
											clear_all
										</span>
									</button>
									<button
										className="flex items-center justify-center h-[60px] w-[60px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer "
										onClick={borrarUltimo}
										title="Borrar último dígito"
									>
										<span className="material-symbols-rounded text-2xl text-text-light dark:text-text-dark">
											backspace
										</span>
									</button>
								</div>
								<button
									className="bg-primary-600/90 w-full sm:w-[80%] text-white rounded-lg p-2"
									onClick={handleNextStep}
								>
									Siguiente
								</button>
							</div>
						</div>
						{/* Step 2: seleccionar servicios */}
						<div
							className={`${
								currentStep === 2
									? "animate__animated animate__fadeIn"
									: "hidden"
							} space-y-6`}
							id="step-2"
						>
							<div className="text-center">
								<h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark">
									Seleccionar Servicio
								</h2>
								<p className="mt-2 text-sm text-secondary">
									Elija el tipo de servicio que necesita.
								</p>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 grid-flow-row gap-3">
								{services.map((servicio) => (
									<button
										key={servicio.id}
										className="flex items-center justify-center h-[80px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer "
										onClick={() => {
											setState({
												...state,
												id_servicio: servicio.id,
												servicio: servicio.nombre,
											});
											setCurrentStep(3);
										}}
									>
										<h3 className="text-md font-medium text-text-light dark:text-dark">
											{servicio.nombre}
										</h3>
									</button>
								))}
							</div>
							<div className="flex sm:justify-center gap-4">
								<button
									className="w-full sm:w-[80%] flex justify-center py-3 px-4 border border-white bg-primary-600/90 dark:border-border-dark rounded-lg text-sm font-bold text-white dark:text-text-dark  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
									id="prev-step-2"
									onClick={() => setCurrentStep(1)}
								>
									<span className="material-symbols-rounded mr-1 text-sm">
										arrow_back
									</span>
									Atrás
								</button>
							</div>
						</div>
						{/* Step 3: Atención */}
						<div
							className={`${
								currentStep === 3
									? "animate__animated animate__fadeIn"
									: "hidden"
							} space-y-6`}
							id="step-3"
						>
							<div className="text-center">
								<h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark">
									Seleccionar Atención
								</h2>
								<p className="mt-2 text-sm text-secondary">
									Seleccione el tipo de atención.
								</p>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 grid-flow-row gap-3">
								{prioridades.map((atencion) => (
									<button
										key={atencion.id}
										className="flex items-center justify-center h-[80px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer "
										onClick={() => {
											setState({
												...state,
												id_prioridad: atencion.id,
												prioridad: atencion.nombre_prioridad,
											});
											setCurrentStep(4);
										}}
									>
										<h3 className="text-md font-medium text-text-light dark:text-text-dark">
											{atencion.nombre_prioridad}
										</h3>
									</button>
								))}
							</div>
							<div className="flex gap-4">
								<button
									className="w-full flex justify-center py-3 px-4 border border-white bg-primary-600/90 dark:border-border-dark rounded-lg text-sm font-bold text-white dark:text-text-dark  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
									onClick={() => setCurrentStep(2)}
								>
									<span className="material-symbols-rounded mr-1 text-sm">
										arrow_back
									</span>
									Atrás
								</button>
							</div>
						</div>
						{/* Step 4: Confirmación de Turno */}
						<div
							className={`${
								currentStep === 4
									? "animate__animated animate__fadeIn"
									: "hidden"
							} space-y-6`}
							id="step-4"
						>
							<div className="text-center">
								<h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark">
									Confirmación
								</h2>
								<p className="mt-2 text-sm text-secondary">
									Revise los detalles y confirme el turno.
								</p>
							</div>
							<div
								className="bg-background-default/50 dark:bg-background-dark p-4 rounded-lg border border-secondary-50 
                        dark:border-border-dark space-y-3"
							>
								<p className="flex items-center text-sm font-medium text-text-light dark:text-text-dark ">
									<span className="material-symbols-rounded mr-1 text-sm">
										assignment_ind
									</span>
									Identificación:
									<span
										className="ms-2 font-normal text-secondary"
										id="confirm-service"
									>
										{state.identification}
									</span>
								</p>
								<p className="flex items-center text-sm font-medium text-text-light dark:text-text-dark ">
									<span className="material-symbols-rounded mr-1 text-sm">
										person
									</span>
									Nombre paciente:
									<span
										className="ms-2 font-normal text-secondary"
										id="confirm-service"
									>
										{state.nombre_cliente}
									</span>
								</p>
								<p className="flex items-center text-sm font-medium text-text-light dark:text-text-dark">
									<span className="material-symbols-rounded mr-1 text-sm">
										medical_services
									</span>
									Servicio:
									<span
										className="ms-2 font-normal text-secondary"
										id="confirm-service"
									>
										{state.servicio}
									</span>
								</p>
								<p className="flex items-center text-sm font-medium text-light dark:text-text-dark">
									<span className="material-symbols-rounded mr-1 text-sm">
										local_hospital
									</span>
									Tipo de atención:
									<span
										className="ms-2 font-normal text-secondary"
										id="confirm-date"
									>
										{state.prioridad}
									</span>
								</p>
								<div>
									<label
										className="flex items-center text-sm font-medium dark:text-gray-300 mb-1"
										htmlFor="observaciones"
									>
										<span className="material-symbols-rounded mr-1 text-sm">
											text_ad
										</span>
										Observaciones:
									</label>
									<textarea
										className="w-full bg-white px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
										id="observaciones"
										value={state.observaciones}
										onChange={(e) =>
											setState({ ...state, observaciones: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="flex flex-col sm:flex-row gap-4">
								<button
									className="w-full flex justify-center py-3 px-4 border border-border-light dark:border-border-dark rounded-lg text-sm font-bold text-text-light dark:text-text-dark hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
									onClick={() => setCurrentStep(3)}
								>
									<span className="material-symbols-rounded mr-1 text-sm">
										arrow_back
									</span>
									Atrás
								</button>
								<button
									className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
									onClick={() => handleCrearTurno()}
								>
									Confirmar Turno
									<span className="material-symbols-rounded ms-1 text-sm">
										task_alt
									</span>
								</button>
							</div>
						</div>
					</div>
					<div
						className={`${
							turnoCreado ? "animate__animated animate__fadeIn" : "hidden"
						} bg-white dark:bg-background-dark p-8 rounded-xl shadow-lg text-center transition-all duration-300`}
						id="ticket-display"
					>
						<span className="material-symbols-rounded text-green-500 text-7xl!">
							check_circle
						</span>
						<p className="mt-4 text-lg font-medium text-secondary">
							Su turno ha sido asignado
						</p>
						<p className="text-8xl font-black text-primary my-4">
							{turnoCreado?.codigo_turno}
						</p>
						<p className="text-text-light dark:text-text-dark">
							Por favor, esté atento a la pantalla. Será llamado en breve.
						</p>
						<button
							className="mt-8 w-full flex justify-center py-3 px-4 border border-border-light dark:border-border-dark rounded-lg text-sm font-bold text-text-light dark:text-text-dark hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
							onClick={() => {
								setTurnoCreado(null);
								setCurrentStep(1);
							}}
						>
							Solicitar otro turno
						</button>
					</div>
				</div>
			</main>
			<ClienteModal
				identificacion={state.identification.toString()}
				isOpen={openModal}
				onClose={() => setOpenModal(false)}
				onSubmit={handleClienteSubmit}
			/>
		</div>
	);
};

export default ViewCrearTurnos;
