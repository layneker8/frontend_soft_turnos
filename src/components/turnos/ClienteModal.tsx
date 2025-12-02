import React, { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import type { FullCliente } from "@/@types/clientes";

interface ClienteModalProps {
	identificacion: string;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (cliente: FullCliente) => boolean;
}

const ClienteModal: React.FC<ClienteModalProps> = ({
	identificacion,
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [formData, setFormData] = useState({
		documento: identificacion || "",
		nombre: "",
		telefono: "",
		email: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (isOpen) {
			// Reset form data and errors when modal opens
			setFormData({
				documento: identificacion || "",
				nombre: "",
				telefono: "",
				email: "",
			});
		}
		setErrors({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		const regexDocumento = /^[0-9]{5,20}$/;
		const regexNombre = /^[a-zA-Z0-9Á-ÿÑñ\s]{5,}$/;
		const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const regexTelefono = /^[0-9+\-\s]{7,15}$/;

		if (!formData.nombre) newErrors.nombre = "El nombre es requerido";
		else if (!regexNombre.test(formData.nombre))
			newErrors.nombre = "El nombre debe tener al menos 5 caracteres válidos";

		if (!formData.documento) newErrors.documento = "El documento es requerido";
		else if (!regexDocumento.test(formData.documento))
			newErrors.documento =
				"El documento debe tener entre 5 y 20 dígitos numéricos";

		if (formData.email && !regexEmail.test(formData.email))
			newErrors.email = "El email no es válido";

		if (formData.telefono && !regexTelefono.test(formData.telefono))
			newErrors.telefono = "El teléfono no es válido";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		const data = {
			documento: formData.documento,
			nombre: formData.nombre,
			...(formData.telefono ? { telefono: formData.telefono } : null),
			...(formData.email ? { email: formData.email } : null),
		} as FullCliente;

		const success = onSubmit(data);

		if (success) onClose();
	};

	const formBody = (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Número de Documento *
				</label>
				<input
					type="text"
					value={formData.documento}
					onChange={(e) =>
						setFormData((p) => ({ ...p, documento: e.target.value }))
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

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Nombre completo *
				</label>
				<input
					type="text"
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
					Número de teléfono *
				</label>
				<input
					type="text"
					value={formData.telefono}
					onChange={(e) =>
						setFormData((p) => ({ ...p, telefono: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.telefono
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.telefono && (
					<p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
					Correo *
				</label>
				<input
					type="email"
					value={formData.email}
					onChange={(e) =>
						setFormData((p) => ({ ...p, email: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.email
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.email && (
					<p className="mt-1 text-sm text-red-600">{errors.email}</p>
				)}
			</div>
		</form>
	);

	const footer = (
		<div className="flex flex-row-reverse gap-3">
			<button
				type="button"
				onClick={handleSubmit}
				className="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				<span className="material-symbols-rounded text-sm mr-2">save</span>
				Guardar
			</button>
			<button
				type="button"
				onClick={onClose}
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
			title={"Crear Nuevo Paciente"}
			footer={footer}
			size="md"
		>
			{formBody}
		</Modal>
	);
};

export default ClienteModal;
