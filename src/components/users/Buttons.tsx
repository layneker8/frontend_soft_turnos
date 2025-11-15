import type { FullUser } from "@/@types/users";
import { ProtectedAnyPermission } from "../common/ProtectedComponent";
import { USER_PERMISSIONS } from "@/constants/permissions";
import { useAuthStore } from "@/stores";

interface ButtonsProps {
	row: FullUser;
	onView: (user: FullUser) => void;
	onEdit: (user: FullUser) => void;
	onDelete: (user: FullUser) => void;
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
				permissions={[USER_PERMISSIONS.READ, USER_PERMISSIONS.MANAGE]}
			>
				<button
					className="bg-secondary-500 text-white px-2 py-1 rounded hover:bg-secondary-600 shadow"
					onClick={() => onView(row)}
				>
					<span className="material-symbols-rounded text-sm! ">visibility</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[USER_PERMISSIONS.UPDATE, USER_PERMISSIONS.MANAGE]}
			>
				<button
					className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-500 shadow"
					onClick={() => onEdit(row)}
				>
					<span className="material-symbols-rounded text-sm!">edit</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[USER_PERMISSIONS.DELETE, USER_PERMISSIONS.MANAGE]}
			>
				<button
					className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 shadow disabled:opacity-50 disabled:cursor-not-allowed!"
					onClick={() => onDelete(row)}
					disabled={row.id_usuario === user?.id}
				>
					<span className="material-symbols-rounded text-sm!">delete</span>
				</button>
			</ProtectedAnyPermission>
		</div>
	);
}
