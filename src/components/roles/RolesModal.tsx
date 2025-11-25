import React, { useEffect, useMemo, useState } from "react";
import type { FullRoles, CreateRolData, UpdateRolData } from "@/@types/roles";
import Modal from "@/components/common/Modal";

interface RolesModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateRolData | UpdateRolData) => Promise<boolean>;
	rol: FullRoles | null;
	loading?: boolean;
	viewMode?: boolean;
	serverError?: string;
	serverFieldErrors?: Record<string, string>;
	getAllPermissions: { id: number; nombre: string; descripcion: string }[];
}

const RolesModal: React.FC<RolesModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	rol,
	loading = false,
	viewMode = false,
	serverError,
	serverFieldErrors,
	getAllPermissions,
}) => {
	const [formData, setFormData] = useState({
		nombre_rol: "",
		descripcion: "",
		permissions: [] as number[],
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!rol;

	useEffect(() => {
		if (isOpen) {
			if (rol) {
				setFormData({
					nombre_rol: rol.nombre_rol || "",
					descripcion: rol.descripcion || "",
					permissions: rol.permissions.map((p) => p.id) || [],
				});
			} else {
				setFormData({
					nombre_rol: "",
					descripcion: "",
					permissions: [],
				});
			}
			setErrors({});
		}
	}, [isOpen, rol]);

	useEffect(() => {
		if (!isOpen) return;
		if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
			setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
		}
	}, [isOpen, serverFieldErrors]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		const regexNombre = /^[a-zA-Z0-9Á-ÿÑñ\s-_]{2,}$/;
		if (!formData.nombre_rol.trim())
			newErrors.nombre_rol = "El nombre es requerido";
		else if (!regexNombre.test(formData.nombre_rol))
			newErrors.nombre_rol = "El nombre debe tener al menos 2 caracteres";
		else if (formData.permissions.length === 0)
			newErrors.permissions = "Debe asignar al menos un permiso al rol";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const groupedPermissions = useMemo(() => {
		const groups: Record<
			string,
			{ id: number; nombre: string; descripcion: string }[]
		> = {};
		(getAllPermissions || []).forEach((perm) => {
			const parts = perm.nombre.split(".");
			const moduleName = parts.length > 1 ? parts[0] : "general";
			if (!groups[moduleName]) groups[moduleName] = [];
			groups[moduleName].push(perm);
		});
		// ordenar módulos y permisos internamente
		Object.keys(groups).forEach((k) =>
			groups[k].sort((a, b) => a.nombre.localeCompare(b.nombre))
		);
		return groups;
	}, [getAllPermissions]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		const data = {
			nombre_rol: formData.nombre_rol,
			descripcion: formData.descripcion,
			permissions: formData.permissions.map((p) => p.toString()),
		} as CreateRolData | UpdateRolData;
		const success = await onSubmit(data);
		if (success) onClose();
	};

	const handleChangePermission = (e: React.FormEvent) => {
		const target = e.target as HTMLInputElement;
		const permId = parseInt(target.id, 10);
		let updatedPermissions = [...(formData.permissions || [])];
		if (target.checked) {
			if (!updatedPermissions.includes(permId)) {
				updatedPermissions.push(permId);
			}
		} else {
			updatedPermissions = updatedPermissions.filter((id) => id !== permId);
		}
		setFormData((prev) => ({ ...prev, permissions: updatedPermissions }));
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
					Nombre del rol*
				</label>
				<input
					type="text"
					disabled={viewMode || loading}
					value={formData.nombre_rol}
					onChange={(e) =>
						setFormData((p) => ({ ...p, nombre_rol: e.target.value }))
					}
					className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
						errors.nombre_rol
							? "border-red-300 focus:ring-red-500 focus:border-red-500"
							: "border-gray-300 focus:ring-primary focus:border-primary"
					} dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				/>
				{errors.nombre_rol && (
					<p className="mt-1 text-sm text-red-600">{errors.nombre_rol}</p>
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
				{errors.descripcion && (
					<p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
				)}
			</div>

			<div>
				<label className="block font-bold text-secondary-700 dark:text-gray-300 mb-1 text-lg">
					Permisos
				</label>
				{errors.permissions && (
					<p className="mt-1 text-sm text-red-600">{errors.permissions}</p>
				)}
				<fieldset>
					<legend className="sr-only">Permisos</legend>
					<div className="space-y-4">
						{Object.keys(groupedPermissions).map((module) => (
							<div key={module}>
								<h3 className="font-semibold text-primary-600 dark:text-gray-200 mb-2 text-md bg-background-light text-center py-1 rounded uppercase">
									{module}
								</h3>
								<div className="space-y-2 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2">
									{groupedPermissions[module].map((perm) => (
										<label
											className="cursor-pointer rounded-lg border border-primary-100 transition relative"
											htmlFor={`${perm.id}`}
											key={perm.id}
										>
											<input
												id={`${perm.id}`}
												checked={
													formData.permissions.some((p) => p === perm.id) ||
													false
												}
												disabled={viewMode || loading}
												onChange={handleChangePermission}
												className="peer sr-only"
												type="checkbox"
											/>
											<div className="flex items-start gap-2 w-full peer-checked:bg-primary/10 peer-checked:border-primary dark:peer-checked:bg-primary-500 p-4 h-full peer-disabled:cursor-not-allowed peer-">
												<div className="flex-1">
													<strong className="font-medium text-sm text-gray-900 break-all dark:text-white">
														{perm.nombre.indexOf(".") !== -1
															? perm.nombre.split(".")[1]
															: perm.nombre}
													</strong>

													<p className="mt-1 text-pretty text-sm text-gray-700 dark:text-white">
														{perm.descripcion}
													</p>
												</div>
											</div>
											<span className="material-symbols-rounded text-primary-600 dark:text-primary-300 absolute right-2 top-2 pointer-events-none select-none opacity-0 transition-all peer-checked:opacity-100 peer-disabled:text-primary-300">
												check_circle
											</span>
										</label>
									))}
								</div>
							</div>
						))}
					</div>
				</fieldset>
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
							{isEditing ? "Actualizar" : "Crear Nuevo Rol"}
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
				viewMode ? "Ver roles" : isEditing ? "Editar roles" : "Crear Nuevo rol"
			}
			footer={footer}
			size="xl"
		>
			{formBody}
		</Modal>
	);
};

export default RolesModal;
