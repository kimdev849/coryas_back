// ================================================================
// SuperAdmin - Dashboard de gestion des entreprises Présencia
// ================================================================
// Visible uniquement par les SuperAdmin.
// Permet de voir toutes les entreprises, leurs stats,
// de créer des entreprises et de gérer les abonnements.
// ================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import entreprisesService from "../../services/entreprisesService";
import plansService from "../../services/plansService";
import "./style.css";

function SuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ nom: "", email: "", telephone: "", ville: "", plan_id: "" });

  const isSuperAdmin = user?.role === "SuperAdmin";

  useEffect(() => {
    if (!isSuperAdmin) { navigate("/dashboard"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, entreprisesRes, plansRes] = await Promise.all([
        entreprisesService.getStats(),
        entreprisesService.getAll(),
        plansService.getAll(),
      ]);
      // Les services renvoient { message, data } - on extrait .data
      setStats(statsRes?.data || statsRes);
      setEntreprises(entreprisesRes?.data || entreprisesRes || []);
      setPlans(plansRes?.data || plansRes || []);
    } catch (err) {
      console.error("Erreur chargement SuperAdmin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await entreprisesService.create(formData);
      setShowCreate(false);
      setFormData({ nom: "", email: "", telephone: "", ville: "", plan_id: "" });
      loadData();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const getStatusBadge = (statut) => {
    if (statut === "actif") return <span className="badge badge-success">Actif</span>;
    if (statut === "inactif") return <span className="badge badge-error">Inactif</span>;
    if (statut === "en_attente") return <span className="badge badge-warning">En attente</span>;
    return <span className="badge">{statut}</span>;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="loading-spinner-text">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="superadmin">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Super Admin</h1>
          <p className="page-description">Gestion centralisée de toutes les entreprises Présencia</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Nouvelle entreprise
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="superadmin-stats">
        <div className="superadmin-stat-card">
          <div className="superadmin-stat-icon">🏢</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{stats?.total_entreprises || 0}</span>
            <span className="superadmin-stat-label">Entreprises</span>
          </div>
        </div>
        <div className="superadmin-stat-card">
          <div className="superadmin-stat-icon">👥</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{stats?.total_employes || 0}</span>
            <span className="superadmin-stat-label">Employés</span>
          </div>
        </div>
        <div className="superadmin-stat-card superadmin-stat-active">
          <div className="superadmin-stat-icon">✅</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{stats?.entreprises_actives || 0}</span>
            <span className="superadmin-stat-label">Actives</span>
          </div>
        </div>
        <div className="superadmin-stat-card superadmin-stat-waiting">
          <div className="superadmin-stat-icon">⏳</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{stats?.en_attente || 0}</span>
            <span className="superadmin-stat-label">En attente</span>
          </div>
        </div>
      </div>

      {/* Companies table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Employés</th>
              <th>Statut</th>
              <th>Créée le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entreprises.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  Aucune entreprise pour le moment. Créez la première !
                </td>
              </tr>
            ) : (
              entreprises.map((ent) => (
                <tr key={ent.id}>
                  <td><strong>{ent.nom}</strong></td>
                  <td>{ent.email || "—"}</td>
                  <td>{ent.plan_nom || "—"}</td>
                  <td>{ent.nb_employes || 0}</td>
                  <td>{getStatusBadge(ent.statut)}</td>
                  <td>{ent.created_at ? new Date(ent.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigate(`/super-admin/entreprise/${ent.id}`)}
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Créer une entreprise</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nom de l'entreprise *</label>
                <input
                  type="text" className="form-input" required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="SARL Congo Tech"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email" className="form-input" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@entreprise.cg"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel" className="form-input"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+242 06 000 0000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ville</label>
                  <input
                    type="text" className="form-input"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    placeholder="Brazzaville"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Plan</label>
                <select
                  className="form-select"
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                >
                  <option value="">Sélectionner un plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }}>
                Créer l'entreprise
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdmin;
