// ================================================================
// Sidebar - Menu lateral
// ================================================================
// Contient les liens vers toutes les pages de l'application.
// Le lien "Deconnexion" est en bas.
// ================================================================

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "Administrateur" || user?.role === "RH" || user?.role === "Directeur";

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          Dashboard
        </NavLink>

        {!isAdmin && (
          <NavLink to="/mon-pointage" className="sidebar-link">
            Mon Pointage
          </NavLink>
        )}

        <NavLink to="/conges" className="sidebar-link">
          Mes Conges
        </NavLink>

        {isAdmin && (
          <>
            <NavLink to="/employes" className="sidebar-link">
              Employes
            </NavLink>
            <NavLink to="/presences" className="sidebar-link">
              Presences
            </NavLink>
            <NavLink to="/configuration" className="sidebar-link">
              Configuration
            </NavLink>
          </>
        )}

        <NavLink to="/profil" className="sidebar-link">
          Profil
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <a href="/" onClick={handleLogout} className="sidebar-link sidebar-logout">
          Deconnexion
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
