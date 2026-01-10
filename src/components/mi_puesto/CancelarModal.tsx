import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import type {
	CancelarTurno,
	MotivoCancelacion,
	DataTurnoCompleto,
} from "@/@types";
import { miPuestoService } from "@/services/miPuestoService";

interface CancelarModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CancelarTurno) => Promise<boolean>;
	turno: DataTurnoCompleto;
	loading?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
}

const CancelarModal: React.FC<CancelarModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	turno,
	loading = false,
}) => {
	const [dataMotivos, setMotivos] = useState<MotivoCancelacion[]>([]);
	const [selectedMotivo, setSelectedMotivo] = useState<number>(0);
	const [descripcion, setDescripcion] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loadingMotivos, setLoadingMotivos] = useState(false);
	// Cargar motivos de pausa al abrir el modal
	useEffect(() => {
		if (isOpen) {
			loadMotivos();
			setSelectedMotivo(0);
			setDescripcion("");
			setErrors({});
		}
	}, [isOpen]);

	const loadMotivos = async () => {
		setLoadingMotivos(true);
		try {
			const data = await miPuestoService.getMotivosCancelacion();
			setMotivos(data);
		} catch (error) {
			console.error("Error cargando motivos de pausa:", error);
		} finally {
			setLoadingMotivos(false);
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!selectedMotivo || selectedMotivo === 0) {
			newErrors.motivo = "Debe seleccionar un motivo de cancelación";
		}
		console.log("!descripcion.trim()", !descripcion.trim());
		if (!descripcion.trim() || descripcion.trim().length < 10) {
			newErrors.descripcion =
				"La descripción debe tener al menos 10 caracteres";
		}

		const regexDescripcion = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñÜü\s.,;:()-]+$/;
		if (!regexDescripcion.test(descripcion)) {
			newErrors.descripcion = "La descripción contiene caracteres no válidos";
		}

		if (descripcion.length > 500) {
			newErrors.descripcion =
				"La descripción no puede exceder los 500 caracteres";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		const success = await onSubmit({
			turno_id: turno.id,
			motivo_id: selectedMotivo,
			observaciones: descripcion.trim() || undefined,
		});
		if (success) onClose();
	};

	const formBody = (
		<div>
			<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#FF9D43]/20 mb-3">
				<span className="material-symbols-rounded text-[#FF9D43] text-4xl!">
					cancel
				</span>
			</div>
			<h3 className="text-2xl text-gray-900 dark:text-white text-center font-bold ">
				Cancelar Turno
			</h3>
			<p className="text-md text-gray-500 dark:text-gray-400 mt-1 text-center mb-3">
				Selecciona un motivo para cancelar el turno.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				{(errors.motivo || errors.descripcion) && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-800 dark:text-red-200">
						{Object.values(errors).map((errMsg, idx) => (
							<div key={idx}>❌&nbsp;{errMsg}</div>
						))}
					</div>
				)}

				{/* Motivo de la pausa */}
				<div>
					<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
						Motivo de la cancelación *
					</label>
					{loadingMotivos ? (
						<div className="flex items-center justify-center py-4">
							<span className="material-symbols-rounded animate-spin text-primary">
								refresh
							</span>
							<span className="ml-2 text-sm text-gray-500">
								Cargando motivos...
							</span>
						</div>
					) : (
						<select
							disabled={loading}
							value={selectedMotivo}
							onChange={(e) => setSelectedMotivo(parseInt(e.target.value))}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
								errors.motivo
									? "border-red-300 focus:ring-red-500 focus:border-red-500"
									: "border-gray-300 focus:ring-primary focus:border-primary"
							} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
						>
							<option value={0}>Seleccionar motivo</option>
							{dataMotivos.map((motivo) => (
								<option key={motivo.motivo_id} value={motivo.motivo_id}>
									{motivo.motivo}
								</option>
							))}
						</select>
					)}
				</div>

				{/* Descripción (Opcional) */}
				<div>
					<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
						Descripción de la cancelación{" "}
					</label>
					<textarea
						disabled={loading}
						value={descripcion}
						onChange={(e) => setDescripcion(e.target.value)}
						rows={4}
						placeholder="Añade una descripción detallada aquí..."
						maxLength={500}
						className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 resize-none ${
							errors.descripcion
								? "border-red-300 focus:ring-red-500 focus:border-red-500"
								: "border-gray-300 focus:ring-primary focus:border-primary"
						} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 dark:placeholder:text-gray-500`}
					/>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						{descripcion.length}/500 caracteres
					</p>
				</div>
			</form>
		</div>
	);

	const footer = (
		<div className="flex flex-row-reverse gap-3">
			<button
				type="button"
				onClick={handleSubmit}
				disabled={loading}
				className="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-800 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				{loading ? (
					<>
						<span className="material-symbols-rounded animate-spin text-sm mr-2">
							refresh
						</span>
						Cancelando...
					</>
				) : (
					<>
						<span className="material-symbols-rounded text-sm mr-2">
							check_circle
						</span>
						Confirmar Cancelación
					</>
				)}
			</button>
			<button
				type="button"
				onClick={onClose}
				disabled={loading}
				className="inline-flex justify-center rounded-md px-4 py-2 bg-white text-base font-medium text-secondary-700 dark:bg-gray-700 dark:text-white sm:text-sm cursor-pointer underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Cerrar
			</button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Cancelar Turno"
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default CancelarModal;
