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

	// Acciones
	login: (credentials: LoginCredentials) => Promise<AuthResponse>;
	logout: () => Promise<void>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;

	// Utilidades
	getAuthHeaders: () => Record<string, string>;
	refreshCSRFToken: () => Promise<string | null>;
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
		}),
		{
			name: "auth-storage", // nombre único para el localStorage
			partialize: (state) => ({
				user: state.user,
				// csrfToken: state.csrfToken,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
