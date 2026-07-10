// ================================================================
// Page Profil - Informations de l'utilisateur connecte
// ================================================================

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Profil() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const avatarLetter = user?.prenom ? user.prenom.charAt(0).toUpperCase() : "U";
  const displayName = user?.prenom && user?.nom
    ? user.prenom + " " + user.nom
    : "Utilisateur";
  const displayEmail = user?.email || "email@non.disponible";
  const displayRole = user?.role || "Employe";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Les modifications seront disponibles prochainement.");
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div>
      <h1 className="page-title">Mon Profil</h1>
      <p className="page-description">
        Gerez vos informations personnelles
      </p>

      <div className="profil-card">
        <div className="profil-avatar">
          <span className="profil-avatar-letter">{avatarLetter}</span>
        </div>

        <div className="profil-info">
          <h2 className="profil-name">{displayName}</h2>
          <p className="profil-email">{displayEmail}</p>
          <p className="profil-role">{displayRole}</p>
        </div>
      </div>

      {message && (
        <div className={"profil-message " + messageType}>
          {message}
        </div>
      )}

      <div className="profil-form-card">
        <h3 className="profil-form-title">
          Modifier mes informations
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="profil-form-group">
            <label className="profil-label" htmlFor="prenom">
              Prenom
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              className="profil-input"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Votre prenom"
            />
          </div>

          <div className="profil-form-group">
            <label className="profil-label" htmlFor="nom">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              className="profil-input"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom"
            />
          </div>

          <div className="profil-form-group">
            <label className="profil-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="profil-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
            />
          </div>

          <div className="profil-form-group">
            <label className="profil-label" htmlFor="password">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="profil-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Laissez vide pour ne pas changer"
            />
          </div>

          <button type="submit" className="employes-btn employes-btn-primary">
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profil;
