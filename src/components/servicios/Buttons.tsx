import type { FullServicios } from "@/@types/servicios";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { SERVICE_PERMISSIONS } from "@/constants/permissions";

interface ButtonsProps {
	row: FullServicios;
	onView: (p: FullServicios) => void;
	onEdit: (p: FullServicios) => void;
	onDelete: (p: FullServicios) => void;
}

export default function Buttons({
	row,
	onView,
	onEdit,
	onDelete,
}: ButtonsProps) {
	return (
		<div className="flex gap-2 items-center">
			<ProtectedAnyPermission
				permissions={[SERVICE_PERMISSIONS.READ, SERVICE_PERMISSIONS.MANAGE]}
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
				permissions={[SERVICE_PERMISSIONS.UPDATE, SERVICE_PERMISSIONS.MANAGE]}
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
				permissions={[SERVICE_PERMISSIONS.DELETE, SERVICE_PERMISSIONS.MANAGE]}
			>
				<button
					className="border-1 border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow"
					onClick={() => onDelete(row)}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700!">
						delete
					</span>
				</button>
			</ProtectedAnyPermission>
		</div>
	);
}
