// ================================================================
// Page Configuration - Paramètres premium de l'entreprise
// ================================================================
// Sections : Informations entreprise, Logo/Branding, Horaires,
// Jours ouvrables, Règles de pointage, Politique de congés,
// Notifications, Sécurité, Thème
// ================================================================

import { useState, useEffect } from "react";
import parametresService from "../../services/parametresService";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Building2, Clock, Palette, Shield, Bell, Calendar,
  Mail, Phone, MapPin, Save, CheckCircle2, AlertCircle,
  Globe, Settings2, Timer, Coffee,
  UserCheck, Briefcase, ChevronDown, ChevronUp
} from "lucide-react";
import "./style.css";

// Jours de la semaine
const JOURS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

function Configuration() {
  const { currentTheme, themes, changeTheme } = useTheme();

  // Sections dépliables
  const [sections, setSections] = useState({
    entreprise: true,
    horaires: false,
    jours: false,
    regles: false,
    conges: false,
    notifications: false,
    securite: false,
    theme: false,
  });

  // État des paramètres
  const [settings, setSettings] = useState({
    // Entreprise
    nom_entreprise: "",
    slogan: "",
    description: "",
    email_entreprise: "",
    telephone: "",
    adresse: "",
    site_web: "",
    logo_url: "",
    
    // Horaires
    heure_ouverture: "08:00",
    heure_fermeture: "17:00",
    duree_pause: 60,
    pause_debut: "12:00",
    
    // Jours ouvrables
    jours_ouvrables: ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
    
    // Règles de pointage
    retard_apres: 15,
    depart_anticipe: 15,
    tolerance_retard: 5,
    auto_checkout: false,
    heure_auto_checkout: "19:00",
    geo_restriction: false,
    limite_pointage: false,
    heure_limite_pointage: "09:00",
    
    // Congés
    conges_annuel_default: 30,
    conges_maladie_annee: 90,
    jours_max_consecutifs: 15,
    delai_demande_jours: 2,
    
    // Notifications
    notif_pointage: true,
    notif_retard: true,
    notif_absence: true,
    notif_conge_demande: true,
    notif_conge_valide: true,
    notif_rapport_hebdo: false,
    
    // Sécurité
    ip_restriction: false,
    ip_autorisees: "",
    double_auth: false,
    session_timeout: 60,
    
    // Thème
    theme: "bleu",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    loadParametres();
  }, []);

  const loadParametres = async () => {
    setIsLoading(true);
    try {
      const result = await parametresService.get();
      if (result.data) {
        setSettings(prev => ({
          ...prev,
          nom_entreprise: result.data.nom_entreprise || "",
          slogan: result.data.slogan || "",
          description: result.data.description || "",
          email_entreprise: result.data.email_entreprise || "",
          telephone: result.data.telephone || "",
          adresse: result.data.adresse || "",
          site_web: result.data.site_web || "",
          logo_url: result.data.logo_url || "",
          heure_ouverture: result.data.heure_ouverture?.slice(0, 5) || "08:00",
          heure_fermeture: result.data.heure_fermeture?.slice(0, 5) || "17:00",
          duree_pause: result.data.duree_pause || 60,
          pause_debut: result.data.pause_debut?.slice(0, 5) || "12:00",
          jours_ouvrables: result.data.jours_ouvrables || ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
          retard_apres: result.data.retard_apres ?? 15,
          depart_anticipe: result.data.depart_anticipe ?? 15,
          tolerance_retard: result.data.tolerance_retard ?? 5,
          auto_checkout: result.data.auto_checkout ?? false,
          heure_auto_checkout: result.data.heure_auto_checkout?.slice(0, 5) || "19:00",
          geo_restriction: result.data.geo_restriction ?? false,
          limite_pointage: result.data.limite_pointage ?? false,
          heure_limite_pointage: result.data.heure_limite_pointage?.slice(0, 5) || "09:00",
          conges_annuel_default: result.data.conges_annuel_default ?? 30,
          conges_maladie_annee: result.data.conges_maladie_annee ?? 90,
          jours_max_consecutifs: result.data.jours_max_consecutifs ?? 15,
          delai_demande_jours: result.data.delai_demande_jours ?? 2,
          notif_pointage: result.data.notif_pointage ?? true,
          notif_retard: result.data.notif_retard ?? true,
          notif_absence: result.data.notif_absence ?? true,
          notif_conge_demande: result.data.notif_conge_demande ?? true,
          notif_conge_valide: result.data.notif_conge_valide ?? true,
          notif_rapport_hebdo: result.data.notif_rapport_hebdo ?? false,
          ip_restriction: result.data.ip_restriction ?? false,
          ip_autorisees: result.data.ip_autorisees || "",
          double_auth: result.data.double_auth ?? false,
          session_timeout: result.data.session_timeout ?? 60,
          theme: result.data.theme || "bleu",
        }));
      }
    } catch (err) {
      console.error("Erreur chargement paramètres:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleJour = (key) => {
    setSettings(prev => {
      const jours = [...prev.jours_ouvrables];
      if (jours.includes(key)) {
        if (jours.length > 1) {
          return { ...prev, jours_ouvrables: jours.filter(j => j !== key) };
        }
        return prev;
      }
      return { ...prev, jours_ouvrables: [...jours, key] };
    });
  };

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await parametresService.save(settings);
      setMessage("✅ Paramètres sauvegardés avec succès !");
      setMessageType("success");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setMessage("❌ Erreur : " + (err.message || "Impossible de sauvegarder"));
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <span className="loading-spinner-text">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="config-page">
      <h1 className="page-title">Configuration</h1>
      <p className="page-description">
        Personnalisez tous les paramètres de votre entreprise — branding, horaires, règles et sécurité
      </p>

      {message && (
        <div className={`config-alert config-alert-${messageType}`}>
          {messageType === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* ===== SECTION 1: INFORMATIONS ENTREPRISE ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("entreprise")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Building2 size={20} /></div>
              <div>
                <h3 className="config-section-title">Informations entreprise</h3>
                <p className="config-section-desc">Nom, logo, coordonnées et branding</p>
              </div>
            </div>
            {sections.entreprise ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.entreprise && (
            <div className="config-section-body">
              {/* Logo */}
              <div className="config-row">
                <div className="config-row-label">
                  <strong>Logo de l'entreprise</strong>
                  <p className="config-row-desc">Image carrée recommandée (200x200px). Sélectionnez un fichier sur votre appareil.</p>
                </div>
                <div className="config-logo-area">
                  <div className="config-logo-preview">
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <Building2 size={32} />
                    )}
                  </div>
                  <div className="config-logo-input-group">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 1.5 * 1024 * 1024) {
                          alert("Image trop volumineuse. Maximum 1,5 Mo.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setSettings(prev => ({ ...prev, logo_url: ev.target?.result || "" }));
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="config-input-file"
                    />
                  </div>
                  {settings.logo_url && settings.logo_url.startsWith('data:') && (
                    <button type="button" className="config-btn-remove"
                      onClick={() => setSettings(prev => ({ ...prev, logo_url: "" }))}>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              <div className="config-row">
                <div className="config-row-label">
                  <strong>Nom de l'entreprise</strong>
                  <p className="config-row-desc">Nom affiché dans toute l'application</p>
                </div>
                <input type="text" name="nom_entreprise" className="config-input"
                  value={settings.nom_entreprise} onChange={handleChange}
                  placeholder="Présencia SARL" />
              </div>

              <div className="config-row">
                <div className="config-row-label">
                  <strong>Slogan</strong>
                  <p className="config-row-desc">Phrase d'accroche de votre entreprise</p>
                </div>
                <input type="text" name="slogan" className="config-input"
                  value={settings.slogan || ""} onChange={handleChange}
                  placeholder="La gestion RH intelligente" />
              </div>

              <div className="config-row">
                <div className="config-row-label">
                  <strong>Description</strong>
                  <p className="config-row-desc">Brève présentation de l'entreprise</p>
                </div>
                <textarea name="description" className="config-input config-textarea"
                  value={settings.description || ""} onChange={handleChange}
                  placeholder="Présencia est une solution de gestion des présences et RH..." rows={3} />
              </div>

              <div className="config-row-group">
                <div className="config-row">
                  <div className="config-row-label">
                    <strong><Mail size={14} /> Email</strong>
                  </div>
                  <input type="email" name="email_entreprise" className="config-input"
                    value={settings.email_entreprise} onChange={handleChange}
                    placeholder="contact@entreprise.com" />
                </div>
                <div className="config-row">
                  <div className="config-row-label">
                    <strong><Phone size={14} /> Téléphone</strong>
                  </div>
                  <input type="text" name="telephone" className="config-input"
                    value={settings.telephone} onChange={handleChange}
                    placeholder="+225 01 02 03 04 05" />
                </div>
              </div>

              <div className="config-row-group">
                <div className="config-row">
                  <div className="config-row-label">
                    <strong><MapPin size={14} /> Adresse</strong>
                  </div>
                  <input type="text" name="adresse" className="config-input"
                    value={settings.adresse} onChange={handleChange}
                    placeholder="Abidjan, Cocody" />
                </div>
                <div className="config-row">
                  <div className="config-row-label">
                    <strong><Globe size={14} /> Site web</strong>
                  </div>
                  <input type="url" name="site_web" className="config-input"
                    value={settings.site_web || ""} onChange={handleChange}
                    placeholder="https://www.presencia.ci" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION 2: HORAIRES ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("horaires")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Clock size={20} /></div>
              <div>
                <h3 className="config-section-title">Horaires de travail</h3>
                <p className="config-section-desc">Plages horaires et pauses</p>
              </div>
            </div>
            {sections.horaires ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.horaires && (
            <div className="config-section-body">
              <div className="config-row-group">
                <div className="config-row">
                  <div className="config-row-label">
                    <strong>Heure d'ouverture</strong>
                    <p className="config-row-desc">Début de la journée de travail</p>
                  </div>
                  <input type="time" name="heure_ouverture" className="config-input config-input-time"
                    value={settings.heure_ouverture} onChange={handleChange} />
                </div>
                <div className="config-row">
                  <div className="config-row-label">
                    <strong>Heure de fermeture</strong>
                    <p className="config-row-desc">Fin de la journée de travail</p>
                  </div>
                  <input type="time" name="heure_fermeture" className="config-input config-input-time"
                    value={settings.heure_fermeture} onChange={handleChange} />
                </div>
              </div>
              <div className="config-row">
                <div className="config-row-label">
                  <strong><Coffee size={14} /> Durée de pause</strong>
                  <p className="config-row-desc">Temps de pause déjeuner en minutes</p>
                </div>
                <div className="config-input-with-icon">
                  <input type="number" name="duree_pause" className="config-input config-input-number"
                    value={settings.duree_pause} onChange={handleChange} min="0" max="180" />
                  <span className="config-input-suffix">minutes</span>
                </div>
              </div>
              <div className="config-row">
                <div className="config-row-label">
                  <strong><Coffee size={14} /> Début de la pause</strong>
                  <p className="config-row-desc">À quelle heure commence la pause déjeuner</p>
                </div>
                <div className="config-input-with-icon">
                  <input type="time" name="pause_debut" className="config-input config-input-time"
                    value={settings.pause_debut} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION 3: JOURS OUVRABLES ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("jours")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Calendar size={20} /></div>
              <div>
                <h3 className="config-section-title">Jours ouvrables</h3>
                <p className="config-section-desc">Sélectionnez les jours travaillés</p>
              </div>
            </div>
            {sections.jours ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.jours && (
            <div className="config-section-body">
              <p className="config-row-desc" style={{ marginBottom: 12 }}>
                Choisissez les jours de la semaine où l'entreprise est ouverte
              </p>
              <div className="config-jours-grid">
                {JOURS.map(jour => {
                  const isActive = settings.jours_ouvrables.includes(jour.key);
                  return (
                    <button
                      key={jour.key}
                      type="button"
                      className={`config-jour-btn ${isActive ? "active" : ""}`}
                      onClick={() => toggleJour(jour.key)}
                    >
                      <span className="config-jour-indicator" />
                      {jour.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION 4: RÈGLES DE POINTAGE ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("regles")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Settings2 size={20} /></div>
              <div>
                <h3 className="config-section-title">Règles de pointage</h3>
                <p className="config-section-desc">Tolérances, restrictions et automatismes</p>
              </div>
            </div>
            {sections.regles ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.regles && (
            <div className="config-section-body">
              <div className="config-row-group">
                <div className="config-row">
                  <div className="config-row-label">
                    <strong><Timer size={14} /> Seuil de retard</strong>
                    <p className="config-row-desc">Minutes après l'ouverture = retard</p>
                  </div>
                  <div className="config-input-with-icon">
                    <input type="number" name="retard_apres" className="config-input config-input-number"
                      value={settings.retard_apres} onChange={handleChange} min="0" max="120" />
                    <span className="config-input-suffix">min</span>
                  </div>
                </div>
                <div className="config-row">
                  <div className="config-row-label">
                    <strong><Timer size={14} /> Départ anticipé</strong>
                    <p className="config-row-desc">Minutes avant fermeture = départ anticipé</p>
                  </div>
                  <div className="config-input-with-icon">
                    <input type="number" name="depart_anticipe" className="config-input config-input-number"
                      value={settings.depart_anticipe} onChange={handleChange} min="0" max="120" />
                    <span className="config-input-suffix">min</span>
                  </div>
                </div>
              </div>
              <div className="config-row">
                <div className="config-row-label">
                  <strong><UserCheck size={14} /> Tolérance de retard</strong>
                  <p className="config-row-desc">Retard non pénalisé (minutes de grâce)</p>
                </div>
                <div className="config-input-with-icon">
                  <input type="number" name="tolerance_retard" className="config-input config-input-number"
                    value={settings.tolerance_retard} onChange={handleChange} min="0" max="30" />
                  <span className="config-input-suffix">min</span>
                </div>
              </div>
              <div className="config-row">
                <div className="config-row-label">
                  <strong>Check-out automatique</strong>
                  <p className="config-row-desc">Fermeture automatique des pointages à une heure définie</p>
                </div>
                <div className="config-row-right">
                  <label className="config-toggle">
                    <input type="checkbox" name="auto_checkout" checked={settings.auto_checkout} onChange={handleChange} />
                    <span className="config-toggle-slider" />
                  </label>
                  {settings.auto_checkout && (
                    <input type="time" name="heure_auto_checkout" className="config-input config-input-time"
                      value={settings.heure_auto_checkout} onChange={handleChange} style={{ marginLeft: 8 }} />
                  )}
                </div>
              </div>
              <div className="config-row">
                <div className="config-row-label">
                  <strong><MapPin size={14} /> Restriction géographique</strong>
                  <p className="config-row-desc">Pointage autorisé uniquement depuis le lieu de travail</p>
                </div>
                <label className="config-toggle">
                  <input type="checkbox" name="geo_restriction" checked={settings.geo_restriction} onChange={handleChange} />
                  <span className="config-toggle-slider" />
                </label>
              </div>
              <div className="config-row">
                <div className="config-row-label">
                  <strong><Timer size={14} /> Heure limite de pointage</strong>
                  <p className="config-row-desc">Bloquer le pointage après cette heure (ex: arrivée très tardive)</p>
                </div>
                <div className="config-row-right">
                  <label className="config-toggle">
                    <input type="checkbox" name="limite_pointage" checked={settings.limite_pointage} onChange={handleChange} />
                    <span className="config-toggle-slider" />
                  </label>
                  {settings.limite_pointage && (
                    <input type="time" name="heure_limite_pointage" className="config-input config-input-time"
                      value={settings.heure_limite_pointage} onChange={handleChange} style={{ marginLeft: 8 }} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION 5: POLITIQUE DE CONGÉS ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("conges")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Briefcase size={20} /></div>
              <div>
                <h3 className="config-section-title">Politique de congés</h3>
                <p className="config-section-desc">Règles et quotas par défaut</p>
              </div>
            </div>
            {sections.conges ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.conges && (
            <div className="config-section-body">
              <div className="config-row-group">
                <div className="config-row">
                  <div className="config-row-label">
                    <strong>Congés annuels par défaut</strong>
                    <p className="config-row-desc">Nombre de jours de congés annuels pour un employé</p>
                  </div>
                  <div className="config-input-with-icon">
                    <input type="number" name="conges_annuel_default" className="config-input config-input-number"
                      value={settings.conges_annuel_default} onChange={handleChange} min="0" max="60" />
                    <span className="config-input-suffix">jours</span>
                  </div>
                </div>
                <div className="config-row">
                  <div className="config-row-label">
                    <strong>Congés maladie par an</strong>
                    <p className="config-row-desc">Nombre maximum de jours de congés maladie par an</p>
                  </div>
                  <div className="config-input-with-icon">
                    <input type="number" name="conges_maladie_annee" className="config-input config-input-number"
                      value={settings.conges_maladie_annee} onChange={handleChange} min="0" max="365" />
                    <span className="config-input-suffix">jours</span>
                  </div>
                </div>
              </div>
              <div className="config-row-group">
                <div className="config-row">
                  <div className="config-row-label">
                    <strong>Jours max consécutifs</strong>
                    <p className="config-row-desc">Nombre maximum de jours de congés consécutifs autorisé</p>
                  </div>
                  <div className="config-input-with-icon">
                    <input type="number" name="jours_max_consecutifs" className="config-input config-input-number"
                      value={settings.jours_max_consecutifs} onChange={handleChange} min="1" max="90" />
                    <span className="config-input-suffix">jours</span>
                  </div>
                </div>
                <div className="config-row">
                  <div className="config-row-label">
                    <strong>Délai de demande</strong>
                    <p className="config-row-desc">Délai minimum avant la date de début (en jours ouvrés)</p>
                  </div>
                  <div className="config-input-with-icon">
                    <input type="number" name="delai_demande_jours" className="config-input config-input-number"
                      value={settings.delai_demande_jours} onChange={handleChange} min="0" max="30" />
                    <span className="config-input-suffix">jours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION 6: NOTIFICATIONS ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("notifications")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Bell size={20} /></div>
              <div>
                <h3 className="config-section-title">Notifications</h3>
                <p className="config-section-desc">Alertes et notifications automatiques</p>
              </div>
            </div>
            {sections.notifications ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.notifications && (
            <div className="config-section-body">
              {[
                { key: "notif_pointage", label: "Pointage effectué", desc: "Notification lorsqu'un employé pointe" },
                { key: "notif_retard", label: "Alerte retard", desc: "Notification en cas de retard" },
                { key: "notif_absence", label: "Alerte absence", desc: "Notification en cas d'absence non justifiée" },
                { key: "notif_conge_demande", label: "Demande de congé", desc: "Notification lors d'une nouvelle demande" },
                { key: "notif_conge_valide", label: "Congé validé/refusé", desc: "Notification de la décision sur un congé" },
                { key: "notif_rapport_hebdo", label: "Rapport hebdomadaire", desc: "Récapitulatif de la semaine par email" },
              ].map(notif => (
                <div key={notif.key} className="config-row">
                  <div className="config-row-label">
                    <strong>{notif.label}</strong>
                    <p className="config-row-desc">{notif.desc}</p>
                  </div>
                  <label className="config-toggle">
                    <input type="checkbox" name={notif.key}
                      checked={settings[notif.key]} onChange={handleChange} />
                    <span className="config-toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== SECTION 7: SÉCURITÉ ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("securite")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Shield size={20} /></div>
              <div>
                <h3 className="config-section-title">Sécurité</h3>
                <p className="config-section-desc">Contrôle d'accès et restrictions</p>
              </div>
            </div>
            {sections.securite ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.securite && (
            <div className="config-section-body">
              <div className="config-row">
                <div className="config-row-label">
                  <strong>Restriction par IP</strong>
                  <p className="config-row-desc">Limiter l'accès à certaines adresses IP</p>
                </div>
                <label className="config-toggle">
                  <input type="checkbox" name="ip_restriction" checked={settings.ip_restriction} onChange={handleChange} />
                  <span className="config-toggle-slider" />
                </label>
              </div>
              {settings.ip_restriction && (
                <div className="config-row">
                  <div className="config-row-label">
                    <strong>IPs autorisées</strong>
                    <p className="config-row-desc">Une adresse IP par ligne</p>
                  </div>
                  <textarea name="ip_autorisees" className="config-input config-textarea"
                    value={settings.ip_autorisees} onChange={handleChange}
                    placeholder="192.168.1.1&#10;10.0.0.1" rows={3} />
                </div>
              )}
              <div className="config-row">
                <div className="config-row-label">
                  <strong>Authentification à deux facteurs</strong>
                  <p className="config-row-desc">Renforcer la sécurité des comptes</p>
                </div>
                <label className="config-toggle">
                  <input type="checkbox" name="double_auth" checked={settings.double_auth} onChange={handleChange} />
                  <span className="config-toggle-slider" />
                </label>
              </div>
              <div className="config-row">
                <div className="config-row-label">
                  <strong>Expiration de session</strong>
                  <p className="config-row-desc">Déconnexion automatique après inactivité</p>
                </div>
                <div className="config-input-with-icon">
                  <input type="number" name="session_timeout" className="config-input config-input-number"
                    value={settings.session_timeout} onChange={handleChange} min="5" max="480" />
                  <span className="config-input-suffix">minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION 8: THÈME ===== */}
        <div className="config-premium-section">
          <button type="button" className="config-section-header" onClick={() => toggleSection("theme")}>
            <div className="config-section-header-left">
              <div className="config-section-icon"><Palette size={20} /></div>
              <div>
                <h3 className="config-section-title">Thème</h3>
                <p className="config-section-desc">Personnalisez l'apparence de l'interface</p>
              </div>
            </div>
            {sections.theme ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sections.theme && (
            <div className="config-section-body">
              <p className="config-row-desc" style={{ marginBottom: 16 }}>
                Choisissez la couleur principale de l'interface
              </p>
              <div className="config-themes-grid">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    type="button"
                    className={`config-theme-btn ${currentTheme === key ? "active" : ""}`}
                    onClick={() => {
                      changeTheme(key);
                      setSettings(prev => ({ ...prev, theme: key }));
                    }}
                  >
                    <div className="config-theme-color"
                      style={{ background: theme.colors["--color-primary"] }} />
                    <div className="config-theme-name">
                      {theme.name}
                      {currentTheme === key && " ✓"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bouton sauvegarder */}
        <div className="config-save-bar">
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSaving}>
            <Save size={18} />
            {isSaving ? "Sauvegarde en cours..." : "Sauvegarder tous les paramètres"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Configuration;
