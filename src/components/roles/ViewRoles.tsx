import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_PERMISSIONS } from "@/constants/permissions";
import DataTable, { type TableColumn, Media } from "react-data-table-component";
import { ProtectedAnyPermission } from "../common/ProtectedComponent";
import tailwindTheme, { PaginationOptions } from "@/config/StyleTable";
import Loading from "@/components/common/Loading";
import Modal from "@/components/common/Modal";
import Buttons from "./Buttons";
import { useRoles } from "@/hooks/useRoles";
import type { FullRoles, CreateRolData, UpdateRolData } from "@/@types/roles";
import RolesModal from "./RolesModal";

const ViewRoles: React.FC = () => {
	const {
		roles,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		createRole,
		updateRole,
		deleteRole,
		getRoleById,
		getAllPermissions,
	} = useRoles();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selected, setSelected] = useState<FullRoles | null>(null);
	const [modalMode, setModalMode] = useState(false); // false for edit/create, true for view
	const [searchTerm, setSearchTerm] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [rolToDelete, setRolToDelete] = useState<FullRoles | null>(null);
	const [serverError, setServerError] = useState<string | undefined>(undefined);
	const [serverFieldErrors, setServerFieldErrors] = useState<
		Record<string, string> | undefined
	>(undefined);
	const [isInitialized, setIsInitialized] = useState(false);
	const [allPermissions, setAllPermissions] = useState<
		{ id: number; nombre: string; descripcion: string; created_at: string }[]
	>([]);
	useEffect(() => {
		if (!loading || !permissionsLoading) {
			setIsInitialized(true);
		}
	}, [loading, permissionsLoading]);

	useEffect(() => {
		let mounted = true;
		getAllPermissions().then((perms) => {
			if (mounted) setAllPermissions(perms);
		});
		return () => {
			mounted = false;
		};
	}, [getAllPermissions]);

	const filtered = roles.filter(
		(r) =>
			r.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(r.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleView = useCallback(
		async (r: FullRoles) => {
			const full = await getRoleById(r.id);
			if (full) {
				setServerError(undefined);
				setServerFieldErrors(undefined);
				setModalMode(true);
				setSelected(full);
				setIsModalOpen(true);
			}
		},
		[getRoleById]
	);

	const handleEdit = useCallback(
		async (r: FullRoles) => {
			const full = await getRoleById(r.id);
			if (full) {
				setServerError(undefined);
				setServerFieldErrors(undefined);
				setModalMode(false);
				setSelected(full);
				setIsModalOpen(true);
			}
		},
		[getRoleById]
	);

	const handleCreate = useCallback(() => {
		setServerError(undefined);
		setServerFieldErrors(undefined);
		setSelected(null);
		setModalMode(false);
		setIsModalOpen(true);
	}, []);

	const handleDelete = useCallback((r: FullRoles) => {
		setRolToDelete(r);
		setShowDeleteModal(true);
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!rolToDelete) return;
		const res = await deleteRole(rolToDelete.id);
		if (res.ok) {
			setShowDeleteModal(false);
			setRolToDelete(null);
		}
	}, [rolToDelete, deleteRole]);

	const columns: TableColumn<FullRoles>[] = useMemo(
		() => [
			{
				id: "nombre",
				name: "Nombre",
				selector: (r) => r.nombre_rol,
				sortable: true,
				wrap: true,
			},
			{
				id: "descripcion",
				name: "Descripción",
				selector: (r) => r.descripcion || "-",
				hide: Media.SM,
				wrap: true,
			},
			{
				id: "totalPermissions",
				name: "Total Permisos",
				selector: (r) => `${r.totalPermissions || 0} permiso(s)`,
				hide: Media.SM,
				wrap: true,
			},
			{
				id: "acciones",
				name: "Acciones",
				minWidth: "200px",
				cell: (r) => (
					<Buttons
						row={r}
						onView={handleView}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				),
				ignoreRowClick: true,
				allowOverflow: true,
				button: true,
			},
		],
		[handleView, handleEdit, handleDelete]
	);

	const handleModalSubmit = async (
		data: CreateRolData | Omit<UpdateRolData, "id">
	) => {
		setServerError(undefined);
		setServerFieldErrors(undefined);
		if (selected) {
			const payload = {
				...(data as Omit<UpdateRolData, "id">),
			} as UpdateRolData;
			const res = await updateRole(selected.id, payload);
			if (!res.ok) {
				setServerError(res.message);
				setServerFieldErrors(res.fieldErrors);
			} else {
				setIsModalOpen(false);
			}
			return res.ok;
		}

		const res = await createRole(data as CreateRolData);
		if (!res.ok) {
			setServerError(res.message);
			setServerFieldErrors(res.fieldErrors);
		} else {
			setIsModalOpen(false);
		}
		return res.ok;
	};

	if (!isInitialized || loading || permissionsLoading) return <Loading />;
	if (!canRead) {
		return (
			<div className="p-6">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<div className="flex items-center gap-2 text-red-800 dark:text-red-200">
						<span className="material-symbols-rounded">block</span>
						<span>No tienes permisos para ver los roles</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Gestión de Roles
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Administra los roles del sistema
					</p>
				</div>
				<ProtectedAnyPermission
					permissions={[
						ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
						ADMIN_PERMISSIONS.MANAGE_ROLES,
						ADMIN_PERMISSIONS.MANAGE,
					]}
				>
					<button
						onClick={handleCreate}
						className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 "
					>
						<span className="material-symbols-rounded text-sm">add</span>
						Crear Rol
					</button>
				</ProtectedAnyPermission>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
				<div className="flex items-center gap-4 mb-4">
					<input
						type="text"
						placeholder="Buscar..."
						className="px-3 py-2 border rounded w-full max-w-md"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
						<div className="flex items-center gap-2 text-red-800 dark:text-red-200">
							<span className="material-symbols-rounded">error</span>
							<span>{error}</span>
						</div>
					</div>
				)}

				<DataTable
					customStyles={tailwindTheme}
					noDataComponent={"No se encontraron prioridades"}
					pagination
					responsive
					columns={columns}
					data={filtered}
					paginationComponentOptions={PaginationOptions}
				/>
			</div>

			<RolesModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleModalSubmit}
				rol={selected}
				loading={saving}
				viewMode={modalMode}
				serverError={serverError}
				serverFieldErrors={serverFieldErrors}
				getAllPermissions={allPermissions}
			/>

			{showDeleteModal && rolToDelete && (
				<Modal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
					title="Confirmar eliminación"
					footer={
						<>
							<button
								type="button"
								onClick={confirmDelete}
								disabled={loading}
								className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
							>
								{loading ? "Eliminando..." : "Eliminar"}
							</button>
							<button
								type="button"
								onClick={() => {
									setShowDeleteModal(false);
									setRolToDelete(null);
								}}
								disabled={loading}
								className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
							>
								Cancelar
							</button>
						</>
					}
					size="sm"
				>
					<div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden sm:my-3 sm:align-middle sm:max-w-lg sm:w-full">
						<div className="bg-white dark:bg-gray-800 sm:p-3 sm:pb-4">
							<div className="sm:flex sm:items-center content-center">
								<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-14 sm:w-14">
									<span className="material-symbols-rounded text-red-600 dark:text-red-400">
										warning
									</span>
								</div>
								<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
									<h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
										Eliminar Rol
									</h3>
									<div className="mt-2">
										<p className="text-sm text-gray-500 dark:text-gray-400">
											¿Estás seguro de que deseas eliminar el rol{" "}
											<strong>{rolToDelete.nombre_rol}</strong>? Esta acción no
											se puede deshacer.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default ViewRoles;
