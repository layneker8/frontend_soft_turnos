import { useState } from "react";
import useStep from "@/hooks/useStep";
import { useToastStore } from "@/stores";

interface stateAsignacionTurnos {
	identification: number | string;
	servicio: string;
	tipoAtencion: string;
}

const ViewAsignacionTurnos: React.FC = () => {
	const [state, setState] = useState<stateAsignacionTurnos>({
		identification: "",
		servicio: "",
		tipoAtencion: "",
	});

	const { currentStep, goToStep } = useStep();
	const { addToast } = useToastStore();

	const digitarNumero = (num: number) => {
		const input = document.getElementById("identification") as HTMLInputElement;
		if (input) {
			input.value += num.toString();
		}
		setState({
			...state,
			identification: Number(input.value),
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
	const handleNextStep = () => {
		if (!state.identification) {
			addToast({
				type: "error",
				title: "Identificación requerida",
				message: "Por favor, ingrese un número de identificación.",
			});
			return;
		}
		//validar que el numero de identificacion tenga al menos 6 digitos
		if (state.identification.toString().length < 6) {
			addToast({
				type: "error",
				title: "Identificación inválida",
				message: "El número de identificación debe tener al menos 6 dígitos.",
			});
			return;
		}
		goToStep(2);
	};

	return (
		<main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark h-screen ">
			<div className="w-full max-w-xl space-y-8 h-[calc(100vh-8rem)] overflow-y-auto">
				<div
					className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl shadow-lg space-y-6 bg-white"
					id="multi-step-form"
				>
					<div className="mb-6">
						<div className="flex justify-between text-sm font-medium text-secondary mb-2">
							<span>Paso {currentStep} de 4</span>
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
					<div className="space-y-6" id="step-1">
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
								placeholder="Número de identificación"
								className="w-full sm:w-[80%] px-4 py-3 border border-border-light dark:border-border-dark rounded-lg mb-3"
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
								>
									<span className="material-symbols-rounded text-2xl text-text-light dark:text-text-dark">
										remove
									</span>
								</button>
								<button
									className="flex items-center justify-center h-[60px] w-[60px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer "
									onClick={borrarUltimo}
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
					<div className="hidden space-y-6" id="step-2">
						<div className="text-center">
							<h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark">
								Seleccionar Servicio
							</h2>
							<p className="mt-2 text-sm text-secondary">
								Elija el tipo de servicio que necesita.
							</p>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 grid-flow-row gap-3">
							{[
								"General",
								"Consulta Neurocirugia",
								"Prueba Cognitiva",
								"Videotelemetria",
								"Procedimientos",
								"Prueba de Inteligencia",
							].map((servicio) => (
								<button
									key={servicio}
									className="flex items-center justify-center h-[80px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer "
									onClick={() => {
										setState({ ...state, servicio });
										goToStep(3);
									}}
								>
									<h3 className="text-md font-medium text-text-light dark:text-dark">
										{servicio}
									</h3>
								</button>
							))}
						</div>
						<div className="flex sm:justify-center gap-4">
							<button
								className="w-full sm:w-[80%] flex justify-center py-3 px-4 border border-white bg-primary-600/90 dark:border-border-dark rounded-lg text-sm font-bold text-white dark:text-text-dark  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
								id="prev-step-2"
								onClick={() => goToStep(1)}
							>
								<span className="material-symbols-rounded mr-1 text-sm">arrow_back</span>
								Atrás
							</button>
						</div>
					</div>
					{/* Step 3: EPS */}
					<div className="hidden space-y-6" id="step-3">
						<div className="text-center">
							<h2 className="text-3xl font-extrabold text-text-light dark:text-text-dark">
								Seleccionar Atención
							</h2>
							<p className="mt-2 text-sm text-secondary">Seleccione el tipo de atención.</p>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 grid-flow-row gap-3">
							{["Particular", "Prepagada", "EPS", "ARL", "Regimen Especial"].map(
								(atencion) => (
									<button
										key={atencion}
										className="flex items-center justify-center h-[80px] p-3 shadow shadow-primary-500/50 bg-primary/10 rounded-lg focus:outline-primary focus:ring-2 focus:ring-primary cursor-pointer "
										onClick={() => {
											setState({ ...state, tipoAtencion: atencion });
											goToStep(4);
										}}
									>
										<h3 className="text-md font-medium text-text-light dark:text-text-dark">
											{atencion}
										</h3>
									</button>
								)
							)}
						</div>
						<div className="flex gap-4">
							<button
								className="w-full flex justify-center py-3 px-4 border border-white bg-primary-600/90 dark:border-border-dark rounded-lg text-sm font-bold text-white dark:text-text-dark  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
								onClick={() => goToStep(2)}
							>
								<span className="material-symbols-rounded mr-1 text-sm">arrow_back</span>
								Atrás
							</button>
						</div>
					</div>
					{/* Step 4: Confirmación de Turno */}
					<div className="hidden space-y-6" id="step-4">
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
								<span className="material-symbols-rounded mr-1 text-sm">assignment_ind</span>
								Identificación:
								<span className="ms-2 font-normal text-secondary" id="confirm-service">
									{state.identification}
								</span>
							</p>
							<p className="flex items-center text-sm font-medium text-text-light dark:text-text-dark">
								<span className="material-symbols-rounded mr-1 text-sm">medical_services</span>
								Servicio:
								<span className="ms-2 font-normal text-secondary" id="confirm-service">
									{state.servicio}
								</span>
							</p>
							<p className="flex items-center text-sm font-medium text-text-light dark:text-text-dark">
								<span className="material-symbols-rounded mr-1 text-sm">local_hospital</span>
								Tipo de atención:
								<span className="ms-2 font-normal text-secondary" id="confirm-date">
									{state.tipoAtencion}
								</span>
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<button
								className="w-full flex justify-center py-3 px-4 border border-border-light dark:border-border-dark rounded-lg text-sm font-bold text-text-light dark:text-text-dark hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
								onClick={() => goToStep(3)}
							>
								<span className="material-symbols-rounded mr-1 text-sm">arrow_back</span>
								Atrás
							</button>
							<button
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
								id="submit-form"
								onClick={() => {
									// Aquí puedes manejar la confirmación del turno
								}}
							>
								Confirmar Turno
								<span className="material-symbols-rounded ms-1 text-sm">task_alt</span>
							</button>
						</div>
					</div>
				</div>
				<div
					className="hidden bg-surface-light dark:bg-surface-dark p-8 rounded-xl shadow-lg text-center"
					id="ticket-display"
				>
					<span className="material-symbols-outlined text-green-500 text-6xl">
						check_circle
					</span>
					<p className="mt-4 text-lg font-medium text-secondary">
						Su turno ha sido asignado
					</p>
					<p className="text-8xl font-black text-primary my-4">A-42</p>
					<p className="text-text-light dark:text-text-dark">
						Por favor, esté atento a la pantalla. Será llamado en breve.
					</p>
					<button
						className="mt-8 w-full flex justify-center py-3 px-4 border border-border-light dark:border-border-dark rounded-lg text-sm font-bold text-text-light dark:text-text-dark hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
						id="new-request-button"
					>
						Solicitar otro turno
					</button>
				</div>
			</div>
		</main>
	);
};

export default ViewAsignacionTurnos;
