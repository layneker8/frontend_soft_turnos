import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import tailwindTheme, { PaginationOptions } from "@/config/StyleTable";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import Loading from "@/components/common/Loading";
import Modal from "@/components/common/Modal";
import ServiciosModal from "./ServiciosModal";
import Buttons from "./Buttons";
import type {
	FullServicios,
	CreateServiciosData,
	UpdateServiciosData,
} from "@/@types/servicios";
import { useServicios } from "@/hooks/useServicios";
import { SERVICE_PERMISSIONS } from "@/constants/permissions";

const ViewServicios: React.FC = () => {
	const {
		servicios,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		createServicio,
		updateServicio,
		deleteServicio,
		getServicioById,
	} = useServicios();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selected, setSelected] = useState<FullServicios | null>(null);
	const [modalMode, setModalMode] = useState(false); // false for edit/create, true for view
	const [searchTerm, setSearchTerm] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [serviciosToDelete, setServiciosToDelete] =
		useState<FullServicios | null>(null);
	const [serverError, setServerError] = useState<string | undefined>(undefined);
	const [serverFieldErrors, setServerFieldErrors] = useState<
		Record<string, string> | undefined
	>(undefined);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (!loading || !permissionsLoading) {
			setIsInitialized(true);
		}
	}, [loading, permissionsLoading]);

	const filtered = servicios.filter(
		(p) =>
			p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(p.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.codigo_servicio.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleView = useCallback(
		async (p: FullServicios) => {
			const full = await getServicioById(p.id);

			if (full) {
				setServerError(undefined);
				setServerFieldErrors(undefined);
				setModalMode(true);
				setSelected(full);
				setIsModalOpen(true);
			}
		},
		[getServicioById]
	);

	const handleEdit = useCallback(
		async (p: FullServicios) => {
			const full = await getServicioById(p.id);
			if (full) {
				setServerError(undefined);
				setServerFieldErrors(undefined);
				setModalMode(false);
				setSelected(full);
				setIsModalOpen(true);
			}
		},
		[getServicioById]
	);

	const handleCreate = useCallback(() => {
		setServerError(undefined);
		setServerFieldErrors(undefined);
		setSelected(null);
		setModalMode(false);
		setIsModalOpen(true);
	}, []);

	const handleDelete = useCallback((p: FullServicios) => {
		setServiciosToDelete(p);
		setShowDeleteModal(true);
	}, []);

	const confirmDelete = useCallback(async () => {
		if (!serviciosToDelete) return;
		const res = await deleteServicio(serviciosToDelete.id);
		if (res.ok) {
			setShowDeleteModal(false);
			setServiciosToDelete(null);
		}
	}, [serviciosToDelete, deleteServicio]);

	const columns: TableColumn<FullServicios>[] = useMemo(
		() => [
			{
				id: "nombre",
				name: "Nombre",
				selector: (r) => r.nombre,
				sortable: true,
				wrap: true,
			},
			{
				id: "codigo_servicio",
				name: "Código Servicio",
				selector: (r) => r.codigo_servicio,
				center: true,
				sortable: true,
			},
			{
				id: "estado",
				name: "Estado",
				cell: (row) => (
					<span className="px-2 py-1 rounded-full text-xs flex items-center bg-secondary-100 text-background-dark shadow">
						<span
							className={`material-symbols-rounded text-sm! mr-1 ${
								row.estado ? "text-green-500" : "text-red-600"
							}`}
						>
							{row.estado ? "check_circle" : "cancel"}
						</span>
						{row.estado ? "Activo" : "Inactivo"}
					</span>
				),
				center: true,
				sortable: true,
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
		data: CreateServiciosData | Omit<UpdateServiciosData, "id">
	) => {
		setServerError(undefined);
		setServerFieldErrors(undefined);
		if (selected) {
			const payload = {
				id: selected.id,
				...(data as Omit<UpdateServiciosData, "id">),
			} as UpdateServiciosData;
			const res = await updateServicio(selected.id, payload);
			if (!res.ok) {
				setServerError(res.message);
				setServerFieldErrors(res.fieldErrors);
			} else {
				setIsModalOpen(false);
			}
			return res.ok;
		}

		const res = await createServicio(data as CreateServiciosData);
		if (!res.ok) {
			setServerError(res.message);
			setServerFieldErrors(res.fieldErrors);
		} else {
			setIsModalOpen(false);
		}
		return res.ok;
	};

	if (!isInitialized || loading || permissionsLoading) return <Loading />;
	if (!canRead)
		return (
			<div className="p-6">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<div className="flex items-center gap-2 text-red-800 dark:text-red-200">
						<span className="material-symbols-rounded">block</span>
						<span>No tienes permisos para ver los servicios</span>
					</div>
				</div>
			</div>
		);

	return (
		<div className="p-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Gestión de Servicios
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Administra los servicios del sistema
					</p>
				</div>
				<ProtectedAnyPermission
					permissions={[SERVICE_PERMISSIONS.CREATE, SERVICE_PERMISSIONS.MANAGE]}
				>
					<button
						onClick={handleCreate}
						className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
					>
						<span className="material-symbols-rounded text-sm">add</span>
						Crear Servicio
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
					noDataComponent={"No se encontraron servicios"}
					pagination
					responsive
					columns={columns}
					data={filtered}
					paginationComponentOptions={PaginationOptions}
				/>
			</div>

			<ServiciosModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleModalSubmit}
				servicio={selected}
				loading={saving}
				viewMode={modalMode}
				serverError={serverError}
				serverFieldErrors={serverFieldErrors}
			/>

			{showDeleteModal && serviciosToDelete && (
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
									setServiciosToDelete(null);
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
										Eliminar servicio
									</h3>
									<div className="mt-2">
										<p className="text-sm text-gray-500 dark:text-gray-400">
											¿Estás seguro de que deseas eliminar el servicio{" "}
											<strong>{serviciosToDelete.nombre}</strong>? Esta acción
											no se puede deshacer.
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

export default ViewServicios;
