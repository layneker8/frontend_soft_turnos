import type { AsignacionServicio } from "@/@types/asignacionServicios";
import { ProtectedAnyPermission } from "@/components/common/ProtectedComponent";
import { SERVICE_PERMISSIONS } from "@/constants/permissions";

interface ButtonsProps {
	row: AsignacionServicio;
	onDelete: (asignacion: AsignacionServicio) => void;
}

export default function Buttons({ row, onDelete }: ButtonsProps) {
	return (
		<div className="flex gap-2 items-center justify-center">
			<ProtectedAnyPermission
				permissions={[SERVICE_PERMISSIONS.ASSIGN, SERVICE_PERMISSIONS.MANAGE]}
			>
				<button
					className="border-1 border-secondary-500 text-white px-2 py-1 rounded hover:bg-primary-100 shadow"
					onClick={() => onDelete(row)}
					title="Eliminar asignación"
				>
					<span className="material-symbols-rounded text-sm! text-secondary-700!">
						delete
					</span>
				</button>
			</ProtectedAnyPermission>
		</div>
	);
}
