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
					className="bg-secondary-500 text-white px-2 py-1 rounded hover:bg-secondary-600 shadow"
					onClick={() => onView(row)}
				>
					<span className="material-symbols-rounded text-sm!">visibility</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[
					PRIORIDADES_PERMISSIONS.UPDATE,
					PRIORIDADES_PERMISSIONS.MANAGE,
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
					PRIORIDADES_PERMISSIONS.DELETE,
					PRIORIDADES_PERMISSIONS.MANAGE,
				]}
			>
				<button
					className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 shadow"
					onClick={() => onDelete(row)}
				>
					<span className="material-symbols-rounded text-sm!">delete</span>
				</button>
			</ProtectedAnyPermission>
		</div>
	);
}
