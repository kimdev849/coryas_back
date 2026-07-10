// ================================================================
// Navbar - Barre de navigation en haut
// ================================================================
// Affiche le logo de l'app a gauche et le nom de l'utilisateur a droite.
// ================================================================

import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Navbar() {
  const { user } = useAuth();

  const avatarLetter = user?.prenom ? user.prenom.charAt(0).toUpperCase() : "A";
  const displayName = user?.prenom ? user.prenom + " " + user.nom : "Utilisateur";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo.png" alt="Logo" className="navbar-logo-img" />
        <span className="navbar-logo">PRESENCE CORYAS</span>
      </div>

      <div className="navbar-user">
        <span className="navbar-user-name">{displayName}</span>
        <span className="navbar-user-avatar">{avatarLetter}</span>
      </div>
    </nav>
  );
}

export default Navbar;
