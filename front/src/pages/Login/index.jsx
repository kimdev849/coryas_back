// ================================================================
// Page Login - Connexion Présencia
// ================================================================
// Design moderne avec icônes Lucide React.
// ================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import parametresService from "../../services/parametresService";
import { Mail, Lock, Eye, EyeOff, LogIn, Building2 } from "lucide-react";
import "./style.css";

function Login() {
  const [company, setCompany] = useState({ nom: "PRÉSENCIA", logo: null, slogan: "Connectez-vous à votre espace" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await parametresService.get();
        if (res.data) {
          setCompany({
            nom: res.data.nom_entreprise || "PRÉSENCIA",
            logo: res.data.logo_url || null,
            slogan: res.data.slogan || "Connectez-vous à votre espace",
          });
        }
      } catch { /* fallback */ }
    };
    load();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (isLoading || !email || !password) return;
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("Network")) {
        setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
      } else {
        setError(err.message || "Email ou mot de passe incorrect");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="login-shape login-shape-1" />
        <div className="login-shape login-shape-2" />
        <div className="login-shape login-shape-3" />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo">
            {company.logo ? (
              <img src={company.logo} alt={company.nom} className="login-logo-img" />
            ) : (
              <Building2 size={48} className="login-logo-icon" />
            )}
          </div>
          <h1 className="login-title">{company.nom}</h1>
          <p className="login-subtitle">{company.slogan}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="login-form">
          <div className="login-field">
            <label className="login-label" htmlFor="email">Email</label>
            <div className="login-input-wrapper">
              <Mail size={18} className="login-input-icon" />
              <input
                type="email" id="email" className="login-input"
                placeholder="vous@entreprise.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown} disabled={isLoading}
                autoComplete="email" autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Mot de passe</label>
            <div className="login-input-wrapper">
              <Lock size={18} className="login-input-icon" />
              <input
                type={showPassword ? "text" : "password"} id="password"
                className="login-input login-input-password"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown} disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button" className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Cacher" : "Afficher"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="button" className="login-btn" disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? (
              <span className="login-btn-loading">
                <span className="login-spinner" />
                Connexion...
              </span>
            ) : (
              <span className="login-btn-content">
                <LogIn size={18} />
                Se connecter
              </span>
            )}
          </button>
        </div>

        <p className="login-footer">
          <strong>PRÉSENCIA</strong>
        </p>
      </div>
    </div>
  );
}

export default Login;
