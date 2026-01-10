import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import type { FinalizarData, DataTurnoCompleto } from "@/@types";

interface FinalizarModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: FinalizarData) => Promise<boolean>;
	turno: DataTurnoCompleto;
	loading?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const FinalizarModal: React.FC<FinalizarModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	turno,
	loading = false,
	serverError,
	serverFieldErrors,
}) => {
	const [formData, setFormData] = useState({
		id: 0,
		observaciones: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (isOpen) {
			if (turno) {
				setFormData({
					id: turno.id,
					observaciones: turno.observaciones || "",
				});
			} else {
				setFormData({ id: 0, observaciones: "" });
			}
			setErrors({});
		}
	}, [isOpen, turno]);

	// Aplicar errores de backend sin limpiar el formulario
	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Observaciones es opcional, pero si se proporciona debe ser válido
		if (formData.observaciones.trim()) {
			const regexObservaciones = /^[a-zA-Z0-9Á-ÿÑñ\s-,.]{2,500}$/;
			if (!regexObservaciones.test(formData.observaciones)) {
				newErrors.observaciones =
					"Las observaciones solo pueden contener letras, números, espacios y los caracteres ,.- y deben tener entre 2 y 500 caracteres.";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		const data: FinalizarData = {
			turno_id: formData.id.toString(),
			observaciones: formData.observaciones.trim() || undefined,
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

			{/* Información del turno */}
			<div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 space-y-2">
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium text-secondary-700 dark:text-gray-300">
						Número de turno:
					</span>
					<span className="text-sm font-semibold text-primary">
						{turno?.codigo_turno || "N/A"}
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium text-secondary-700 dark:text-gray-300">
						Paciente:
					</span>
					<span className="text-sm text-secondary-900 dark:text-gray-100">
						{turno?.cliente?.nombre || "N/A"}
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium text-secondary-700 dark:text-gray-300">
						Servicio:
					</span>
					<span className="text-sm text-secondary-900 dark:text-gray-100">
						{turno?.servicio || "N/A"}
					</span>
				</div>
			</div>

			{/* Observaciones */}
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Observaciones{" "}
					<span className="text-gray-500 text-xs">(opcional)</span>
				</label>
				<textarea
					disabled={loading}
					value={formData.observaciones}
					onChange={(e) =>
						setFormData((p) => ({ ...p, observaciones: e.target.value }))
					}
					rows={4}
					placeholder="Ingrese observaciones sobre la atención del turno..."
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 resize-none ${
						errors.observaciones
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 dark:placeholder:text-gray-500`}
				/>
				{errors.observaciones && (
					<p className="mt-1 text-sm text-red-600">{errors.observaciones}</p>
				)}
				<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
					{formData.observaciones.length}/500 caracteres
				</p>
			</div>
		</form>
	);

	const footer = (
		<div className="flex flex-row-reverse gap-3">
			<button
				type="button"
				onClick={handleSubmit}
				disabled={loading}
				className="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				{loading ? (
					<>
						<span className="material-symbols-rounded animate-spin text-sm mr-2">
							refresh
						</span>
						Finalizando...
					</>
				) : (
					<>
						<span className="material-symbols-rounded text-sm mr-2">
							check_circle
						</span>
						Finalizar Turno
					</>
				)}
			</button>
			<button
				type="button"
				onClick={onClose}
				disabled={loading}
				className="inline-flex justify-center rounded-md px-4 py-2 bg-white text-base font-medium text-secondary-700 dark:bg-gray-700 dark:text-white sm:text-sm cursor-pointer underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Cancelar
			</button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Finalizar Turno"
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default FinalizarModal;
