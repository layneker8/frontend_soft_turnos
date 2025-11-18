import React, { useState, useEffect } from "react";
import type { Sede, Rol } from "@/@types";
import type { FullUser, CreateUserData, UpdateUserData } from "@/@types/users";
import Modal from "../common/Modal";

interface UserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (userData: CreateUserData | UpdateUserData) => Promise<boolean>;
	user?: FullUser | null;
	sedes: Sede[];
	roles: Rol[];
	loading?: boolean;
	viewMode?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const UserModal: React.FC<UserModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	user,
	sedes,
	roles,
	loading = false,
	viewMode = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		documento: "",
		nombre_user: "",
		usuario_user: "",
		correo_user: "",
		id_rol: 0,
		id_sede: 0,
		area_user: "",
		estado: true,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!user;

	// Resetear formulario cuando se abre/cierra el modal
	useEffect(() => {
		if (isOpen) {
			if (user) {
				// Modo edición
				setFormData({
					documento: user.documento || "",
					nombre_user: user.nombre_user || "",
					usuario_user: user.usuario_user || "",
					correo_user: user.correo_user || "",
					area_user: user.area_user || "",
					id_rol: user.id_rol || 0,
					id_sede: user.id_sede || 0,
					estado: user.status_user,
				});
			} else {
				// Modo creación
				setFormData({
					documento: "",
					nombre_user: "",
					usuario_user: "",
					correo_user: "",
					id_rol: 0,
					id_sede: 0,
					area_user: "",
					estado: true,
				});
			}
			setErrors({});
		}
	}, [isOpen, user]);

	// Aplicar errores de backend sin limpiar el formulario
	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		const expDocumento = /^\d+$/;
		const expNombre = /^[a-zA-ZÀ-ÿ\s]{2,100}$/;
		const expUsuario = /^[a-zA-Z0-9_]{3,20}$/;
		const expCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!formData.documento.trim()) {
			newErrors.documento = "El documento es requerido y debe ser numérico";
		} else if (!expDocumento.test(formData.documento)) {
			newErrors.documento = "El documento debe contener solo números";
		}

		if (!formData.nombre_user.trim()) {
			newErrors.nombre_user = "El nombre completo es requerido";
		} else if (!expNombre.test(formData.nombre_user)) {
			newErrors.nombre_user =
				"El nombre completo debe tener solo letras y espacios, entre 2 y 100 caracteres";
		}

		if (!formData.usuario_user.trim()) {
			newErrors.usuario_user = "El nombre de usuario es requerido";
		} else if (!expUsuario.test(formData.usuario_user)) {
			newErrors.usuario_user =
				"El nombre de usuario debe contener entre 3 y 20 caracteres alfanuméricos permitidos con guiones bajos";
		}

		if (!formData.correo_user.trim()) {
			newErrors.correo_user = "El correo electrónico es requerido";
		} else if (!expCorreo.test(formData.correo_user)) {
			newErrors.correo_user = "El formato del correo electrónico no es válido";
		}

		if (formData.id_rol === 0) {
			newErrors.id_rol = "Debe seleccionar un rol";
		}

		if (formData.id_sede === 0) {
			newErrors.id_sede = "Debe seleccionar una sede";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const userData = {
			documento: formData.documento,
			nombre_user: formData.nombre_user,
			usuario_user: formData.usuario_user,
			correo_user: formData.correo_user,
			id_rol: formData.id_rol,
			id_sede: formData.id_sede,
			status_user: formData.estado,
			...(formData.area_user ? { area_user: formData.area_user } : null),
		};

		const success = await onSubmit(userData);
		if (success) {
			onClose();
		}
	};

	// Body del formulario
	const formBody = (
		<form onSubmit={handleSubmit} className="space-y-4">
			{serverError && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-800 dark:text-red-200">
					{serverError}
				</div>
			)}
			{/* Documento */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Documento *
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.documento}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, documento: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.documento
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.documento && (
					<p className="mt-1 text-sm text-red-600">{errors.documento}</p>
				)}
			</div>

			{/* Nombre completo */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Nombre Completo *
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.nombre_user}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, nombre_user: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.nombre_user
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.nombre_user && (
					<p className="mt-1 text-sm text-red-600">{errors.nombre_user}</p>
				)}
			</div>

			{/* Usuario */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Nombre de Usuario *
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.usuario_user}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							usuario_user: e.target.value,
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.usuario_user
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.usuario_user && (
					<p className="mt-1 text-sm text-red-600">{errors.usuario_user}</p>
				)}
			</div>

			{/* Email */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Correo Electrónico *
				</label>
				<input
					type="email"
					disabled={viewMode || loading}
					value={formData.correo_user}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, correo_user: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.correo_user
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.correo_user && (
					<p className="mt-1 text-sm text-red-600">{errors.correo_user}</p>
				)}
			</div>

			{/* Área */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Área del Usuario (opcional)
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.area_user}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, area_user: e.target.value }))
					}
					className={`w-full px-3 py-2 border ${
						errors.area_user
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					}  rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.area_user && (
					<p className="mt-1 text-sm text-red-600">{errors.area_user}</p>
				)}
			</div>

			{/* Rol */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Rol *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.id_rol}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							id_rol: parseInt(e.target.value),
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.id_rol
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>Seleccionar rol</option>
					{roles.map((rol) => (
						<option key={rol.id} value={rol.id}>
							{rol.nombre}
						</option>
					))}
				</select>
				{errors.id_rol && (
					<p className="mt-1 text-sm text-red-600">{errors.id_rol}</p>
				)}
			</div>

			{/* Sede */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Sede *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.id_sede}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							id_sede: parseInt(e.target.value),
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.id_sede
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>Seleccionar sede</option>
					{sedes.map((sede) => (
						<option key={sede.id_sede} value={sede.id_sede}>
							{sede.nombre_sede}
						</option>
					))}
				</select>
				{errors.id_sede && (
					<p className="mt-1 text-sm text-red-600">{errors.id_sede}</p>
				)}
			</div>

			{/* estado */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Estado del usuario *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.estado ? "1" : "0"}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							estado: e.target.value === "1",
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.estado
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value="1">Activo</option>
					<option value="0">Inactivo</option>
				</select>
			</div>
		</form>
	);
	const footer = (
		<div className="flex flex-row-reverse gap-3">
			{!viewMode && (
				<button
					type="button"
					onClick={handleSubmit}
					disabled={loading}
					className="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				>
					{loading ? (
						<>
							<span className="material-symbols-rounded animate-spin text-sm mr-2">
								refresh
							</span>
							{isEditing ? "Actualizando..." : "Creando..."}
						</>
					) : (
						<>
							<span className="material-symbols-rounded text-sm mr-2">
								{isEditing ? "edit" : "add"}
							</span>
							{isEditing ? "Actualizar" : "Crear Usuario"}
						</>
					)}
				</button>
			)}
			<button
				type="button"
				onClick={onClose}
				disabled={loading}
				className="inline-flex justify-center rounded-md px-4 py-2 bg-white text-base font-medium text-secondary-700 dark:bg-gray-700 dark:text-white sm:text-sm cursor-pointer underline hover:no-underline"
			>
				{viewMode ? "Cerrar" : "Cancelar"}
			</button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				viewMode
					? "Ver Usuario"
					: isEditing
					? "Editar Usuario"
					: "Crear Nuevo Usuario"
			}
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default UserModal;
