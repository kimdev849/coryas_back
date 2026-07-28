// ================================================================
// Sidebar - Menu lateral
// ================================================================
// Affiche le nom de l'entreprise (depuis Configuration) en haut.
// Contient les liens vers toutes les pages de l'application.
// Le lien "Deconnexion" est en bas.
// ================================================================

import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import parametresService from "../../services/parametresService";
import "./style.css";

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("PRÉSENCIA");

  useEffect(() => {
    // SuperAdmin ne doit pas voir le nom d'une entreprise spécifique
    if (user?.role === "SuperAdmin") {
      setCompanyName("PRÉSENCIA");
      return;
    }
    const load = async () => {
      try {
        const res = await parametresService.get();
        if (res.data?.nom_entreprise) setCompanyName(res.data.nom_entreprise);
      } catch { /* fallback */ }
    };
    load();
  }, [user]);

  const isAdmin = user?.role === "Administrateur" || user?.role === "RH" || user?.role === "Directeur";
  const isSuperAdmin = user?.role === "SuperAdmin";
  const canManage = isAdmin || isSuperAdmin;

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
        <div className="sidebar-brand-text">{companyName}</div>
        <div className="sidebar-brand-sub">Gestion RH Intelligente</div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link" onClick={handleNavClick}>
          Dashboard
        </NavLink>

        {/* Liens employé (cachés pour SuperAdmin et admin) */}
        {!canManage && (
          <NavLink to="/mon-pointage" className="sidebar-link" onClick={handleNavClick}>
            Mon Pointage
          </NavLink>
        )}

        {/* Liens employé (cachés pour SuperAdmin) */}
        {!isSuperAdmin && (
          <NavLink to="/conges" className="sidebar-link" onClick={handleNavClick}>
            Congés
          </NavLink>
        )}

        {/* Liens admin (cachés pour SuperAdmin) */}
        {isAdmin && !isSuperAdmin && (
          <>
            <NavLink to="/employes" className="sidebar-link" onClick={handleNavClick}>
              Employés
            </NavLink>
            <NavLink to="/presences" className="sidebar-link" onClick={handleNavClick}>
              Présences
            </NavLink>
            <NavLink to="/heures-sup" className="sidebar-link" onClick={handleNavClick}>
              Heures sup
            </NavLink>
            <NavLink to="/stats" className="sidebar-link" onClick={handleNavClick}>
              Ponctualité
            </NavLink>
            <NavLink to="/types-conges" className="sidebar-link" onClick={handleNavClick}>
              Types congés
            </NavLink>
            <NavLink to="/departements" className="sidebar-link" onClick={handleNavClick}>
              Départements
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
