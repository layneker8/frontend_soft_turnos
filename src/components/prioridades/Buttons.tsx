import type { FullPrioridad } from "@/@types/prioridades";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { PRIORIDADES_PERMISSIONS } from "@/constants/permissions";

interface ButtonsProps {
	row: FullPrioridad;
	onView: (p: FullPrioridad) => void;
	onEdit: (p: FullPrioridad) => void;
	onDelete: (p: FullPrioridad) => void;
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
				permissions={[
					PRIORIDADES_PERMISSIONS.READ,
					PRIORIDADES_PERMISSIONS.MANAGE,
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
					PRIORIDADES_PERMISSIONS.UPDATE,
					PRIORIDADES_PERMISSIONS.MANAGE,
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
					PRIORIDADES_PERMISSIONS.DELETE,
					PRIORIDADES_PERMISSIONS.MANAGE,
				]}
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
