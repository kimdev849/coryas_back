// ================================================================
// Page Dashboard - Tableau de bord Présencia
// ================================================================
// Vue employé : statut, pointage, actions rapides
// Vue admin/RH : statistiques globales
// Design moderne avec icônes Lucide React
// ================================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import dashboardService from "../../services/dashboardService";
import presencesService from "../../services/presencesService";
import {
  Users, UserCheck, UserX, Clock, CalendarCheck, AlertTriangle,
  LogIn, LogOut, Bell, ArrowRight, RefreshCw, BarChart3
} from "lucide-react";
import "./style.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmploye = user?.role === "Employé";
  const isAdmin = !isEmploye;

  const [stats, setStats] = useState(null);
  const [activePresence, setActivePresence] = useState(null);
  const [todayPresences, setTodayPresences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const greeting = new Date().getHours() >= 18 ? "Bonsoir" : "Bonjour";

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
      const [presenceRes, todayRes] = await Promise.all([
        presencesService.getActivePresence(user?.employe_id),
        presencesService.getAll({ employe_id: user?.employe_id, date_debut: todayStr, date_fin: todayStr }),
      ]);
      setActivePresence(presenceRes.data || null);
      setTodayPresences(todayRes.data || []);
    } catch { /* silent */ }
      finally { setIsLoading(false); }
  };

  const loadStats = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await dashboardService.getStats();
      setStats(result.data);
    } catch (err) {
      setError(err.message || "Erreur de chargement");
    } finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="dash">
        <div className="dash-loading">
          <div className="dash-spinner" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // ============================ VUE EMPLOYÉ ============================
  if (isEmploye) {
    const hasActivePresence = !!activePresence;
    const hasCheckedOut = !hasActivePresence && todayPresences.length > 0;
    const status = hasActivePresence ? "present"
      : hasCheckedOut ? "depart" : "absent";

    return (
      <div className="dash">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">
              {greeting}, {user?.prenom || "Utilisateur"}
            </h1>
            <p className="dash-date">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <div className={`dash-badge dash-badge-${status}`}>
            <span className="dash-badge-dot" />
            {hasActivePresence ? "Présent" : hasCheckedOut ? "Départ enregistré" : "Absent"}
          </div>
        </div>

        {/* Statut card */}
        <div className="dash-status-card">
          <div className="dash-status-info">
            <div className={`dash-status-icon dash-status-icon-${status}`}>
              {hasActivePresence ? <UserCheck size={28} /> : hasCheckedOut ? <Clock size={28} /> : <UserX size={28} />}
            </div>
            <div>
              <p className="dash-status-label">Statut</p>
              <p className="dash-status-value">
                {hasActivePresence ? "Vous êtes présent" : hasCheckedOut ? "Journée terminée" : "Pas encore pointé"}
              </p>
              {hasActivePresence && (
                <p className="dash-status-time">Arrivée à {activePresence.heure_entree}</p>
              )}
              {hasCheckedOut && (
                <p className="dash-status-time">
                  {todayPresences[0]?.heure_entree} → {todayPresences[0]?.heure_sortie}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="dash-actions">
          <Link to="/mon-pointage" className="dash-action-btn dash-action-primary">
            {hasActivePresence ? <LogOut size={20} /> : <LogIn size={20} />}
            <span>{hasActivePresence ? "Pointer le départ" : "Pointer l'arrivée"}</span>
          </Link>
          <Link to="/conges" className="dash-action-btn dash-action-secondary">
            <CalendarCheck size={20} />
            <span>Demander un congé</span>
          </Link>
        </div>

        {/* Timeline */}
        {todayPresences.length > 0 && (
          <div className="dash-timeline">
            <h3 className="dash-section-title">Aujourd'hui</h3>
            <div className="dash-timeline-list">
              {todayPresences.map((p, i) => (
                <div key={p.id || i} className="dash-timeline-item">
                  <div className="dash-timeline-dot" />
                  <div className="dash-timeline-line" />
                  <div className="dash-timeline-content">
                    <span className="dash-timeline-label">Arrivée</span>
                    <span className="dash-timeline-time">{p.heure_entree || "--:--"}</span>
                  </div>
                  {p.heure_sortie && (
                    <>
                      <div className="dash-timeline-dot dash-timeline-dot-out" />
                      <div className="dash-timeline-content" style={{ marginLeft: 0 }}>
                        <span className="dash-timeline-label">Départ</span>
                        <span className="dash-timeline-time">{p.heure_sortie}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================ VUE ADMIN / RH ============================
  if (error) {
    return (
      <div className="dash">
        <h1 className="dash-title">Tableau de bord</h1>
        <div className="dash-error">
          {error}
        </div>
        <button onClick={loadStats} className="dash-btn dash-btn-secondary">
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Employés", value: stats?.totalEmployes || 0, color: "#2563EB" },
    { icon: UserCheck, label: "Présents", value: stats?.presents || 0, color: "#059669" },
    { icon: UserX, label: "Absents", value: stats?.absents || 0, color: "#DC2626" },
    { icon: Clock, label: "Retards", value: stats?.retards || 0, color: "#D97706" },
    { icon: BarChart3, label: "Taux présence", value: `${stats?.tauxPresence || 0}%`, color: "#7C3AED" },
    { icon: AlertTriangle, label: "Congés en attente", value: stats?.congesEnAttente || 0, color: "#2563EB" },
  ];

  return (
    <div className="dash">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Tableau de bord</h1>
          <p className="dash-date">Résumé du jour</p>
        </div>
        <button onClick={loadStats} className="dash-btn dash-btn-secondary dash-btn-sm" title="Actualiser">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="dash-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-value">{card.value}</span>
              <span className="dash-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
