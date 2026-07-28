// ================================================================
// Navbar - Barre de navigation en haut
// ================================================================
// Affiche le logo de l'entreprise (depuis Configuration) à gauche
// et le nom de l'utilisateur à droite.
// ================================================================

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import parametresService from "../../services/parametresService";
import "./style.css";

function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const [company, setCompany] = useState({ nom: "PRÉSENCIA", logo: null });

  useEffect(() => {
    // SuperAdmin ne doit pas voir le nom d'une entreprise spécifique
    if (user?.role === "SuperAdmin") {
      setCompany({ nom: "PRÉSENCIA", logo: null });
      return;
    }
    const load = async () => {
      try {
        const res = await parametresService.get();
        if (res.data) {
          setCompany({
            nom: res.data.nom_entreprise || "PRÉSENCIA",
            logo: res.data.logo_url || "/logo.png",
          });
        }
      } catch { /* fallback silencieux */ }
    };
    load();
  }, [user]);

  const avatarLetter = user?.prenom ? user.prenom.charAt(0).toUpperCase() : "A";
  const displayName = user?.prenom ? user.prenom + " " + user.nom : "Utilisateur";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Bouton hamburger pour mobile */}
        <button className="navbar-hamburger" onClick={onToggleSidebar} aria-label="Menu">
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div className="navbar-brand">
          <img src={company.logo || "/logo.png"} alt="Logo" className="navbar-logo-img" />
          <span className="navbar-logo">{company.nom}</span>
        </div>
      </div>

      <div className="navbar-user">
        <span className="navbar-user-name">{displayName}</span>
        <span className="navbar-user-avatar">{avatarLetter}</span>
      </div>
    </nav>
  );
}

export default Navbar;
