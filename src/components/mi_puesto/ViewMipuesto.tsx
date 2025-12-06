export default function ViewMipuesto() {
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
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						<div className="group cursor-pointer rounded-xl border-2 border-primary bg-primary/10 p-5 text-center transition-all duration-300">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-white">
								Caja 1
							</h3>
						</div>
						<div className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-secondary group-hover:text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-secondary group-hover:text-gray-900 dark:group-hover:text-white">
								Caja 2
							</h3>
						</div>
						<div className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-secondary group-hover:text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-secondary group-hover:text-gray-900 dark:group-hover:text-white">
								Caja 3
							</h3>
						</div>
						<div className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-secondary group-hover:text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-secondary group-hover:text-gray-900 dark:group-hover:text-white">
								Módulo de Servicio A
							</h3>
						</div>
						<div className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-secondary group-hover:text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-secondary group-hover:text-gray-900 dark:group-hover:text-white">
								Módulo de Servicio B
							</h3>
						</div>
						<div className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-secondary group-hover:text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-secondary group-hover:text-gray-900 dark:group-hover:text-white">
								Plataforma 1
							</h3>
						</div>
						<div className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-secondary group-hover:text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-secondary group-hover:text-gray-900 dark:group-hover:text-white">
								Plataforma 2
							</h3>
						</div>
						<div className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-5 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5">
							<div className="flex justify-center items-center mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/20">
								<span className="material-symbols-rounded text-4xl text-secondary group-hover:text-primary">
									meeting_room
								</span>
							</div>
							<h3 className="text-lg font-bold text-secondary group-hover:text-gray-900 dark:group-hover:text-white">
								Asesoría Remota
							</h3>
						</div>
					</div>
				</div>
				<div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
					<button className="w-full sm:w-auto flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white dark:text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
						<span className="truncate">Confirmar Puesto</span>
					</button>
				</div>
			</div>
		</div>
	);
}
