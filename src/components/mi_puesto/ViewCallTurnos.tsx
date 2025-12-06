// import { useAuthStore } from "@/stores";

export default function ViewCallTurnos() {
	// const { user } = useAuthStore();

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:h-full xl:min-h-[650px]">
			<div className="lg:col-span-2 bg-white dark:bg-dark rounded-xl border border-black/10 dark:border-dark shadow-sm p-6 flex flex-col items-center justify-center ">
				{/* vista principal antes de llamar turno */}
				<div className="w-full max-w-lg mx-auto flex flex-col gap-6 ">
					<div className="text-center mb-6">
						<h3 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">
							Puesto de Atención: Caja 1
						</h3>
						<div className="flex items-center justify-center gap-2 mb-4">
							<p className="text-xl text-text-muted-light dark:text-text-muted-dark mr-4">
								Estado actual
							</p>
							<div className="flex items-center gap-2">
								<span className="relative flex h-3 w-3">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
								</span>
								<span className="font-bold text-green-600 dark:text-green-400 text-xl">
									Disponible
								</span>
							</div>
						</div>
					</div>
					<button className="w-full bg-primary text-white text-xl font-bold py-6 px-8 rounded-xl shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1">
						<span className="material-symbols-rounded text-3xl">campaign</span>
						Llamar Turno
					</button>
					<button className="w-full bg-secondary/20 text-text-light dark:text-text-dark text-xl font-bold py-6 px-8 rounded-xl hover:bg-secondary/30 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1">
						<span className="material-symbols-rounded text-3xl">
							pause_circle
						</span>
						Pausar
					</button>
				</div>
				{/* vista despues de haber Llamando al turno  o atendiendo */}
				<div className="w-full max-w-md text-center hidden">
					<h2 className="text-gray-600 dark:text-gray-300 tracking-light text-2xl font-bold leading-tight">
						Llamando al turno:
					</h2>
					<h1 className="text-primary tracking-tight text-8xl font-bold leading-tight py-6">
						B-045
					</h1>
					<div className="flex items-center justify-center gap-2 -mt-4 mb-4">
						<span className="material-symbols-rounded text-secondary dark:text-gray-500">
							timer
						</span>
						<p className="text-lg font-medium text-secondary dark:text-gray-400">
							00:42
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-4 py-8 w-full">
						<button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-bold leading-normal hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors gap-2">
							<span className="material-symbols-rounded">replay</span>
							<span className="truncate">Llamar de Nuevo</span>
						</button>
						<button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-transparent text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 text-base font-bold leading-normal hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors gap-2">
							<span className="material-symbols-rounded">cancel</span>
							<span className="truncate">Cancelar</span>
						</button>
					</div>
					<div className="flex pt-4 justify-center">
						<button className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-primary text-gray-900 dark:text-white text-lg font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors gap-2">
							<span className="material-symbols-rounded">check_circle</span>
							<span className="truncate">Finalizar</span>
						</button>
					</div>
				</div>
			</div>

			<div className="lg:col-span-1 bg-white dark:bg-primary dark:text-white rounded-xl border border-black/10 dark:border-black/20 shadow-sm p-6 flex flex-col items-center justify-center">
				{/* vista principal antes de llamar turno */}
				<div className="text-center">
					<p className="text-sm text-secondary dark:text-white mb-2">
						Hora Actual
					</p>
					<p
						className="text-5xl font-extrabold text-text-light dark:text-white"
						id="current-time"
					>
						10:30 AM
					</p>
				</div>

				{/* vista de informacion cuando se ha llamado un turno */}
				<div className="hidden">
					<h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-8">
						Información del Turno
					</h3>
					<div className="space-y-6">
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Nombre
							</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
								Alejandra Rodriguez
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Documento
							</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
								1023456789
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Tipo de atención
							</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
								Embarazada
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Servicio
							</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
								Asesoría de Crédito Hipotecario
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Fecha y Hora de Llamado
							</p>
							<p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
								24 de Julio, 2024 - 10:32 AM
							</p>
						</div>
					</div>
				</div>
				{/* <script>
              function updateTime() {
                const now = new Date();
                let hours = now.getHours();
                const minutes = now.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                const minutesStr = minutes < 10 ? '0' + minutes : minutes;
                document.getElementById('current-time').textContent = `${hours}:${minutesStr} ${ampm}`;
              }
              setInterval(updateTime, 1000);
              updateTime(); // Initial call to display time immediately
            </script> */}
			</div>
		</div>
	);
}
