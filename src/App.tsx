import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Login from "@/components/auth/Login";
import Home from "@/components/dashboard/Home";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ToastContainer from "@/components/common/ToastContainer";
import ViewCrearTurnos from "@/components/turnos/ViewAsignacionTurnos";
import ViewTurnos from "./components/turnos/ViewTurnos";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/turnos-view" element={<ViewTurnos />} />
				<Route
					path="/create-turnos"
					element={
						<ProtectedRoute>
							<ViewCrearTurnos />
						</ProtectedRoute>
					}
				/>

				{/* Todas las rutas del dashboard usan el mismo layout (Home) */}
				<Route
					path="/dashboard/*"
					element={
						<ProtectedRoute>
							<Home />
						</ProtectedRoute>
					}
				/>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
			<ToastContainer />
		</Router>
	);
}

export default App;
