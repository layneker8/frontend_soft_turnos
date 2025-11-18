import React, { useEffect, useState } from "react";
import type { FullSede, CreateSedeData, UpdateSedeData } from "@/@types/sedes";
import Modal from "@/components/common/Modal";

interface SedeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateSedeData | UpdateSedeData) => Promise<boolean>;
	sede?: FullSede | null;
	loading?: boolean;
	viewMode?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const SedeModal: React.FC<SedeModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	sede,
	loading = false,
	viewMode = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		nombre_sede: "",
		direccion: "",
		estado_sede: true,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!sede;

	useEffect(() => {
		if (isOpen) {
			if (sede) {
				setFormData({
					nombre_sede: sede.nombre_sede || "",
					direccion: sede.direccion || "",
					estado_sede: sede.estado_sede,
				});
			} else {
				setFormData({ nombre_sede: "", direccion: "", estado_sede: true });
			}
			setErrors({});
		}
	}, [isOpen, sede]);

	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		const regexNombre = /^[a-zA-Z0-9Á-ÿÑñ\s-_]{2,}$/;
		if (!formData.nombre_sede.trim())
			newErrors.nombre_sede = "El nombre es requerido";
		else if (!regexNombre.test(formData.nombre_sede))
			newErrors.nombre_sede = "El nombre debe tener al menos 2 caracteres";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		const data = {
			nombre_sede: formData.nombre_sede,
			direccion: formData.direccion,
			estado_sede: formData.estado_sede,
		} as CreateSedeData | UpdateSedeData;
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
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Nombre *
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.nombre_sede}
					onChange={(e) =>
						setFormData((p) => ({ ...p, nombre_sede: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.nombre_sede
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.nombre_sede && (
					<p className="mt-1 text-sm text-red-600">{errors.nombre_sede}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Dirección
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.direccion}
					onChange={(e) =>
						setFormData((p) => ({ ...p, direccion: e.target.value }))
					}
					className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Estado *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.estado_sede ? "1" : "0"}
					onChange={(e) =>
						setFormData((p) => ({ ...p, estado_sede: e.target.value === "1" }))
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
							{isEditing ? "Actualizar" : "Crear Sede"}
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
				viewMode ? "Ver Sede" : isEditing ? "Editar Sede" : "Crear Nueva Sede"
			}
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default SedeModal;
