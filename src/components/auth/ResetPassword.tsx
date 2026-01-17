import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validateResetToken, resetPasswordWithToken } from "@/services/api";
import { useToastStore } from "@/stores";
import Loading from "@/components/common/Loading";

const ResetPassword: React.FC = () => {
	const { token } = useParams<{ token: string }>();
	const navigate = useNavigate();
	const { addToast } = useToastStore();

	const [isValidatingToken, setIsValidatingToken] = useState(true);
	const [isTokenValid, setIsTokenValid] = useState(false);
	const [username, setUsername] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const validateToken = useCallback(async () => {
		if (!token) return;

		setIsValidatingToken(true);
		try {
			const response = await validateResetToken(token);
			if (response.success) {
				setIsTokenValid(true);
				setUsername(response.username || "");
			} else {
				setIsTokenValid(false);
				setErrorMessage(
					response.message || "El token es inválido o ha expirado",
				);
			}
		} catch {
			setIsTokenValid(false);
			setErrorMessage("Error al validar el token");
		} finally {
			setIsValidatingToken(false);
		}
	}, [token]);

	useEffect(() => {
		if (token) {
			validateToken();
		} else {
			setIsValidatingToken(false);
			setErrorMessage("Token no proporcionado");
		}
	}, [token, validateToken]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validaciones
		if (!newPassword || !confirmPassword) {
			addToast({
				type: "error",
				title: "Por favor complete todos los campos",
			});
			return;
		}

		if (newPassword.length < 8) {
			addToast({
				type: "error",
				title: "La contraseña debe tener al menos 8 caracteres",
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			addToast({
				type: "error",
				title: "Las contraseñas no coinciden",
			});
			return;
		}

        // validar que la contraseña tenga al menos una mayúscula, una minúscula, un número y un carácter especial
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            addToast({
                type: "error",
                title: "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial",
            });
            return;
        }

		if (!token) {
			addToast({
				type: "error",
				title: "Token no válido",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await resetPasswordWithToken(token, newPassword);
			if (response.success) {
				addToast({
					type: "success",
					title: response.message || "Contraseña restablecida exitosamente",
				});
				setTimeout(() => {
					navigate("/login");
				}, 2000);
			} else {
				addToast({
					type: "error",
					title: response.message || "Error al restablecer la contraseña",
				});
			}
		} catch {
			addToast({
				type: "error",
				title: "Error al restablecer la contraseña",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "newPassword") {
			setNewPassword(value);
		} else if (name === "confirmPassword") {
			setConfirmPassword(value);
		}
	};

	if (isValidatingToken) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background-light from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
					<Loading />
					<p className="text-center mt-4 text-gray-600 dark:text-gray-300">
						Validando token...
					</p>
				</div>
			</div>
		);
	}

	if (!isTokenValid) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background-light from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
							<span className="material-symbols-rounded text-4xl! text-red-600 dark:text-red-400">
								cancel
							</span>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							Token Inválido
						</h2>
						<p className="text-gray-600 dark:text-gray-300 mb-6">
							{errorMessage}
						</p>
						<button
							onClick={() => navigate("/login")}
							className="w-full bg-primary-600/90 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
						>
							Volver al inicio de sesión
						</button>
						
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background-light from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
			<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
				<div className="text-center mb-8">
					<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
						<span className="material-symbols-rounded text-4xl! text-primary-600 dark:text-primary-400">
							lock_reset
						</span>
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Restablecer Contraseña
					</h2>
					<p className="text-gray-600 dark:text-gray-300">
						Usuario: <span className="font-semibold">{username}</span>
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="newPassword"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Nueva Contraseña
						</label>
						<div className="relative">
							<input
								id="newPassword"
								name="newPassword"
								type={showPassword ? "text" : "password"}
								value={newPassword}
								onChange={handleInputChange}
								className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-200"
								placeholder="Ingrese su nueva contraseña"
								required
								minLength={8}
								disabled={isSubmitting}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							>
								{showPassword ? (
									<span className="material-symbols-rounded text-lg!">
										visibility_off
									</span>
								) : (
									<span className="material-symbols-rounded text-lg!">
										visibility
									</span>
								)}
							</button>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							Mínimo 8 caracteres
						</p>
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							Confirmar Contraseña
						</label>
						<div className="relative">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={handleInputChange}
								className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-200"
								placeholder="Confirme su nueva contraseña"
								required
								minLength={8}
								disabled={isSubmitting}
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							>
								{showConfirmPassword ? (
									<span className="material-symbols-rounded text-lg!">
										visibility_off
									</span>
								) : (
									<span className="material-symbols-rounded text-lg!">
										visibility
									</span>
								)}
							</button>
						</div>
					</div>

					{newPassword &&
						confirmPassword &&
						newPassword !== confirmPassword && (
							<p className="text-sm text-red-600 dark:text-red-400">
								Las contraseñas no coinciden
							</p>
						)}

					<button
						type="submit"
						disabled={isSubmitting || newPassword !== confirmPassword}
						className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 disabled:cursor-not-allowed! text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
					>
						{isSubmitting ? (
							<>
								<span className="material-symbols-rounded animate-spin text-xl">
									loop
								</span>
								<span>Procesando...</span>
							</>
						) : (
							<span>Restablecer Contraseña</span>
						)}
					</button>

					<div className="text-center">
						<button
							type="button"
							onClick={() => navigate("/login")}
							className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
							disabled={isSubmitting}
						>
							Volver al inicio de sesión
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ResetPassword;
