import React from "react";

const DashboardMain: React.FC = () => {
	return (
		<div className="mt-4 xl:mt-6 w-full px-4 sm:px-6 lg:px-8">
			<h2 className="text-lg font-semibold mb-4">Resumen</h2>
			<div className="grid grid-cols-3 gap-4 mb-6">
				<div className="bg-white p-4 rounded shadow">Tarjeta 1</div>
				<div className="bg-white p-4 rounded shadow">Tarjeta 2</div>
				<div className="bg-white p-4 rounded shadow">Tarjeta 3</div>
			</div>
			<div className="border-4 border-dashed border-gray-200 rounded-lg flex items-center justify-center min-h-96">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-background-dark dark:text-background-light mb-4">
						Dashboard - Gestión de Turnos
					</h2>
					<p className="text-secondary mb-4">Sistema de gestión de turnos y citas</p>
					<div className="space-y-2 text-sm text-secondary">
						<p>Usuario: Laynker Gutierrez</p>
						<p>Rol: Super Administrador</p>
						<p>Turnos activos: 5</p>
						<p className="max-w-md mx-auto">
							Bienvenido al sistema de gestión de turnos. Desde aquí puedes administrar todos
							los aspectos relacionados con las citas y turnos de tu organización.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardMain;