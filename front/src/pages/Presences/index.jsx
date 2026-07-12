// ================================================================
// Page Presences - Gestion des présences
// ================================================================
// Affiche les présences des employés avec un filtre simple.
// Permet le rattrapage si un employé a oublié de pointer son départ.
// ================================================================

import { useState, useEffect, useCallback } from "react";
import presencesService from "../../services/presencesService";
import employesService from "../../services/employesService";
import "./style.css";

function Presences() {
  // --- États ---
  const [presences, setPresences] = useState([]);      // Liste des présences
  const [employes, setEmployes] = useState([]);         // Liste des employés
  const [presencesAValider, setPresencesAValider] = useState([]); // Présences incomplètes
  const [isLoading, setIsLoading] = useState(true);     // Chargement en cours ?

  // Filtres
  const [filtreEmploye, setFiltreEmploye] = useState("");     // ID employé sélectionné
  const [filtreDate, setFiltreDate] = useState("aujourdhui"); // Période sélectionnée

  // Rattrapage : quand on clique sur un employé qui a oublié son départ
  const [rattrapagePresence, setRattrapagePresence] = useState(null);
  const [rattrapageHeure, setRattrapageHeure] = useState("");

  // Message de confirmation/erreur
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Date d'aujourd'hui au format YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  // Affiche un message temporaire (4 secondes)
  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  // Charge les présences à valider (arrivée sans départ, date passée)
  const loadPresencesAValider = async () => {
    try {
      // On prend toutes les présences JUSQU'À hier (date_fin = hier)
      // Cela exclut les présences d'aujourd'hui qui sont encore "en cours"
      // (l'employé travaille encore, pas besoin de validation)
      const hier = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const res = await presencesService.getAll({
        date_fin: hier,
      });
      const incompletes = (res.data || []).filter(p => !p.heure_sortie);
      setPresencesAValider(incompletes);
    } catch (err) {
      console.warn("⚠️ Erreur chargement présences à valider:", err);
    }
  };

  // ========== CHARGEMENT ==========

  // Charge les employés (pour le filtre dropdown)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await employesService.getAll();
      setEmployes(res.data || []);
    } catch {
      showMessage("Erreur lors du chargement", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charge les présences filtrées (selon l'employé et la période)
  async function loadPresencesFiltrees() {
    // On construit les paramètres de l'API
    const params = {};
    if (filtreEmploye) params.employe_id = filtreEmploye;

    // Selon la période choisie, on calcule les dates
    if (filtreDate === "aujourdhui") {
      params.date_debut = todayStr;
      params.date_fin = todayStr;
    } else if (filtreDate === "semaine") {
      // Calcul du lundi de la semaine actuelle
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const lundi = new Date(d.setDate(diff));
      params.date_debut = lundi.toISOString().split("T")[0];
      params.date_fin = todayStr;
    } else if (filtreDate === "mois") {
      // Premier jour du mois
      const d = new Date();
      params.date_debut = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
      params.date_fin = todayStr;
    }

    try {
      const res = await presencesService.getAll(params);
      setPresences(res.data || []);
    } catch {
      // Silencieux : on garde les données précédentes
    }
  }

  // Au chargement initial : on charge les employés + les présences filtrées
  useEffect(() => {
    loadData();
    loadPresencesFiltrees();
    loadPresencesAValider();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quand les filtres changent : on recharge les présences
  useEffect(() => {
    loadPresencesFiltrees();
  }, [filtreEmploye, filtreDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== RATTRAPAGE ==========

  // Ouvre le popup de rattrapage pour une présence
  const ouvrirRattrapage = (presence) => {
    setRattrapagePresence(presence);
    setRattrapageHeure(presence.heure_sortie || "");
  };

  // Ferme le popup de rattrapage
  const fermerRattrapage = () => {
    setRattrapagePresence(null);
    setRattrapageHeure("");
  };

  // Enregistre le rattrapage (l'admin fixe l'heure de départ)
  const handleRattrapage = async (e) => {
    e.preventDefault();
    
    // Vérification : heure de départ obligatoire
    if (!rattrapageHeure) {
      showMessage("Veuillez saisir l'heure de départ", "error");
      return;
    }

    // Vérification : ID de présence obligatoire
    if (!rattrapagePresence || !rattrapagePresence.id) {
      showMessage("Erreur : présence introuvable. Rechargez la page.", "error");
      fermerRattrapage();
      return;
    }

    try {
      console.log("📤 Envoi rattrapage:", {
        id: rattrapagePresence.id,
        heure_sortie: rattrapageHeure,
        employe: rattrapagePresence.employe_nom,
      });

      await presencesService.rattrapage(rattrapagePresence.id, {
        heure_sortie: rattrapageHeure,
        remarque: "Rattrapage RH",
      });
      
      showMessage("✅ Rattrapage enregistré !");
      fermerRattrapage();
      
      // Recharge les données en arrière-plan (silencieux si échec)
      loadPresencesFiltrees().catch(() => {});
      loadPresencesAValider().catch(() => {});
    } catch (err) {
      console.error("❌ Erreur rattrapage:", err);
      
      // Le message d'erreur vient déjà du backend via fetchWithAuth
      const msg = err.message || "Erreur inconnue";
      showMessage("❌ " + msg, "error");
    }
  };

  // ========== CHECK-IN / CHECK-OUT RAPIDE ==========

  // Pointer l'arrivée d'un employé
  const nowTime = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };

  const handleCheckIn = async () => {
    if (!filtreEmploye) {
      showMessage("Sélectionnez un employé", "error");
      return;
    }
    try {
      const res = await presencesService.checkIn(filtreEmploye, nowTime());
      const autoClosed = res.autoClosed;
      if (autoClosed && autoClosed.length > 0) {
        showMessage(`Arrivée enregistrée — ${autoClosed.length} présence(s) précédente(s) fermée(s) auto`);
      } else {
        showMessage("Arrivée enregistrée !");
      }
      await loadPresencesFiltrees();
    } catch (err) {
      showMessage("Erreur : " + err.message, "error");
    }
  };

  // Pointer le départ d'un employé
  const handleCheckOut = async () => {
    if (!filtreEmploye) {
      showMessage("Sélectionnez un employé", "error");
      return;
    }
    try {
      const activeRes = await presencesService.getActivePresence(filtreEmploye);
      if (!activeRes.data) {
        showMessage("Aucune présence active pour cet employé", "error");
        return;
      }
      await presencesService.checkOut(activeRes.data.id, nowTime());
      showMessage("Départ enregistré !");
      await loadPresencesFiltrees();
    } catch (err) {
      showMessage("Erreur : " + err.message, "error");
    }
  };

  // ========== AFFICHAGE ==========

  // Badge de statut coloré (Présent = vert, Retard = orange, Absent = rouge)
  const badgeStatut = (statut) => {
    const couleurs = {
      Present: "var(--color-success)",
      Retard: "var(--color-warning)",
      Absent: "var(--color-danger)",
    };
    const bg = {
      Present: "#d4edda",
      Retard: "#fff3cd",
      Absent: "#f8d7da",
    };
    const color = {
      Present: "#155724",
      Retard: "#856404",
      Absent: "#721c24",
    };
    const s = statut || "Absent";
    return (
      <span className="presences-badge" style={{ background: bg[s] || "#e2e3e5", color: color[s] || "#383d41" }}>
        {s}
      </span>
    );
  };

  // Formatage : HH:MM → XhXX
  const formaterDuree = (minutes) => {
    if (minutes == null || minutes < 0) return null;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h${m > 0 ? String(m).padStart(2, '0') : '00'}`;
  };

  // Affiche une date au format français (extrait YYYY-MM-DD avant parsing)
  const afficherDate = (dateStr, options) => {
    const d = (dateStr || "").split("T")[0];
    return d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", options) : "-";
  };

  return (
    <div className="presences-page">
      {/* ===== TITRE ===== */}
      <h1 className="page-title">Présences</h1>
      <p className="page-description">Suivi des présences des employés</p>

      {/* ===== MESSAGE ===== */}
      {message && (
        <div className={`presences-message presences-message-${messageType}`}>
          {message}
        </div>
      )}

      {/* ===== SECTION À VALIDER ===== */}
      {presencesAValider.length > 0 && (
        <div className="presences-valider-section">
          <div className="presences-valider-header">
            <span className="presences-valider-icon">⏳</span>
            <div>
              <strong>{presencesAValider.length} présence(s) à valider</strong>
              <p className="presences-valider-subtitle">
                Ces employés ont pointé leur arrivée mais ont oublié leur départ.
                Confirmez leur présence en ajoutant l'heure de départ.
              </p>
            </div>
            <button className="presences-btn presences-btn-gris"
              onClick={loadPresencesAValider} style={{ marginLeft: "auto" }}>
              ↻
            </button>
          </div>

          <div className="presences-valider-liste">
            {presencesAValider.map((p) => (
              <div key={p.id} className="presences-valider-item">
                <div className="presences-valider-infos">
                  <strong>{p.employe_nom}</strong>
                  <span className="presences-valider-date">
                    {afficherDate(p.date_presence, { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                  <span className="presences-vert">Arrivée : {p.heure_entree}</span>
                </div>
                <button className="presences-btn presences-btn-jaune"
                  onClick={() => ouvrirRattrapage(p)}>
                  ⏱ Valider
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== FILTRES SIMPLES ===== */}
      <div className="presences-filtres">
        {/* Filtre par employé */}
        <div className="presences-filtre-groupe">
          <label className="presences-filtre-label">Employé</label>
          <select value={filtreEmploye} onChange={(e) => setFiltreEmploye(e.target.value)} className="presences-select">
            <option value="">Tous les employés</option>
            {employes.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.prenom} {emp.nom} — {emp.departement_nom || "—"}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par période */}
        <div className="presences-filtre-groupe">
          <label className="presences-filtre-label">Période</label>
          <div className="presences-filtre-boutons">
            {["aujourdhui", "semaine", "mois"].map((p) => (
              <button key={p}
                className={`presences-filtre-btn ${filtreDate === p ? "active" : ""}`}
                onClick={() => setFiltreDate(p)}>
                {p === "aujourdhui" ? "Aujourd'hui" : p === "semaine" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
        </div>

        {/* Actions rapides : Arrivée / Départ */}
        <div className="presences-filtre-groupe">
          <label className="presences-filtre-label">Actions</label>
          <div className="presences-filtre-actions">
            <button className="presences-btn presences-btn-vert" onClick={handleCheckIn} disabled={isLoading}>
              🟢 Arrivée
            </button>
            <button className="presences-btn presences-btn-rouge" onClick={handleCheckOut} disabled={isLoading}>
              🔴 Départ
            </button>
            <button className="presences-btn presences-btn-gris" onClick={() => { loadData(); loadPresencesFiltrees(); }}>
              ↻ Recharger
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABLEAU DES PRÉSENCES ===== */}
      <div className="presences-table-container">
        <table className="presences-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Date</th>
              <th>Arrivée</th>
              <th>Départ</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="presences-empty">Chargement...</td>
              </tr>
            )}

            {!isLoading && presences.length === 0 && (
              <tr>
                <td colSpan={6} className="presences-empty">
                  Aucune présence trouvée.
                </td>
              </tr>
            )}

            {!isLoading && presences.map((p) => (
              <tr key={p.id}>
                {/* Nom de l'employé */}
                <td><strong>{p.employe_nom}</strong></td>
                {/* Date formatée en français */}
                <td>{afficherDate(p.date_presence, { weekday: "short", day: "numeric", month: "short" })}</td>
                {/* Heure d'arrivée */}
                <td><span className="presences-vert">{p.heure_entree || "-"}</span></td>
                {/* Heure de départ */}
                <td>{p.heure_sortie
                  ? <span className="presences-rouge">{p.heure_sortie}</span>
                  : <span className="presences-encours">En cours...</span>}</td>
                {/* Badge statut */}
                <td>{badgeStatut(p.statut)}</td>
                {/* Bouton rattrapage si pas de départ */}
                <td>
                  {!p.heure_sortie ? (
                    <button className="presences-btn presences-btn-jaune" onClick={() => ouvrirRattrapage(p)}>
                      ⏱ Rattrapage
                    </button>
                  ) : (
                    <span style={{ color: "#aaa", fontSize: "13px" }}>✔ Fait</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== POPUP RATTRAPAGE ===== */}
      {rattrapagePresence && (
        <div className="presences-modal-overlay" onClick={fermerRattrapage}>
          <div className="presences-modal" onClick={(e) => e.stopPropagation()}>
            {/* Titre avec le nom de l'employé */}
            <h3 style={{ marginBottom: "6px" }}>
              ⏱ Rattrapage — {rattrapagePresence.employe_nom}
            </h3>
            {/* Date du jour */}
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>
              {afficherDate(rattrapagePresence.date_presence, {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
            {/* Infos : arrivée et statut */}
            <div className="presences-modal-infos">
              <span>Arrivée : <strong>{rattrapagePresence.heure_entree}</strong></span>
              <span>Statut : {badgeStatut(rattrapagePresence.statut)}</span>
            </div>
            {/* Formulaire : saisir l'heure de départ */}
            <form onSubmit={handleRattrapage} style={{ marginTop: "16px" }}>
              <label style={{ fontWeight: 600, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                Heure de départ *
              </label>
              <input type="time" value={rattrapageHeure}
                onChange={(e) => setRattrapageHeure(e.target.value)}
                className="presences-input" required autoFocus />
              <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
                <button type="submit" className="presences-btn presences-btn-vert" disabled={isLoading}>
                  Enregistrer
                </button>
                <button type="button" className="presences-btn presences-btn-gris" onClick={fermerRattrapage}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Presences;
