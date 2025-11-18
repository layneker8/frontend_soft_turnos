import React, { useEffect, useState } from "react";
import type { Sede } from "@/@types";
import type {
	FullCubiculo,
	CreateCubiculoData,
	UpdateCubiculoData,
} from "@/@types/cubiculos";
import Modal from "../common/Modal";

interface CubiculoModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateCubiculoData | UpdateCubiculoData) => Promise<boolean>;
	cubiculo?: FullCubiculo | null;
	sedes: Sede[];
	loading?: boolean;
	viewMode?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const CubiculoModal: React.FC<CubiculoModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	cubiculo,
	sedes,
	loading = false,
	viewMode = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		nombre: "",
		id_sede: 0,
		estado: true,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!cubiculo;

	useEffect(() => {
		if (isOpen) {
			if (cubiculo) {
				setFormData({
					nombre: cubiculo.nombre || "",
					id_sede: cubiculo.sede_id || 0,
					estado: cubiculo.estado,
				});
			} else {
				setFormData({ nombre: "", id_sede: 0, estado: true });
			}
			setErrors({});
		}
	}, [isOpen, cubiculo]);

	// Aplicar errores de backend sin limpiar el formulario
	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		const regexNombre = /^[a-zA-Z0-9Á-ÿÑñ\s-_]{2,}$/;

		if (!formData.nombre.trim()) {
			newErrors.nombre = "El nombre es requerido";
		} else if (!regexNombre.test(formData.nombre)) {
			newErrors.nombre =
				"El nombre debe tener al menos 2 caracteres y solo letras y números";
		}

		// id_sede
		if (!sedes.find((s) => s.id_sede === formData.id_sede)) {
			newErrors.id_sede = "La sede seleccionada no es válida";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		const data = {
			nombre: formData.nombre,
			id_sede: formData.id_sede,
			estado: formData.estado,
		};

		const success = await onSubmit(data);
		if (success) onClose();
	};

	const formBody = (
		<form onSubmit={handleSubmit} className="space-y-4">
			{serverError && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-800 dark:text-red-200">
					{serverError}
				</div>
			)}
			{/* Nombre */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Nombre *
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.nombre}
					onChange={(e) =>
						setFormData((p) => ({ ...p, nombre: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.nombre
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.nombre && (
					<p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
				)}
			</div>

			{/* Sede*/}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Sede *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.id_sede}
					onChange={(e) =>
						setFormData((p) => ({ ...p, id_sede: parseInt(e.target.value) }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.id_sede
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>Sin sede</option>
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

			{/* Estado */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Estado *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.estado ? "1" : "0"}
					onChange={(e) =>
						setFormData((p) => ({ ...p, estado: e.target.value === "1" }))
					}
					className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
							{isEditing ? "Actualizar" : "Crear Cubículo"}
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
					? "Ver Cubículo"
					: isEditing
					? "Editar Cubículo"
					: "Crear Nuevo Cubículo"
			}
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default CubiculoModal;
