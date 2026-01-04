import { useTurnosRealtime } from "@/hooks/useTurnosRealtime";
import { usePublicSedes } from "@/hooks/usePublicSedes";
import { useEffect, useState, useMemo } from "react";

const STORAGE_KEY = "turnos_sede_id";

const ViewTurnos: React.FC = () => {
	const { sedes, loadSedes } = usePublicSedes();
	const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);

	// Hook para manejar turnos en tiempo real
	const { turnos, turnoActual, isConnected, error, turnosEnAtencion } =
		useTurnosRealtime({
			sedeId: selectedSedeId,
			autoConnect: true,
		});

	// Cargar sedes al montar el componente
	useEffect(() => {
		loadSedes();
	}, [loadSedes]);

	// Auto-seleccionar sede desde: 1) URL, 2) localStorage, 3) primera disponible
	useEffect(() => {
		if (selectedSedeId || sedes.length === 0) return;

		// 1. Intentar obtener de parámetro URL (?sede=1)
		const urlParams = new URLSearchParams(window.location.search);
		const sedeParam = urlParams.get("sede");
		if (sedeParam) {
			const sedeId = Number(sedeParam);
			const sedeExists = sedes.find((s) => s.id_sede === sedeId);
			if (sedeExists) {
				setSelectedSedeId(sedeId);
				localStorage.setItem(STORAGE_KEY, sedeId.toString());
				return;
			}
		}

		// 2. Intentar obtener de localStorage
		const savedSedeId = localStorage.getItem(STORAGE_KEY);
		if (savedSedeId) {
			const sedeId = Number(savedSedeId);
			const sedeExists = sedes.find((s) => s.id_sede === sedeId);
			if (sedeExists) {
				setSelectedSedeId(sedeId);
				return;
			}
		}

		// 3. Seleccionar la primera sede disponible
		if (sedes.length > 0) {
			setSelectedSedeId(sedes[0].id_sede);
			localStorage.setItem(STORAGE_KEY, sedes[0].id_sede.toString());
		}
	}, [sedes, selectedSedeId]);

	// Guardar en localStorage cuando cambie la selección
	const handleSedeChange = (sedeId: number) => {
		setSelectedSedeId(sedeId);
		localStorage.setItem(STORAGE_KEY, sedeId.toString());
	};

	// Turno más reciente llamado
	const ultimoTurnoLlamado = useMemo(() => {
		return turnoActual || turnosEnAtencion[0] || null;
	}, [turnoActual, turnosEnAtencion]);

	return (
		<div className="flex flex-col h-screen w-screen">
			{/* Header con selector de sede e indicador de conexión */}
			<header className="bg-primary dark:bg-primary-dark text-white p-4 flex items-center justify-between shadow-lg">
				<div className="flex items-center gap-4">
					<img className="h-10" src="images/logo_blanco.png" alt="Logo" />
					<div className="flex items-center gap-2">
						<div
							className={`w-3 h-3 rounded-full ${
								isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
							}`}
						/>
						<span className="text-sm">
							{isConnected ? "Conectado" : "Desconectado"}
						</span>
					</div>
				</div>

				{/* Selector de sede */}
				<div className="flex items-center gap-4">
					<label htmlFor="sede-select" className="text-sm font-medium">
						Sede:
					</label>
					<select
						id="sede-select"
						value={selectedSedeId || ""}
						onChange={(e) => handleSedeChange(Number(e.target.value))}
						className="px-4 py-2 rounded-lg bg-white text-gray-900 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-secondary"
					>
						{sedes.length === 0 && <option value="">Cargando sedes...</option>}
						{sedes.map((sede) => (
							<option key={sede.id_sede} value={sede.id_sede}>
								{sede.nombre_sede}
							</option>
						))}
					</select>
				</div>
			</header>

			{/* Mostrar error si existe */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center">
					<strong className="font-bold">Error: </strong>
					<span>{error}</span>
				</div>
			)}

			{/* Contenido principal */}
			<div className="flex flex-1 overflow-hidden">
				{/* Panel principal - Turno actual */}
				<main className="w-2/3 p-12 flex flex-col items-center justify-center bg-white dark:bg-background-dark relative">
					{ultimoTurnoLlamado ? (
						<div className="text-center animate__animated animate__flash ">
							<h1 className="text-6xl font-bold text-gray-400 dark:text-gray-600 mb-4">
								TURNO
							</h1>
							<p className="text-[20rem] font-black text-primary leading-none tracking-tighter">
								{ultimoTurnoLlamado.codigo_turno}
							</p>
							<p className="text-8xl font-bold text-gray-500 dark:text-gray-400 mt-4">
								{ultimoTurnoLlamado.nombre_cubiculo || ""}
							</p>
						</div>
					) : (
						<div className="text-center">
							<h1 className="text-6xl font-bold text-gray-400 dark:text-gray-600 mb-4">
								SIN TURNOS
							</h1>
							<p className="text-4xl text-gray-400 dark:text-gray-500">
								No hay turnos siendo atendidos en este momento
							</p>
						</div>
					)}

					{/* Barra de progreso decorativa */}
					<div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-200 dark:bg-gray-700">
						<div className="progress-bar h-full bg-primary"></div>
					</div>
				</main>

				{/* Panel lateral - Turnos en atención */}
				<aside className="w-1/3 bg-gray-100 dark:bg-gray-900 p-12 flex flex-col">
					<h2 className="text-4xl font-bold text-center text-secondary mb-6">
						TURNOS EN ATENCIÓN
					</h2>

					<div className="grow space-y-4">
						{turnosEnAtencion.length === 0 ? (
							<div className="flex items-center justify-center h-full">
								<p className="text-2xl text-gray-400 dark:text-gray-600 text-center">
									No hay turnos en atención
								</p>
							</div>
						) : (
							turnosEnAtencion.map((turno) => (
								<div
									key={turno.id}
									className={`flex items-center justify-between bg-white dark:bg-background-dark p-6 rounded-xl shadow-md transition-all ${
										turno.id === ultimoTurnoLlamado?.id
											? "ring-3 ring-primary scale-105"
											: ""
									}`}
								>
									<div className="flex-1">
										<p className="text-6xl font-bold text-secondary text-shadow-xs text-shadow-secondary-600">
											{turno.codigo_turno}
										</p>
										{turno.estado === "llamado" && (
											<div className="flex items-center text-sm  gap-2 text-yellow-600 dark:text-yellow-400 font-semibold mt-2">
												<span className="material-symbols-rounded text-2xl">
													campaign
												</span>
												Llamando
											</div>
										)}
									</div>
									<p className="text-4xl font-semibold text-secondary">
										{turno.nombre_cubiculo || ""}
									</p>
								</div>
							))
						)}
					</div>

					{/* Estadísticas */}
					<div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
						<div className="grid grid-cols-2 gap-4 text-center">
							<div>
								<p className="text-3xl font-bold text-primary">
									{turnos.filter((t) => t.estado === "esperando").length}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									En espera
								</p>
							</div>
							<div>
								<p className="text-3xl font-bold text-secondary">
									{turnosEnAtencion.length}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									En atención
								</p>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default ViewTurnos;
