// ================================================================
// Page Dashboard - Tableau de bord
// ================================================================
// Affiche les statistiques du jour : nombre d'employes, presents,
// absents, retards, taux de presence, conges en attente.
// Les donnees viennent de l'API /api/dashboard/stats.
// ================================================================

import { useState, useEffect } from "react";
import dashboardService from "../../services/dashboardService";
import "./style.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await dashboardService.getStats();
      setStats(result.data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="page-title">Tableau de Bord</h1>
        <p className="page-description">
          Chargement des statistiques en cours...
        </p>
        <div style={{
          textAlign: "center",
          padding: "60px",
          color: "#888",
          fontSize: "18px"
        }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Tableau de Bord</h1>
        <p className="page-description">
          Bienvenue sur le tableau de bord.
        </p>
        <div className="dashboard-error" style={{
          background: "#f8d7da",
          color: "#721c24",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          marginBottom: "24px"
        }}>
          {error}
        </div>
        <button
          onClick={loadStats}
          className="employes-btn employes-btn-primary"
        >
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Tableau de Bord</h1>
      <p className="page-description">
        Resume des activites du jour
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Employes</h3>
          <p className="dashboard-number">{stats?.totalEmployes || 0}</p>
          <p className="dashboard-card-desc">Total des employes actifs</p>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Present(s)</h3>
          <p className="dashboard-number">{stats?.presentAujourdhui || 0}</p>
          <p className="dashboard-card-desc">Present(s) aujourd'hui</p>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Absent(s)</h3>
          <p className="dashboard-number">{stats?.absents || 0}</p>
          <p className="dashboard-card-desc">Absent(s) aujourd'hui</p>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Retard(s)</h3>
          <p className="dashboard-number">{stats?.retrards || 0}</p>
          <p className="dashboard-card-desc">En retard ce matin</p>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Taux presence</h3>
          <p className="dashboard-number">{stats?.presensTaux || 0}%</p>
          <p className="dashboard-card-desc">Taux de presence global</p>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Conges</h3>
          <p className="dashboard-number">{stats?.congesEnAttente || 0}</p>
          <p className="dashboard-card-desc">Demande(s) en attente</p>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={loadStats}
          className="employes-btn employes-btn-primary"
          style={{ background: "#6c757d" }}
        >
          Actualiser les donnees
        </button>
      </div>

      <div className="dashboard-recent">
        <h2 className="dashboard-recent-title">Activite recente</h2>
        <p className="dashboard-recent-empty">
          Les donnees sont mises a jour en temps reel.
          <br />
          <small>
            Total {stats?.totalEmployes || 0} employes,{" "}
            {stats?.presentAujourdhui || 0} presents,{" "}
            {stats?.absents || 0} absents,{" "}
            {stats?.congesEnAttente || 0} conges en attente
          </small>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
