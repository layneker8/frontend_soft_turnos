import React from "react";
import { useToastStore, type Toast } from "@/stores";

const ToastContainer: React.FC = () => {
	const { toasts, removeToast } = useToastStore();

	if (toasts.length === 0) return null;

	const getToastIcon = (type: Toast["type"]) => {
		switch (type) {
			case "success":
				return "check_circle";
			case "error":
				return "error";
			case "warning":
				return "warning";
			case "info":
				return "info";
			default:
				return "info";
		}
	};

	const getToastColors = (type: Toast["type"]) => {
		switch (type) {
			case "success":
				return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200";
			case "error":
				return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
			case "warning":
				return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
			case "info":
				return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
			default:
				return "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200";
		}
	};

	return (
		<div className="fixed top-4 right-4 space-y-2 z-[99999]">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`
            max-w-sm w-full border rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300
            ${getToastColors(toast.type)}
          `}
				>
					<div className="flex items-start">
						<span className="material-symbols-rounded mr-3 text-lg flex-shrink-0">
							{getToastIcon(toast.type)}
						</span>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium">{toast.title}</p>
							{toast.message && (
								<p className="text-xs mt-1 opacity-80">{toast.message}</p>
							)}
						</div>
						<button
							onClick={() => removeToast(toast.id)}
							className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
						>
							<span className="material-symbols-rounded text-sm">close</span>
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default ToastContainer;
