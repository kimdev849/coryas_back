// ================================================================
// App.jsx - Point d'entree de l'application
// ================================================================
// C'est le composant principal. Il contient :
// 1. AuthProvider : donne les infos de connexion a toute l'app
// 2. Les routes : chaque URL affiche une page differente
// 3. ProtectedRoute : si pas connecte, on est renvoye au login
// ================================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employes from "./pages/Employes";
import Presences from "./pages/Presences";
import Conges from "./pages/Conges";
import MonPointage from "./pages/MonPointage";
import Configuration from "./pages/Configuration";
import Profil from "./pages/Profil";
import EmployeDetail from "./pages/EmployeDetail";
import DashboardLayout from "./layouts/DashboardLayout";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#666"
      }}>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrateur" || user?.role === "RH" || user?.role === "Directeur";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mon-pointage" element={<MonPointage />} />
        <Route path="/conges" element={<Conges />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/employes/:id" element={<AdminRoute><EmployeDetail /></AdminRoute>} />
        <Route path="/employes" element={<AdminRoute><Employes /></AdminRoute>} />
        <Route path="/presences" element={<AdminRoute><Presences /></AdminRoute>} />
        <Route path="/configuration" element={<AdminRoute><Configuration /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
