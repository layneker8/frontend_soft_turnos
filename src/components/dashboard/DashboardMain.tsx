import React from "react";

const DashboardMain: React.FC = () => {
	return (
		<main className="flex-1 overflow-y-auto">
			<div className="p-8">
				<h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
					Panel de Control
				</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					<div className="bg-white dark:bg-background-dark/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
						<p className="text-secondary dark:text-slate-400 mb-2">
							Turnos Atendidos
						</p>
						<p className="text-3xl font-bold text-slate-900 dark:text-white">
							125
						</p>
					</div>
					<div className="bg-white dark:bg-background-dark/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
						<p className="text-secondary dark:text-slate-400 mb-2">
							Tiempo de Espera Promedio
						</p>
						<p className="text-3xl font-bold text-slate-900 dark:text-white">
							15 min
						</p>
					</div>
					<div className="bg-white dark:bg-background-dark/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
						<p className="text-secondary dark:text-slate-400 mb-2">
							Turnos por Servicio
						</p>
						<p className="text-3xl font-bold text-slate-900 dark:text-white">
							50
						</p>
					</div>
				</div>
				<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
					Gráficos
				</h2>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					<div className="bg-white dark:bg-background-dark/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
						<p className="text-secondary dark:text-slate-400 font-bold mb-4">
							Turnos Atendidos por Día
						</p>
						<div className="grid grid-cols-7 gap-4 items-end h-48">
							<div className="flex flex-col items-center gap-2">
								<div
									className="w-full bg-primary/20 dark:bg-primary/30 rounded"
									style={{ height: "60%" }}
								></div>
								<p className="text-xs text-secondary dark:text-slate-400">
									Lun
								</p>
							</div>
							<div className="flex flex-col items-center gap-2">
								<div
									className="w-full bg-primary/20 dark:bg-primary/30 rounded"
									style={{ height: "20%" }}
								></div>
								<p className="text-xs text-secondary dark:text-slate-400">
									Mar
								</p>
							</div>
							<div className="flex flex-col items-center gap-2">
								<div
									className="w-full bg-primary/20 dark:bg-primary/30 rounded"
									style={{ height: "80%" }}
								></div>
								<p className="text-xs text-secondary dark:text-slate-400">
									Mié
								</p>
							</div>
							<div className="flex flex-col items-center gap-2">
								<div
									className="w-full bg-primary/20 dark:bg-primary/30 rounded"
									style={{ height: "60%" }}
								></div>
								<p className="text-xs text-secondary dark:text-slate-400">
									Jue
								</p>
							</div>
							<div className="flex flex-col items-center gap-2">
								<div
									className="w-full bg-primary/20 dark:bg-primary/30 rounded"
									style={{ height: "50%" }}
								></div>
								<p className="text-xs text-secondary dark:text-slate-400">
									Vie
								</p>
							</div>
							<div className="flex flex-col items-center gap-2">
								<div
									className="w-full bg-primary/20 dark:bg-primary/30 rounded"
									style={{ height: "20%" }}
								></div>
								<p className="text-xs text-secondary dark:text-slate-400">
									Sáb
								</p>
							</div>
							<div className="flex flex-col items-center gap-2">
								<div
									className="w-full bg-primary/20 dark:bg-primary/30 rounded"
									style={{ height: "10%" }}
								></div>
								<p className="text-xs text-secondary dark:text-slate-400">
									Dom
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white dark:bg-background-dark/80 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
						<p className="text-secondary dark:text-slate-400 font-bold mb-4">
							Turnos por Tipo de Servicio
						</p>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-secondary dark:text-slate-400 mb-1">
									Consulta General
								</p>
								<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
									<div
										className="bg-primary h-2.5 rounded-full"
										style={{ width: "75%" }}
									></div>
								</div>
							</div>
							<div>
								<p className="text-sm text-secondary dark:text-slate-400 mb-1">
									Asesoría Especializada
								</p>
								<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
									<div
										className="bg-primary h-2.5 rounded-full"
										style={{ width: "40%" }}
									></div>
								</div>
							</div>
							<div>
								<p className="text-sm text-secondary dark:text-slate-400 mb-1">
									Revisión de Documentos
								</p>
								<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
									<div
										className="bg-primary h-2.5 rounded-full"
										style={{ width: "50%" }}
									></div>
								</div>
							</div>
							<div>
								<p className="text-sm text-secondary dark:text-slate-400 mb-1">
									Otros
								</p>
								<div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
									<div
										className="bg-primary h-2.5 rounded-full"
										style={{ width: "10%" }}
									></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default DashboardMain;
