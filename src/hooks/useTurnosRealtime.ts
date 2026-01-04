import { useState, useEffect, useCallback, useRef } from "react";
import { socketService } from "@/services/socket";
import type {
	TurnoDisplayData,
	UseTurnosRealtimeOptions,
} from "@/@types/turnos";

export const useTurnosRealtime = ({
	sedeId,
	autoConnect = true,
}: UseTurnosRealtimeOptions) => {
	const [turnos, setTurnos] = useState<TurnoDisplayData[]>([]);
	const [turnoActual, setTurnoActual] = useState<TurnoDisplayData | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const previousSedeId = useRef<number | null>(null);
	// const audioContextRef = useRef<AudioContext | null>(null);

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
				| "cancelado"
		) => {
			return turnos.filter((t) => t.estado === estado);
		},
		[turnos]
	);

	/**
	 * Reproducir llamada de turno (optimizado para displays sin interacción)
	 */
	const playTurnoCallSound = useCallback(async (turno: TurnoDisplayData) => {
		console.log("🔊 Reproduciendo sonido para turno:", turno.codigo_turno);

		// 1. Síntesis de voz (más permisiva en navegadores)
		try {
			const utterance = new SpeechSynthesisUtterance(
				`Turno ${turno.codigo_turno}, por favor diríjase al ${
					turno.nombre_cubiculo || "cubículo"
				}`
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
	}, []);

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

				// Si cambió la sede, salir de la anterior
				if (previousSedeId.current && previousSedeId.current !== sedeId) {
					await socketService.leaveSedeRoom(previousSedeId.current);
				}

				// Unirse a la nueva sala de sede
				if (previousSedeId.current !== sedeId) {
					await socketService.joinSedeRoom(sedeId);
					previousSedeId.current = sedeId;
				}

				setIsConnected(socketService.isConnected());
			} catch (err) {
				console.error("Error conectando socket:", err);
				setError("Error al conectar con el servidor");
				setIsConnected(false);
			}
		};

		connectAndJoin();

		// Cleanup: NO desconectar, solo salir de la sala
		return () => {
			if (previousSedeId.current) {
				socketService.leaveSedeRoom(previousSedeId.current);
			}
		};
	}, [sedeId, autoConnect]);

	/**
	 * Efecto: Registrar listeners del socket (garantiza conexión antes de registrar)
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
						t.estado === "llamado" || t.estado === "atendiendo"
				);
				if (actual) setTurnoActual(actual);
			}
		};

		const handleTurnoCreado = (turno: TurnoDisplayData) => {
			console.log("🆕 Nuevo turno creado:", turno);
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t
					  )
					: [...prev, turno];
			});
		};

		const handleTurnoActualizado = (turno: TurnoDisplayData) => {
			console.log("🔄 Turno actualizado:", turno);
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t
					  )
					: [...prev, turno];
			});
		};

		const handleTurnoLlamado = (turno: TurnoDisplayData) => {
			console.log("📢 Turno llamado:", turno);
			setTurnoActual(turno);
			playTurnoCallSound(turno);
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t
					  )
					: [...prev, turno];
			});
		};

		const handleRellamarTurno = (turno: TurnoDisplayData) => {
			console.log("🔁 Turno re-llamado:", turno);
			setTurnoActual(turno);
			playTurnoCallSound(turno);
		};

		const handleTurnoAtendiendo = (turno: TurnoDisplayData) => {
			console.log("👨‍💼 Turno en atención:", turno);
			setTurnos((prev) => {
				const exists = prev.find(
					(t) => t.id === turno.id || t.codigo_turno === turno.codigo_turno
				);
				return exists
					? prev.map((t) =>
							t.id === turno.id || t.codigo_turno === turno.codigo_turno
								? { ...t, ...turno }
								: t
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

		let socketInstance = socketService.getSocket();

		const register = async () => {
			try {
				// Garantizar socket conectado antes de registrar
				socketInstance = await socketService.connect();

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
			} catch (err) {
				console.error("Error registrando listeners de socket:", err);
				setError("No se pudieron registrar listeners de socket");
			}
		};

		register();

		return () => {
			console.log("🔌 Removiendo listeners de socket...");
			if (socketInstance) {
				socketInstance.off("connect", handleConnect);
				socketInstance.off("disconnect", handleDisconnect);
				socketInstance.off("estado:inicial", handleEstadoInicial);
				socketInstance.off("turno:creado", handleTurnoCreado);
				socketInstance.off("turno:actualizado", handleTurnoActualizado);
				socketInstance.off("turno:llamado", handleTurnoLlamado);
				socketInstance.off("turno:atendiendo", handleTurnoAtendiendo);
				socketInstance.off("turno:finalizado", handleTurnoFinalizado);
				socketInstance.off("turno:cancelado", handleTurnoCancelado);
			}
		};
	}, [playTurnoCallSound]);

	return {
		// Estado
		turnos,
		turnoActual,
		isConnected,
		error,

		// Utilidades
		getTurnosByEstado,
		turnosEnEspera: turnos.filter((t) => t.estado === "esperando"),
		turnosEnAtencion: turnos.filter(
			(t) => t.estado === "llamado" || t.estado === "atendiendo"
		),
	};
};
