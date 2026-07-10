// ================================================================
// Page Dashboard - Tableau de bord
// ================================================================
// Affiche les statistiques du jour : nombre d'employes, presents,
// absents, retards, taux de presence, conges en attente.
// Les donnees viennent de l'API /api/dashboard/stats.
// ================================================================

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import dashboardService from "../../services/dashboardService";
import presencesService from "../../services/presencesService";
import "./style.css";

function Dashboard() {
  const { user } = useAuth();
  const isEmploye = user?.role === "Employé";

  const [stats, setStats] = useState(null);
  const [activePresence, setActivePresence] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEmploye) {
      loadEmployeData();
    } else {
      loadStats();
    }
  }, []);

  const loadEmployeData = async () => {
    setIsLoading(true);
    try {
      const [presenceRes] = await Promise.all([
        presencesService.getActivePresence(user.employe_id),
      ]);
      setActivePresence(presenceRes.data || null);
    } catch {
      // silencieux
    } finally {
      setIsLoading(false);
    }
  };

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
        <div style={{
          textAlign: "center", padding: "60px", color: "#888", fontSize: "18px"
        }}>
          Chargement...
        </div>
      </div>
    );
  }

  // ======================= VUE EMPLOYÉ =======================
  if (isEmploye) {
    return (
      <div>
        <h1 className="page-title">
          Bonjour, {user?.prenom || "Utilisateur"}
        </h1>
        <p className="page-description">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">Statut</h3>
            <p className="dashboard-number" style={{ color: activePresence ? "#22c55e" : "#808080" }}>
              {activePresence ? "Présent" : "Absent"}
            </p>
            {activePresence && (
              <p className="dashboard-card-desc">Arrivé à {activePresence.heure_entree}</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3 className="dashboard-card-title">Rôle</h3>
            <p className="dashboard-number" style={{ fontSize: 20 }}>{user?.role || "-"}</p>
            <p className="dashboard-card-desc">{user?.email || ""}</p>
          </div>
        </div>

        <div className="dashboard-recent">
          <h2 className="dashboard-recent-title">Actions rapides</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <a href="/mon-pointage" className="employes-btn employes-btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
              {activePresence ? "Pointer le départ" : "Pointer l'arrivée"}
            </a>
            <a href="/conges" className="employes-btn employes-btn-primary" style={{ textDecoration: "none", display: "inline-block", background: "#6c757d" }}>
              Demander un congé
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ======================= VUE ADMIN / RH =======================
  if (error) {
    return (
      <div>
        <h1 className="page-title">Tableau de Bord</h1>
        <div className="dashboard-error" style={{
          background: "#f8d7da", color: "#721c24", padding: "20px",
          borderRadius: "12px", textAlign: "center", marginBottom: "24px"
        }}>
          {error}
        </div>
        <button onClick={loadStats} className="employes-btn employes-btn-primary">
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Tableau de Bord</h1>
      <p className="page-description">Résumé des activités du jour</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Employés</h3>
          <p className="dashboard-number">{stats?.totalEmployes || 0}</p>
          <p className="dashboard-card-desc">Total des employés actifs</p>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Présent(s)</h3>
          <p className="dashboard-number">{stats?.presentAujourdhui || 0}</p>
          <p className="dashboard-card-desc">Présent(s) aujourd'hui</p>
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
          <h3 className="dashboard-card-title">Taux présence</h3>
          <p className="dashboard-number">{stats?.presensTaux || 0}%</p>
          <p className="dashboard-card-desc">Taux de présence global</p>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Congés</h3>
          <p className="dashboard-number">{stats?.congesEnAttente || 0}</p>
          <p className="dashboard-card-desc">Demande(s) en attente</p>
        </div>
      </div>

      <div>
        <button onClick={loadStats} className="employes-btn employes-btn-primary" style={{ background: "#6c757d" }}>
          Actualiser les données
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
