import React from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
	showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	footer,
	size = "md",
	showCloseButton = true,
}) => {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: "sm:max-w-[400px]",
		md: "sm:max-w-[570px]",
		lg: "sm:max-w-[800px]",
		xl: "sm:max-w-[1024px]",
	};

	return (
		<div
			className={`fixed left-0 top-0 h-full w-full bg-black/50 z-[1060] overflow-x-hidden overflow-y-auto outline-0 transition-opacity ease-linear ${
				isOpen ? "opacity-100" : "opacity-0"
			}`}
			onClick={onClose}
		>
			<div
				className={`relative w-auto pointer-events-none ${
					sizeClasses[size]
				} my-[0.5rem] mx-[0.5rem] sm:mx-auto md:my-[1.5rem] xl:my-[1.75rem] transition-transform ease-out ${
					isOpen ? "transform-none" : "transform-[translate(0,-50px)]"
				}`}
			>
				<div
					className="relative flex flex-col w-full pointer-events-auto bg-white dark:bg-gray-800 border-1 border-solid border-black/50 dark:border-gray-600 rounded-lg outline-0"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex flex-shrink-0 items-center justify-between p-3 md:p-4 border-b-1 border-solid border-black/20 dark:border-gray-600">
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							{title}
						</h3>
						{showCloseButton && (
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
							>
								<span className="material-symbols-rounded">close</span>
							</button>
						)}
					</div>

					{/* Body */}
					<div className="p-[1rem] grow-1 shrink-1 basis-auto max-h-[calc(100vh-200px)] overflow-y-auto">
						{children}
					</div>

					{/* Footer */}
					{footer && (
						<div className="px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-600">
							{footer}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Modal;
