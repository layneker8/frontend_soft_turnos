import React from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound404: React.FC = () => {
	const location = useLocation();

	return (
		<div className="flex flex-col items-center justify-center min-h-96 px-4 sm:px-6 lg:px-8 py-8">
			<div className="text-center max-w-md">
				{/* Icono 404 */}
				<div className="mb-8">
					<span className="material-symbols-rounded text-7xl sm:text-9xl text-gray-300 dark:text-gray-600">
						error_outline
					</span>
				</div>

				{/* Título */}
				<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
					404
				</h1>

				{/* Subtítulo */}
				<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
					Página no encontrada
				</h2>

				{/* Mensaje */}
				<p className="text-gray-600 dark:text-gray-400 mb-2">
					Lo sentimos, la página que estás buscando no existe o ha sido movida.
				</p>

				{/* Mostrar la ruta inválida */}
				<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-8">
					<p className="text-sm text-gray-500 dark:text-gray-400">Ruta solicitada:</p>
					<code className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
						{location.pathname}
					</code>
				</div>

				{/* Botones de acción */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						to="/dashboard"
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
					>
						<span className="material-symbols-rounded mr-2 text-sm">home</span>
						Ir al Dashboard
					</Link>

					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
					>
						<span className="material-symbols-rounded mr-2 text-sm">arrow_back</span>
						Volver Atrás
					</button>
				</div>

				{/* Enlaces útiles */}
				<div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enlaces útiles:</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm">
						<Link
							to="/dashboard/turnos"
							className="text-primary hover:text-primary/80 transition-colors"
						>
							Ver Turnos
						</Link>
						<Link
							to="/dashboard/asignacion-turnos"
							className="text-primary hover:text-primary/80 transition-colors"
						>
							Asignar Turnos
						</Link>
						<Link
							to="/dashboard/usuarios"
							className="text-primary hover:text-primary/80 transition-colors"
						>
							Usuarios
						</Link>
						<Link
							to="/dashboard/configuracion"
							className="text-primary hover:text-primary/80 transition-colors"
						>
							Configuración
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound404;
