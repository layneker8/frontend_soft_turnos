import type { FullUser } from "@/@types/users";
import { ProtectedAnyPermission } from "../common/ProtectedComponent";
import { USER_PERMISSIONS } from "@/constants/permissions";
import { useAuthStore } from "@/stores";

interface ButtonsProps {
	row: FullUser;
	onView: (user: FullUser) => void;
	onEdit: (user: FullUser) => void;
	onDelete: (user: FullUser) => void;
	onForgetEmail: (user: FullUser) => void;
}

export default function Buttons({
	row,
	onView,
	onEdit,
	onDelete,
	onForgetEmail,
}: ButtonsProps) {
	const { user } = useAuthStore();
	return (
		<div className="flex gap-2 items-center">
			<ProtectedAnyPermission
				permissions={[USER_PERMISSIONS.READ, USER_PERMISSIONS.MANAGE]}
			>
				<button
					className="border border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow"
					onClick={() => onView(row)}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700! ">
						visibility
					</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[USER_PERMISSIONS.UPDATE, USER_PERMISSIONS.MANAGE]}
			>
				<button
					className="border border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow"
					onClick={() => onEdit(row)}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700!">
						edit
					</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[USER_PERMISSIONS.DELETE, USER_PERMISSIONS.MANAGE]}
			>
				<button
					className="border border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow disabled:opacity-50 disabled:cursor-not-allowed!"
					onClick={() => onDelete(row)}
					disabled={row.id_usuario === user?.id}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700!">
						delete
					</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[USER_PERMISSIONS.UPDATE, USER_PERMISSIONS.MANAGE]}
			>
				<button
					className="border border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow disabled:opacity-50 disabled:cursor-not-allowed!"
					title={`${
						!row.status_verified
							? "Enviar correo para restablecimiento de contraseña"
							: "Enviar correo para verificación de cuenta"
					}`}
					onClick={() => onForgetEmail(row)}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700!">
						{!row.status_verified ? "outgoing_mail" : "mail_shield"}
					</span>
				</button>
			</ProtectedAnyPermission>
		</div>
	);
}
