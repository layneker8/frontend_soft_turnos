import type { FullSede } from "@/@types/sedes";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { SEDE_PERMISSIONS } from "@/constants/permissions";

interface ButtonsProps {
	row: FullSede;
	onView: (sede: FullSede) => void;
	onEdit: (sede: FullSede) => void;
	onDelete: (sede: FullSede) => void;
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
				permissions={[SEDE_PERMISSIONS.READ, SEDE_PERMISSIONS.MANAGE]}
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
				permissions={[SEDE_PERMISSIONS.UPDATE, SEDE_PERMISSIONS.MANAGE]}
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
				permissions={[SEDE_PERMISSIONS.DELETE, SEDE_PERMISSIONS.MANAGE]}
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
