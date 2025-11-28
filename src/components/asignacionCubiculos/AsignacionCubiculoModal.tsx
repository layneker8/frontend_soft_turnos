import React, { useEffect, useState } from "react";
import type {
	AsignacionesCubiculo,
	dataAsignacion,
	FullCubiculo,
} from "@/@types/cubiculos";
import Modal from "../common/Modal";
import type { FullSede } from "@/@types/sedes";
import type { FullUser } from "@/@types/users";

interface AsignacionCubiculoModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: dataAsignacion) => Promise<boolean>;
	asignaciones: AsignacionesCubiculo | null;
	sedes: FullSede[];
	usuarios: FullUser[];
	cubiculos: FullCubiculo[];
	loadCubiculosBySede: (id_sede: number) => Promise<void>;
	loading?: boolean;
	viewMode?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const AsignacionCubiculoModal: React.FC<AsignacionCubiculoModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	asignaciones,
	sedes,
	cubiculos,
	usuarios,
	loadCubiculosBySede,
	loading = false,
	viewMode = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		id_sede: 0,
		id_usuario: 0,
		cubiculo_id: 0,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!asignaciones;

	useEffect(() => {
		if (isOpen) {
			if (asignaciones) {
				setFormData({
					id_sede: asignaciones.id_sede || 0,
					id_usuario: asignaciones.id_usuario || 0,
					cubiculo_id: asignaciones.cubiculo_id || 0,
				});
			} else {
				setFormData({
					id_sede: 0,
					id_usuario: 0,
					cubiculo_id: 0,
				});
			}
			setErrors({});
		}
	}, [isOpen, asignaciones]);

	// Aplicar errores de backend sin limpiar el formulario
	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (!formData.id_sede || formData.id_sede <= 0) {
			newErrors.id_sede = "La sede es obligatoria y debe ser válida";
		}
		if (!formData.id_usuario || formData.id_usuario <= 0) {
			newErrors.id_usuario = "El usuario es obligatorio y debe ser válido";
		}
		if (!formData.cubiculo_id || formData.cubiculo_id <= 0) {
			newErrors.cubiculo_id = "El cubículo es obligatorio y debe ser válido";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		const data = {
			id_usuario: formData.id_usuario,
			cubiculo_id: formData.cubiculo_id,
		};

		const success = await onSubmit(data);
		if (success) onClose();
	};

	const handleLoadCubiculosBySede = async (sedeId: number) => {
		setFormData((p) => ({
			...p,
			id_sede: sedeId,
		}));
		await loadCubiculosBySede(sedeId);
	};

	const formBody = (
		<form onSubmit={handleSubmit} className="space-y-4">
			{serverError && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-800 dark:text-red-200">
					{serverError}
				</div>
			)}
			{/* Sede*/}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Sede *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.id_sede || 0}
					onChange={(e) => handleLoadCubiculosBySede(Number(e.target.value))}
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

			{/* Cubículo */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Cubículo *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.cubiculo_id}
					onChange={(e) =>
						setFormData((p) => ({
							...p,
							cubiculo_id: Number(e.target.value),
						}))
					}
					className={`w-full pl-3 pr-5 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.cubiculo_id
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>Sin cubículo</option>
					{cubiculos.map((cubiculo) => (
						<option key={cubiculo.id} value={cubiculo.id}>
							{cubiculo.nombre}
						</option>
					))}
				</select>
				{errors.cubiculo_id && (
					<p className="mt-1 text-sm text-red-600">{errors.cubiculo_id}</p>
				)}
			</div>

			{/* Usuarios */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Usuario *
				</label>
				<select
					disabled={viewMode || loading}
					value={formData.id_usuario}
					onChange={(e) =>
						setFormData((p) => ({
							...p,
							id_usuario: Number(e.target.value),
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.id_usuario
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>Sin usuario</option>
					{usuarios.map((usuario) => (
						<option key={usuario.id_usuario} value={usuario.id_usuario}>
							{usuario.nombre_user}
						</option>
					))}
				</select>
				{errors.id_usuario && (
					<p className="mt-1 text-sm text-red-600">{errors.id_usuario}</p>
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

export default AsignacionCubiculoModal;
