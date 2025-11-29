import type { AsignacionesCubiculo } from "@/@types/cubiculos";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { CUBICULO_PERMISSIONS } from "@/constants/permissions";

interface ButtonsProps {
	row: AsignacionesCubiculo;
	onDelete: (cubiculo: AsignacionesCubiculo) => void;
}

export default function Buttons({ row, onDelete }: ButtonsProps) {
	return (
		<div className="flex gap-2 items-center">
			<ProtectedAnyPermission
				permissions={[CUBICULO_PERMISSIONS.ASSIGN, CUBICULO_PERMISSIONS.MANAGE]}
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
