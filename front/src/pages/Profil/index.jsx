// ================================================================
// Page Profil - Informations de l'utilisateur connecte
// Changement de mot de passe operationnel pour tous les roles
// ================================================================

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";
import parametresService from "../../services/parametresService";
import { Building2 } from "lucide-react";
import "./style.css";

function Profil() {
  const { user } = useAuth();
  const [company, setCompany] = useState({ nom: "", logo: null });

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await parametresService.get();
        if (res.data) {
          setCompany({
            nom: res.data.nom_entreprise || "",
            logo: res.data.logo_url || null,
          });
        }
      } catch { /* fallback */ }
    };
    load();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const avatarLetter = user?.prenom ? user.prenom.charAt(0).toUpperCase() : "U";
  const displayName = user?.prenom && user?.nom
    ? user.prenom + " " + user.nom
    : "Utilisateur";
  const displayEmail = user?.email || "email@non.disponible";
  const displayRole = user?.role || "Employé";

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validations
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      showMessage("Veuillez remplir tous les champs.", "error");
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      showMessage("Les nouveaux mots de passe ne correspondent pas.", "error");
      return;
    }
    if (nouveauMdp.length < 6) {
      showMessage("Le mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.changePassword(ancienMdp, nouveauMdp);
      showMessage(result.message || "Mot de passe modifié avec succès !");
      setAncienMdp("");
      setNouveauMdp("");
      setConfirmMdp("");
    } catch (err) {
      showMessage(err.message || "Erreur lors du changement de mot de passe.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Mon Profil</h1>
      <p className="page-description">
        Gérez votre profil et votre mot de passe
      </p>

      <div className="profil-card">
        <div className="profil-card-top">
          <div className="profil-avatar">
            {company.logo ? (
              <img src={company.logo} alt={company.nom} className="profil-company-logo" />
            ) : (
              <span className="profil-avatar-letter">{avatarLetter}</span>
            )}
          </div>
          <div className="profil-info">
            <h2 className="profil-name">{displayName}</h2>
            <p className="profil-email">{displayEmail}</p>
            <p className="profil-role">{displayRole}</p>
          </div>
        </div>
        {company.nom && (
          <div className="profil-company">
            <Building2 size={14} />
            <span>{company.nom}</span>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`profil-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profil-form-card">
        <h3 className="profil-form-title">
          <span style={{ marginRight: 8 }}>🔒</span>
          Changer mon mot de passe
        </h3>

        <form onSubmit={handleChangePassword}>
          <div className="profil-form-group">
            <label className="profil-label" htmlFor="ancienMdp">
              Ancien mot de passe
            </label>
            <input
              type="password"
              id="ancienMdp"
              className="profil-input"
              value={ancienMdp}
              onChange={(e) => setAncienMdp(e.target.value)}
              placeholder="Votre mot de passe actuel"
            />
          </div>

          <div className="profil-form-group">
            <label className="profil-label" htmlFor="nouveauMdp">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="nouveauMdp"
              className="profil-input"
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              placeholder="Au moins 6 caractères"
            />
          </div>

          <div className="profil-form-group">
            <label className="profil-label" htmlFor="confirmMdp">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              id="confirmMdp"
              className="profil-input"
              value={confirmMdp}
              onChange={(e) => setConfirmMdp(e.target.value)}
              placeholder="Retapez le nouveau mot de passe"
            />
          </div>

          <button
            type="submit"
            className="employes-btn employes-btn-primary"
            disabled={loading}
            style={loading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
          >
            {loading ? "Changement en cours..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profil;
