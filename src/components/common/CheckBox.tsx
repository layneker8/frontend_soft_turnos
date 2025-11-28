import React from "react";

interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "primary" | "secondary" | "danger";
}

const getVariantStyles = (variant: CheckBoxProps["variant"]) => {
	switch (variant) {
		case "primary":
			return "bg-blue-600 text-white hover:bg-blue-700";
		case "secondary":
			return "bg-gray-200 text-gray-800 hover:bg-gray-300";
		case "danger":
			return "bg-red-600 text-white hover:bg-red-700";
		default:
			return "bg-gray-100 text-black hover:bg-gray-200";
	}
};

export const CheckBox: React.FC<CheckBoxProps> = ({
	variant,
	className = "",
	...props
}) => {
	return (
		<input
			type="checkbox"
			className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${getVariantStyles(
				variant
			)} ${className}`}
			{...props}
		/>
	);
};

export const ToggleCheckBox: React.FC<CheckBoxProps> = ({
	className = "",
	...props
}) => {
	return (
		<label className="relative inline-flex items-center cursor-pointer">
			<input type="checkbox" value="" className="sr-only peer" {...props} />
			<div
				className={`group peer ring-0 bg-red-400 rounded-full outline-none duration-300 after:duration-300 w-12 h-6  shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:bg-gray-50 after:outline-none after:h-4 after:w-4 after:top-1 after:left-1 after:-rotate-180 after:flex after:justify-center after:items-center after:text-xs peer-checked:after:translate-x-5 peer-checked:after:content-['✔️'] peer-checked:after:rotate-0 ${className}`}
			></div>
		</label>
	);
};
