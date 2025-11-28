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
					className="border-1 border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow"
					onClick={() => onView(row)}
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700! ">
						visibility
					</span>
				</button>
			</ProtectedAnyPermission>
			<ProtectedAnyPermission
				permissions={[CUBICULO_PERMISSIONS.UPDATE, CUBICULO_PERMISSIONS.MANAGE]}
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
				permissions={[CUBICULO_PERMISSIONS.DELETE, CUBICULO_PERMISSIONS.MANAGE]}
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
