// ================================================================
// Page Login - Connexion
// ================================================================
// L'utilisateur tape son email et mot de passe.
// Au clic sur "Se connecter", on appelle l'API /auth/login.
// Si ok, on stocke le token JWT et on va sur /dashboard.
// Si erreur, on affiche le message.
// ================================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  // ================================================================
  // handleLogin - Fonction appelée au clic sur le bouton
  // IMPORTANT : on utilise onClick sur le bouton (pas onSubmit sur
  // le formulaire) pour éviter tout rechargement intempestif de
  // la page. Certains navigateurs peuvent soumettre le formulaire
  // de manière native (avec autofill par ex.) et provoquer un
  // rechargement complet de la page.
  // ================================================================
  const handleLogin = async () => {
    if (isLoading || !email || !password) return;
    
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // ⚠️ Si le serveur est injoignable, fetch() lance une TypeError
      if (err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("Network")) {
        setError("Impossible de contacter le serveur. Vérifiez votre connexion internet.");
      } else {
        setError(err.message || "Email ou mot de passe incorrect");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================
  // handleKeyDown - Empêche la touche Entrée de soumettre le
  // formulaire de manière native (ce qui rechargerait la page).
  // ================================================================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.png" alt="Logo Gestion des Présences" className="login-logo-img" />
          </div>
          <h1 className="login-title">GESTION DES PRÉSENCES</h1>
          <p className="login-subtitle">
            Connectez-vous à votre compte
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {/* ⚠️ On utilise <div> au lieu de <form> pour éviter
            tout rechargement intempestif de la page lié à une
            soumission native du formulaire par le navigateur */}
        <div className="login-form">
          <div className="login-field">
            <label className="login-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="login-input"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              className="login-input"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="button"
            className="login-btn"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
