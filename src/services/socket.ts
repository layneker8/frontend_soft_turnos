import { io, Socket } from "socket.io-client";
import env from "@/config/env";
import type { TurnoSocketEvents, ClientToServerEvents } from "@/@types/turnos";

// Tipar correctamente el Socket con eventos personalizados
// Socket<ServerToClientEvents, ClientToServerEvents>
type TypedSocket = Socket<TurnoSocketEvents, ClientToServerEvents>;

class SocketService {
	private socket: TypedSocket | null = null;
	private connectionPromise: Promise<TypedSocket> | null = null;
	private currentSedeId: number | null = null;

	/**
	 * Conecta al servidor de Socket.IO
	 */
	connect(): Promise<TypedSocket> {
		// Si ya existe una conexión en proceso, retornarla
		if (this.connectionPromise) {
			return this.connectionPromise;
		}

		// Si ya está conectado, retornar el socket existente
		if (this.socket?.connected) {
			return Promise.resolve(this.socket);
		}

		this.connectionPromise = new Promise((resolve, reject) => {
			try {
				this.socket = io(env.SOCKET_URL, {
					transports: ["websocket"],
					autoConnect: true,
					reconnection: true,
					reconnectionDelay: 1000,
					reconnectionDelayMax: 5000,
					reconnectionAttempts: Infinity,
				});

				this.socket.on("connect", () => {
					console.log("✅ Socket conectado:", this.socket?.id);

					if (this.currentSedeId !== null) {
						console.log(
							`🔄 Reconectando a sala de sede: ${this.currentSedeId}`
						);
						this.socket?.emit("join:sede", this.currentSedeId);
					}
					resolve(this.socket!);
				});

				this.socket.on("connect_error", (error) => {
					console.error("❌ Error de conexión Socket:", error);
					reject(error);
				});

				this.socket.on("disconnect", (reason) => {
					console.log("🔌 Socket desconectado:", reason);
					this.connectionPromise = null;
					if (reason === "io server disconnect") {
						console.log("🔄 Reconectando...");
						this.socket?.connect();
					}
				});

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(this.socket as any).on("reconnect", (attemptNumber: number) => {
					console.log(`✅ Reconectado después de ${attemptNumber} intentos`);
				});

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(this.socket as any).on(
					"reconnect_attempt",
					(attemptNumber: number) => {
						console.log(`🔄 Intento de reconexión #${attemptNumber}`);
					}
				);

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(this.socket as any).on("reconnect_failed", () => {
					console.error("❌ Falló la reconexión después de todos los intentos");
				});
			} catch (error) {
				console.error("Error al crear socket:", error);
				reject(error);
			}
		});

		return this.connectionPromise;
	}

	/**
	 * Desconecta el socket
	 */
	disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
			this.connectionPromise = null;
			this.currentSedeId = null;
		}
	}

	/**
	 * Verifica si el socket está conectado
	 */
	isConnected(): boolean {
		return this.socket?.connected ?? false;
	}

	/**
	 * Obtiene el socket actual
	 */
	getSocket(): TypedSocket | null {
		return this.socket;
	}

	/**
	 * Une a una sala específica de sede
	 */
	async joinSedeRoom(sedeId: number): Promise<void> {
		this.currentSedeId = sedeId;
		const socket = await this.connect();
		socket.emit("join:sede", sedeId);
		console.log(`📍 Unido a sala de sede: ${sedeId}`);
	}

	/**
	 * Sale de una sala de sede
	 */
	async leaveSedeRoom(sedeId: number): Promise<void> {
		const socket = this.getSocket();
		if (socket) {
			socket.emit("leave:sede", sedeId);
			console.log(`📍 Salió de sala de sede: ${sedeId}`);
		}
		if (this.currentSedeId === sedeId) {
			this.currentSedeId = null;
		}
	}

	/**
	 * Escucha eventos del socket (reservados y personalizados)
	 */
	on(event: "connect", callback: () => void): void;
	on(event: "disconnect", callback: (reason: string) => void): void;
	on(event: "connect_error", callback: (error: Error) => void): void;
	on<K extends keyof TurnoSocketEvents>(
		event: K,
		callback: TurnoSocketEvents[K]
	): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(event: string, callback: (...args: any[]) => void): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.socket?.on(event as any, callback as any);
	}

	/**
	 * Deja de escuchar eventos
	 */
	off(event: "connect"): void;
	off(event: "disconnect"): void;
	off(event: "connect_error"): void;
	off<K extends keyof TurnoSocketEvents>(event: K): void;
	off(event: string): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.socket?.off(event as any);
	}

	/**
	 * Emite un evento
	 */
	emit(event: string, ...args: unknown[]): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.socket?.emit(event as any, ...args);
	}
}

// Exportar una instancia única del servicio
export const socketService = new SocketService();
