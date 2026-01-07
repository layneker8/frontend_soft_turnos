import type { DataCitaPrevia } from "@/@types/clientes";
import Modal from "../common/Modal";
// import Button from "../common/Button";

interface CitasModalProps {
	data: DataCitaPrevia[];
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: DataCitaPrevia) => void;
}

const CitasModal: React.FC<CitasModalProps> = ({
	data,
	isOpen,
	onClose,
	onSubmit,
}) => {
	const body = (
		<div className="flex flex-col gap-3">
			<p>
				{data.length === 1
					? `El usuario tiene ${data.length} cita previa,`
					: `El usuario tiene ${data.length} citas previas,`}{" "}
				por favor selecciona una para continuar:
			</p>
			{data.map((cita) => (
				<button
					onClick={() => onSubmit(cita)}
					key={cita.id_cita}
					className="w-full"
				>
					<div
						key={cita.id_cita}
						className="border border-black/20 p-2 rounded shadow-md bg-primary-100/20 transition"
					>
						<p className="text-justify text-sm mb-2">
							<strong className="text-primary-700">Servicio:</strong>{" "}
							{cita.servicio}
						</p>
						<p className="text-justify text-sm mb-2">
							<strong className="text-primary-700">Fecha de Asignación:</strong>{" "}
							{new Date(cita.fecha_asignacion).toLocaleString("es-ES", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								hour12: true,
							})}
						</p>
						<p className="text-justify text-sm mb-2">
							<strong className="text-primary-700">Lugar de Cita:</strong>{" "}
							{cita.lugar_cita}
						</p>
						<p className="text-justify text-sm mb-2">
							<strong className="text-primary-700">Especialista:</strong>{" "}
							{cita.especialista_nombre || "N/A"}
						</p>
						<p className="text-justify text-sm mb-2">
							<strong className="text-primary-700">Estado de Cita:</strong>{" "}
							{cita.estado_cita}
						</p>
					</div>
				</button>
			))}
		</div>
	);
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={"Citas Previas"}
			// footer={footer}
			size="md"
			position="center"
		>
			{body}
		</Modal>
	);
};

export default CitasModal;
