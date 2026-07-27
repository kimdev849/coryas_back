// ================================================================
// Navbar - Barre de navigation en haut
// ================================================================
// Affiche le logo de l'app a gauche et le nom de l'utilisateur a droite.
// ================================================================

import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();

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
          <img src="/logo.png" alt="Logo" className="navbar-logo-img" />
          <span className="navbar-logo">GESTION DES PRÉSENCES</span>
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
