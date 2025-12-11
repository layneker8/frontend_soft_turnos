import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?:
		| "primary"
		| "secondary"
		| "danger"
		| "outline-primary"
		| "outline-secondary"
		| "outline-danger";
	children: React.ReactNode;
};

const getButtonClass = (variant: ButtonProps["variant"]) => {
	switch (variant) {
		case "primary":
			return "bg-blue-600 text-white hover:bg-blue-700";
		case "secondary":
			return "bg-gray-200 text-gray-800 hover:bg-gray-300";
		case "danger":
			return "bg-red-600 text-white hover:bg-red-700";
		case "outline-primary":
			return "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white";
		case "outline-secondary":
			return "bg-transparent text-gray-800 border border-gray-300 hover:bg-gray-800 hover:text-white";
		case "outline-danger":
			return "bg-transparent text-red-600 border border-red-600 hover:bg-red-600 hover:text-white";
		default:
			return "bg-gray-100 text-black hover:bg-gray-200";
	}
};

const Button: React.FC<ButtonProps> = ({
	variant = "primary",
	children,
	className = "",
	...props
}) => {
	return (
		<button
			className={`px-4 py-2 rounded focus:outline-none transition ${getButtonClass(
				variant
			)} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
