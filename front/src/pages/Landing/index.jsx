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
            {/* ===== NAVBAR LANDING ===== */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <div className="landing-logo">
                        <span className="landing-logo-icon">P</span>
                        <span className="landing-logo-text">résencia</span>
                    </div>
                    <div className="landing-nav-links">
                        <a href="#features" className="landing-nav-link">Fonctionnalités</a>
                        <a href="#pricing" className="landing-nav-link">Tarifs</a>
                        <a href="#how" className="landing-nav-link">Comment ça marche</a>
                        <a href="/login" className="landing-btn landing-btn-outline">Se connecter</a>
                        <button className="landing-btn landing-btn-primary" onClick={() => setShowSignup(true)}>
                            Demander un accès
                        </button>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="landing-hero">
                <div className="landing-hero-bg" />
                <div className="landing-hero-content">
                    <h1 className="landing-hero-title">
                        Gérez vos <span className="landing-hero-highlight">présences</span> sans triche possible
                    </h1>
                    <p className="landing-hero-subtitle">
                        Pointage GPS + photo, congés, heures sup, statistiques — une plateforme complète pour les RH au Congo et en Afrique.
                    </p>
                    <div className="landing-hero-actions">
                        <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => setShowSignup(true)}>
                            🚀 Créer mon espace entreprise
                        </button>
                        <a href="#how" className="landing-btn landing-btn-outline landing-btn-lg">
                            ▶ Voir comment ça marche
                        </a>
                    </div>
                    <div className="landing-hero-stats">
                        <div className="landing-hero-stat">
                            <span className="landing-hero-stat-nb">0</span>
                            <span className="landing-hero-stat-label">Entreprises</span>
                        </div>
                        <div className="landing-hero-stat">
                            <span className="landing-hero-stat-nb">0</span>
                            <span className="landing-hero-stat-label">Employés</span>
                        </div>
                        <div className="landing-hero-stat">
                            <span className="landing-hero-stat-nb">0</span>
                            <span className="landing-hero-stat-label">Pointages</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ANTI-TRICHE ===== */}
            <section className="landing-section" id="features">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Anti-triche : la fiabilité avant tout</h2>
                    <p className="landing-section-desc">
                        Fini les pointages depuis la maison, les photos truquées et les heures falsifiées.
                    </p>
                    <div className="landing-features-grid">
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">📍</div>
                            <h3>Géofencing GPS</h3>
                            <p>L'employé ne peut pointer que s'il est à moins de 100 mètres du bureau.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">📸</div>
                            <h3>Photo selfie obligatoire</h3>
                            <p>Photo prise en direct à chaque pointage. Pas de galerie, pas de vieille photo.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">🕐</div>
                            <h3>Horodatage serveur</h3>
                            <p>L'heure du téléphone ne compte pas. C'est le serveur Présencia qui valide.</p>
                        </div>
                        <div className="landing-feature-card">
                            <div className="landing-feature-icon">👤</div>
                            <h3>Détection de fraude</h3>
                            <p>Le manager voit les photos de pointage. Si c'est un autre visage, il le voit tout de suite.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FONCTIONNALITÉS ===== */}
            <section className="landing-section landing-section-dark">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Tout ce dont votre entreprise a besoin</h2>
                    <p className="landing-section-desc">Une plateforme complète pour gérer vos RH au quotidien.</p>
                    <div className="landing-features-grid landing-features-grid-wide">
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">⏱️</div>
                            <h3>Pointage mobile</h3>
                            <p>Arrivée et départ en un clic depuis l'application mobile. Avec GPS et photo.</p>
                        </div>
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">🏖️</div>
                            <h3>Congés intelligents</h3>
                            <p>Demande, approbation, suivi des soldes. Plus de papier ni de WhatsApp.</p>
                        </div>
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">⏰</div>
                            <h3>Heures sup</h3>
                            <p>Déclaration et validation avec workflow.</p>
                        </div>
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">📊</div>
                            <h3>Statistiques</h3>
                            <p>Tableaux de bord, taux de présence, ponctualité.</p>
                        </div>
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">📱</div>
                            <h3>App mobile + Web</h3>
                            <p>Accessible depuis le téléphone et l'ordinateur.</p>
                        </div>
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">📥</div>
                            <h3>Export Excel</h3>
                            <p>Exportez les présences, congés et heures pour la paie.</p>
                        </div>
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">🏢</div>
                            <h3>Multi-sites</h3>
                            <p>Gérez plusieurs agences, bureaux ou filiales.</p>
                        </div>
                        <div className="landing-feature-card landing-feature-card-dark">
                            <div className="landing-feature-icon">🔍</div>
                            <h3>Journal d'audit</h3>
                            <p>Toutes les actions sont tracées. Transparence totale.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== COMMENT ÇA MARCHE ===== */}
            <section className="landing-section" id="how">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Comment ça marche ?</h2>
                    <p className="landing-section-desc">3 étapes simples pour digitaliser vos RH.</p>
                    <div className="landing-steps">
                        <div className="landing-step">
                            <div className="landing-step-nb">1</div>
                            <h3>Créez votre espace</h3>
                            <p>Remplissez le formulaire. Nous activons votre compte sous 24h.</p>
                        </div>
                        <div className="landing-step-arrow">→</div>
                        <div className="landing-step">
                            <div className="landing-step-nb">2</div>
                            <h3>Configurez</h3>
                            <p>Ajoutez vos sites, vos horaires, vos employés. Chaque employé reçoit ses identifiants.</p>
                        </div>
                        <div className="landing-step-arrow">→</div>
                        <div className="landing-step">
                            <div className="landing-step-nb">3</div>
                            <h3>Suivez en direct</h3>
                            <p>Les employés pointent, les managers valident, les RH exportent.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TARIFS ===== */}
            <section className="landing-section landing-section-dark" id="pricing">
                <div className="landing-section-inner">
                    <h2 className="landing-section-title">Des prix pour toutes les entreprises</h2>
                    <p className="landing-section-desc">Du gratuit pour démarrer au premium pour les grandes structures.</p>
                    <div className="landing-pricing">
                        <div className="landing-pricing-card">
                            <h3 className="landing-pricing-name">Gratuit</h3>
                            <div className="landing-pricing-price">0 FCFA</div>
                            <p className="landing-pricing-desc">Pour découvrir Présencia</p>
                            <ul className="landing-pricing-features">
                                <li>✓ Jusqu'à 3 employés</li>
                                <li>✓ Pointage simple</li>
                                <li>✓ Congés basiques</li>
                                <li>✓ 1 site</li>
                                <li className="disabled">✗ GPS / Photo</li>
                                <li className="disabled">✗ Export Excel</li>
                            </ul>
                            <button className="landing-btn landing-btn-outline landing-btn-block" onClick={() => setShowSignup(true)}>
                                Commencer
                            </button>
                        </div>
                        <div className="landing-pricing-card landing-pricing-card-popular">
                            <div className="landing-pricing-popular">Populaire</div>
                            <h3 className="landing-pricing-name">Pro</h3>
                            <div className="landing-pricing-price">2 000 FCFA <span>/employé/mois</span></div>
                            <p className="landing-pricing-desc">Pour les PME</p>
                            <ul className="landing-pricing-features">
                                <li>✓ Jusqu'à 50 employés</li>
                                <li>✓ Pointage GPS + Photo</li>
                                <li>✓ Congés avec workflow</li>
                                <li>✓ Multi-sites</li>
                                <li>✓ Export Excel paie</li>
                                <li>✓ Statistiques</li>
                                <li className="disabled">✗ Borne QR code</li>
                            </ul>
                            <button className="landing-btn landing-btn-primary landing-btn-block" onClick={() => setShowSignup(true)}>
                                Choisir Pro
                            </button>
                        </div>
                        <div className="landing-pricing-card">
                            <h3 className="landing-pricing-name">Entreprise</h3>
                            <div className="landing-pricing-price">5 000 FCFA <span>/employé/mois</span></div>
                            <p className="landing-pricing-desc">Pour les grandes entreprises</p>
                            <ul className="landing-pricing-features">
                                <li>✓ Employés illimités</li>
                                <li>✓ Tout le plan Pro</li>
                                <li>✓ Borne QR code</li>
                                <li>✓ Support prioritaire</li>
                                <li>✓ API dédiée</li>
                                <li>✓ SLA garanti</li>
                            </ul>
                            <button className="landing-btn landing-btn-outline landing-btn-block" onClick={() => setShowSignup(true)}>
                                Nous contacter
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FORMULAIRE D'INSCRIPTION ===== */}
            {showSignup && !signupSent && (
                <div className="landing-modal">
                    <div className="landing-modal-content">
                        <button className="landing-modal-close" onClick={() => setShowSignup(false)}>✕</button>
                        <h2>Demander un accès Présencia</h2>
                        <p>Remplissez ce formulaire. Notre équipe vous contactera sous 24h pour activer votre espace.</p>
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
                                    placeholder="Parlez-nous de votre entreprise, du nombre d'employés..." className="landing-form-input landing-form-textarea" />
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
                        <p>Merci ! Notre équipe Présencia vous contactera sous 24h à l'adresse <strong>{signupData.email}</strong> pour activer votre espace entreprise.</p>
                        <button className="landing-btn landing-btn-primary" onClick={() => { setShowSignup(false); setSignupSent(false); }}>
                            Compris !
                        </button>
                    </div>
                </div>
            )}

            {/* ===== FOOTER ===== */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-footer-brand">
                        <span className="landing-logo-icon">P</span>
                        <span className="landing-logo-text">résencia</span>
                    </div>
                    <p className="landing-footer-text">
                        © 2026 Présencia — Gestion RH Intelligente pour les entreprises africaines.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
