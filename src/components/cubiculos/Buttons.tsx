import type { FullCubiculo } from "@/@types/cubiculos";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { CUBICULO_PERMISSIONS } from "@/constants/permissions";

interface ButtonsProps {
	row: FullCubiculo;
	onView: (cubiculo: FullCubiculo) => void;
	onEdit: (cubiculo: FullCubiculo) => void;
	onDelete: (cubiculo: FullCubiculo) => void;
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
				permissions={[CUBICULO_PERMISSIONS.READ, CUBICULO_PERMISSIONS.MANAGE]}
			>
				<button
					className="bg-secondary-500 text-white px-2 py-1 rounded hover:bg-secondary-600 shadow"
					onClick={() => onView(row)}
				>
					<span className="material-symbols-rounded text-sm! ">visibility</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[CUBICULO_PERMISSIONS.UPDATE, CUBICULO_PERMISSIONS.MANAGE]}
			>
				<button
					className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-500 shadow"
					onClick={() => onEdit(row)}
				>
					<span className="material-symbols-rounded text-sm!">edit</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[CUBICULO_PERMISSIONS.DELETE, CUBICULO_PERMISSIONS.MANAGE]}
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
