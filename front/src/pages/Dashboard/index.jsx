// ================================================================
// Page Dashboard - Tableau de bord Présencia PREMIUM
// ================================================================
// Vue employé : statut, pointage, actions rapides, timeline, stats
// Vue admin/RH : statistiques globales, activités récentes, top employés
// Design moderne premium avec icônes Lucide React
// ================================================================

import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import dashboardService from "../../services/dashboardService";
import presencesService from "../../services/presencesService";
import {
  Users, UserCheck, UserX, Clock, CalendarCheck, AlertTriangle,
  LogIn, LogOut, Bell, ArrowRight, RefreshCw, BarChart3, Award,
  TrendingUp, TrendingDown, Activity, Calendar, CheckCircle2,
  XCircle, Clock4, Moon, Sun, MapPin, Mail, Phone, Building2,
  ChevronRight, Sparkles
} from "lucide-react";
import "./style.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // SuperAdmin → rediriger vers /super-admin
  if (user?.role === "SuperAdmin") {
    return <Navigate to="/super-admin" replace />;
  }
  
  const isEmploye = user?.role === "Employé";
  const isAdmin = !isEmploye;

  const [stats, setStats] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [activePresence, setActivePresence] = useState(null);
  const [todayPresences, setTodayPresences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const greeting = hour >= 18 ? "Bonsoir" : hour >= 12 ? "Bon après-midi" : "Bonjour";
  const greetingEmoji = hour >= 18 ? "🌙" : hour >= 12 ? "☀️" : "🌅";

  useEffect(() => {
    if (isEmploye) {
      loadEmployeData();
    } else {
      loadAdminData();
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

  const loadAdminData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // On lance les deux appels en parallèle mais on les gère séparément
      // pour qu'un échec de l'un ne bloque pas l'autre
      const [statsRes, todayStatsRes] = await Promise.allSettled([
        dashboardService.getStats(),
        presencesService.getTodayStats(),
      ]);
      
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      } else {
        console.warn("⚠️ Dashboard stats échoué:", statsRes.reason?.message);
        setStats(null);
      }
      
      if (todayStatsRes.status === "fulfilled") {
        setTodayStats(todayStatsRes.value.data);
      } else {
        console.warn("⚠️ TodayStats échoué:", todayStatsRes.reason?.message);
        setTodayStats(null);
      }

      // Si les DEUX ont échoué, on affiche une erreur
      if (statsRes.status === "rejected" && todayStatsRes.status === "rejected") {
        setError(statsRes.reason?.message || "Erreur de chargement des données");
      }
    } catch (err) {
      setError(err.message || "Erreur de chargement");
    } finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="dash">
        <div className="dash-loading">
          <div className="dash-spinner" />
          <p className="dash-loading-text">Chargement de votre tableau de bord...</p>
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

    const entryTime = activePresence?.heure_entree
      || todayPresences[0]?.heure_entree
      || "--:--";
    const exitTime = todayPresences[0]?.heure_sortie || "--:--";

    return (
      <div className="dash">
        {/* Hero Header */}
        <div className="dash-hero">
          <div className="dash-hero-content">
            <div className="dash-hero-greeting">
              <span className="dash-hero-emoji">{greetingEmoji}</span>
              <div>
                <h1 className="dash-title">
                  {greeting}, <span className="dash-title-highlight">{user?.prenom || "Utilisateur"}</span>
                </h1>
                <p className="dash-date">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className={`dash-badge dash-badge-${status}`}>
              <span className="dash-badge-dot" />
              {hasActivePresence ? "Présent" : hasCheckedOut ? "Départ enregistré" : "Absent"}
            </div>
          </div>
        </div>

        {/* Status Card Premium */}
        <div className="dash-status-card">
          <div className={`dash-status-glow dash-status-glow-${status}`} />
          <div className="dash-status-info">
            <div className={`dash-status-icon dash-status-icon-${status}`}>
              {hasActivePresence ? <UserCheck size={28} /> : hasCheckedOut ? <Clock4 size={28} /> : <XCircle size={28} />}
            </div>
            <div className="dash-status-details">
              <p className="dash-status-label">Statut du jour</p>
              <p className="dash-status-value">
                {hasActivePresence ? "Vous êtes en service" : hasCheckedOut ? "Journée terminée ✓" : "Pas encore pointé"}
              </p>
              <div className="dash-status-times">
                <div className="dash-time-chip">
                  <LogIn size={14} />
                  <span>Arrivée : {entryTime}</span>
                </div>
                {(hasActivePresence || hasCheckedOut) && (
                  <div className="dash-time-chip">
                    <LogOut size={14} />
                    <span>Départ : {hasActivePresence ? "---" : exitTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="dash-quick-stats">
          <div className="dash-qs-card">
            <Calendar size={18} />
            <div>
              <span className="dash-qs-value">{todayPresences.length}</span>
              <span className="dash-qs-label">Pointages</span>
            </div>
          </div>
          <div className="dash-qs-card">
            <Clock size={18} />
            <div>
              <span className="dash-qs-value">
                {hasActivePresence ? entryTime : "---"}
              </span>
              <span className="dash-qs-label">Arrivée</span>
            </div>
          </div>
          <div className="dash-qs-card">
            <Award size={18} />
            <div>
              <span className="dash-qs-value" style={{ color: "var(--color-success)" }}>
                {hasActivePresence ? "En cours" : hasCheckedOut ? "Terminé" : "---"}
              </span>
              <span className="dash-qs-label">Statut</span>
            </div>
          </div>
        </div>

        {/* Actions Premium */}
        <div className="dash-actions-section">
          <h3 className="dash-section-title">Actions rapides</h3>
          <div className="dash-actions">
            <Link to="/mon-pointage" className={`dash-action-btn ${hasActivePresence ? "dash-action-danger" : "dash-action-primary"}`}>
              <div className="dash-action-icon">
                {hasActivePresence ? <LogOut size={22} /> : <LogIn size={22} />}
              </div>
              <div className="dash-action-text">
                <strong>{hasActivePresence ? "Pointer le départ" : "Pointer l'arrivée"}</strong>
                <span>{hasActivePresence ? "Terminer votre journée" : "Commencer votre journée"}</span>
              </div>
              <ChevronRight size={18} className="dash-action-arrow" />
            </Link>
            <Link to="/conges" className="dash-action-btn dash-action-secondary">
              <div className="dash-action-icon">
                <CalendarCheck size={22} />
              </div>
              <div className="dash-action-text">
                <strong>Demander un congé</strong>
                <span>Soumettre une demande d'absence</span>
              </div>
              <ChevronRight size={18} className="dash-action-arrow" />
            </Link>
            <Link to="/heures-sup" className="dash-action-btn dash-action-secondary">
              <div className="dash-action-icon">
                <Clock size={22} />
              </div>
              <div className="dash-action-text">
                <strong>Heures supplémentaires</strong>
                <span>Déclarer des heures sup</span>
              </div>
              <ChevronRight size={18} className="dash-action-arrow" />
            </Link>
          </div>
        </div>

        {/* Timeline */}
        {todayPresences.length > 0 && (
          <div className="dash-timeline">
            <h3 className="dash-section-title">
              <Activity size={18} />
              Aujourd'hui
            </h3>
            <div className="dash-timeline-list">
              {todayPresences.map((p, i) => (
                <div key={p.id || i} className="dash-timeline-item">
                  <div className="dash-timeline-track">
                    <div className={`dash-timeline-dot ${p.heure_sortie ? "dash-timeline-dot-complete" : "dash-timeline-dot-active"}`} />
                    <div className="dash-timeline-line" />
                  </div>
                  <div className="dash-timeline-content">
                    <div className="dash-timeline-entry">
                      <span className="dash-timeline-label">Arrivée</span>
                      <span className="dash-timeline-time">
                        <LogIn size={14} />
                        {p.heure_entree || "--:--"}
                      </span>
                    </div>
                    {p.heure_sortie && (
                      <div className="dash-timeline-entry">
                        <span className="dash-timeline-label">Départ</span>
                        <span className="dash-timeline-time dash-timeline-time-out">
                          <LogOut size={14} />
                          {p.heure_sortie}
                        </span>
                      </div>
                    )}
                    {!p.heure_sortie && (
                      <div className="dash-timeline-progress">
                        <div className="dash-timeline-progress-bar" />
                        <span>En cours</span>
                      </div>
                    )}
                  </div>
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
        <div className="dash-error-state">
          <AlertTriangle size={48} />
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button onClick={loadAdminData} className="btn btn-primary">
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Building2, label: "Total Employés", value: stats?.totalEmployes || 0, color: "#2563EB", bg: "#EFF6FF", change: "Effectif total" },
    { icon: UserCheck, label: "Présents", value: stats?.presentAujourdhui || todayStats?.presents || 0, color: "#059669", bg: "#D1FAE5", change: `${Math.round((stats?.presentAujourdhui || 0) / (stats?.totalEmployes || 1) * 100)}% du personnel` },
    { icon: UserX, label: "Absents", value: stats?.absents || 0, color: "#DC2626", bg: "#FEE2E2", change: "Aujourd'hui" },
    { icon: Clock, label: "Retards", value: stats?.retards || 0, color: "#D97706", bg: "#FEF3C7", change: "Aujourd'hui" },
    { icon: TrendingUp, label: "Taux de présence", value: `${stats?.tauxPresence || 0}%`, color: "#7C3AED", bg: "#EDE9FE", change: "Objectif : 95%" },
    { icon: AlertTriangle, label: "Congés en attente", value: stats?.congesEnAttente || 0, color: "#2563EB", bg: "#DBEAFE", change: "À valider" },
    { icon: Award, label: "Taux de présence", value: `${todayStats?.tauxPresence || stats?.tauxPresence || 0}%`, color: "#0891B2", bg: "#CFFAFE", change: "Aujourd'hui" },
    { icon: TrendingDown, label: "En cours", value: todayStats?.enCours || 0, color: "#EA580C", bg: "#FED7AA", change: "Encore au travail" },
  ];

  return (
    <div className="dash">
      {/* Hero Header Admin */}
      <div className="dash-admin-hero">
        <div className="dash-admin-hero-content">
          <div>
            <h1 className="dash-title">
              Tableau de bord <Sparkles size={20} className="dash-sparkle-icon" />
            </h1>
            <p className="dash-date">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <div className="dash-hero-actions">
            <button onClick={loadAdminData} className="btn btn-secondary btn-sm" title="Actualiser">
              <RefreshCw size={16} />
              <span>Actualiser</span>
            </button>
            <Link to="/employes" className="btn btn-primary btn-sm">
              <Users size={16} />
              <span>Gérer</span>
            </Link>
          </div>
        </div>
        <div className="dash-admin-hero-stats">
          <div className="dash-hero-stat">
            <span className="dash-hero-stat-value">{stats?.totalEmployes || 0}</span>
            <span className="dash-hero-stat-label">Employés</span>
          </div>
          <div className="dash-hero-divider" />
          <div className="dash-hero-stat">
            <span className="dash-hero-stat-value" style={{ color: "var(--color-success)" }}>{stats?.presentAujourdhui || todayStats?.presents || 0}</span>
            <span className="dash-hero-stat-label">Présents</span>
          </div>
          <div className="dash-hero-divider" />
          <div className="dash-hero-stat">
            <span className="dash-hero-stat-value" style={{ color: "var(--color-warning)" }}>{stats?.retards || 0}</span>
            <span className="dash-hero-stat-label">Retards</span>
          </div>
          <div className="dash-hero-divider" />
          <div className="dash-hero-stat">
            <span className="dash-hero-stat-value" style={{ color: "var(--color-error)" }}>{stats?.absents || 0}</span>
            <span className="dash-hero-stat-label">Absents</span>
          </div>
        </div>
      </div>

      {/* Stats Grid Premium */}
      <div className="dash-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="dash-stat-card">
            <div className="dash-stat-card-top">
              <div className="dash-stat-icon" style={{ background: card.bg, color: card.color }}>
                <card.icon size={22} />
              </div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{card.value}</span>
                <span className="dash-stat-label">{card.label}</span>
              </div>
            </div>
            <div className="dash-stat-card-bottom">
              <span className="dash-stat-change">{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dash-admin-actions">
        <h3 className="dash-section-title">Actions rapides</h3>
        <div className="dash-actions-grid">
          <Link to="/presences" className="dash-quick-action">
            <Clock size={20} />
            <span>Gérer les présences</span>
            <ChevronRight size={16} />
          </Link>
          <Link to="/conges" className="dash-quick-action">
            <CalendarCheck size={20} />
            <span>Gérer les congés</span>
            <ChevronRight size={16} />
          </Link>
          <Link to="/employes" className="dash-quick-action">
            <Users size={20} />
            <span>Gérer les employés</span>
            <ChevronRight size={16} />
          </Link>
          <Link to="/stats" className="dash-quick-action">
            <BarChart3 size={20} />
            <span>Voir les statistiques</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
