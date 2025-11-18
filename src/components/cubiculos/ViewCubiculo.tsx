import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { type TableColumn, Media } from "react-data-table-component";
import tailwindTheme, { PaginationOptions } from "@/config/StyleTable";
import { useCubiculos } from "@/hooks/useCubiculos";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { CUBICULO_PERMISSIONS } from "@/constants/permissions";
import Loading from "../common/Loading";
import Modal from "../common/Modal";
import type {
	FullCubiculo,
	CreateCubiculoData,
	UpdateCubiculoData,
} from "@/@types/cubiculos";
import CubiculoModal from "./CubiculoModal";
import Buttons from "./Buttons";

const ViewCubiculo: React.FC = () => {
	const {
		cubiculos,
		sedes,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		createCubiculo,
		updateCubiculo,
		deleteCubiculo,
		getCubiculoById,
	} = useCubiculos();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selected, setSelected] = useState<FullCubiculo | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterEstado, setFilterEstado] = useState<"all" | 1 | 0>("all");
	const [filterSede, setFilterSede] = useState<number>(0);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [viewMode, setViewMode] = useState(false);
	const [toDelete, setToDelete] = useState<FullCubiculo | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [formServerError, setFormServerError] = useState<string | undefined>(
		undefined
	);
	const [formFieldErrors, setFormFieldErrors] = useState<
		Record<string, string> | undefined
	>(undefined);

	useEffect(() => {
		if (!loading || !permissionsLoading) {
			setIsInitialized(true);
		}
	}, [loading, permissionsLoading]);

	const handleView = useCallback(
		async (cub: FullCubiculo) => {
			const full = await getCubiculoById(cub.id);
			if (full) {
				setViewMode(true);
				setSelected(full);
				setIsModalOpen(true);
			}
		},
		[getCubiculoById]
	);

	const handleEdit = useCallback(
		async (cub: FullCubiculo) => {
			const full = await getCubiculoById(cub.id);
			if (full) {
				setViewMode(false);
				setSelected(full);
				setIsModalOpen(true);
			}
		},
		[getCubiculoById]
	);

	const columns: TableColumn<FullCubiculo>[] = useMemo(
		() => [
			{
				id: "nombre",
				name: "Nombre",
				selector: (row) => row.nombre,
				sortable: true,
				wrap: true,
			},
			{
				id: "sede",
				name: "Sede",
				selector: (row) => row.nombre_sede || "-",
				hide: Media.SM,
				sortable: true,
				wrap: true,
			},
			{
				id: "estado",
				name: "Estado",
				center: true,
				cell: (row) => (
					<span className="px-2 py-1 rounded-full text-xs flex items-center bg-secondary-100 text-background-dark shadow">
						<span
							className={`material-symbols-rounded text-sm! mr-1 ${
								row.estado ? "text-green-500" : "text-red-500"
							}`}
						>
							{row.estado ? "check_circle" : "cancel"}
						</span>
						{row.estado ? "Activo" : "Inactivo"}
					</span>
				),
				sortable: true,
			},
			{
				id: "acciones",
				name: "Acciones",
				wrap: true,
				minWidth: "200px",
				cell: (row) => (
					<Buttons
						row={row}
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
		[handleView, handleEdit]
	);

	const filtered = cubiculos.filter((c) => {
		const matchesSearch =
			c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(c.nombre_sede?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false);
		const matchesEstado =
			filterEstado === "all" || c.estado === Boolean(filterEstado);
		const matchesSede = filterSede === 0 || c.sede_id === filterSede;
		return matchesSearch && matchesEstado && matchesSede;
	});

	const handleDelete = (cub: FullCubiculo) => {
		setToDelete(cub);
		setShowDeleteModal(true);
	};

	const handleCreate = () => {
		setSelected(null);
		setIsModalOpen(true);
		setViewMode(false);
	};

	const confirmDelete = async () => {
		if (toDelete) {
			const res = await deleteCubiculo(toDelete.id);
			if (res.ok) {
				setShowDeleteModal(false);
				setToDelete(null);
			}
		}
	};

	const handleModalSubmit = async (
		data: CreateCubiculoData | Omit<UpdateCubiculoData, "id">
	) => {
		setFormServerError(undefined);
		setFormFieldErrors(undefined);
		if (selected) {
			const res = await updateCubiculo(selected.id, {
				id: selected.id,
				...data,
			});
			if (!res.ok) {
				setFormServerError(res.message);
				setFormFieldErrors(res.fieldErrors);
			}
			return res.ok;
		}
		const res = await createCubiculo(data);
		if (!res.ok) {
			setFormServerError(res.message);
			setFormFieldErrors(res.fieldErrors);
		}
		return res.ok;
	};

	if (!isInitialized || loading || permissionsLoading) {
		return <Loading />;
	}

	if (!canRead) {
		return (
			<div className="p-6">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<div className="flex items-center gap-2 text-red-800 dark:text-red-200">
						<span className="material-symbols-rounded">block</span>
						<span>No tienes permisos para ver la gestión de cubículos</span>
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
						Gestión de Cubículos
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Administra los cubículos del sistema
					</p>
				</div>
				<ProtectedAnyPermission
					permissions={[
						CUBICULO_PERMISSIONS.CREATE,
						CUBICULO_PERMISSIONS.MANAGE,
					]}
				>
					<button
						onClick={handleCreate}
						className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
					>
						<span className="material-symbols-rounded text-sm">add</span>
						Crear Cubículo
					</button>
				</ProtectedAnyPermission>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
				<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
					<div className="flex flex-col sm:flex-row gap-4 flex-1">
						<div className="relative flex-1 max-w-md">
							<span className="material-symbols-rounded absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
								search
							</span>
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar cubículos..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						<select
							value={filterEstado}
							onChange={(e) => {
								const value = e.target.value;
								setFilterEstado(
									value === "all" ? "all" : (parseInt(value) as 1 | 0)
								);
							}}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						>
							<option value={"all"}>Todos los estados</option>
							<option value={1}>Activos</option>
							<option value={0}>Inactivos</option>
						</select>

						<select
							value={filterSede}
							onChange={(e) => setFilterSede(parseInt(e.target.value))}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						>
							<option value={0}>Todas las sedes</option>
							{sedes.map((s) => (
								<option key={s.id_sede} value={s.id_sede}>
									{s.nombre_sede}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{loading && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
					<div className="flex items-center justify-center">
						<span className="material-symbols-rounded animate-spin text-2xl text-blue-600 mr-3">
							refresh
						</span>
						<span className="text-gray-600 dark:text-gray-400">
							Cargando cubículos...
						</span>
					</div>
				</div>
			)}

			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
					<div className="flex items-center gap-2 text-red-800 dark:text-red-200">
						<span className="material-symbols-rounded">error</span>
						<span>{error}</span>
					</div>
				</div>
			)}

			{!loading &&
				!error &&
				(filtered.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
						<span className="material-symbols-rounded text-4xl text-gray-300 mb-4 block">
							chair
						</span>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							No se encontraron cubículos
						</h3>
						<p className="text-gray-600 dark:text-gray-400">
							{searchTerm
								? "Intenta ajustar los filtros de búsqueda"
								: "Aún no hay cubículos registrados"}
						</p>
					</div>
				) : (
					<DataTable
						paginationComponentOptions={PaginationOptions}
						customStyles={tailwindTheme}
						noDataComponent="No se encontraron cubículos"
						pagination
						responsive
						columns={columns}
						data={filtered}
					/>
				))}

			<CubiculoModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleModalSubmit}
				cubiculo={selected}
				sedes={sedes}
				loading={saving}
				viewMode={viewMode}
				serverError={formServerError}
				serverFieldErrors={formFieldErrors}
			/>

			{showDeleteModal && toDelete && (
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
								className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
							>
								{loading ? "Eliminando..." : "Eliminar"}
							</button>
							<button
								type="button"
								onClick={() => {
									setShowDeleteModal(false);
									setToDelete(null);
								}}
								disabled={loading}
								className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700"
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
										Eliminar Cubículo
									</h3>
									<div className="mt-2">
										<p className="text-sm text-gray-500 dark:text-gray-400">
											¿Estás seguro de que deseas eliminar el cubículo{" "}
											<strong>{toDelete.nombre}</strong>? Esta acción no se
											puede deshacer.
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

export default ViewCubiculo;
