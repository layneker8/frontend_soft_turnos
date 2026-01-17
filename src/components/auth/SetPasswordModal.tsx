import React, { useState } from "react";
import Modal from "@/components/common/Modal";

interface SetPasswordModalProps {
	isOpen: boolean;
	username: string;
	onClose: () => void;
	onSubmit: (password: string) => Promise<void>;
}

const SetPasswordModal: React.FC<SetPasswordModalProps> = ({
	isOpen,
	username,
	onClose,
	onSubmit,
}) => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validatePassword = (pwd: string): string | null => {
		if (pwd.length < 8) {
			return "La contraseña debe tener al menos 8 caracteres";
		}
		if (!/[A-Z]/.test(pwd)) {
			return "La contraseña debe contener al menos una letra mayúscula";
		}
		if (!/[a-z]/.test(pwd)) {
			return "La contraseña debe contener al menos una letra minúscula";
		}
		if (!/[0-9]/.test(pwd)) {
			return "La contraseña debe contener al menos un número";
		}
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
			return "La contraseña debe contener al menos un carácter especial";
		}
		return null;
	};

	const handleSubmit = async () => {
		setError("");

		// Validar que las contraseñas coincidan
		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden");
			return;
		}

		// Validar fortaleza de la contraseña
		const validationError = validatePassword(password);
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(password);
			// Limpiar campos después de enviar
			setPassword("");
			setConfirmPassword("");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Error al establecer la contraseña"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			setPassword("");
			setConfirmPassword("");
			setError("");
			onClose();
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Establecer Contraseña">
			<div className="space-y-4">
				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<div className="flex items-start">
						<span className="material-symbols-rounded text-blue-600 dark:text-blue-400 mr-2">
							info
						</span>
						<div className="text-sm text-blue-800 dark:text-blue-200">
							<p className="font-semibold mb-1">Bienvenido, {username}</p>
							<p>
								Para continuar, debe establecer una nueva contraseña segura.
								Esta contraseña reemplazará la temporal y le permitirá acceder
								al sistema.
							</p>
						</div>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
						<div className="flex items-center text-red-800 dark:text-red-200 text-sm">
							<span className="material-symbols-rounded mr-2">error</span>
							<span>{error}</span>
						</div>
					</div>
				)}

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						Nueva Contraseña
					</label>
					<div className="relative">
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isSubmitting}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
							placeholder="Ingrese su nueva contraseña"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							disabled={isSubmitting}
							className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:cursor-not-allowed"
						>
							<span className="material-symbols-rounded text-xl">
								{showPassword ? "visibility_off" : "visibility"}
							</span>
						</button>
					</div>
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						Confirmar Contraseña
					</label>
					<div className="relative">
						<input
							id="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={isSubmitting}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
							placeholder="Confirme su nueva contraseña"
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							disabled={isSubmitting}
							className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:cursor-not-allowed"
						>
							<span className="material-symbols-rounded text-xl">
								{showConfirmPassword ? "visibility_off" : "visibility"}
							</span>
						</button>
					</div>
				</div>

				<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
					<p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Requisitos de la contraseña:
					</p>
					<ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
						<li className="flex items-center">
							<span
								className={`material-symbols-rounded text-sm mr-1 ${
									password.length >= 8
										? "text-green-600 dark:text-green-400"
										: "text-gray-400"
								}`}
							>
								{password.length >= 8
									? "check_circle"
									: "radio_button_unchecked"}
							</span>
							Mínimo 8 caracteres
						</li>
						<li className="flex items-center">
							<span
								className={`material-symbols-rounded text-sm mr-1 ${
									/[A-Z]/.test(password)
										? "text-green-600 dark:text-green-400"
										: "text-gray-400"
								}`}
							>
								{/[A-Z]/.test(password)
									? "check_circle"
									: "radio_button_unchecked"}
							</span>
							Al menos una letra mayúscula
						</li>
						<li className="flex items-center">
							<span
								className={`material-symbols-rounded text-sm mr-1 ${
									/[a-z]/.test(password)
										? "text-green-600 dark:text-green-400"
										: "text-gray-400"
								}`}
							>
								{/[a-z]/.test(password)
									? "check_circle"
									: "radio_button_unchecked"}
							</span>
							Al menos una letra minúscula
						</li>
						<li className="flex items-center">
							<span
								className={`material-symbols-rounded text-sm mr-1 ${
									/[0-9]/.test(password)
										? "text-green-600 dark:text-green-400"
										: "text-gray-400"
								}`}
							>
								{/[0-9]/.test(password)
									? "check_circle"
									: "radio_button_unchecked"}
							</span>
							Al menos un número
						</li>
						<li className="flex items-center">
							<span
								className={`material-symbols-rounded text-sm mr-1 ${
									/[!@#$%^&*(),.?":{}|<>]/.test(password)
										? "text-green-600 dark:text-green-400"
										: "text-gray-400"
								}`}
							>
								{/[!@#$%^&*(),.?":{}|<>]/.test(password)
									? "check_circle"
									: "radio_button_unchecked"}
							</span>
							Al menos un carácter especial (!@#$%^&*...)
						</li>
					</ul>
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<button
						onClick={handleClose}
						disabled={isSubmitting}
						className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancelar
					</button>
					<button
						onClick={handleSubmit}
						disabled={
							isSubmitting ||
							!password ||
							!confirmPassword ||
							password !== confirmPassword
						}
						className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
					>
						{isSubmitting ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Estableciendo...
							</>
						) : (
							<>
								<span className="material-symbols-rounded mr-1 text-base">
									lock_reset
								</span>
								Establecer Contraseña
							</>
						)}
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default SetPasswordModal;
