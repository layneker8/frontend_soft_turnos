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
					className="border-1 border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow"
					onClick={() => onView(row)}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700! ">
						visibility
					</span>
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
					className="border-1 border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow"
					onClick={() => onEdit(row)}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700!">
						edit
					</span>
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
					className="border-1 border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow disabled:opacity-50! disabled:cursor-not-allowed!"
					onClick={() => onDelete(row)}
					disabled={
						row.id === user?.id_rol || row.nombre_rol === "Super administrador"
					}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700!">
						delete
					</span>
				</button>
			</ProtectedAnyPermission>
		</div>
	);
}
