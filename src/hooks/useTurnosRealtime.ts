import { useState, useEffect, useCallback, useRef } from "react";
import { socketService } from "@/services/socket";
import type {
	TurnoDisplayData,
	UseTurnosRealtimeOptions,
	DataTurnosEnCola,
} from "@/@types/turnos";

export const useTurnosRealtime = ({
	sedeId,
	autoConnect = true,
	playSound = true,
}: UseTurnosRealtimeOptions) => {
	const [turnos, setTurnos] = useState<TurnoDisplayData[]>([]);
	const [turnoActual, setTurnoActual] = useState<TurnoDisplayData | null>(null);
	const [turnosCola, setTurnosCola] = useState<DataTurnosEnCola>({
		turnos: [],
		sede_id: 0,
	});
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const previousSedeId = useRef<number | null>(null);

	/**
	 * Filtra turnos por estado
	 */
	const getTurnosByEstado = useCallback(
		(
			estado:
				| "esperando"
				| "llamado"
				| "atendiendo"
				| "finalizado"
				| "cancelado",
		) => {
			return turnos.filter((t) => t.estado === estado);
		},
		[turnos],
	);

	/**
	 * Reproducir llamada de turno (optimizado para displays sin interacción)
	 * 👇 Usar useRef para evitar recreación en cada render
	 */
	const playTurnoCallSoundRef = useRef((turno: TurnoDisplayData) => {
		console.log("🔊 Reproduciendo sonido para turno:", turno.codigo_turno);

		try {
			const utterance = new SpeechSynthesisUtterance(
				`Turno ${turno.codigo_turno}, por favor diríjase al ${
					turno.nombre_cubiculo || "cubículo"
				}`,
			);
			utterance.lang = "es-ES";
			utterance.rate = 0.9; // Velocidad ligeramente más lenta
			utterance.pitch = 1.0;
			utterance.volume = 1.0;

			// Reproducir inmediatamente
			speechSynthesis.speak(utterance);
			console.log("✅ Síntesis de voz iniciada");
		} catch (speechErr) {
			console.error("❌ Error en síntesis de voz:", speechErr);
		}
	});

	/**
	 * Efecto: Limpiar estados cuando cambie la sede
	 */
	useEffect(() => {
		if (previousSedeId.current !== null && previousSedeId.current !== sedeId) {
			console.log("🧹 Limpiando estados al cambiar de sede");
			setTurnos([]);
			setTurnoActual(null);
		}
	}, [sedeId]);

	/**
	 * Efecto: Manejo de conexión y cambio de sede
	 */
	useEffect(() => {
		if (!autoConnect || !sedeId) return;

		const connectAndJoin = async () => {
			try {
				setError(null);

				// Conectar al socket si no está conectado
				await socketService.connect();

				// Unirse a la sala de sede
				await socketService.joinSedeRoom(sedeId);
				previousSedeId.current = sedeId;

				setIsConnected(socketService.isConnected());
			} catch (err) {
				console.error("Error conectando socket:", err);
				setError("Error al conectar con el servidor");
				setIsConnected(false);
			}
		};

		connectAndJoin();

		// Cleanup: salir de la sala antes de cambiar
		return () => {
			if (previousSedeId.current) {
				socketService.leaveSedeRoom(previousSedeId.current);
			}
		};
	}, [sedeId, autoConnect]);

	/**
	 * Efecto: Registrar listeners del socket
	 * 👇 SIN dependencias para evitar re-registro
	 * El servicio de socket previene duplicados automáticamente
	 */
	useEffect(() => {
		console.log("🔌 Registrando listeners de socket...");

		// Handlers
		const handleConnect = () => {
			console.log("✅ Conectado a Socket.IO");
			setIsConnected(true);
			setError(null);
		};

		const handleDisconnect = (reason: string) => {
			console.log("❌ Desconectado:", reason);
			setIsConnected(false);
		};

		const handleEstadoInicial = (data: TurnoDisplayData[]) => {
			console.log("📊 Estado inicial recibido:", data);
			if (data && Array.isArray(data)) {
				setTurnos(data);
				const actual = data.find(
					(t: TurnoDisplayData) =>
						t.estado === "llamado" || t.estado === "atendiendo",
				);
				if (actual) setTurnoActual(actual);
			}
		};

		const handleTurnoCreado = (turno: TurnoDisplayData) => {
			console.log("🆕 Nuevo turno creado:", turno);
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno,
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t,
						)
					: [...prev, turno];
			});
		};

		const handleTurnoActualizado = (turno: TurnoDisplayData) => {
			console.log("🔄 Turno actualizado:", turno);
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno,
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t,
						)
					: [...prev, turno];
			});
		};

		const handleTurnoLlamado = (turno: TurnoDisplayData) => {
			console.log("📢 Turno llamado:", turno);
			setTurnoActual(turno);
			if (playSound) {
				playTurnoCallSoundRef.current(turno); // 👈 Usar ref
			}
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno,
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t,
						)
					: [...prev, turno];
			});
		};

		const handleRellamarTurno = (turno: TurnoDisplayData) => {
			console.log("🔁 Turno re-llamado:", turno);
			setTurnoActual(turno);
			if (playSound) {
				playTurnoCallSoundRef.current(turno); // 👈 Usar ref
			}
		};

		const handleTurnoAtendiendo = (turno: TurnoDisplayData) => {
			console.log("👨‍💼 Turno en atención:", turno);
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno,
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t,
						)
					: [...prev, turno];
			});
		};

		const handleTurnoFinalizado = (turno: TurnoDisplayData) => {
			console.log("✅ Turno finalizado:", turno);
			setTurnos((prev) => prev.filter((t) => t.id !== turno.id));
			setTurnoActual((current) => (current?.id === turno.id ? null : current));
		};

		const handleTurnoCancelado = (turno: TurnoDisplayData) => {
			console.log("❌ Turno cancelado:", turno);
			setTurnos((prev) => prev.filter((t) => t.id !== turno.id));
			setTurnoActual((current) => (current?.id === turno.id ? null : current));
		};

		const handleColaTurnos = (data: DataTurnosEnCola) => {
			console.log("📊 Cola de turnos:", data);
			setTurnosCola(data);
		};

		const register = async () => {
			try {
				const socketInstance = await socketService.connect();

				socketInstance.on("connect", handleConnect);
				socketInstance.on("disconnect", handleDisconnect);
				socketInstance.on("estado:inicial", handleEstadoInicial);
				socketInstance.on("turno:creado", handleTurnoCreado);
				socketInstance.on("turno:actualizado", handleTurnoActualizado);
				socketInstance.on("turno:llamado", handleTurnoLlamado);
				socketInstance.on("turno:rellamar", handleRellamarTurno);
				socketInstance.on("turno:atendiendo", handleTurnoAtendiendo);
				socketInstance.on("turno:finalizado", handleTurnoFinalizado);
				socketInstance.on("turno:cancelado", handleTurnoCancelado);
				socketInstance.on("queue:turnos", handleColaTurnos);

				console.log("✅ Listeners registrados correctamente");
			} catch (err) {
				console.error("Error registrando listeners de socket:", err);
				setError("No se pudieron registrar listeners de socket");
			}
		};

		register();

		return () => {
			console.log("🔌 Removiendo listeners de socket...");
			const socketInstance = socketService.getSocket();
			if (socketInstance) {
				socketInstance.off("connect", handleConnect);
				socketInstance.off("disconnect", handleDisconnect);
				socketInstance.off("estado:inicial", handleEstadoInicial);
				socketInstance.off("turno:creado", handleTurnoCreado);
				socketInstance.off("turno:actualizado", handleTurnoActualizado);
				socketInstance.off("turno:llamado", handleTurnoLlamado);
				socketInstance.off("turno:rellamar", handleRellamarTurno);
				socketInstance.off("turno:atendiendo", handleTurnoAtendiendo);
				socketInstance.off("turno:finalizado");
				socketInstance.off("turno:cancelado");
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		// Estado
		turnos,
		turnoActual,
		turnosCola,
		isConnected,
		error,

		// Utilidades
		getTurnosByEstado,
		turnosEnEspera: turnos.filter((t) => t.estado === "esperando"),
		turnosEnAtencion: turnos.filter(
			(t) => t.estado === "llamado" || t.estado === "atendiendo",
		),
	};
};
