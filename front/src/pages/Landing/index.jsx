import { useState } from "react";
import "./style.css";

function Landing() {
    const [showSignup, setShowSignup] = useState(false);
    const [signupData, setSignupData] = useState({ nom_entreprise: "", email: "", telephone: "", ville: "", message: "" });
    const [signupSent, setSignupSent] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/entreprises/inscription", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });
            if (res.ok) setSignupSent(true);
        } catch { /* handled */ }
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
                        <a href="#mobile" className="landing-nav-link">App mobile</a>
                        <a href="#pricing" className="landing-nav-link">Tarifs</a>
                        <a href="/login" className="landing-btn landing-btn-outline">Se connecter</a>
                        <button className="landing-btn landing-btn-primary" onClick={() => setShowSignup(true)}>
                            Créer mon espace
                        </button>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="landing-hero">
                <div className="landing-hero-bg" />
                <div className="landing-hero-content">
                    <div className="landing-hero-badge">Plateforme RH nouvelle génération</div>
                    <h1 className="landing-hero-title">
                        La meilleure façon de gérer<br />
                        <span className="landing-hero-highlight">vos équipes et leurs présences</span>
                    </h1>
                    <p className="landing-hero-subtitle">
                        Pointage GPS avec photo, congés, heures supplémentaires, statistiques — 
                        une solution complète pour les RH. Anti-triche intégré.
                    </p>
                    <div className="landing-hero-actions">
                        <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => setShowSignup(true)}>
                            Créer mon espace entreprise
                        </button>
                        <a href="#how" className="landing-btn landing-btn-outline landing-btn-lg">
                            Voir comment ça marche
                        </a>
                    </div>
                    <div className="landing-hero-clients">
                        <span className="landing-hero-clients-text">Utilisé par des entreprises au Congo et en Afrique</span>
                    </div>
                </div>
            </section>

            {/* ===== COMMENT ÇA MARCHE (4 étapes) ===== */}
            <section className="landing-section" id="how">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Comment ça fonctionne</h2>
                    <p className="landing-section-desc">
                        Déployez Présencia dans votre entreprise en quelques minutes.
                    </p>
                    <div className="landing-flow">
                        <div className="landing-flow-step">
                            <div className="landing-flow-nb">1</div>
                            <div className="landing-flow-icon">🏢</div>
                            <h3>Créez votre entreprise</h3>
                            <p>Configurez vos sites, départements, horaires et types de congés en quelques clics.</p>
                        </div>
                        <div className="landing-flow-arrow">→</div>
                        <div className="landing-flow-step">
                            <div className="landing-flow-nb">2</div>
                            <div className="landing-flow-icon">👥</div>
                            <h3>Ajoutez vos employés</h3>
                            <p>Importez votre équipe. Chacun reçoit ses identifiants par SMS ou email.</p>
                        </div>
                        <div className="landing-flow-arrow">→</div>
                        <div className="landing-flow-step">
                            <div className="landing-flow-nb">3</div>
                            <div className="landing-flow-icon">⏱️</div>
                            <h3>Suivez les présences</h3>
                            <p>Pointage GPS + photo. Les retards, absences et congés sont visibles en temps réel.</p>
                        </div>
                        <div className="landing-flow-arrow">→</div>
                        <div className="landing-flow-step">
                            <div className="landing-flow-nb">4</div>
                            <div className="landing-flow-icon">📊</div>
                            <h3>Analysez vos données</h3>
                            <p>Tableaux de bord, statistiques, export Excel pour la paie. Tout est tracé.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== DASHBOARD PREVIEW ===== */}
            <section className="landing-section landing-section-dark" id="features">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Un tableau de bord clair et puissant</h2>
                    <p className="landing-section-desc">
                        En un coup d'œil, vous savez exactement qui travaille, qui est en retard, qui est en congé.
                    </p>
                    <div className="landing-dashboard-preview">
                        <div className="landing-dashboard-grid">
                            <div className="landing-dashboard-card">
                                <div className="landing-dash-label">Total employés</div>
                                <div className="landing-dash-number">18</div>
                            </div>
                            <div className="landing-dashboard-card landing-dash-green">
                                <div className="landing-dash-label">Présents</div>
                                <div className="landing-dash-number">15</div>
                            </div>
                            <div className="landing-dashboard-card landing-dash-red">
                                <div className="landing-dash-label">Absents</div>
                                <div className="landing-dash-number">2</div>
                            </div>
                            <div className="landing-dashboard-card landing-dash-yellow">
                                <div className="landing-dash-label">Retards</div>
                                <div className="landing-dash-number">1</div>
                            </div>
                            <div className="landing-dashboard-card">
                                <div className="landing-dash-label">Taux présence</div>
                                <div className="landing-dash-number">94%</div>
                            </div>
                            <div className="landing-dashboard-card">
                                <div className="landing-dash-label">Congés en attente</div>
                                <div className="landing-dash-number">3</div>
                            </div>
                        </div>
                        <div className="landing-dashboard-list">
                            <div className="landing-dash-list-header">
                                <span>Employés présents aujourd'hui</span>
                                <span className="landing-dash-list-badge">15</span>
                            </div>
                            <div className="landing-dash-list-item">
                                <span className="landing-dash-dot" />
                                <span>Jean Kouassi</span>
                                <span className="landing-dash-time">08:02</span>
                            </div>
                            <div className="landing-dash-list-item">
                                <span className="landing-dash-dot" />
                                <span>Marie Ngoma</span>
                                <span className="landing-dash-time">07:58</span>
                            </div>
                            <div className="landing-dash-list-item">
                                <span className="landing-dash-dot landing-dash-dot-late" />
                                <span>Paul Dibakou</span>
                                <span className="landing-dash-time">08:32</span>
                            </div>
                            <div className="landing-dash-list-item">
                                <span className="landing-dash-dot" />
                                <span>Sarah Mbemba</span>
                                <span className="landing-dash-time">08:05</span>
                            </div>
                            <div className="landing-dash-list-item">
                                <span className="landing-dash-dot" />
                                <span>Christophe Mboungou</span>
                                <span className="landing-dash-time">07:55</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FONCTIONNALITÉS ===== */}
            <section className="landing-section">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Tout ce dont vous avez besoin</h2>
                    <p className="landing-section-desc">
                        Une plateforme complète pensée pour les RH africaines.
                    </p>
                    <div className="landing-features-grid">
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">📍</div>
                            <h3>Géofencing GPS</h3>
                            <p>Pointage impossible hors du périmètre du bureau. Anti-triche intégré.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">📸</div>
                            <h3>Photo selfie</h3>
                            <p>Photo prise en direct à chaque pointage. Pas de galerie, pas de fraude.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">🏖️</div>
                            <h3>Congés & absences</h3>
                            <p>Workflow complet : demande, approbation, suivi des soldes.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">⏰</div>
                            <h3>Heures sup</h3>
                            <p>Déclaration et validation avec calcul automatique des majorations.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">🏢</div>
                            <h3>Multi-sites</h3>
                            <p>Gérez plusieurs agences ou filiales depuis un seul compte.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">📥</div>
                            <h3>Export Excel</h3>
                            <p>Exportez les présences, congés et heures pour la paie en un clic.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== APPLICATION MOBILE ===== */}
            <section className="landing-section landing-section-dark" id="mobile">
                <div className="landing-section-inner">
                    <div className="landing-mobile">
                        <div className="landing-mobile-content">
                            <h2 className="landing-section-title" style={{ textAlign: "left" }}>
                                Application mobile
                            </h2>
                            <p className="landing-section-desc" style={{ textAlign: "left", marginLeft: 0 }}>
                                Vos employés pointent en quelques secondes depuis leur téléphone.
                            </p>
                            <div className="landing-mobile-features">
                                <div className="landing-mobile-feat">
                                    <span className="landing-mobile-feat-icon">⏱️</span>
                                    <div>
                                        <strong>Pointer l'arrivée</strong>
                                        <p>Un clic, GPS + photo, horodaté par le serveur</p>
                                    </div>
                                </div>
                                <div className="landing-mobile-feat">
                                    <span className="landing-mobile-feat-icon">🏁</span>
                                    <div>
                                        <strong>Pointer le départ</strong>
                                        <p>Validation automatique de la durée de travail</p>
                                    </div>
                                </div>
                                <div className="landing-mobile-feat">
                                    <span className="landing-mobile-feat-icon">📅</span>
                                    <div>
                                        <strong>Historique & congés</strong>
                                        <p>Consultez vos pointages, demandez des congés en un clic</p>
                                    </div>
                                </div>
                                <div className="landing-mobile-feat">
                                    <span className="landing-mobile-feat-icon">🛡️</span>
                                    <div>
                                        <strong>Anti-triche total</strong>
                                        <p>GPS, selfie, horodatage serveur — impossible de tricher</p>
                                    </div>
                                </div>
                            </div>
                            <div className="landing-mobile-cta">
                                <div className="landing-btn landing-btn-primary" onClick={() => setShowSignup(true)}>
                                    Créer mon espace entreprise
                                </div>
                            </div>
                        </div>
                        <div className="landing-mobile-phone">
                            <div className="landing-phone-frame">
                                <div className="landing-phone-notch" />
                                <div className="landing-phone-screen">
                                    <div className="landing-phone-header">
                                        <span className="landing-phone-time">08:02</span>
                                        <div className="landing-phone-icons">
                                            <span>📶</span><span>📶</span><span>🔋</span>
                                        </div>
                                    </div>
                                    <div className="landing-phone-greeting">
                                        <div className="landing-phone-greeting-text">
                                            <span>Bonjour Jean 👋</span>
                                            <small>Bureau Brazzaville</small>
                                        </div>
                                    </div>
                                    <div className="landing-phone-status">
                                        <div className="landing-phone-status-dot" />
                                        <span>Présent</span>
                                        <small>Arrivée 08:02</small>
                                    </div>
                                    <div className="landing-phone-btn-area">
                                        <div className="landing-phone-btn">
                                            <div className="landing-phone-btn-inner">
                                                <span className="landing-phone-btn-icon">⏱️</span>
                                                <span>Pointer le départ</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="landing-phone-tab-bar">
                                        <span>🏠</span><span>📅</span><span>🏖️</span><span>👤</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ANTI-TRICHE ===== */}
            <section className="landing-section">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Anti-triche : la fiabilité avant tout</h2>
                    <p className="landing-section-desc">
                        Nous avons pensé à toutes les tentatives de fraude pour garantir des données fiables.
                    </p>
                    <div className="landing-cheat-grid">
                        <div className="landing-cheat-card">
                            <div className="landing-cheat-icon">📍</div>
                            <h3>GPS obligatoire</h3>
                            <p>L'employé ne peut pointer que depuis le site. Bouton grisé s'il est hors zone.</p>
                        </div>
                        <div className="landing-cheat-card">
                            <div className="landing-cheat-icon">📸</div>
                            <h3>Photo en direct</h3>
                            <p>Appareil natif uniquement. Pas d'accès à la galerie, pas de vieille photo.</p>
                        </div>
                        <div className="landing-cheat-card">
                            <div className="landing-cheat-icon">🕐</div>
                            <h3>Heure serveur</h3>
                            <p>L'heure du téléphone ne compte pas. C'est le serveur Présencia qui horodate.</p>
                        </div>
                        <div className="landing-cheat-card">
                            <div className="landing-cheat-icon">👤</div>
                            <h3>Visage visible</h3>
                            <p>Le manager voit toutes les photos de pointage. Fraude détectable immédiatement.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TARIFS (sans prix) ===== */}
            <section className="landing-section landing-section-dark" id="pricing">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Un abonnement adapté à votre entreprise</h2>
                    <p className="landing-section-desc">
                        Du démarrage à la grande entreprise, nous avons une formule pour vous.
                    </p>
                    <div className="landing-pricing">
                        <div className="landing-pricing-card">
                            <div className="landing-pricing-header">
                                <h3 className="landing-pricing-name">Starter</h3>
                                <p className="landing-pricing-desc">Pour découvrir Présencia</p>
                            </div>
                            <ul className="landing-pricing-features">
                                <li>✓ Jusqu'à 10 employés</li>
                                <li>✓ Pointage mobile</li>
                                <li>✓ Congés</li>
                                <li>✓ 1 site</li>
                                <li className="disabled">✗ GPS / Photo</li>
                                <li className="disabled">✗ Export Excel</li>
                            </ul>
                            <button className="landing-btn landing-btn-outline landing-btn-block" onClick={() => setShowSignup(true)}>
                                Démarrer
                            </button>
                        </div>
                        <div className="landing-pricing-card landing-pricing-card-popular">
                            <div className="landing-pricing-popular">Recommandé</div>
                            <div className="landing-pricing-header">
                                <h3 className="landing-pricing-name">Pro</h3>
                                <p className="landing-pricing-desc">Pour les PME structurées</p>
                            </div>
                            <ul className="landing-pricing-features">
                                <li>✓ Employés et sites illimités</li>
                                <li>✓ Pointage GPS + Photo</li>
                                <li>✓ Congés avec workflow</li>
                                <li>✓ Export Excel paie</li>
                                <li>✓ Statistiques avancées</li>
                                <li>✓ Support prioritaire</li>
                            </ul>
                            <button className="landing-btn landing-btn-primary landing-btn-block" onClick={() => setShowSignup(true)}>
                                Choisir Pro
                            </button>
                        </div>
                        <div className="landing-pricing-card">
                            <div className="landing-pricing-header">
                                <h3 className="landing-pricing-name">Entreprise</h3>
                                <p className="landing-pricing-desc">Pour les grandes organisations</p>
                            </div>
                            <ul className="landing-pricing-features">
                                <li>✓ Tout le plan Pro</li>
                                <li>✓ Borne QR code dédiée</li>
                                <li>✓ API personnalisée</li>
                                <li>✓ SLA garanti</li>
                                <li>✓ Accompagnement dédié</li>
                                <li>✓ Déploiement sur mesure</li>
                            </ul>
                            <button className="landing-btn landing-btn-outline landing-btn-block" onClick={() => setShowSignup(true)}>
                                Nous contacter
                            </button>
                        </div>
                    </div>
                    <p className="landing-pricing-note">
                        Abonnement mensuel par employé. Pas d'engagement, résiliable à tout moment.
                        <a href="#contact" onClick={(e) => { e.preventDefault(); setShowSignup(true); }}> Contactez-nous</a> pour un devis personnalisé.
                    </p>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section className="landing-section landing-section-cta">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title" style={{ color: "#fff" }}>
                        Prêt à digitaliser vos RH ?
                    </h2>
                    <p className="landing-section-desc" style={{ color: "#9CA3AF" }}>
                        Créez votre espace entreprise en quelques minutes. Nos équipes vous accompagnent.
                    </p>
                    <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => setShowSignup(true)}>
                        Créer mon espace entreprise
                    </button>
                </div>
            </section>

            {/* ===== FORMULAIRE ===== */}
            {showSignup && !signupSent && (
                <div className="landing-modal">
                    <div className="landing-modal-content">
                        <button className="landing-modal-close" onClick={() => setShowSignup(false)}>✕</button>
                        <h2>Créer mon espace Présencia</h2>
                        <p>Remplissez ce formulaire. Notre équipe vous active sous 24h.</p>
                        <form onSubmit={handleSignup}>
                            <div className="landing-form-group">
                                <label>Nom de l'entreprise *</label>
                                <input type="text" required value={signupData.nom_entreprise}
                                    onChange={e => setSignupData({...signupData, nom_entreprise: e.target.value})}
                                    placeholder="SARL Congo Tech" className="landing-form-input" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div className="landing-form-group">
                                    <label>Email professionnel *</label>
                                    <input type="email" required value={signupData.email}
                                        onChange={e => setSignupData({...signupData, email: e.target.value})}
                                        placeholder="contact@entreprise.cg" className="landing-form-input" />
                                </div>
                                <div className="landing-form-group">
                                    <label>Téléphone</label>
                                    <input type="tel" value={signupData.telephone}
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
                            <div className="landing-form-group">
                                <label>Message (optionnel)</label>
                                <textarea value={signupData.message}
                                    onChange={e => setSignupData({...signupData, message: e.target.value})}
                                    placeholder="Nombre d'employés, besoins spécifiques..." className="landing-form-input landing-form-textarea" />
                            </div>
                            <button type="submit" className="landing-btn landing-btn-primary landing-btn-block landing-btn-lg">
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
                        <p>Merci ! Notre équipe vous contactera sous 24h à <strong>{signupData.email}</strong> pour activer votre espace Présencia.</p>
                        <button className="landing-btn landing-btn-primary" onClick={() => { setShowSignup(false); setSignupSent(false); }}>
                            Compris !
                        </button>
                    </div>
                </div>
            )}

            {/* ===== FOOTER ===== */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-logo" style={{ justifyContent: "center" }}>
                        <img src="/logo.png" alt="Présencia" className="landing-logo-img" style={{ height: 28 }} />
                        <span className="landing-logo-text" style={{ fontSize: 18 }}>Présencia</span>
                    </div>
                    <p className="landing-footer-text">
                        © 2026 Présencia — Plateforme RH intelligente pour les entreprises africaines.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
