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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.png" alt="Logo Presence Coryas" className="login-logo-img" />
          </div>
          <h1 className="login-title">PRÉSENCE CORYAS</h1>
          <p className="login-subtitle">
            Connectez-vous à votre compte
          </p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
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
              disabled={isLoading}
              required
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
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
