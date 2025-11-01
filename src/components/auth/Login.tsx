import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { useToastStore } from "@/stores";
import type { LoginCredentials } from "@/@types";

const Login: React.FC = () => {
	const [formData, setFormData] = useState<LoginCredentials>({
		username: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const navigate = useNavigate();
	// Zustand stores
	const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
	const { addToast } = useToastStore();

	useEffect(() => {
		// Si ya está autenticado, redirigir al dashboard
		if (isAuthenticated) {
			navigate("/dashboard", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const handleTogglePassword = (e: React.MouseEvent) => {
		e.preventDefault();
		setShowPassword((prev) => !prev);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Limpiar error cuando el usuario empiece a escribir
		if (error) clearError();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		clearError();

		const result = await login(formData);

		if (result.status === 200 && result.success) {
			addToast({
				type: "success",
				title: "¡Bienvenido!",
				message: "Has iniciado sesión correctamente",
			});
			// navigate("/dashboard", { replace: true });
		}
		if (result.status === 401) {
			addToast({
				type: "error",
				title: "Error de autenticación",
				message: result.error || "Usuario o contraseña incorrectos",
			});
		}

		if (result.status === 400 || result.status === 500) {
			addToast({
				type: "error",
				title: "Error",
				message:
					result.error ||
					"Hubo un problema al iniciar sesión. Por favor, inténtelo de nuevo más tarde.",
			});
		}
		if (result.status === 429) {
			addToast({
				type: "warning",
				title: "Demasiados intentos",
				message:
					"Has excedido el número de intentos de inicio de sesión. Por favor, espera un momento e inténtalo de nuevo.",
			});
		}
	};

	return (
		<div className="flex min-h-screen">
			<div className="hidden lg:flex lg:w-1/2 bg-gray-200 dark:bg-gray-800">
				<img
					alt="Illustrative image highlighting a key feature of SchedulePro"
					className="w-full h-full object-cover"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYdvJfTvqat9CCgDW_xKfiyVw9WMYvw6lqevqvqo8JlVvexSfIGIv1lwBTH8yv0hqAbtA6kEc8IZBvdBoANjbseTHAroWTgfGX8ph_-hfPRDbl4ib72Qc9x6d_6j8fvJNzXleLqKoha9J0cmINvb-EujCP0bo_c97i_SEjY6H4DECCYb02QXHIPppUyPmBXWoHcO3PXjZ32wBHaML3wWuykvlimpArL9UDmspYmdm9yAPy8XMEvu7-uGavKjMboooBnt3mFmJRtaeH"
				/>
			</div>
			<div className="flex items-center justify-center w-full lg:w-1/2 bg-background-light dark:bg-background-dark">
				<div className="w-[90%] max-w-md p-8 space-y-8 bg-white dark:bg-background-dark rounded-xl shadow-lg">
					<div className="text-center">
						<h3 className="text-3xl font-bold text-background-dark dark:text-background-light">
							Iniciar Sesión
						</h3>
						<p className="mt-2 text-sm text-secondary">
							Bienvenido, por favor ingrese sus credenciales para continuar.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="mt-8 space-y-6">
						{error && (
							<div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg flex items-center">
								<span className="material-symbols-rounded mr-2">error</span>{" "}
								<span>{error}</span>
							</div>
						)}

						<div className="space-y-4">
							<div>
								<label
									htmlFor="username"
									className="text-sm font-medium text-secondary dark:text-gray-400 mb-1 flex items-center"
								>
									<span className="material-symbols-rounded mr-2 text-secondary text-base">
										shield
									</span>
									Usuario
								</label>
								<input
									id="username"
									name="username"
									type="text"
									required
									value={formData.username}
									onChange={handleInputChange}
									className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-secondary text-background-dark dark:text-background-light bg-background-light dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
									placeholder="Usuario"
								/>
							</div>

							<div>
								<label
									htmlFor="password"
									className="text-sm font-medium text-secondary dark:text-gray-400 mb-1 flex items-center"
								>
									<span className="material-symbols-rounded mr-2 text-secondary text-base">
										fingerprint
									</span>
									Contraseña
								</label>
								<div className="relative">
									<input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										required
										autoComplete="current-password"
										value={formData.password}
										onChange={handleInputChange}
										className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-secondary text-background-dark dark:text-background-light bg-background-light dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
										placeholder="Contraseña"
									/>
									<span
										className="material-symbols-rounded absolute right-3 top-3 text-gray-400 cursor-pointer"
										onClick={handleTogglePassword}
									>
										{showPassword ? "visibility" : "visibility_off"}
									</span>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-end">
							<div className="text-sm">
								<Link
									to="/forgot-password"
									className="font-medium text-primary hover:text-primary/80 transition-colors"
								>
									¿Olvidé mi contraseña?
								</Link>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isLoading}
								className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							>
								{isLoading ? (
									<div className="flex items-center">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Iniciando sesión...
									</div>
								) : (
									<>
										<span className="material-symbols-rounded mr-2 text-white text-base">
											vpn_key
										</span>
										Iniciar Sesión
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
