import React, { useEffect, useState } from "react";
import type {
	FullPrioridad,
	CreatePrioridadData,
	UpdatePrioridadData,
} from "@/@types/prioridades";
import Modal from "@/components/common/Modal";

interface PrioridadModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		data: CreatePrioridadData | UpdatePrioridadData
	) => Promise<boolean>;
	prioridad?: FullPrioridad | null;
	loading?: boolean;
	viewMode?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const PrioridadModal: React.FC<PrioridadModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	prioridad,
	loading = false,
	viewMode = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		nombre_prioridad: "",
		descripcion: "",
		nivel_prioridad: 99,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!prioridad;

	useEffect(() => {
		if (isOpen) {
			if (prioridad) {
				setFormData({
					nombre_prioridad: prioridad.nombre_prioridad || "",
					descripcion: prioridad.descripcion || "",
					nivel_prioridad: prioridad.nivel_prioridad,
				});
			} else {
				setFormData({
					nombre_prioridad: "",
					descripcion: "",
					nivel_prioridad: 99,
				});
			}
			setErrors({});
		}
	}, [isOpen, prioridad]);

	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		const regexNombre = /^[a-zA-Z0-9Á-ÿÑñ\s-_]{2,}$/;
		if (!formData.nombre_prioridad.trim())
			newErrors.nombre_prioridad = "El nombre es requerido";
		else if (!regexNombre.test(formData.nombre_prioridad))
			newErrors.nombre_prioridad = "El nombre debe tener al menos 2 caracteres";
		if (
			typeof formData.nivel_prioridad !== "number" ||
			isNaN(formData.nivel_prioridad) ||
			formData.nivel_prioridad < 0
		)
			newErrors.nivel_prioridad = "El nivel debe ser un número >= 0";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		const data = {
			nombre_prioridad: formData.nombre_prioridad,
			descripcion: formData.descripcion,
			nivel_prioridad: formData.nivel_prioridad,
		} as CreatePrioridadData | UpdatePrioridadData;
		const success = await onSubmit(data);
		if (success) onClose();
	};

	const nivelOptions = [0, 1, 2, 3, 5, 10, 20, 30, 40, 50, 60, 70, 80, 99];

	const formBody = (
		<form onSubmit={handleSubmit} className="space-y-4">
			{serverError && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-800 dark:text-red-200">
					{serverError}
				</div>
			)}

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Nombre *
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.nombre_prioridad}
					onChange={(e) =>
						setFormData((p) => ({ ...p, nombre_prioridad: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.nombre_prioridad
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.nombre_prioridad && (
					<p className="mt-1 text-sm text-red-600">{errors.nombre_prioridad}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Descripción
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.descripcion}
					onChange={(e) =>
						setFormData((p) => ({ ...p, descripcion: e.target.value }))
					}
					className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Nivel de prioridad *
				</label>
				<select
					disabled={viewMode || loading}
					value={String(formData.nivel_prioridad)}
					onChange={(e) =>
						setFormData((p) => ({
							...p,
							nivel_prioridad: parseInt(e.target.value),
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.nivel_prioridad
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					{nivelOptions.map((n) => (
						<option key={n} value={n}>
							{n} {n === 99 ? "(Normal)" : n === 0 ? "(Alta)" : ""}
						</option>
					))}
				</select>
				<p className="text-xs text-gray-500 mt-1">
					Entre mayor sea el número, menor prioridad/menos atención (default
					Normal = 99). Mínimo 0.
				</p>
				{errors.nivel_prioridad && (
					<p className="mt-1 text-sm text-red-600">{errors.nivel_prioridad}</p>
				)}
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
							{isEditing ? "Actualizar" : "Crear Prioridad"}
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
					? "Ver Prioridad"
					: isEditing
					? "Editar Prioridad"
					: "Crear Nueva Prioridad"
			}
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default PrioridadModal;
