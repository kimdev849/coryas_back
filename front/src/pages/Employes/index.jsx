// ================================================================
// Page Employes - Gestion des employes
// ================================================================
// Nouveau formulaire avec les vrais champs de la base Supabase :
// matricule, nom, prenom, sexe, telephone, date_naissance,
// date_embauche, departement_id + email, password, role_id
// ================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import employesService from "../../services/employesService";
import departementsService from "../../services/departementsService";
import parametresService from "../../services/parametresService";
import typeContratService from "../../services/typeContratService";
import sitesService from "../../services/sitesService";
import equipesService from "../../services/equipesService";
import "./style.css";

function Employes() {
  const navigate = useNavigate();
  const [companyPrint, setCompanyPrint] = useState({ nom: "", logo: null });
  const [employes, setEmployes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",           // Nom de famille
    prenom: "",         // Prénom
    sexe: "",           // M ou F
    telephone: "",      // Téléphone
    date_naissance: "", // Date de naissance
    date_embauche: "",  // Date d'embauche
    departement_id: "", // ID du département
    type_contrat_id: "", // Type de contrat
    poste: "",          // Poste / Fonction
    salaire: "",        // Salaire
    site_id: "",        // Site de travail
    equipe_id: "",      // Équipe
    date_fin_contrat: "", // Date fin contrat
    periode_essai_jours: 0, // Période d'essai (jours)
    email: "",          // Email pour le compte utilisateur
    password: "",       // Mot de passe pour le compte utilisateur
    role_id: 3,         // Rôle : 3=Employé (défaut)
  });

  const [departements, setDepartements] = useState([]);
  const [typesContrat, setTypesContrat] = useState([]);
  const [sites, setSites] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [roles] = useState([
    { id: 1, nom: "Administrateur" },
    { id: 2, nom: "RH" },
    { id: 3, nom: "Employé" },
    { id: 4, nom: "Directeur" },
  ]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadEmployes();
    loadDepartements();
    loadTypesContrat();
    loadSites();
    loadEquipes();
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const res = await parametresService.get();
      if (res.data) {
        setCompanyPrint({
          nom: res.data.nom_entreprise || "",
          logo: res.data.logo_url || null,
        });
      }
    } catch { /* fallback */ }
  };

  const loadTypesContrat = async () => {
    try {
      const res = await typeContratService.getAll();
      setTypesContrat(res.data || []);
    } catch (e) { console.error(e); }
  };

  const loadSites = async () => {
    try {
      const res = await sitesService.getAll();
      setSites(res.data || []);
    } catch (e) { console.error(e); }
  };

  const loadEquipes = async () => {
    try {
      const res = await equipesService.getAll();
      setEquipes(res.data || []);
    } catch (e) { console.error(e); }
  };

  // Charge les departements depuis la base Supabase
  const loadDepartements = async () => {
    try {
      const result = await departementsService.getAll();
      if (result.data && result.data.length > 0) {
        setDepartements(result.data);
      } else {
        console.warn("Aucun departement trouve");
        setMessage("Aucun departement trouve ! Ajoutez-en depuis la page Departements.");
        setMessageType("error");
        setTimeout(() => setMessage(""), 6000);
      }
    } catch (err) {
      console.error("Erreur chargement departements:", err);
      setMessage("Erreur lors du chargement des departements : " + (err.message || "API inaccessible"));
      setMessageType("error");
    }
  };

  const loadEmployes = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await employesService.getAll();
      setEmployes(result.data || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      nom: "",
      prenom: "",
      sexe: "",
      telephone: "",
      date_naissance: "",
      date_embauche: new Date().toISOString().split("T")[0],
      departement_id: "",
      type_contrat_id: "",
      poste: "",
      salaire: "",
      site_id: "",
      equipe_id: "",
      date_fin_contrat: "",
      periode_essai_jours: 0,
      email: "",
      password: "",
      role_id: 3,
    });
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (employe) => {
    setEditingId(employe.id);
    setFormData({
      nom: employe.nom || "",
      prenom: employe.prenom || "",
      sexe: employe.sexe || "",
      telephone: employe.telephone || "",
      date_naissance: employe.date_naissance ? employe.date_naissance.split("T")[0] : "",
      date_embauche: employe.date_embauche ? employe.date_embauche.split("T")[0] : "",
      departement_id: employe.departement_id || "",
      type_contrat_id: employe.type_contrat_id || "",
      poste: employe.poste || "",
      salaire: employe.salaire || "",
      site_id: employe.site_id || "",
      equipe_id: employe.equipe_id || "",
      date_fin_contrat: employe.date_fin_contrat ? employe.date_fin_contrat.split("T")[0] : "",
      periode_essai_jours: employe.periode_essai_jours || 0,
      statut: employe.statut || "Actif",
      email: employe.email || "",
      password: "",
      role_id: employe.role_id || 3,
    });
    setShowForm(true);
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // --- Validation côté client ---

    if (!formData.nom || !formData.prenom || !formData.departement_id) {
      setMessage("Nom, prénom et département obligatoires !");
      setMessageType("error");
      return;
    }

    // Vérifie que le nom ne contient pas de chiffres
    const regexLettres = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/;
    if (!regexLettres.test(formData.nom)) {
      setMessage("Le nom ne doit contenir que des lettres (pas de chiffres !)");
      setMessageType("error");
      return;
    }
    if (!regexLettres.test(formData.prenom)) {
      setMessage("Le prénom ne doit contenir que des lettres (pas de chiffres !)");
      setMessageType("error");
      return;
    }

    // Vérifie le téléphone (si fourni)
    if (formData.telephone && formData.telephone.trim() !== "") {
      const regexTel = /^[\d\s\+\-\.\(\)]+$/;
      if (!regexTel.test(formData.telephone)) {
        setMessage("Le téléphone ne doit contenir que des chiffres");
        setMessageType("error");
        return;
      }
    }

    // En creation, email + password sont obligatoires
    if (!editingId && (!formData.email || !formData.password)) {
      setMessage("Email et mot de passe obligatoires pour creer le compte !");
      setMessageType("error");
      return;
    }

    // Vérifie le format de l'email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage("Format d'email invalide (ex: nom@domaine.com)");
      setMessageType("error");
      return;
    }

    // Vérifie la longueur du mot de passe
    if (formData.password && formData.password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await employesService.update(editingId, formData);
        setMessage("Employe modifie avec succes !");
      } else {
        await employesService.create(formData);
        setMessage("Employe et compte utilisateur crees avec succes !");
      }
      setMessageType("success");
      closeForm();
      await loadEmployes();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Erreur : " + (err.message || "Erreur inconnue"));
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (id, nomComplet) => {
    if (!window.confirm(`Desactiver ${nomComplet} ? Il ne pourra plus se connecter mais ses donnees seront conservees.`)) return;

    try {
      await employesService.deactivate(id);
      setMessage(`${nomComplet} desactive avec succes. Ses donnees sont conservees.`);
      setMessageType("success");
      await loadEmployes();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Erreur : " + (err.message || "Erreur inconnue"));
      setMessageType("error");
    }
  };

  const getRoleLabel = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.nom : "-";
  };

  const getSexeLabel = (sexe) => {
    if (sexe === "M") return "Masculin";
    if (sexe === "F") return "Feminin";
    return sexe || "-";
  };

  return (
    <div>
      {/* ===== EN-TÊTE D'IMPRESSION ===== */}
      <div className="employes-print-header">
        <div className="print-header-brand">
          <div className="print-header-logo">
            {companyPrint.logo ? (
              <img src={companyPrint.logo} alt="Logo" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z"/></svg>
            )}
          </div>
          <div className="print-header-texts">
            <div className="print-header-title">Liste des employés</div>
            <div className="print-header-company">{companyPrint.nom || "PRÉSENCIA"}</div>
          </div>
        </div>
        <div className="print-header-date">
          {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <h1 className="page-title">Gestion des Employés</h1>
      <p className="page-description">
        Liste et gestion des employés — création automatique du compte utilisateur
      </p>

      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "20px",
          fontWeight: "bold",
          background: messageType === "success" ? "#d4edda" : "#f8d7da",
          color: messageType === "success" ? "#155724" : "#721c24",
          border: messageType === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
        }}>
          {message}
        </div>
      )}

      <div className="employes-actions">
        <button className="employes-btn employes-btn-primary" onClick={openAddForm}>
          + Ajouter un employé
        </button>
        <button
          className="employes-btn"
          onClick={loadEmployes}
          style={{ background: "#6c757d", color: "white" }}
        >
          Recharger
        </button>
        <button
          className="employes-btn employes-btn-print"
          onClick={() => window.print()}
        >
          🖨️ Imprimer
        </button>
      </div>

      {showForm && (
        <div style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "20px",
        }}>
          <h3 style={{ marginBottom: "20px", color: "#1a1a2e" }}>
            {editingId ? "Modifier l'employé" : "Ajouter un employé"}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", maxWidth: "700px" }}>

            {/* LIGNE 1 : Nom + Prenom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Nom *
                </label>
                <input type="text" name="nom" value={formData.nom}
                  onChange={handleChange} className="login-input" placeholder="Dupont" required />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Prénom *
                </label>
                <input type="text" name="prenom" value={formData.prenom}
                  onChange={handleChange} className="login-input" placeholder="Jean" required />
              </div>
            </div>

            {/* LIGNE 2 : Sexe + Telephone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Sexe
                </label>
                <select name="sexe" value={formData.sexe}
                  onChange={handleChange} className="login-input">
                  <option value="">-- Selectionner --</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Téléphone
                </label>
                <input type="text" name="telephone" value={formData.telephone}
                  onChange={handleChange} className="login-input" placeholder="+225 01 02 03 04" />
              </div>
            </div>

            {/* LIGNE 3 : Date naissance + Date embauche + Departement + Statut */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Date naissance
                </label>
                <input type="date" name="date_naissance" value={formData.date_naissance}
                  onChange={handleChange} className="login-input" />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Date embauche
                </label>
                <input type="date" name="date_embauche" value={formData.date_embauche}
                  onChange={handleChange} className="login-input" />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Département *
                </label>
                <select name="departement_id" value={formData.departement_id}
                  onChange={handleChange} className="login-input" required>
                  <option value="">-- Selectionner --</option>
                  {departements.map((dep) => (
                    <option key={dep.id} value={dep.id}>{dep.nom}</option>
                  ))}
                </select>
              </div>
              {editingId && (
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                    Statut
                  </label>
                  <select name="statut" value={formData.statut}
                    onChange={handleChange} className="login-input">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              )}
            </div>

            {/* SEPARATEUR : Informations contrat */}
            <hr style={{ border: "none", borderTop: "2px dashed #e0e0e0", margin: "8px 0" }} />
            <p style={{ fontSize: "13px", color: "#888", fontWeight: 600 }}>
              📋 Informations contrat
            </p>

            {/* LIGNE 4 : Type contrat + Poste + Salaire */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Type de contrat
                </label>
                <select name="type_contrat_id" value={formData.type_contrat_id}
                  onChange={handleChange} className="login-input">
                  <option value="">-- Selectionner --</option>
                  {typesContrat.map((tc) => (
                    <option key={tc.id} value={tc.id}>{tc.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Poste / Fonction
                </label>
                <input type="text" name="poste" value={formData.poste}
                  onChange={handleChange} className="login-input" placeholder="Développeur Full Stack" />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Salaire (FCFA)
                </label>
                <input type="number" name="salaire" value={formData.salaire}
                  onChange={handleChange} className="login-input" placeholder="500000" min="0" />
              </div>
            </div>

            {/* LIGNE 5 : Site + Équipe + Période essai + Fin contrat */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Site de travail
                </label>
                <select name="site_id" value={formData.site_id}
                  onChange={handleChange} className="login-input">
                  <option value="">-- Selectionner --</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Équipe
                </label>
                <select name="equipe_id" value={formData.equipe_id}
                  onChange={handleChange} className="login-input">
                  <option value="">-- Selectionner --</option>
                  {equipes.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Période essai (jours)
                </label>
                <input type="number" name="periode_essai_jours" value={formData.periode_essai_jours}
                  onChange={handleChange} className="login-input" min="0" placeholder="0" />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                  Fin contrat
                </label>
                <input type="date" name="date_fin_contrat" value={formData.date_fin_contrat}
                  onChange={handleChange} className="login-input" />
              </div>
            </div>

            {/* LIGNE 4 : Email + Role (en mode édition) */}
            {editingId && (
              <>
                <hr style={{ border: "none", borderTop: "2px dashed #e0e0e0", margin: "8px 0" }} />
                <p style={{ fontSize: "13px", color: "#888", fontWeight: 600 }}>
                  🔐 Informations du compte utilisateur
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                      Email
                    </label>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleChange} className="login-input"
                      placeholder="jean.dupont@email.com" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                      Rôle
                    </label>
                    <select name="role_id" value={formData.role_id}
                      onChange={handleChange} className="login-input">
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* SEPARATEUR si création */}
            {!editingId && (
              <>
                <hr style={{ border: "none", borderTop: "2px dashed #e0e0e0", margin: "8px 0" }} />
                <p style={{ fontSize: "13px", color: "#888", fontWeight: 600 }}>
                  🔐 Création du compte utilisateur
                </p>

                {/* LIGNE 4 : Email + Password + Role */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                      Email *
                    </label>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleChange} className="login-input"
                      placeholder="jean.dupont@email.com" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                      Mot de passe *
                    </label>
                    <input type="password" name="password" value={formData.password}
                      onChange={handleChange} className="login-input"
                      placeholder="Minimum 6 caracteres" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "6px", fontSize: "14px" }}>
                      Rôle
                    </label>
                    <select name="role_id" value={formData.role_id}
                      onChange={handleChange} className="login-input">
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button type="submit" className="employes-btn employes-btn-primary" disabled={isLoading}>
                {isLoading ? "..." : editingId ? "Enregistrer" : "Créer l'employé"}
              </button>
              <button type="button" className="employes-btn" onClick={closeForm}
                style={{ background: "#dc3545", color: "white" }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="employes-table-container">
        <table className="employes-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Poste</th>
              <th>Département</th>
              <th>Contrat</th>
              <th>Tél.</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9}>
                  <div className="loading-spinner" style={{ padding: "30px" }}>
                    <span className="loading-spinner-text">Chargement...</span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && employes.length === 0 && (
              <tr>
                <td colSpan={9} className="employes-empty">
                  Aucun employé pour le moment.<br />
                  <small>Cliquez sur "Ajouter un employé" pour commencer.</small>
                </td>
              </tr>
            )}

            {!isLoading && employes.map((emp) => (
              <tr key={emp.id}>
                <td><strong>{emp.matricule}</strong></td>
                <td>{emp.nom}</td>
                <td>{emp.prenom}</td>
                <td style={{ fontSize: 13, color: "#374151" }}>{emp.poste || "—"}</td>
                <td>{emp.departement_nom || "-"}</td>
                <td>
                  {emp.type_contrat_nom ? (
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: "8px",
                      fontWeight: 600, fontSize: "11px",
                      background: "#EFF6FF", color: "#1D4ED8"
                    }}>
                      {emp.type_contrat_nom}
                    </span>
                  ) : "—"}
                </td>
                <td>{emp.telephone || "-"}</td>
                <td>
                  <span style={{
                    display: "inline-block", padding: "4px 12px", borderRadius: "12px",
                    fontWeight: 600, fontSize: "12px",
                    background: emp.statut === "Actif" ? "#d4edda" : "#f8d7da",
                    color: emp.statut === "Actif" ? "#155724" : "#721c24",
                  }}>
                    {emp.statut || "Actif"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    <button className="employes-btn"
                      onClick={() => navigate(`/employes/${emp.id}`)}
                      style={{ background: "#3b82f6", color: "white", padding: "6px 10px", fontSize: "12px" }}
                      title="Voir les statistiques">
                      📊 Stats
                    </button>
                    <button className="employes-btn"
                      onClick={() => openEditForm(emp)}
                      style={{ background: "var(--color-primary)", color: "white", padding: "6px 10px", fontSize: "12px" }}>
                      Modifier
                    </button>
                    <button className="employes-btn"
                      onClick={() => handleDeactivate(emp.id, `${emp.prenom} ${emp.nom}`)}
                      style={{ background: "#6c757d", color: "white", padding: "6px 10px", fontSize: "12px" }}
                      disabled={emp.statut === "Inactif"}>
                      {emp.statut === "Inactif" ? "✔" : "Désactiver"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employes;
