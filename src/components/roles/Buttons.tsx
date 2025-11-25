import type { FullRoles } from "@/@types/roles";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { ADMIN_PERMISSIONS } from "@/constants/permissions";
import { useAuthStore } from "@/stores";

interface ButtonsProps {
	row: FullRoles;
	onView: (p: FullRoles) => void;
	onEdit: (p: FullRoles) => void;
	onDelete: (p: FullRoles) => void;
}

export default function Buttons({
	row,
	onView,
	onEdit,
	onDelete,
}: ButtonsProps) {
	const { user } = useAuthStore();
	return (
		<div className="flex gap-2 items-center">
			<ProtectedAnyPermission
				permissions={[
					ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
					ADMIN_PERMISSIONS.MANAGE_ROLES,
					ADMIN_PERMISSIONS.MANAGE,
				]}
			>
				<button
					className="bg-secondary-500 text-white px-2 py-1 rounded hover:bg-secondary-600 shadow"
					onClick={() => onView(row)}
				>
					<span className="material-symbols-rounded text-sm!">visibility</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[
					ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
					ADMIN_PERMISSIONS.MANAGE_ROLES,
					ADMIN_PERMISSIONS.MANAGE,
				]}
			>
				<button
					className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-500 shadow"
					onClick={() => onEdit(row)}
				>
					<span className="material-symbols-rounded text-sm!">edit</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[
					ADMIN_PERMISSIONS.MANAGE_PERMISSIONS,
					ADMIN_PERMISSIONS.MANAGE_ROLES,
					ADMIN_PERMISSIONS.MANAGE,
				]}
			>
				<button
					className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 shadow disabled:opacity-50! disabled:cursor-not-allowed!"
					onClick={() => onDelete(row)}
					disabled={
						row.id === user?.id_rol || row.nombre_rol === "Super administrador"
					}
				>
					<span className="material-symbols-rounded text-sm!">delete</span>
				</button>
			</ProtectedAnyPermission>
		</div>
	);
}
