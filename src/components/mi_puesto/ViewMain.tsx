import { useState } from "react";
import ViewMipuesto from "./ViewMipuesto";
import ViewCallTurnos from "./ViewCallTurnos";

export default function ViewMain() {
	const [estado, setEstado] = useState(false);

	return estado ? <ViewMipuesto /> : <ViewCallTurnos />;
}
