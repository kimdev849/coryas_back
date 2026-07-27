// ================================================================
// EntrepriseDetail - Détails d'une entreprise (SuperAdmin)
// ================================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import entreprisesService from "../../services/entreprisesService";
import { Building2, Mail, Phone, MapPin, Users, Calendar, CheckCircle2, XCircle, Globe, ChevronLeft } from "lucide-react";

function EntrepriseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entreprise, setEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadEntreprise = async () => {
    setLoading(true);
    try {
      const res = await entreprisesService.getById(id);
      setEntreprise(res?.data || res);
    } catch (err) {
      setMessage("Erreur: " + (err.message || ""));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadEntreprise();
  }, [id]);

  const toggleActivation = async () => {
    if (!entreprise) return;
    const newStatus = !entreprise.actif;
    const action = newStatus ? "activée" : "désactivée";
    const confirmMsg = entreprise.actif
      ? `⚠️ Désactiver "${entreprise.nom}" ?\n\nLes employés de cette entreprise ne pourront plus se connecter tant que l'entreprise est désactivée.`
      : `✅ Activer "${entreprise.nom}" ?\n\nLes employés pourront à nouveau se connecter.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await entreprisesService.update(id, { actif: newStatus });
      setMessage(`✅ Entreprise ${action} avec succès !`);
      loadEntreprise();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setMessage("❌ Erreur: " + (err.message || ""));
    }
  };

  if (loading) {
    return (
      <div className="superadmin">
        <div className="loading-spinner">
          <div className="loading-spinner-text">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!entreprise && !loading) {
    return (
      <div className="superadmin">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate("/super-admin")}>
            <ChevronLeft size={16} /> Retour
          </button>
        </div>
        <div className="empty-state">
          <span className="empty-state-icon">🏢</span>
          <h3 className="empty-state-title">Entreprise introuvable</h3>
          <p className="empty-state-text">Cette entreprise n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  const isActive = entreprise.actif === true || entreprise.actif === "true";

  return (
    <div className="superadmin">
      {/* Message */}
      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: 600,
          background: message.includes("✅") || message.includes("activée") ? "#d4edda" : "#f8d7da",
          color: message.includes("✅") || message.includes("activée") ? "#155724" : "#721c24",
          fontSize: 14, display: "flex", alignItems: "center", gap: 8
        }}>
          {message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/super-admin")}>
            <ChevronLeft size={16} /> Retour
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: 22 }}>
              {entreprise.nom || "Entreprise"}
            </h1>
            <p className="page-description" style={{ marginBottom: 0 }}>
              {entreprise.email || "—"} {entreprise.ville ? `• ${entreprise.ville}` : ""}
            </p>
          </div>
        </div>
        <button
          className={`btn ${isActive ? "btn-danger" : "btn-success"}`}
          onClick={toggleActivation}
        >
          {isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {isActive ? "Désactiver" : "Activer"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="superadmin-stats">
        <div className="superadmin-stat-card">
          <div className="superadmin-stat-icon">👥</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{entreprise.nb_employes_total || 0}</span>
            <span className="superadmin-stat-label">Employés total</span>
          </div>
        </div>
        <div className="superadmin-stat-card superadmin-stat-active">
          <div className="superadmin-stat-icon">✅</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{entreprise.nb_employes_actifs || 0}</span>
            <span className="superadmin-stat-label">Employés actifs</span>
          </div>
        </div>
        <div className="superadmin-stat-card">
          <div className="superadmin-stat-icon">📋</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{entreprise.plan_nom || "—"}</span>
            <span className="superadmin-stat-label">Plan</span>
          </div>
        </div>
        <div className={`superadmin-stat-card ${isActive ? "superadmin-stat-active" : ""}`}>
          <div className="superadmin-stat-icon">{isActive ? "🟢" : "🔴"}</div>
          <div className="superadmin-stat-info">
            <span className="superadmin-stat-number">{isActive ? "Actif" : "Inactif"}</span>
            <span className="superadmin-stat-label">Statut</span>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="table-container" style={{ marginTop: 20 }}>
        <div style={{ padding: "20px 24px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Building2 size={18} /> Informations générales
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {[
              { icon: Building2, label: "Nom", value: entreprise.nom },
              { icon: Mail, label: "Email", value: entreprise.email },
              { icon: Phone, label: "Téléphone", value: entreprise.telephone || "—" },
              { icon: MapPin, label: "Ville", value: entreprise.ville || "—" },
              { icon: Globe, label: "Pays", value: entreprise.pays || "Congo" },
              { icon: Users, label: "Max employés", value: entreprise.nb_employes_max || 10 },
              { icon: Calendar, label: "Créée le", value: entreprise.created_at ? new Date(entreprise.created_at).toLocaleDateString("fr-FR") : "—" },
              { icon: Calendar, label: "Dernière màj", value: entreprise.updated_at ? new Date(entreprise.updated_at).toLocaleDateString("fr-FR") : "—" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", background: "#F9FAFB", borderRadius: 10,
                border: "1px solid #F3F4F6"
              }}>
                <item.icon size={18} style={{ color: "#2563EB", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>
                    {item.value || "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status warning */}
      {!isActive && (
        <div style={{
          marginTop: 20, padding: "16px 20px", borderRadius: 12,
          background: "#FEF2F2", border: "1px solid #FECACA",
          display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14
        }}>
          <XCircle size={20} style={{ color: "#DC2626", flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: "#991B1B" }}>Entreprise désactivée</strong>
            <p style={{ color: "#7F1D1D", margin: "4px 0 0", fontSize: 13 }}>
              Les employés de cette entreprise ne peuvent pas se connecter tant que vous ne la réactivez pas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntrepriseDetail;
