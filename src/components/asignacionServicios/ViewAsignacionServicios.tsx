import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { type TableColumn, Media } from "react-data-table-component";
import { SERVICE_PERMISSIONS } from "@/constants/permissions";
import { ProtectedAnyPermission } from "../common/ProtectedComponent";
import Modal from "../common/Modal";
import AsignacionServiciosModal from "./AsignacionServiciosModal";
import { useAsignacionServicios } from "@/hooks/useAsignacionServicios";
import Loading from "../common/Loading";
import type { AsignacionServicio } from "@/@types/asignacionServicios";
import Buttons from "./Buttons";
import tailwindTheme, { PaginationOptions } from "@/config/StyleTable";
import { ToggleCheckBox } from "../common/CheckBox";
import { Link } from "react-router-dom";

export default function ViewAsignacionServicios() {
	const {
		asignaciones,
		cubiculosSedes,
		sedes,
		servicios,
		loading,
		saving,
		permissionsLoading,
		error,
		canCreate,
		createAsignacion,
		toggleEstadoAsignacion,
		deleteAsignacion,
		loadCubiculosBySede,
	} = useAsignacionServicios();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterEstado, setFilterEstado] = useState<"all" | 1 | 0>("all");
	const [filterSede, setFilterSede] = useState<string>("all");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [toDelete, setToDelete] = useState<AsignacionServicio | null>(null);
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

	const handleDelete = useCallback((asignacion: AsignacionServicio) => {
		setToDelete(asignacion);
		setShowDeleteModal(true);
	}, []);

	const handleToggleEstado = useCallback(
		async (asignacion: AsignacionServicio) => {
			await toggleEstadoAsignacion(asignacion.id);
		},
		[toggleEstadoAsignacion]
	);

	// Obtener lista única de sedes
	const sedesUnicas = useMemo(() => {
		const sedes = new Set(asignaciones.map((a) => a.nombre_sede));
		return Array.from(sedes).sort();
	}, [asignaciones]);

	const columns: TableColumn<AsignacionServicio>[] = useMemo(
		() => [
			{
				id: "nombre_sede",
				name: "Sede",
				selector: (row) => row.nombre_sede,
				sortable: true,
				wrap: true,
				hide: Media.SM,
			},
			{
				id: "cubiculo_nombre",
				name: "Cubículo",
				selector: (row) => row.cubiculo_nombre,
				sortable: true,
				wrap: true,
			},
			{
				id: "servicio_nombre",
				name: "Servicio",
				selector: (row) => row.servicio_nombre,
				sortable: true,
				wrap: true,
			},
			{
				id: "codigo_servicio",
				name: "Código",
				selector: (row) => row.codigo_servicio,
				sortable: true,
				hide: Media.MD,
				center: true,
				minWidth: "120px",
			},
			{
				id: "estado",
				name: "Estado",
				cell: (row) => (
					<ToggleCheckBox
						checked={row.estado}
						onChange={() => handleToggleEstado(row)}
						disabled={saving}
					/>
				),
				minWidth: "100px",
				ignoreRowClick: true,
				allowOverflow: true,
				button: true,
				center: true,
			},
			{
				id: "acciones",
				name: "Acciones",
				wrap: true,
				minWidth: "100px",
				cell: (row) => <Buttons row={row} onDelete={handleDelete} />,
				ignoreRowClick: true,
				allowOverflow: true,
				button: true,
				center: true,
			},
		],
		[handleToggleEstado, handleDelete, saving]
	);

	const confirmDelete = useCallback(async () => {
		if (!toDelete) return;
		const success = await deleteAsignacion(toDelete.id);
		if (success) {
			setShowDeleteModal(false);
			setToDelete(null);
		}
	}, [toDelete, deleteAsignacion]);

	const handleSubmit = useCallback(
		async (data: {
			cubiculo_id: number;
			servicio_id: number;
		}): Promise<boolean> => {
			const result = await createAsignacion(data);

			if (result.fieldErrors) {
				setFormFieldErrors(result.fieldErrors);
			}

			if (result.success) {
				setIsModalOpen(false);
				setFormServerError(undefined);
				setFormFieldErrors(undefined);
			}

			return result.success;
		},
		[createAsignacion]
	);

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false);
		setFormServerError(undefined);
		setFormFieldErrors(undefined);
	}, []);

	const handleNewAsignacion = useCallback(() => {
		setIsModalOpen(true);
		setFormServerError(undefined);
		setFormFieldErrors(undefined);
	}, []);

	const filteredData = useMemo(() => {
		return asignaciones.filter((asignacion) => {
			const matchesSearch =
				asignacion.cubiculo_nombre
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				asignacion.servicio_nombre
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				asignacion.codigo_servicio
					.toLowerCase()
					.includes(searchTerm.toLowerCase());

			const matchesEstado =
				filterEstado === "all" || asignacion.estado === Boolean(filterEstado);

			const matchesSede =
				filterSede === "all" || asignacion.nombre_sede === filterSede;

			return matchesSearch && matchesEstado && matchesSede;
		});
	}, [asignaciones, searchTerm, filterEstado, filterSede]);

	if (!isInitialized) {
		return <Loading />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full">
				<p className="text-red-500 mb-4">{error}</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col gap-4 p-4">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Asignación de Servicios</h1>
				<div className="flex gap-2">
					<ProtectedAnyPermission
						permissions={[
							SERVICE_PERMISSIONS.ASSIGN,
							SERVICE_PERMISSIONS.MANAGE,
						]}
					>
						<button
							onClick={handleNewAsignacion}
							disabled={!canCreate}
							className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
						>
							<span className="material-symbols-rounded text-sm">add</span>
							Asignar Cubículo
						</button>
					</ProtectedAnyPermission>
					<ProtectedAnyPermission
						permissions={[
							SERVICE_PERMISSIONS.CREATE,
							SERVICE_PERMISSIONS.MANAGE,
						]}
					>
						<Link
							to="/dashboard/servicios"
							className="border-1 border-secondary-500 text-secondary-700 hover:bg-primary-500 hover:text-white hover:border-primary shadow  px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer group"
						>
							<span className="material-symbols-rounded text-secondary-700 group-hover:text-white">
								view_list
							</span>
							Ver servicios
						</Link>
					</ProtectedAnyPermission>
				</div>
			</div>

			<div className="flex gap-4 items-center flex-wrap">
				<input
					type="text"
					placeholder="Buscar por cubículo, servicio o código..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="border border-gray-300 px-4 py-2 rounded w-full max-w-md"
				/>
				<select
					value={filterSede}
					onChange={(e) => setFilterSede(e.target.value)}
					className="border border-gray-300 px-4 py-2 rounded"
				>
					<option value="all">Todas las sedes</option>
					{sedesUnicas.map((sede) => (
						<option key={sede} value={sede}>
							{sede}
						</option>
					))}
				</select>
				<select
					value={filterEstado}
					onChange={(e) =>
						setFilterEstado(
							e.target.value === "all"
								? "all"
								: (Number(e.target.value) as 1 | 0)
						)
					}
					className="border border-gray-300 px-4 py-2 rounded"
				>
					<option value="all">Todos los estados</option>
					<option value={1}>Activos</option>
					<option value={0}>Inactivos</option>
				</select>
			</div>

			<div className="flex-1 overflow-auto">
				<DataTable
					columns={columns}
					data={filteredData}
					pagination
					paginationComponentOptions={PaginationOptions}
					customStyles={tailwindTheme}
					progressPending={loading}
					progressComponent={<Loading />}
					noDataComponent={
						<div className="py-8 text-gray-500">
							No hay asignaciones de servicios registradas
						</div>
					}
				/>
			</div>

			<AsignacionServiciosModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleSubmit}
				sedes={sedes}
				cubiculos={cubiculosSedes}
				servicios={servicios}
				loadCubiculosBySede={loadCubiculosBySede}
				loading={saving}
				serverError={formServerError}
				serverFieldErrors={formFieldErrors}
			/>

			<Modal
				isOpen={showDeleteModal}
				onClose={() => {
					setShowDeleteModal(false);
					setToDelete(null);
				}}
				title="Confirmar eliminación"
			>
				<div className="p-4">
					<p className="mb-4">
						¿Estás seguro de que deseas eliminar la asignación del servicio{" "}
						<strong>{toDelete?.servicio_nombre}</strong> del cubículo{" "}
						<strong>{toDelete?.cubiculo_nombre}</strong>?
					</p>
					<div className="flex justify-end gap-2">
						<button
							className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
							onClick={() => {
								setShowDeleteModal(false);
								setToDelete(null);
							}}
						>
							Cancelar
						</button>
						<button
							className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
							onClick={confirmDelete}
							disabled={saving}
						>
							{saving ? "Eliminando..." : "Eliminar"}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
