import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import type { FullCubiculo } from "@/@types/cubiculos";
import type { FullServicios } from "@/@types/servicios";
import type { FullSede } from "@/@types/sedes";

interface AsignacionServiciosModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		cubiculo_id: number;
		servicio_id: number;
	}) => Promise<boolean>;
	sedes: FullSede[];
	cubiculos: FullCubiculo[];
	servicios: FullServicios[];
	loadCubiculosBySede: (id_sede: number) => Promise<void>;
	loading?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const AsignacionServiciosModal: React.FC<AsignacionServiciosModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	sedes,
	cubiculos,
	servicios,
	loadCubiculosBySede,
	loading = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		id_sede: 0,
		cubiculo_id: 0,
		servicio_id: 0,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (isOpen) {
			setFormData({
				id_sede: 0,
				cubiculo_id: 0,
				servicio_id: 0,
			});
			setErrors({});
		}
	}, [isOpen]);

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
		if (!formData.cubiculo_id || formData.cubiculo_id <= 0) {
			newErrors.cubiculo_id = "El cubículo es obligatorio y debe ser válido";
		}
		if (!formData.servicio_id || formData.servicio_id <= 0) {
			newErrors.servicio_id = "El servicio es obligatorio y debe ser válido";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		const data = {
			cubiculo_id: formData.cubiculo_id,
			servicio_id: formData.servicio_id,
		};

		const success = await onSubmit(data);
		if (success) onClose();
	};

	const handleLoadCubiculosBySede = async (sedeId: number) => {
		setFormData((p) => ({
			...p,
			id_sede: sedeId,
			cubiculo_id: 0, // Resetear el cubículo al cambiar de sede
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

			{/* Sede */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Sede *
				</label>
				<select
					disabled={loading}
					value={formData.id_sede || 0}
					onChange={(e) => handleLoadCubiculosBySede(Number(e.target.value))}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.id_sede
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>Seleccione una sede</option>
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
					disabled={loading || !formData.id_sede}
					value={formData.cubiculo_id}
					onChange={(e) =>
						setFormData((p) => ({
							...p,
							cubiculo_id: Number(e.target.value),
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.cubiculo_id
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>
						{!formData.id_sede
							? "Primero seleccione una sede"
							: "Seleccione un cubículo"}
					</option>
					{cubiculos
						.filter((c) => c.estado)
						.map((cubiculo) => (
							<option key={cubiculo.id} value={cubiculo.id}>
								{cubiculo.nombre}
							</option>
						))}
				</select>
				{errors.cubiculo_id && (
					<p className="mt-1 text-sm text-red-600">{errors.cubiculo_id}</p>
				)}
			</div>

			{/* Servicio */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Servicio *
				</label>
				<select
					disabled={loading}
					value={formData.servicio_id}
					onChange={(e) =>
						setFormData((p) => ({
							...p,
							servicio_id: Number(e.target.value),
						}))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.servicio_id
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					<option value={0}>Seleccione un servicio</option>
					{servicios
						.filter((s) => s.estado)
						.map((servicio) => (
							<option key={servicio.id} value={servicio.id}>
								{servicio.nombre} ({servicio.codigo_servicio})
							</option>
						))}
				</select>
				{errors.servicio_id && (
					<p className="mt-1 text-sm text-red-600">{errors.servicio_id}</p>
				)}
			</div>
		</form>
	);

	const footer = (
		<div className="flex flex-row-reverse gap-3">
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
						Creando...
					</>
				) : (
					<>
						<span className="material-symbols-rounded text-sm mr-2">add</span>
						Crear Asignación
					</>
				)}
			</button>
			<button
				type="button"
				onClick={onClose}
				disabled={loading}
				className="inline-flex justify-center rounded-md px-4 py-2 bg-white text-base font-medium text-secondary-700 dark:bg-gray-700 dark:text-white sm:text-sm cursor-pointer underline hover:no-underline"
			>
				Cancelar
			</button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Nueva Asignación de Servicio"
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default AsignacionServiciosModal;
