import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { type TableColumn, Media } from "react-data-table-component";
import { useUsers } from "@/hooks/useUsers";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { USER_PERMISSIONS } from "@/constants/permissions";
import UserModal from "./UserModal";
import tailwindTheme, { PaginationOptions } from "@/config/StyleTable";
import Buttons from "./Buttons";

import type { FullUser, CreateUserData, UpdateUserData } from "@/@types/users";
import Loading from "../common/Loading";
import Modal from "../common/Modal";
import { useToastStore } from "@/stores/toastStore";

const ViewUsers: React.FC = () => {
	const {
		users,
		sedes,
		roles,
		loading,
		saving,
		permissionsLoading,
		error,
		canRead,
		createUser,
		updateUser,
		deleteUser,
		getUserById,
		sendEmailToUser,
	} = useUsers();
	const { addToast } = useToastStore();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<FullUser | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSede, setFilterSede] = useState<number>(0);
	const [filterEstado, setFilterEstado] = useState<number | "all">("all");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [viewMode, setViewMode] = useState(false);
	const [userToDelete, setUserToDelete] = useState<FullUser | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [formServerError, setFormServerError] = useState<string | undefined>(
		undefined
	);
	const [formFieldErrors, setFormFieldErrors] = useState<
		Record<string, string> | undefined
	>(undefined);

	// Esperar a que se inicialice el hook
	useEffect(() => {
		if (!loading || !permissionsLoading) {
			setIsInitialized(true);
		}
	}, [loading, permissionsLoading]);

	const columns: TableColumn<FullUser>[] = [
		{
			id: "nombre_user",
			name: "Nombre",
			selector: (row) => row.nombre_user,
			wrap: true,
			sortable: true,
			minWidth: "250px",
			cell: (row) => (
				<div className="flex justify-start items-center">
					<span
						className={`material-symbols-rounded mr-1 ${
							!row.status_verified ? "text-green-500" : "text-red-500"
						}`}
						title={`${
							!row.status_verified
								? "Usuario verificado"
								: "Usuario no verificado"
						}`}
					>
						{!row.status_verified ? "verified_user" : "safety_check"}
					</span>
					<span>{row.nombre_user}</span>
				</div>
			),
		},
		{
			id: "usuario_user",
			name: "Usuario",
			selector: (row) => row.usuario_user,
			sortable: true,
		},
		{
			id: "rol",
			name: "Rol",
			selector: (row) => row.rol,
			sortable: true,
		},
		{
			id: "sede",
			name: "Sede",
			selector: (row) => row.sede,
			wrap: true,
			hide: Media.SM,
			sortable: true,
		},
		{
			id: "status_user",
			name: "Estado",
			center: true,
			cell: (row) => (
				<span className="px-2 py-1 rounded-full text-xs flex items-center bg-secondary-100 text-background-dark shadow">
					<span
						className={`material-symbols-rounded text-sm! mr-1 ${
							row.status_user ? "text-green-500" : "text-red-500"
						}`}
					>
						{row.status_user ? "check_circle" : "cancel"}
					</span>
					{row.status_user ? "Activo" : "Inactivo"}
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
					onEdit={handleEditUser}
					onDelete={handleDelete}
					onForgetEmail={handleForgetEmail}
				/>
			),
			ignoreRowClick: true, // evita que el click en el botón dispare eventos de la fila
			allowOverflow: true, // permite que el contenido de la celda se muestre sin recortarse
			button: true, // indica que esta columna tiene botones
		},
	];

	// Filtrar usuarios
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.nombre_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.usuario_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.sede.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesSede = filterSede === 0 || user.id_sede === filterSede;
		const matchesEstado =
			filterEstado === "all" || user.status_user === Boolean(filterEstado);

		return matchesSearch && matchesSede && matchesEstado;
	});

	const handleForgetEmail = async (user: FullUser) => {
		const mode = user.status_verified ? "verify_account" : "reset_password";
		const sendMail = await sendEmailToUser(user.id_usuario, mode);
		if (sendMail.ok) {
			addToast({
				type: "success",
				title: "Correo enviado",
				message: "El correo fue enviado exitosamente al usuario",
			});
		} else {
			addToast({
				type: "error",
				title: "Error enviando correo",
				message: sendMail.message,
			});
		}
	};

	const handleView = async (user: FullUser) => {
		const fullUser = await getUserById(user.id_usuario);
		if (fullUser) {
			setFormServerError(undefined);
			setFormFieldErrors(undefined);
			setViewMode(true);
			setSelectedUser(fullUser);
			setIsModalOpen(true);
		}
	};
	const handleEditUser = async (user: FullUser) => {
		const fullUser = await getUserById(user.id_usuario);
		if (fullUser) {
			setFormServerError(undefined);
			setFormFieldErrors(undefined);
			setViewMode(false);
			setSelectedUser(fullUser);
			setIsModalOpen(true);
		}
	};

	const handleDelete = (user: FullUser) => {
		setUserToDelete(user);
		setShowDeleteModal(true);
	};

	const handleCreateUser = () => {
		setFormServerError(undefined);
		setFormFieldErrors(undefined);
		setSelectedUser(null);
		setIsModalOpen(true);
		setViewMode(false);
	};

	const confirmDeleteUser = async () => {
		if (userToDelete) {
			const res = await deleteUser(userToDelete.id_usuario);
			if (res.ok) {
				setShowDeleteModal(false);
				setUserToDelete(null);
			}
		}
	};

	const handleModalSubmit = async (
		userData: CreateUserData | UpdateUserData
	) => {
		setFormServerError(undefined);
		setFormFieldErrors(undefined);
		if (selectedUser) {
			const res = await updateUser(
				selectedUser.id_usuario,
				userData as UpdateUserData
			);
			if (!res.ok) {
				setFormServerError(res.message);
				setFormFieldErrors(res.fieldErrors);
			}
			return res.ok;
		} else {
			const res = await createUser(userData as CreateUserData);
			if (!res.ok) {
				setFormServerError(res.message);
				setFormFieldErrors(res.fieldErrors);
			}
			return res.ok;
		}
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
						<span>No tienes permisos para ver la gestión de usuarios</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Gestión de Usuarios
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Administra los usuarios del sistema
					</p>
				</div>

				{/* Botón crear usuario */}
				<ProtectedAnyPermission
					permissions={[USER_PERMISSIONS.CREATE, USER_PERMISSIONS.MANAGE]}
				>
					<button
						onClick={handleCreateUser}
						className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
					>
						<span className="material-symbols-rounded text-sm">add</span>
						Crear Usuario
					</button>
				</ProtectedAnyPermission>
			</div>
			{/* Filtros y búsqueda */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
				<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
					<div className="flex flex-col sm:flex-row gap-4 flex-1">
						{/* Búsqueda */}
						<div className="relative flex-1 max-w-md">
							<span className="material-symbols-rounded absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
								search
							</span>
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar usuarios..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Filtro por sede */}
						<select
							value={filterSede}
							onChange={(e) => setFilterSede(parseInt(e.target.value))}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						>
							<option value={0}>Todas las sedes</option>
							{sedes.map((sede) => (
								<option key={sede.id_sede} value={sede.id_sede}>
									{sede.nombre_sede}
								</option>
							))}
						</select>
						{/* Filtro por estado */}
						<select
							value={filterEstado}
							onChange={(e) => {
								const value = e.target.value;
								setFilterEstado(value === "all" ? "all" : parseInt(value));
							}}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						>
							<option value={"all"}>Todas los estados</option>
							<option value={1}>Activos</option>
							<option value={0}>Inactivos</option>
						</select>
					</div>
				</div>
			</div>
			{/* Loading state */}
			{loading && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
					<div className="flex items-center justify-center">
						<span className="material-symbols-rounded animate-spin text-2xl text-blue-600 mr-3">
							refresh
						</span>
						<span className="text-gray-600 dark:text-gray-400">
							Cargando usuarios...
						</span>
					</div>
				</div>
			)}
			{/* Error state */}
			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
					<div className="flex items-center gap-2 text-red-800 dark:text-red-200">
						<span className="material-symbols-rounded">error</span>
						<span>{error}</span>
					</div>
				</div>
			)}
			{/* Content */}
			{!loading &&
				!error &&
				(filteredUsers.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
						<span className="material-symbols-rounded text-4xl text-gray-300 mb-4 block">
							person_off
						</span>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							No se encontraron usuarios
						</h3>
						<p className="text-gray-600 dark:text-gray-400">
							{searchTerm || filterSede
								? "Intenta ajustar los filtros de búsqueda"
								: "Aún no hay usuarios registrados"}
						</p>
					</div>
				) : (
					<DataTable
						paginationComponentOptions={PaginationOptions}
						customStyles={tailwindTheme}
						noDataComponent="No se encontraron usuarios"
						pagination
						responsive
						columns={columns}
						data={filteredUsers}
					/>
				))}
			{/* Modal de crear/editar usuario */}
			<UserModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleModalSubmit}
				user={selectedUser}
				sedes={sedes}
				roles={roles}
				loading={saving}
				viewMode={viewMode}
				serverError={formServerError}
				serverFieldErrors={formFieldErrors}
			/>
			{/* Modal de confirmación de eliminación */}
			{showDeleteModal && userToDelete && (
				<Modal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
					title="Confirmar eliminación"
					footer={
						<>
							<button
								type="button"
								onClick={confirmDeleteUser}
								disabled={loading}
								className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
							>
								{loading ? "Eliminando..." : "Eliminar"}
							</button>
							<button
								type="button"
								onClick={() => {
									setShowDeleteModal(false);
									setUserToDelete(null);
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
								<div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-14 sm:w-14">
									<span className="material-symbols-rounded text-red-600 dark:text-red-400">
										warning
									</span>
								</div>

								<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
									<h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
										Eliminar Usuario
									</h3>
									<div className="mt-2">
										<p className="text-sm text-gray-500 dark:text-gray-400">
											¿Estás seguro de que deseas eliminar al usuario{" "}
											<strong>{userToDelete.nombre_user}</strong>? Esta acción
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

export default ViewUsers;
