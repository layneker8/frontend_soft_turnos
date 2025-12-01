import React, { useEffect, useState } from "react";
import type {
	FullServicios,
	CreateServiciosData,
	UpdateServiciosData,
} from "@/@types/servicios";
import Modal from "@/components/common/Modal";

interface ServiciosModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		data: CreateServiciosData | UpdateServiciosData
	) => Promise<boolean>;
	servicio?: FullServicios | null;
	loading?: boolean;
	viewMode?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const ServiciosModal: React.FC<ServiciosModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	servicio,
	loading = false,
	viewMode = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		nombre: "",
		descripcion: "",
		codigo_servicio: "",
		estado: true,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!servicio;

	useEffect(() => {
		if (isOpen) {
			if (servicio) {
				setFormData({
					nombre: servicio.nombre || "",
					descripcion: servicio.descripcion || "",
					codigo_servicio: servicio.codigo_servicio || "",
					estado: servicio.estado,
				});
			} else {
				setFormData({
					nombre: "",
					descripcion: "",
					codigo_servicio: "",
					estado: true,
				});
			}
			setErrors({});
		}
	}, [isOpen, servicio]);

	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		const regexNombre = /^[a-zA-Z0-9Á-ÿÑñ\s-_]{2,}$/;
		const regexCodigo = /^[A-Z0-9]{1,10}$/;
		const regexDescripcion = /^[a-zA-Z0-9Á-ÿÑñ\s-_]{0,255}$/;
		if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
		else if (!regexNombre.test(formData.nombre))
			newErrors.nombre = "El nombre debe tener al menos 2 caracteres válidos";

		if (formData.descripcion && formData.descripcion.length > 255)
			newErrors.descripcion =
				"La descripción no puede exceder los 255 caracteres";
		else if (
			formData.descripcion &&
			!regexDescripcion.test(formData.descripcion)
		)
			newErrors.descripcion = "La descripción contiene caracteres no válidos";

		if (!formData.codigo_servicio.trim())
			newErrors.codigo_servicio = "El código de servicio es requerido";
		else if (!regexCodigo.test(formData.codigo_servicio))
			newErrors.codigo_servicio =
				"El código de servicio debe ser mayúsculas o números, máximo 10 caracteres";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		const data = {
			nombre: formData.nombre,
			descripcion: formData.descripcion,
			codigo_servicio: formData.codigo_servicio,
			estado: formData.estado,
		} as CreateServiciosData | UpdateServiciosData;
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
					Nombre del servicio*
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

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Descripción
				</label>
				<textarea
					disabled={viewMode || loading}
					rows={3}
					maxLength={255}
					value={formData.descripcion}
					onChange={(e) =>
						setFormData((p) => ({ ...p, descripcion: e.target.value }))
					}
					className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				{errors.descripcion && (
					<p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Código de servicio *
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.codigo_servicio}
					onChange={(e) =>
						setFormData((p) => ({ ...p, codigo_servicio: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.codigo_servicio
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.codigo_servicio && (
					<p className="mt-1 text-sm text-red-600">{errors.codigo_servicio}</p>
				)}
			</div>
			<div>
				<p className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
					Estado *
				</p>
				<label
					className="relative inline-flex items-center cursor-pointer"
					htmlFor="estado"
				>
					<input
						type="checkbox"
						id="estado"
						className="sr-only peer"
						disabled={viewMode || loading}
						checked={formData.estado}
						onChange={(e) =>
							setFormData((p) => ({ ...p, estado: e.target.checked }))
						}
					/>
					<div
						className="group peer bg-red-50 rounded-full duration-300 w-10 h-5 ring-2 ring-red-600 after:duration-300 after:bg-red-600 after:border after:border-neutral-200 peer-checked:after:bg-green-500 peer-checked:ring-green-500
					peer-checked:bg-green-50 after:rounded-full after:absolute after:h-3 after:w-3 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-5 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
					></div>
				</label>
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
							{isEditing ? "Actualizar" : "Crear servicio"}
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
					? "Ver servicio"
					: isEditing
					? "Editar servicio"
					: "Crear Nuevo servicio"
			}
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default ServiciosModal;
