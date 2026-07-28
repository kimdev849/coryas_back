// ================================================================
// 📊 Page Ponctualité — Design Premium Présencia
// ================================================================
// Affiche :
// - Hero header avec gradient + stats clés
// - Top 10 des employés les plus ponctuels / en retard
// - Stats jour par jour avec barres de progression
// - Filtre par période (semaine / mois / année)
// ================================================================

import { useState, useEffect } from "react";
import { RefreshCw, Clock, Award, AlertTriangle, TrendingUp, Users } from "lucide-react";
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

  const getRankClass = (index) => {
    if (index === 0) return "stats-rank-1";
    if (index === 1) return "stats-rank-2";
    if (index === 2) return "stats-rank-3";
    return "";
  };

  const getWorstRankClass = (index) => {
    if (index === 0) return "stats-rank-worst-1";
    if (index === 1) return "stats-rank-worst-2";
    if (index === 2) return "stats-rank-worst-3";
    return "";
  };

  // ==================== LOADING ====================
  if (isLoading) {
    return (
      <div className="stats-loading">
        <div className="stats-loading-spinner" />
        <p className="stats-loading-text">Calcul des statistiques de ponctualité...</p>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <div className="stats-error">
        <span className="stats-error-icon">⚠️</span>
        <h2 className="stats-error-title">Erreur de chargement</h2>
        <p className="stats-error-text">{error}</p>
        <button onClick={loadData} className="stats-error-btn">
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    );
  }

  const { statsGlobales, topPonctuels, topRetards, statsParJour, heureLimite, retardApres, heureOuverture } = data || {};

  return (
    <div>
      {/* ===== HERO HEADER ===== */}
      <div className="stats-hero">
        <div className="stats-hero-top">
          <div>
            <h1 className="stats-hero-title">
              <span className="stats-hero-title-icon">📊</span>
              Ponctualité
            </h1>
            <p className="stats-hero-subtitle">
              <Clock size={14} />
              Heure limite : <strong>{heureLimite}</strong>
              {retardApres > 0 && (
                <span> (ouverture {heureOuverture} + {retardApres} min)</span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={loadData} className="stats-refresh-btn" title="Actualiser">
              <RefreshCw size={14} />
              Actualiser
            </button>
            <div className="stats-hero-filter">
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
        </div>

        {/* Hero metrics */}
        <div className="stats-hero-metrics">
          <div className="stats-hero-metric">
            <div className="stats-hero-metric-icon" style={{ background: "rgba(34,197,94,0.2)" }}>
              <Award size={20} style={{ color: "#22c55e" }} />
            </div>
            <div>
              <div className="stats-hero-metric-value">{statsGlobales?.totalPonctuels || 0}</div>
              <div className="stats-hero-metric-label">Arrivées à l'heure</div>
            </div>
          </div>
          <div className="stats-hero-metric">
            <div className="stats-hero-metric-icon" style={{ background: "rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={20} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <div className="stats-hero-metric-value">{statsGlobales?.totalRetards || 0}</div>
              <div className="stats-hero-metric-label">Arrivées en retard</div>
            </div>
          </div>
          <div className="stats-hero-metric">
            <div className="stats-hero-metric-icon" style={{ background: "rgba(59,130,246,0.2)" }}>
              <TrendingUp size={20} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <div className="stats-hero-metric-value">{statsGlobales?.tauxPonctualite || 0}%</div>
              <div className="stats-hero-metric-label">Taux de ponctualité</div>
            </div>
          </div>
          <div className="stats-hero-metric">
            <div className="stats-hero-metric-icon" style={{ background: "rgba(139,92,246,0.2)" }}>
              <Users size={20} style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <div className="stats-hero-metric-value">{statsGlobales?.totalPresences || 0}</div>
              <div className="stats-hero-metric-label">Total présences</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOP PONCTUELS + TOP RETARDS ===== */}
      <div className="stats-columns">
        {/* TOP PONCTUELS */}
        <div className="stats-table-card">
          <div className="stats-table-card-header">
            <div className="stats-table-card-icon" style={{ background: "#dcfce7" }}>
              🟢
            </div>
            <span className="stats-table-card-title">Top 10 des plus ponctuels</span>
            <span className="stats-table-card-count">{topPonctuels?.length || 0}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employé</th>
                  <th>Département</th>
                  <th style={{ textAlign: "center" }}>Présences</th>
                  <th style={{ textAlign: "center" }}>À l'heure</th>
                  <th style={{ textAlign: "right" }}>%</th>
                </tr>
              </thead>
              <tbody>
                {topPonctuels?.length > 0 ? (
                  topPonctuels.map((emp, i) => (
                    <tr key={emp.id}>
                      <td>
                        <span className={`stats-rank ${getRankClass(i)}`}>{i + 1}</span>
                      </td>
                      <td>
                        <div className="stats-employe-cell">
                          <span className="stats-employe-name">{emp.prenom} {emp.nom}</span>
                          <span className="stats-employe-matricule">{emp.matricule}</span>
                        </div>
                      </td>
                      <td><span className="stats-dept-badge">{emp.departement || "—"}</span></td>
                      <td style={{ textAlign: "center" }}><span className="stats-num-bold">{emp.totalPresences}</span></td>
                      <td style={{ textAlign: "center" }}><span className="stats-num-green">{emp.arriveesALHeure}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div className="stats-bar-wrap" style={{ justifyContent: "flex-end" }}>
                          <div className="stats-bar stats-bar-green" style={{ width: `${emp.ponctualite}%` }} />
                          <span className="stats-bar-text stats-bar-text-green">{emp.ponctualite}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="stats-empty">
                      <span className="stats-empty-icon">📭</span>
                      <p className="stats-empty-text">Aucune donnée de ponctualité pour cette période</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP RETARDS */}
        <div className="stats-table-card">
          <div className="stats-table-card-header">
            <div className="stats-table-card-icon" style={{ background: "#fee2e2" }}>
              🔴
            </div>
            <span className="stats-table-card-title">Top 10 des plus en retard</span>
            <span className="stats-table-card-count">{topRetards?.length || 0}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employé</th>
                  <th>Département</th>
                  <th style={{ textAlign: "center" }}>Présences</th>
                  <th style={{ textAlign: "center" }}>Retards</th>
                  <th style={{ textAlign: "right" }}>%</th>
                </tr>
              </thead>
              <tbody>
                {topRetards?.length > 0 ? (
                  topRetards.map((emp, i) => (
                    <tr key={emp.id}>
                      <td>
                        <span className={`stats-rank ${getWorstRankClass(i)}`}>{i + 1}</span>
                      </td>
                      <td>
                        <div className="stats-employe-cell">
                          <span className="stats-employe-name">{emp.prenom} {emp.nom}</span>
                          <span className="stats-employe-matricule">{emp.matricule}</span>
                        </div>
                      </td>
                      <td><span className="stats-dept-badge">{emp.departement || "—"}</span></td>
                      <td style={{ textAlign: "center" }}><span className="stats-num-bold">{emp.totalPresences}</span></td>
                      <td style={{ textAlign: "center" }}><span className="stats-num-red">{emp.arriveesEnRetard}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div className="stats-bar-wrap" style={{ justifyContent: "flex-end" }}>
                          <div className="stats-bar stats-bar-red" style={{ width: `${100 - emp.ponctualite}%` }} />
                          <span className="stats-bar-text stats-bar-text-red">{100 - emp.ponctualite}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="stats-empty">
                      <span className="stats-empty-icon">🎉</span>
                      <p className="stats-empty-text">Aucun retard enregistré ! Félicitations !</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== STATS JOUR PAR JOUR ===== */}
      <div className="stats-daily-section">
        <div className="stats-daily-header">
          <div className="stats-daily-icon">
            📅
          </div>
          <span className="stats-daily-title">Jour par jour</span>
          <span className="stats-daily-subtitle">
            {statsParJour?.length || 0} jour(s) analysé(s)
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ textAlign: "center" }}>Total</th>
                <th style={{ textAlign: "center" }}>À l'heure</th>
                <th style={{ textAlign: "center" }}>En retard</th>
                <th style={{ textAlign: "right", minWidth: 160 }}>Taux</th>
              </tr>
            </thead>
            <tbody>
              {statsParJour?.length > 0 ? (
                statsParJour.map((jour) => {
                  const taux = jour.total > 0 ? Math.round((jour.ponctuels / jour.total) * 100) : 0;
                  return (
                    <tr key={jour.date}>
                      <td className="stats-date-cell">
                        {formatDate(jour.date)}
                      </td>
                      <td style={{ textAlign: "center" }}><span className="stats-num-bold">{jour.total}</span></td>
                      <td style={{ textAlign: "center" }}><span className="stats-num-green">{jour.ponctuels}</span></td>
                      <td style={{ textAlign: "center" }}><span className="stats-num-red">{jour.retards}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div className="stats-bar-wrap" style={{ justifyContent: "flex-end" }}>
                          <div className="stats-bar stats-bar-blue" style={{ width: `${taux}%` }} />
                          <span className="stats-bar-text">{taux}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="stats-empty">
                    <span className="stats-empty-icon">📭</span>
                    <p className="stats-empty-text">Aucune donnée journalière pour cette période</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Stats;
