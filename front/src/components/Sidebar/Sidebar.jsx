// ================================================================
// Sidebar - Menu lateral
// ================================================================
// Contient les liens vers toutes les pages de l'application.
// Le lien "Deconnexion" est en bas.
// ================================================================

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "Administrateur" || user?.role === "RH" || user?.role === "Directeur";
  const isSuperAdmin = user?.role === "SuperAdmin";

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="sidebar">
      {/* Bouton fermer pour mobile */}
      <button className="sidebar-close" onClick={onClose} aria-label="Fermer">
        ✕
      </button>
      <div className="sidebar-brand">
        <div className="sidebar-brand-text">PRÉSENCIA</div>
        <div className="sidebar-brand-sub">Gestion RH Intelligente</div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link" onClick={handleNavClick}>
          Dashboard
        </NavLink>

        {!isAdmin && (
          <NavLink to="/mon-pointage" className="sidebar-link" onClick={handleNavClick}>
            Mon Pointage
          </NavLink>
        )}

        <NavLink to="/conges" className="sidebar-link" onClick={handleNavClick}>
          Mes Congés
        </NavLink>

        <NavLink to="/heures-sup" className="sidebar-link" onClick={handleNavClick}>
          Heures sup
        </NavLink>

        {isAdmin && (
          <>
            <NavLink to="/employes" className="sidebar-link" onClick={handleNavClick}>
              Employés
            </NavLink>
            <NavLink to="/presences" className="sidebar-link" onClick={handleNavClick}>
              Présences
            </NavLink>
            <NavLink to="/stats" className="sidebar-link" onClick={handleNavClick}>
              Ponctualité
            </NavLink>
            <NavLink to="/types-conges" className="sidebar-link" onClick={handleNavClick}>
              Types congés
            </NavLink>
            <NavLink to="/equipes" className="sidebar-link" onClick={handleNavClick}>
              Équipes
            </NavLink>
            <NavLink to="/sites" className="sidebar-link" onClick={handleNavClick}>
              Sites
            </NavLink>
            <NavLink to="/contrats" className="sidebar-link" onClick={handleNavClick}>
              Contrats
            </NavLink>
            <NavLink to="/audit" className="sidebar-link" onClick={handleNavClick}>
              Journal audit
            </NavLink>
            <NavLink to="/configuration" className="sidebar-link" onClick={handleNavClick}>
              Configuration
            </NavLink>
          </>
        )}

        {isSuperAdmin && (
          <>
            <div className="sidebar-section">Super Admin</div>
            <NavLink to="/super-admin" className="sidebar-link" onClick={handleNavClick}>
              🏢 Entreprises
            </NavLink>
          </>
        )}

        <NavLink to="/profil" className="sidebar-link" onClick={handleNavClick}>
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
