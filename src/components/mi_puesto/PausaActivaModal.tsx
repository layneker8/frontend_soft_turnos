import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Modal from "../common/Modal";
import type { pausaAtencion } from "@/@types";

interface PausaActivaModalProps {
	isOpen: boolean;
	onClose: () => void;
	pausa: pausaAtencion | null;
	onReanudar: () => Promise<boolean>;
	loading?: boolean;
}

const PausaActivaModal: React.FC<PausaActivaModalProps> = ({
	isOpen,
	onClose,
	pausa,
	onReanudar,
	loading = false,
}) => {
	const [tiempoPausa, setTiempoPausa] = useState("00:00:00");

	// Calcular tiempo transcurrido desde el inicio de la pausa
	useEffect(() => {
		if (!pausa || !isOpen) return;

		const calculateTime = () => {
			const fechaPausa = dayjs(pausa.fecha_pausa).format("YYYY-MM-DD");
			const inicio = dayjs(`${fechaPausa}T${pausa.hora_inicio}`).toDate();
			const ahora = dayjs().toDate();
			// const diff = Math.floor((ahora.getTime() - inicio.getTime()) / 1000);
			const diff = Math.floor(dayjs(ahora).diff(dayjs(inicio)) / 1000);

			const hours = Math.floor(diff / 3600);
			const minutes = Math.floor((diff % 3600) / 60);
			const seconds = diff % 60;

			const hoursStr = hours.toString().padStart(2, "0");
			const minutesStr = minutes.toString().padStart(2, "0");
			const secondsStr = seconds.toString().padStart(2, "0");

			setTiempoPausa(`${hoursStr}:${minutesStr}:${secondsStr}`);
		};

		calculateTime();
		const interval = setInterval(calculateTime, 1000);

		return () => clearInterval(interval);
	}, [pausa, isOpen]);

	const handleReanudar = async () => {
		const success = await onReanudar();
		if (success) onClose();
	};

	const modalBody = (
		<div className="text-center space-y-4">
			<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#FF9D43]/20">
				<span className="material-symbols-rounded text-[#FF9D43] text-3xl">
					pause_circle
				</span>
			</div>
			<p className="text-sm text-gray-600 dark:text-gray-400">
				Tu disponibilidad está actualmente en pausa. Reanuda cuando estés listo.
			</p>

			<div className="my-6">
				<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Tiempo en pausa
				</p>
				<div className="text-5xl font-bold text-gray-900 dark:text-white tracking-wider">
					{tiempoPausa}
				</div>
			</div>

			{pausa?.observaciones && (
				<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
					<p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
						Descripción:
					</p>
					<p className="text-sm text-gray-800 dark:text-gray-200">
						{pausa.observaciones}
					</p>
				</div>
			)}
		</div>
	);

	const footer = (
		<div className="w-full">
			<button
				type="button"
				onClick={handleReanudar}
				disabled={loading}
				className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-[#FF9D43] text-base font-semibold text-white hover:bg-[#FF9D43]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9D43] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				{loading ? (
					<>
						<span className="material-symbols-rounded animate-spin text-sm mr-2">
							refresh
						</span>
						Reanudando...
					</>
				) : (
					<>
						<span className="material-symbols-rounded text-sm mr-2">
							play_arrow
						</span>
						Reanudar Atención
					</>
				)}
			</button>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Atención Pausada"
			footer={footer}
			size="md"
		>
			{modalBody}
		</Modal>
	);
};

export default PausaActivaModal;
