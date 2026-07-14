// ================================================================
// Page Stats - Statistiques de ponctualité
// ================================================================
// Affiche :
// - Top 10 des employés les plus ponctuels
// - Top 10 des employés les plus en retard
// - Stats globales (taux de ponctualité, total retards, etc.)
// - Stats jour par jour
// - Filtre par période (semaine / mois)
// ================================================================

import { useState, useEffect } from "react";
import statsService from "../../services/statsService";
import "./style.css";

function Stats() {
  const [periode, setPeriode] = useState("mois");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [periode]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await statsService.getPunctualite(periode);
      setData(result.data);
    } catch (err) {
      setError(err.message || "Impossible de charger les stats");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T12:00:00"));
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="page-title">Ponctualité</h1>
        <div className="loading-spinner"><span className="loading-spinner-text">Chargement...</span></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Ponctualité</h1>
        <div className="page-error">{error}</div>
        <button onClick={loadData} className="employes-btn employes-btn-primary">Réessayer</button>
      </div>
    );
  }

  const { statsGlobales, topPonctuels, topRetards, statsParJour, heureLimite, retardApres, heureOuverture } = data || {};

  return (
    <div>
      {/* Header responsive */}
      <div className="stats-header">
        <div className="stats-header-left">
          <h1 className="page-title">Ponctualité</h1>
          <p className="page-description" style={{ marginBottom: 0 }}>
            Heure limite : <strong>{heureLimite}</strong>
            {retardApres > 0 && <span> (ouverture {heureOuverture} + {retardApres} min)</span>}
          </p>
        </div>
        {/* Filtre période */}
        <div className="stats-periodes">
          {["semaine", "mois", "annee"].map((p) => (
            <button
              key={p}
              className={`stats-periode-btn ${periode === p ? "active" : ""}`}
              onClick={() => setPeriode(p)}
            >
              {p === "semaine" ? "Semaine" : p === "mois" ? "Mois" : "Année"}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes stats globales */}
      <div className="stats-cards">
        <div className="stats-card stats-card-green">
          <div className="stats-card-icon">🟢</div>
          <div className="stats-card-body">
            <p className="stats-card-number">{statsGlobales?.totalPonctuels || 0}</p>
            <p className="stats-card-label">Arrivées à l'heure</p>
          </div>
        </div>
        <div className="stats-card stats-card-red">
          <div className="stats-card-icon">🔴</div>
          <div className="stats-card-body">
            <p className="stats-card-number">{statsGlobales?.totalRetards || 0}</p>
            <p className="stats-card-label">Arrivées en retard</p>
          </div>
        </div>
        <div className="stats-card stats-card-blue">
          <div className="stats-card-icon">📊</div>
          <div className="stats-card-body">
            <p className="stats-card-number">{statsGlobales?.tauxPonctualite || 0}%</p>
            <p className="stats-card-label">Taux de ponctualité</p>
          </div>
        </div>
        <div className="stats-card stats-card-gray">
          <div className="stats-card-icon">👥</div>
          <div className="stats-card-body">
            <p className="stats-card-number">{statsGlobales?.totalPresences || 0}</p>
            <p className="stats-card-label">Total présences</p>
          </div>
        </div>
      </div>

      {/* Deux colonnes : Top ponctuels + Top retards */}
      <div className="stats-columns">
        {/* Top ponctuels */}
        <div className="stats-table-section">
          <h3 className="stats-section-title">
            <span style={{ color: "#22c55e" }}>●</span> Top 10 des plus ponctuels
          </h3>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employé</th>
                  <th>Département</th>
                  <th>Présences</th>
                  <th>À l'heure</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {topPonctuels?.length > 0 ? topPonctuels.map((emp, i) => (
                  <tr key={emp.id}>
                    <td>
                      <span className={`stats-rank ${i < 3 ? "stats-rank-top" : ""}`}>{i + 1}</span>
                    </td>
                    <td><strong>{emp.prenom} {emp.nom}</strong><br /><small style={{ color: "#888" }}>{emp.matricule}</small></td>
                    <td>{emp.departement || "—"}</td>
                    <td>{emp.totalPresences}</td>
                    <td style={{ color: "#22c55e", fontWeight: 600 }}>{emp.arriveesALHeure}</td>
                    <td>
                      <div className="stats-bar-wrap">
                        <div className="stats-bar" style={{ width: `${emp.ponctualite}%`, background: "#22c55e" }} />
                        <span className="stats-bar-text">{emp.ponctualite}%</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#888" }}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top retards */}
        <div className="stats-table-section">
          <h3 className="stats-section-title">
            <span style={{ color: "#ef4444" }}>●</span> Top 10 des plus en retard
          </h3>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employé</th>
                  <th>Département</th>
                  <th>Présences</th>
                  <th>Retards</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {topRetards?.length > 0 ? topRetards.map((emp, i) => (
                  <tr key={emp.id}>
                    <td>
                      <span className={`stats-rank ${i < 3 ? "stats-rank-worst" : ""}`}>{i + 1}</span>
                    </td>
                    <td><strong>{emp.prenom} {emp.nom}</strong><br /><small style={{ color: "#888" }}>{emp.matricule}</small></td>
                    <td>{emp.departement || "—"}</td>
                    <td>{emp.totalPresences}</td>
                    <td style={{ color: "#ef4444", fontWeight: 600 }}>{emp.arriveesEnRetard}</td>
                    <td>
                      <div className="stats-bar-wrap">
                        <div className="stats-bar" style={{ width: `${100 - emp.ponctualite}%`, background: "#ef4444" }} />
                        <span className="stats-bar-text">{100 - emp.ponctualite}%</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#888" }}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stats jour par jour */}
      <div className="stats-table-section" style={{ marginTop: 24 }}>
        <h3 className="stats-section-title">📅 Jour par jour</h3>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total</th>
                <th>À l'heure</th>
                <th>En retard</th>
                <th>Taux</th>
              </tr>
            </thead>
            <tbody>
              {statsParJour?.length > 0 ? statsParJour.map((jour) => (
                <tr key={jour.date}>
                  <td>{formatDate(jour.date)}</td>
                  <td><strong>{jour.total}</strong></td>
                  <td style={{ color: "#22c55e" }}>{jour.ponctuels}</td>
                  <td style={{ color: "#ef4444" }}>{jour.retards}</td>
                  <td>
                    <div className="stats-bar-wrap">
                      <div
                        className="stats-bar"
                        style={{
                          width: `${jour.total > 0 ? Math.round((jour.ponctuels / jour.total) * 100) : 0}%`,
                          background: "#3b82f6",
                        }}
                      />
                      <span className="stats-bar-text">
                        {jour.total > 0 ? Math.round((jour.ponctuels / jour.total) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#888" }}>Aucune donnée</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <button onClick={loadData} className="employes-btn employes-btn-primary" style={{ marginTop: 16, background: "#6c757d" }}>
          Actualiser
        </button>
      </div>
    </div>
  );
}

export default Stats;
