import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as apiLogin, logout as apiLogout } from "@/services/api";
import { apiService } from "@/services/apiService";
import type { LoginCredentials, AuthResponse, User } from "@/@types";

interface AuthState {
	// Estado
	user: User | null;
	csrfToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	userPermissions: string[]; // Cache de permisos del usuario
	permissionsLoaded: boolean; // Flag para saber si ya se cargaron los permisos

	// Acciones
	login: (credentials: LoginCredentials) => Promise<AuthResponse>;
	logout: () => Promise<void>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
	loadUserPermissions: () => Promise<void>; // Nueva función para cargar permisos

	// Utilidades
	getAuthHeaders: () => Record<string, string>;
	refreshCSRFToken: () => Promise<string | null>;
	checkPermission: (permission: string) => boolean; // Ahora es síncrona
	checkCriticalPermission: (permission: string) => Promise<boolean>; // Para permisos críticos
	getUserPermissions: () => string[]; // Obtener todos los permisos
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			// Estado inicial
			user: null,
			csrfToken: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			userPermissions: [],
			permissionsLoaded: false,

			// Acción de login
			login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
				set({ isLoading: true, error: null });

				try {
					const data = await apiLogin(credentials);

					if (data.success) {
						set({
							user: data.user,
							csrfToken: data.csrfToken,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});

						// Cargar permisos del usuario después del login exitoso
						const { loadUserPermissions } = get();
						loadUserPermissions();

						// Configurar revalidación periódica de permisos (cada 5 minutos)
						setInterval(() => {
							const currentState = get();
							if (currentState.isAuthenticated) {
								currentState.loadUserPermissions();
							}
						}, 5 * 60 * 1000); // 5 minutos
					} else {
						set({
							isLoading: false,
							error: data.message || data.error || "Usuario o contraseña incorrectos",
						});
					}

					return data;
				} catch {
					const errorMessage = "Error de conexión. Por favor, inténtelo de nuevo.";
					set({
						isLoading: false,
						error: errorMessage,
					});

					return {
						success: false,
						error: errorMessage,
					};
				}
			},

			// Acción de logout
			logout: async () => {
				try {
					// Llamar al endpoint de logout para limpiar cookies del servidor
					await apiLogout();
				} catch (error) {
					console.error("Error durante logout:", error);
					// Continuar con logout local aunque falle el servidor
				} finally {
					// Limpiar estado local
					set({
						user: null,
						csrfToken: null,
						isAuthenticated: false,
						error: null,
						userPermissions: [],
						permissionsLoaded: false,
					});

					localStorage.removeItem("auth-storage");
				}
			},

			// Limpiar errores
			clearError: () => {
				set({ error: null });
			},

			// Establecer estado de carga
			setLoading: (loading: boolean) => {
				set({ isLoading: loading });
			},

			// Cargar permisos del usuario
			loadUserPermissions: async (): Promise<void> => {
				const { isAuthenticated, user } = get();

				if (!isAuthenticated || !user) {
					return;
				}

				try {
					const permissions = await apiService.getUserPermissions(user.id_rol);
					set({
						userPermissions: permissions,
						permissionsLoaded: true,
					});
				} catch (error) {
					console.error("Error cargando permisos del usuario:", error);
					set({
						userPermissions: [],
						permissionsLoaded: true, // Marcar como cargado aunque haya error
					});
				}
			},

			// Obtener headers de autenticación
			getAuthHeaders: () => {
				const { csrfToken } = get();
				return {
					"Content-Type": "application/json",
					"X-CSRF-Token": csrfToken || "", // Para operaciones que requieren CSRF
				};
			},

			// Refrescar token CSRF
			refreshCSRFToken: async (): Promise<string | null> => {
				try {
					const token = await apiService.getCSRFToken();
					if (token) {
						set({ csrfToken: token });
					}
					return token;
				} catch (error) {
					console.error("Error obteniendo CSRF token:", error);
				}
				return null;
			},

			// Verificar permisos desde caché (síncrono y rápido)
			checkPermission: (permission: string): boolean => {
				const { isAuthenticated, userPermissions, permissionsLoaded } = get();

				if (!isAuthenticated || !permissionsLoaded) {
					return false;
				}

				return userPermissions.includes(permission);
			},
			// Obtener todos los permisos del usuario
			getUserPermissions: (): string[] => {
				const { userPermissions, isAuthenticated } = get();
				return isAuthenticated ? userPermissions : [];
			},

			// Verificar permiso crítico en tiempo real (para acciones sensibles)
			checkCriticalPermission: async (permission: string): Promise<boolean> => {
				const { isAuthenticated } = get();

				if (!isAuthenticated) {
					return false;
				}

				try {
					// Para permisos críticos, SIEMPRE consultar al servidor
					const response = await apiService.checkPermission(permission);

					// Actualizar caché local con la respuesta del servidor
					const { userPermissions } = get();
					const updatedPermissions = response.hasPermission
						? [...new Set([...userPermissions, permission])]
						: userPermissions.filter((p) => p !== permission);

					set({ userPermissions: updatedPermissions });

					return response.hasPermission || false;
				} catch (error) {
					console.error("Error verificando permiso crítico:", error);
					return false;
				}
			},
		}),
		{
			name: "auth-storage", // nombre único para el localStorage
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
