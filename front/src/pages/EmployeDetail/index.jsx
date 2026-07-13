// ================================================================
// Page Détail Employé - Statistiques complètes
// ================================================================
// Affiche les statistiques détaillées d'un employé :
//   - Carte d'identité (nom, matricule, département)
//   - Statistiques du mois (présences, retards, taux)
//   - Statistiques de l'année
//   - Demandes de congés
//   - 10 dernières présences
// ================================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import employesService from "../../services/employesService";
import "./style.css";

function EmployeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employe, setEmploye] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [empRes, statsRes] = await Promise.all([
        employesService.getById(id),
        employesService.getStats(id),
      ]);
      setEmploye(empRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = dateStr.split("T")[0];
    return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
  };

  const formatHeure = (heure) => heure || "-";

  const badgeStatut = (statut) => {
    const colors = {
      Present: { bg: "#d4edda", color: "#155724" },
      Retard: { bg: "#fff3cd", color: "#856404" },
    };
    const c = colors[statut] || { bg: "#e2e3e5", color: "#383d41" };
    return <span className="ed-badge" style={{ background: c.bg, color: c.color }}>{statut || "Absent"}</span>;
  };

  if (isLoading) {
    return (
      <div>
        <div className="loading-spinner">
          <span className="loading-spinner-text">Chargement des données...</span>
        </div>
      </div>
    );
  }

  if (error || !employe) {
    return (
      <div>
        <h1 className="page-title">Employé</h1>
        <div className="page-error">{error || "Employé introuvable"}</div>
        <button className="employes-btn" onClick={() => navigate("/employes")} style={{ background: "#6c757d", color: "white" }}>
          ← Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="ed-page">
      {/* Header avec retour */}
      <div className="ed-header">
        <button className="ed-back-btn" onClick={() => navigate("/employes")}>
          ← Retour
        </button>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {employe.prenom} {employe.nom}
          </h1>
          <p className="page-description" style={{ marginBottom: 0 }}>
            {employe.matricule} — {employe.departement_nom || "—"}
          </p>
        </div>
      </div>

      {/* === CARTE IDENTITÉ === */}
      <div className="ed-cards">
        <div className="ed-card ed-card-info">
          <div className="ed-card-label">Email</div>
          <div className="ed-card-value">{employe.email || "-"}</div>
        </div>
        <div className="ed-card ed-card-info">
          <div className="ed-card-label">Téléphone</div>
          <div className="ed-card-value">{employe.telephone || "-"}</div>
        </div>
        <div className="ed-card ed-card-info">
          <div className="ed-card-label">Statut</div>
          <div className="ed-card-value">
            <span style={{
              padding: "4px 12px", borderRadius: "12px", fontWeight: 600, fontSize: "12px",
              background: employe.statut === "Actif" ? "#d4edda" : "#f8d7da",
              color: employe.statut === "Actif" ? "#155724" : "#721c24",
            }}>
              {employe.statut}
            </span>
          </div>
        </div>
        <div className="ed-card ed-card-info">
          <div className="ed-card-label">Date embauche</div>
          <div className="ed-card-value">{formatDate(employe.date_embauche)}</div>
        </div>
      </div>

      {/* === STATS DU MOIS === */}
      {stats && (
        <>
          <h2 className="ed-section-title">
            {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </h2>
          <div className="ed-cards">
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: "#22c55e" }}>{stats.mois.presents}</div>
              <div className="ed-card-label">Présent(s)</div>
            </div>
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: "#f59e0b" }}>{stats.mois.retards}</div>
              <div className="ed-card-label">Retard(s)</div>
            </div>
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: "#ef4444" }}>{stats.mois.oublis}</div>
              <div className="ed-card-label">Oubli(s)</div>
            </div>
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: "#3b82f6" }}>
                {stats.mois.tauxPresence}%
              </div>
              <div className="ed-card-label">Taux présence</div>
            </div>
          </div>

          {/* === STATS ANNÉE === */}
          <h2 className="ed-section-title">{new Date().getFullYear()}</h2>
          <div className="ed-cards">
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: "#22c55e" }}>{stats.annee.totalPresences}</div>
              <div className="ed-card-label">Jours travaillés</div>
            </div>
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: "#f59e0b" }}>{stats.annee.retards}</div>
              <div className="ed-card-label">Retard(s)</div>
            </div>
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: "#3b82f6" }}>{stats.conges.approuves}</div>
              <div className="ed-card-label">Congés pris</div>
            </div>
            <div className="ed-card ed-card-stat">
              <div className="ed-stat-number" style={{ color: stats.conges.enAttente > 0 ? "#f59e0b" : "#6b7280" }}>
                {stats.conges.enAttente}
              </div>
              <div className="ed-card-label">Congés en attente</div>
            </div>
          </div>

          {/* === DERNIÈRES PRÉSENCES === */}
          <h2 className="ed-section-title">10 dernières présences</h2>
          <div className="ed-table-container">
            <table className="ed-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Arrivée</th>
                  <th>Départ</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.dernieresPresences.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="ed-empty">Aucune présence enregistrée</td>
                  </tr>
                ) : (
                  stats.dernieresPresences.map((p, i) => (
                    <tr key={i}>
                      <td>{formatDate(p.date_presence)}</td>
                      <td className="ed-vert">{formatHeure(p.heure_entree)}</td>
                      <td>{formatHeure(p.heure_sortie)}</td>
                      <td>{badgeStatut(p.statut)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Bouton modifier */}
      <div style={{ marginTop: "20px" }}>
        <button
          className="employes-btn employes-btn-primary"
          onClick={() => navigate(`/employes`)}
        >
          ← Retour à la liste des employés
        </button>
      </div>
    </div>
  );
}

export default EmployeDetail;
