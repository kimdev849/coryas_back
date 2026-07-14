// ================================================================
// Page Configuration - Paramètres de l'application
// ================================================================
// Connectée à la table `parametres` dans Supabase.
// Les données sont chargées au démarrage et sauvegardées via l'API.
// ================================================================

import { useState, useEffect } from "react";
import parametresService from "../../services/parametresService";
import { useTheme } from "../../contexts/ThemeContext";
import "./style.css";

function Configuration() {
  const { currentTheme, themes, changeTheme } = useTheme();

  // État des paramètres (correspond aux colonnes de la table parametres)
  const [settings, setSettings] = useState({
    nom_entreprise: "",
    heure_ouverture: "08:00",
    heure_fermeture: "17:00",
    retard_apres: 0,       // Minutes après l'heure d'ouverture considéré comme retard
    depart_anticipe: 0,    // Minutes avant l'heure de fermeture considéré comme départ anticipé
    duree_pause: 0,        // Durée de la pause en minutes
    email_entreprise: "",
    telephone: "",
    adresse: "",
    theme: "coryas",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Charge les paramètres depuis Supabase au démarrage
  useEffect(() => {
    loadParametres();
  }, []);

  const loadParametres = async () => {
    setIsLoading(true);
    try {
      const result = await parametresService.get();
      if (result.data) {
        setSettings({
          nom_entreprise: result.data.nom_entreprise || "",
          heure_ouverture: result.data.heure_ouverture
            ? result.data.heure_ouverture.slice(0, 5) : "08:00",
          heure_fermeture: result.data.heure_fermeture
            ? result.data.heure_fermeture.slice(0, 5) : "17:00",
          retard_apres: result.data.retard_apres || 0,
          depart_anticipe: result.data.depart_anticipe || 0,
          duree_pause: result.data.duree_pause || 0,
          email_entreprise: result.data.email_entreprise || "",
          telephone: result.data.telephone || "",
          adresse: result.data.adresse || "",
          theme: result.data.theme || "coryas",
        });
      }
    } catch (err) {
      console.error("Erreur chargement paramètres:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Met à jour un champ du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Sauvegarde les paramètres dans Supabase
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await parametresService.save(settings);
      setMessage("Paramètres sauvegardés avec succès !");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Erreur : " + (err.message || "Impossible de sauvegarder"));
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
    <div>
      <h1 className="page-title">Configuration</h1>
      <p className="page-description">
        Paramètres généraux de l'application — horaires, contacts, règles
      </p>

      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: "8px", marginBottom: "20px",
          fontWeight: "bold",
          background: messageType === "success" ? "#d4edda" : "#f8d7da",
          color: messageType === "success" ? "#155724" : "#721c24",
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* ===== INFORMATIONS ENTREPRISE ===== */}
        <div className="config-section">
          <h3 className="config-section-title">Informations entreprise</h3>

          <div className="config-option">
            <div>
              <strong>Nom de l'entreprise</strong>
              <p className="config-description">Nom affiché dans l'application</p>
            </div>
            <input type="text" name="nom_entreprise"
              className="config-input" value={settings.nom_entreprise}
              onChange={handleChange} placeholder="Mon entreprise" />
          </div>

          <div className="config-option">
            <div>
              <strong>Email</strong>
              <p className="config-description">Email de contact de l'entreprise</p>
            </div>
            <input type="email" name="email_entreprise"
              className="config-input" value={settings.email_entreprise}
              onChange={handleChange} placeholder="contact@entreprise.com" />
          </div>

          <div className="config-option">
            <div>
              <strong>Téléphone</strong>
              <p className="config-description">Numéro de téléphone</p>
            </div>
            <input type="text" name="telephone"
              className="config-input" value={settings.telephone}
              onChange={handleChange} placeholder="+225 01 02 03 04 05" />
          </div>

          <div className="config-option">
            <div>
              <strong>Adresse</strong>
              <p className="config-description">Adresse physique de l'entreprise</p>
            </div>
            <textarea name="adresse" className="config-input"
              value={settings.adresse} onChange={handleChange}
              placeholder="Abidjan, Cocody..." rows={2}
              style={{ resize: "vertical", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* ===== THÈME ===== */}
        <div className="config-section">
          <h3 className="config-section-title">Thème</h3>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
            Choisissez la couleur principale de l'interface
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  changeTheme(key);
                  setSettings(prev => ({ ...prev, theme: key }));
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px",
                  borderRadius: "12px",
                  border: currentTheme === key ? `3px solid ${theme.colors["--color-primary"]}` : "2px solid #e5e7eb",
                  background: currentTheme === key ? theme.colors["--color-primary-bg"] : "#fff",
                  cursor: "pointer",
                  minWidth: "90px",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: theme.colors["--color-primary"],
                  boxShadow: currentTheme === key ? `0 0 12px ${theme.colors["--color-primary"]}60` : "none",
                }} />
                <span style={{
                  fontSize: "13px",
                  fontWeight: currentTheme === key ? "700" : "500",
                  color: currentTheme === key ? theme.colors["--color-primary-dark"] : "#555",
                }}>
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== HORAIRES DE TRAVAIL ===== */}
        <div className="config-section">
          <h3 className="config-section-title">Horaires de travail</h3>

          <div className="config-option">
            <div>
              <strong>Heure d'ouverture</strong>
              <p className="config-description">Début de la journée de travail</p>
            </div>
            <input type="time" name="heure_ouverture"
              className="config-input" value={settings.heure_ouverture}
              onChange={handleChange} />
          </div>

          <div className="config-option">
            <div>
              <strong>Heure de fermeture</strong>
              <p className="config-description">Fin de la journée de travail</p>
            </div>
            <input type="time" name="heure_fermeture"
              className="config-input" value={settings.heure_fermeture}
              onChange={handleChange} />
          </div>

          <div className="config-option">
            <div>
              <strong>Seuil de retard</strong>
              <p className="config-description">Minutes après l'ouverture considéré comme retard</p>
            </div>
            <input type="number" name="retard_apres"
              className="config-input" value={settings.retard_apres}
              onChange={handleChange} min="0" max="120" />
          </div>

          <div className="config-option">
            <div>
              <strong>Départ anticipé</strong>
              <p className="config-description">Minutes avant la fermeture considéré comme départ anticipé</p>
            </div>
            <input type="number" name="depart_anticipe"
              className="config-input" value={settings.depart_anticipe}
              onChange={handleChange} min="0" max="120" />
          </div>

          <div className="config-option">
            <div>
              <strong>Durée de pause</strong>
              <p className="config-description">Temps de pause en minutes (midi, etc.)</p>
            </div>
            <input type="number" name="duree_pause"
              className="config-input" value={settings.duree_pause}
              onChange={handleChange} min="0" max="180" />
          </div>
        </div>

        <button type="submit"
          className="employes-btn employes-btn-primary"
          style={{ marginTop: "16px" }}
          disabled={isSaving}>
          {isSaving ? "Sauvegarde..." : "Sauvegarder les paramètres"}
        </button>
      </form>
    </div>
  );
}

export default Configuration;
