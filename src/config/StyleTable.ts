// const colorprimary = "#ff961d";
// const colorprimary50 = "#fff7ed";
const colorprimary100 = "#ffedd5";
const colorprimary500 = "#ff961d";
// const colorprimary600 = "#ea580c";
// const colorprimary700 = "#c2410c";
// const colorsecondary = "#95969d";
const colorsecondary50 = "#f8fafc";
// const colorsecondary100 = "#f1f5f9";
const colorsecondary500 = "#95969d";
// const colorsecondary600 = "#64748b";
const colorsecondary700 = "#475569";
const colorbackgroundlight = "#f8f7f5";
// const colorbackgrounddark = "#231a0f";
// const colorbackgrounddefault = "#f6f6f0";

const tailwindTheme = {
	header: {
		style: {
			color: "white",
			fontSize: "1.25rem", // text-lg
			fontWeight: "700", // font-bold
			padding: "1rem",
		},
	},
	headRow: {
		style: {
			backgroundColor: colorprimary500, // bg-blue-800
			color: "white",
			fontWeight: "600",
			border: `1px solid ${colorprimary100}`,
			borderTopLeftRadius: "0.5rem", // <-- esquina superior izquierda redondeada
			borderTopRightRadius: "0.5rem",
		},
	},
	headCells: {
		style: {
			padding: "0.75rem 1rem", // p-3 px-4
			fontSize: "1rem",
		},
	},
	rows: {
		style: {
			backgroundColor: "white", // bg-white
			color: colorsecondary700, // text-gray-800
			minHeight: "50px",
			"&:nth-child(even)": {
				backgroundColor: colorbackgroundlight, // bg-gray-100
			},
			"&:hover": {
				backgroundColor: colorsecondary50, // bg-indigo-100
			},
		},
	},
	cells: {
		style: {
			padding: "0.5rem 1rem", // py-2 px-4
			border: `1px solid ${colorbackgroundlight}`, // border-b border-gray-200
		},
	},
	pagination: {
		style: {
			borderTop: `1px solid ${colorbackgroundlight}`, // border-t border-gray-200
			paddingTop: "0.5rem",
			paddingBottom: "0.5rem",
			backgroundColor: "white",
		},
		pageButtonsStyle: {
			borderRadius: "0.25rem", // rounded
			border: `1px solid ${colorbackgroundlight}`, // border-gray-300
			padding: "0.25rem 0.5rem",
			margin: "0 0.25rem",
			"&:hover": {
				backgroundColor: colorprimary100, // hover:bg-indigo-100
			},
			"&:disabled": {
				backgroundColor: colorbackgroundlight, // bg-gray-50
				color: colorsecondary500, // text-gray-400
			},
		},
	},
};

export const PaginationOptions = {
	rowsPerPageText: "Filas por página:",
	rangeSeparatorText: "de",
};

export default tailwindTheme;
