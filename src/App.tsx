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

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
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
