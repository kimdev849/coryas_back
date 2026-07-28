import { useState } from "react";
import { ArrowRight, Shield, Smartphone, BarChart3, Users, Clock, MapPin, Menu, X } from "lucide-react";
import entreprisesService from "../../services/entreprisesService";
import "./style.css";

function Landing() {
  const [showSignup, setShowSignup] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [signupData, setSignupData] = useState({ nom_entreprise: "", email: "", telephone: "", ville: "", pays: "", plan_souhaite: "Pro", message: "" });
  const [signupSent, setSignupSent] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await entreprisesService.creerDemande(signupData);
      setSignupSent(true);
    } catch (err) {
      alert("Erreur : " + (err.message || "Impossible d'envoyer la demande. Veuillez réessayer."));
    }
  };

  return (
    <div className="landing">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <img src="/logo.png" alt="Présencia" className="landing-logo-img" />
            <span className="landing-logo-text">Présencia</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Fonctionnalités</a>
            <a href="#pricing" className="landing-nav-link">Tarifs</a>
            <a href="/login" className="landing-btn landing-btn-outline">Se connecter</a>
            <button className="landing-btn landing-btn-primary" onClick={() => setShowSignup(true)}>
              Essayer gratuitement
            </button>
            {/* Bouton hamburger mobile */}
            <button className="landing-mobile-toggle" onClick={() => setMobileMenu(true)} aria-label="Menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenu && (
        <>
          <div className="landing-mobile-overlay" onClick={() => setMobileMenu(false)} />
          <div className="landing-mobile-menu open">
            <div className="landing-mobile-menu-header">
              <img src="/logo.png" alt="Présencia" style={{ height: 32 }} />
              <button className="landing-mobile-menu-close" onClick={() => setMobileMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <a href="#features" className="landing-mobile-menu-link" onClick={() => setMobileMenu(false)}>
              Fonctionnalités
            </a>
            <a href="#pricing" className="landing-mobile-menu-link" onClick={() => setMobileMenu(false)}>
              Tarifs
            </a>
            <hr style={{ border: "none", borderTop: "1px solid #F3F4F6", margin: "8px 0" }} />
            <a href="/login" className="landing-btn landing-btn-primary landing-mobile-menu-btn"
               onClick={() => setMobileMenu(false)}>
              Se connecter
            </a>
            <button className="landing-btn landing-btn-outline landing-mobile-menu-btn"
                    onClick={() => { setMobileMenu(false); setShowSignup(true); }}>
              Essayer gratuitement
            </button>
          </div>
        </>
      )}

      {/* ===== HERO ===== */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">Plateforme RH nouvelle génération</div>
          <h1 className="landing-hero-title">
            Gérez vos équipes<br />
            <span className="landing-hero-highlight">simplement et sans stress</span>
          </h1>
          <p className="landing-hero-subtitle">
            Pointage mobile, congés, statistiques et anti-triche intégré.
            Une solution complète pour les RH africaines.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => setShowSignup(true)}>
              Créer mon espace <ArrowRight size={18} />
            </button>
            <a href="#features" className="landing-btn landing-btn-outline landing-btn-lg">
              En savoir plus
            </a>
          </div>
          {/* Mockup de l'application */}
          <div className="landing-hero-mockup">
            <img src="/Mockup.png" alt="Présencia App Mockup" className="landing-hero-mockup-img" />
          </div>
        </div>
      </section>

      {/* ===== FONCTIONNALITÉS ===== */}
      <section className="landing-section" id="features">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">L'essentiel pour vos RH</h2>
          <p className="landing-section-desc">
            Tout ce dont vous avez besoin pour gérer vos employés au quotidien.
          </p>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrap" style={{ background: "#EFF6FF" }}>
                <Smartphone size={28} style={{ color: "#2563EB" }} />
              </div>
              <h3>Pointage mobile</h3>
              <p>Vos employés pointent depuis leur téléphone. GPS + photo selfie. Anti-triche intégré.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrap" style={{ background: "#D1FAE5" }}>
                <Users size={28} style={{ color: "#059669" }} />
              </div>
              <h3>Gestion des équipes</h3>
              <p>Employés, congés, absences, heures sup. Tout est centralisé et tracé.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrap" style={{ background: "#FEF3C7" }}>
                <BarChart3 size={28} style={{ color: "#D97706" }} />
              </div>
              <h3>Statistiques & exports</h3>
              <p>Tableaux de bord en temps réel, export Excel pour la paie en un clic.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrap" style={{ background: "#EDE9FE" }}>
                <Shield size={28} style={{ color: "#7C3AED" }} />
              </div>
              <h3>Anti-triche total</h3>
              <p>GPS obligatoire, photo en direct, horodatage serveur. Données fiables à 100%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TARIFS (sans prix) ===== */}
      <section className="landing-section landing-section-dark" id="pricing">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Un abonnement adapté</h2>
          <p className="landing-section-desc">
            Du démarrage à la grande entreprise, nous avons une formule pour vous.
          </p>
          <div className="landing-pricing">
            <div className="landing-pricing-card">
              <h3 className="landing-pricing-name">Starter</h3>
              <p className="landing-pricing-desc">Pour découvrir Présencia</p>
              <ul className="landing-pricing-features">
                <li>✓ Jusqu'à 10 employés</li>
                <li>✓ Pointage mobile</li>
                <li>✓ Congés</li>
                <li className="disabled">✗ GPS / Photo</li>
                <li className="disabled">✗ Export Excel</li>
              </ul>
              <button className="landing-btn landing-btn-outline landing-btn-block" onClick={() => setShowSignup(true)}>
                Démarrer
              </button>
            </div>
            <div className="landing-pricing-card landing-pricing-card-popular">
              <div className="landing-pricing-popular">Recommandé</div>
              <h3 className="landing-pricing-name">Pro</h3>
              <p className="landing-pricing-desc">Pour les PME structurées</p>
              <ul className="landing-pricing-features">
                <li>✓ Employés et sites illimités</li>
                <li>✓ Pointage GPS + Photo</li>
                <li>✓ Congés avec workflow</li>
                <li>✓ Export Excel paie</li>
                <li>✓ Statistiques avancées</li>
              </ul>
              <button className="landing-btn landing-btn-primary landing-btn-block" onClick={() => setShowSignup(true)}>
                Choisir Pro
              </button>
            </div>
            <div className="landing-pricing-card">
              <h3 className="landing-pricing-name">Entreprise</h3>
              <p className="landing-pricing-desc">Pour les grandes organisations</p>
              <ul className="landing-pricing-features">
                <li>✓ Tout le plan Pro</li>
                <li>✓ Borne QR code dédiée</li>
                <li>✓ API personnalisée</li>
                <li>✓ Accompagnement dédié</li>
              </ul>
              <button className="landing-btn landing-btn-outline landing-btn-block" onClick={() => setShowSignup(true)}>
                Nous contacter
              </button>
            </div>
          </div>
          <p className="landing-pricing-note">
            Abonnement mensuel par employé. Pas d'engagement.
            <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(true); }}> Contactez-nous</a> pour plus d'informations.
          </p>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="landing-section landing-section-cta">
        <div className="landing-section-inner">
          <h2 className="landing-section-title" style={{ color: "#fff" }}>
            Prêt à simplifier vos RH ?
          </h2>
          <p className="landing-section-desc" style={{ color: "#9CA3AF" }}>
            Créez votre espace en quelques minutes.
          </p>
          <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => setShowSignup(true)}>
            Créer mon espace entreprise <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      {showSignup && !signupSent && (
        <div className="landing-modal">
          <div className="landing-modal-content">
            <button className="landing-modal-close" onClick={() => setShowSignup(false)}>✕</button>
            <h2>Créer mon espace Présencia</h2>
            <p>Notre équipe vous active sous 24h.</p>
            <form onSubmit={handleSignup}>
              <div className="landing-form-group">
                <label>Nom de l'entreprise *</label>
                <input type="text" required value={signupData.nom_entreprise}
                  onChange={e => setSignupData({...signupData, nom_entreprise: e.target.value})}
                  placeholder="SARL Congo Tech" className="landing-form-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="landing-form-group">
                  <label>Email *</label>
                  <input type="email" required value={signupData.email}
                    onChange={e => setSignupData({...signupData, email: e.target.value})}
                    placeholder="contact@entreprise.cg" className="landing-form-input" />
                </div>
              <div className="landing-form-group">
                <label>Téléphone *</label>
                <input type="tel" required value={signupData.telephone}
                  onChange={e => setSignupData({...signupData, telephone: e.target.value})}
                  placeholder="+242 06 000 0000" className="landing-form-input" />
              </div>
              </div>
              <div className="landing-form-group">
                <label>Ville</label>
                <input type="text" value={signupData.ville}
                  onChange={e => setSignupData({...signupData, ville: e.target.value})}
                  placeholder="Brazzaville" className="landing-form-input" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="landing-form-group">
                  <label>Pays</label>
                  <input type="text" value={signupData.pays}
                    onChange={e => setSignupData({...signupData, pays: e.target.value})}
                    placeholder="Congo" className="landing-form-input" />
                </div>
                <div className="landing-form-group">
                  <label>Plan souhaité</label>
                  <select value={signupData.plan_souhaite}
                    onChange={e => setSignupData({...signupData, plan_souhaite: e.target.value})}
                    className="landing-form-input">
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                </div>
              </div>
              <div className="landing-form-group">
                <label>Message (optionnel)</label>
                <textarea value={signupData.message}
                  onChange={e => setSignupData({...signupData, message: e.target.value})}
                  placeholder="Parlez-nous de vos besoins..." className="landing-form-input"
                  rows={3} style={{ resize: "vertical" }} />
              </div>
              <button type="submit" className="landing-btn landing-btn-primary landing-btn-block landing-btn-lg" style={{ marginTop: 8 }}>
                Envoyer la demande
              </button>
            </form>
          </div>
        </div>
      )}

      {signupSent && (
        <div className="landing-modal">
          <div className="landing-modal-content landing-modal-success">
            <div className="landing-success-icon">✅</div>
            <h2>Demande envoyée !</h2>
            <p>Merci ! Notre équipe vous contactera sous 24h.</p>
            <button className="landing-btn landing-btn-primary" onClick={() => { setShowSignup(false); setSignupSent(false); }}>
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <img src="/logo.png" alt="Présencia" style={{ height: 28, marginBottom: 12 }} />
          <p className="landing-footer-text">© 2026 Présencia — Plateforme RH intelligente.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
