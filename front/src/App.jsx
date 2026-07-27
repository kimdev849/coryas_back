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
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employes from "./pages/Employes";
import Presences from "./pages/Presences";
import Conges from "./pages/Conges";
import MonPointage from "./pages/MonPointage";
import Configuration from "./pages/Configuration";
import Profil from "./pages/Profil";
import EmployeDetail from "./pages/EmployeDetail";
import Stats from "./pages/Stats";
import DashboardLayout from "./layouts/DashboardLayout";
import TypeConges from "./pages/TypeConges";
import Contrats from "./pages/Contrats";
import Sites from "./pages/Sites";
import Equipes from "./pages/Equipes";
import HeuresSup from "./pages/HeuresSup";
import AuditLog from "./pages/AuditLog";
import Departements from "./pages/Departements";
import SuperAdmin from "./pages/SuperAdmin";
import EntrepriseDetail from "./pages/SuperAdmin/EntrepriseDetail";

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

function SuperAdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user?.role !== "SuperAdmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing page publique */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

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
        <Route path="/stats" element={<AdminRoute><Stats /></AdminRoute>} />
        <Route path="/types-conges" element={<AdminRoute><TypeConges /></AdminRoute>} />
        <Route path="/contrats" element={<AdminRoute><Contrats /></AdminRoute>} />
        <Route path="/departements" element={<AdminRoute><Departements /></AdminRoute>} />
        <Route path="/sites" element={<AdminRoute><Sites /></AdminRoute>} />
        <Route path="/equipes" element={<AdminRoute><Equipes /></AdminRoute>} />
        <Route path="/heures-sup" element={<HeuresSup />} />
        <Route path="/audit" element={<AdminRoute><AuditLog /></AdminRoute>} />
        <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
        <Route path="/super-admin/entreprise/:id" element={<SuperAdminRoute><EntrepriseDetail /></SuperAdminRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
