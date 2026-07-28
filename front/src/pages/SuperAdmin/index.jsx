import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import entreprisesService from "../../services/entreprisesService";
import plansService from "../../services/plansService";
import {
  Building2, Mail, Phone, MapPin, Users, Calendar, CheckCircle2,
  XCircle, Globe, ChevronRight, Plus, Search, Filter,
  Clock, AlertCircle, CheckCheck, ArrowUpRight, Download, Eye,
  ChevronDown, ChevronUp, Sparkles, Activity
} from "lucide-react";
import "./style.css";

function SuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [formData, setFormData] = useState({ nom: "", email: "", telephone: "", ville: "", plan_id: "" });
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptPlan, setAcceptPlan] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [demandesOpen, setDemandesOpen] = useState(true);

  const isSuperAdmin = user?.role === "SuperAdmin";

  useEffect(() => {
    if (!isSuperAdmin) { navigate("/dashboard"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, entreprisesRes, plansRes, demandesRes] = await Promise.all([
        entreprisesService.getStats(),
        entreprisesService.getAll(),
        plansService.getAll(),
        entreprisesService.getDemandes(),
      ]);
      setStats(statsRes?.data || statsRes);
      setEntreprises(entreprisesRes?.data || entreprisesRes || []);
      setPlans(plansRes?.data || plansRes || []);
      setDemandes(demandesRes?.data || demandesRes || []);
    } catch (err) {
      console.error("Erreur chargement SuperAdmin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await entreprisesService.create(formData);
      setShowCreate(false);
      setFormData({ nom: "", email: "", telephone: "", ville: "", plan_id: "" });
      if (res?.data?.admin) setShowCredentials(res.data.admin);
      loadData();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleAccepterDemande = async (id, nom) => {
    const plan_id = acceptPlan[id] || "";
    if (!window.confirm(`✅ Accepter la demande de "${nom}" ?\n\nL'entreprise sera créée automatiquement avec un compte admin.`)) return;
    setAcceptingId(id);
    try {
      const res = await entreprisesService.accepterDemande(id, { plan_id: plan_id || null, nb_employes_max: 50 });
      if (res?.data?.admin) setShowCredentials(res.data.admin);
      loadData();
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRefuserDemande = async (id, nom) => {
    if (!window.confirm(`❌ Refuser la demande de "${nom}" ?`)) return;
    try {
      await entreprisesService.refuserDemande(id);
      loadData();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const demandesEnAttente = demandes.filter(d => d.statut === 'En attente' || !d.statut);
  const entreprisesFiltrees = entreprises.filter(e => {
    const matchSearch = !searchTerm || e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || e.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = showInactive || e.actif !== false;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="loading-spinner-text">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="sa">
      {/* ===== HEADER PREMIUM ===== */}
      <div className="sa-header">
        <div className="sa-header-bg" />
        <div className="sa-header-content">
          <div className="sa-header-left">
            <div className="sa-header-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="sa-header-title">Super Admin</h1>
              <p className="sa-header-desc">Pilotez l'ensemble des entreprises Présencia</p>
            </div>
          </div>
          <div className="sa-header-actions">
            <button className="sa-btn sa-btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Nouvelle entreprise
            </button>
            <button className="sa-btn sa-btn-ghost" onClick={loadData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="sa-stats">
        <div className="sa-stat-card sa-stat-blue">
          <div className="sa-stat-icon"><Building2 size={22} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-nb">{stats?.total_entreprises || 0}</span>
            <span className="sa-stat-label">Entreprises</span>
          </div>
          <div className="sa-stat-trend">Total enregistré</div>
        </div>
        <div className="sa-stat-card sa-stat-green">
          <div className="sa-stat-icon"><Users size={22} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-nb">{stats?.total_employes || 0}</span>
            <span className="sa-stat-label">Employés</span>
          </div>
          <div className="sa-stat-trend">Dans toutes les entreprises</div>
        </div>
        <div className="sa-stat-card sa-stat-emerald">
          <div className="sa-stat-icon"><CheckCircle2 size={22} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-nb">{stats?.entreprises_actives || 0}</span>
            <span className="sa-stat-label">Actives</span>
          </div>
          <div className="sa-stat-trend">En production</div>
        </div>
        <div className="sa-stat-card sa-stat-amber">
          <div className="sa-stat-icon"><Clock size={22} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-nb">{demandesEnAttente.length}</span>
            <span className="sa-stat-label">En attente</span>
          </div>
          <div className="sa-stat-trend">Demandes à valider</div>
        </div>
        <div className="sa-stat-card sa-stat-purple">
          <div className="sa-stat-icon"><Activity size={22} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-nb">{stats?.presences_aujourdhui || 0}</span>
            <span className="sa-stat-label">Pointages aujourd'hui</span>
          </div>
          <div className="sa-stat-trend">Dans toutes les entreprises</div>
        </div>
      </div>

      {/* ===== DEMANDES D'INSCRIPTION ===== */}
      {demandesEnAttente.length > 0 && (
        <div className="sa-section sa-section-demandes">
          <button className="sa-section-header" onClick={() => setDemandesOpen(!demandesOpen)}>
            <div className="sa-section-header-left">
              <div className="sa-section-badge">{demandesEnAttente.length}</div>
              <div>
                <h3 className="sa-section-title">Demandes d'inscription</h3>
                <p className="sa-section-desc">Ces entreprises attendent votre validation</p>
              </div>
            </div>
            {demandesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {demandesOpen && (
            <div className="sa-demandes-list">
              {demandesEnAttente.map((d) => (
                <div key={d.id} className="sa-demande-card">
                  <div className="sa-demande-left">
                    <div className="sa-demande-avatar">
                      {d.nom_entreprise?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="sa-demande-info">
                      <div className="sa-demande-nom">{d.nom_entreprise}</div>
                      <div className="sa-demande-meta">
                        <span><Mail size={12} /> {d.email}</span>
                        {d.telephone && <span><Phone size={12} /> {d.telephone}</span>}
                        {d.ville && <span><MapPin size={12} /> {d.ville}</span>}
                      </div>
                      {d.message && (
                        <div className="sa-demande-msg">“{d.message}”</div>
                      )}
                      <div className="sa-demande-date">
                        <Calendar size={12} />
                        {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="sa-demande-right">
                    <div className="sa-demande-plan">
                      Plan souhaité : <strong>{d.plan_souhaite || "Pro"}</strong>
                    </div>
                    <div className="sa-demande-actions">
                      <select
                        className="sa-select"
                        value={acceptPlan[d.id] || ""}
                        onChange={(e) => setAcceptPlan(prev => ({ ...prev, [d.id]: e.target.value }))}
                      >
                        <option value="">Choisir un plan...</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.nom}</option>
                        ))}
                      </select>
                      <button
                        className="sa-btn sa-btn-accept"
                        onClick={() => handleAccepterDemande(d.id, d.nom_entreprise)}
                        disabled={acceptingId === d.id}
                      >
                        {acceptingId === d.id ? (
                          <span className="sa-spinner" />
                        ) : (
                          <><CheckCheck size={14} /> Accepter</>
                        )}
                      </button>
                      <button
                        className="sa-btn sa-btn-reject"
                        onClick={() => handleRefuserDemande(d.id, d.nom_entreprise)}
                      >
                        <XCircle size={14} /> Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ENTREPRISES ===== */}
      <div className="sa-section">
        <div className="sa-section-header">
          <div className="sa-section-header-left">
            <div>
              <h3 className="sa-section-title">Entreprises</h3>
              <p className="sa-section-desc">{entreprisesFiltrees.length} entreprise(s) enregistrée(s)</p>
            </div>
          </div>
          <div className="sa-toolbar">
            <div className="sa-search">
              <Search size={15} className="sa-search-icon" />
              <input
                type="text" className="sa-search-input"
                placeholder="Rechercher une entreprise..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <label className="sa-toggle-label">
              <input type="checkbox" checked={showInactive} onChange={() => setShowInactive(!showInactive)} />
              <span className="sa-toggle-slider" />
              <span>Inclure inactives</span>
            </label>
          </div>
        </div>

        {entreprisesFiltrees.length === 0 ? (
          <div className="sa-empty">
            <Building2 size={40} />
            <h3>Aucune entreprise</h3>
            <p>Créez la première entreprise pour commencer.</p>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Contact</th>
                  <th>Plan</th>
                  <th>Employés</th>
                  <th>Statut</th>
                  <th>Création</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entreprisesFiltrees.map((ent) => {
                  const isActive = ent.actif !== false;
                  return (
                    <tr key={ent.id} className={!isActive ? "sa-row-inactive" : ""}>
                      <td>
                        <div className="sa-ent-name">
                          <div className="sa-ent-avatar">{ent.nom?.charAt(0).toUpperCase() || "?"}</div>
                          <div>
                            <strong>{ent.nom}</strong>
                            {ent.ville && <div className="sa-ent-loc"><MapPin size={11} /> {ent.ville}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="sa-ent-contact">{ent.email || "—"}</div>
                        {ent.telephone && <div className="sa-ent-phone">{ent.telephone}</div>}
                      </td>
                      <td>
                        <span className={`sa-plan-badge ${ent.plan_nom?.toLowerCase() || "starter"}`}>
                          {ent.plan_nom || "Starter"}
                        </span>
                      </td>
                      <td>
                        <div className="sa-ent-employes">
                          <span className="sa-ent-emp-nb">{ent.nb_employes_actifs || 0}</span>
                          <span className="sa-ent-emp-total">/ {ent.nb_employes_total || 0}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`sa-status ${isActive ? "active" : "inactive"}`}>
                          <span className="sa-status-dot" />
                          {isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="sa-date-cell">
                        {ent.created_at ? new Date(ent.created_at).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td>
                        <button
                          className="sa-btn sa-btn-icon"
                          onClick={() => navigate(`/super-admin/entreprise/${ent.id}`)}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== CREDENTIALS MODAL ===== */}
      {showCredentials && (
        <div className="sa-modal-overlay" onClick={() => setShowCredentials(null)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sa-modal-close" onClick={() => setShowCredentials(null)}>✕</button>
            <div className="sa-modal-success-icon">🎉</div>
            <h2 className="sa-modal-title">Entreprise créée avec succès !</h2>
            <p className="sa-modal-desc">Le compte administrateur a été créé automatiquement.</p>

            <div className="sa-credentials">
              <div className="sa-cred-field">
                <span className="sa-cred-label">Administrateur</span>
                <span className="sa-cred-value">{showCredentials.nom}</span>
              </div>
              <div className="sa-cred-field">
                <span className="sa-cred-label">Email de connexion</span>
                <span className="sa-cred-value sa-cred-email">{showCredentials.email}</span>
              </div>
              <div className="sa-cred-field">
                <span className="sa-cred-label">Mot de passe</span>
                <span className="sa-cred-value sa-cred-password">{showCredentials.password}</span>
              </div>
            </div>

            <div className="sa-cred-warning">
              <AlertCircle size={16} />
              <span>Transmettez ces identifiants au responsable. Il devra changer le mot de passe à la première connexion.</span>
            </div>

            <button className="sa-btn sa-btn-primary sa-btn-block" onClick={() => setShowCredentials(null)}>
              <CheckCheck size={16} /> J'ai bien noté les identifiants
            </button>
          </div>
        </div>
      )}

      {/* ===== CREATE MODAL ===== */}
      {showCreate && (
        <div className="sa-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sa-modal-close" onClick={() => setShowCreate(false)}>✕</button>
            <h2 className="sa-modal-title">Nouvelle entreprise</h2>
            <p className="sa-modal-desc">Créez une entreprise et son administrateur</p>

            <form onSubmit={handleCreate}>
              <div className="sa-form-group">
                <label className="sa-form-label">Nom de l'entreprise *</label>
                <input type="text" className="sa-form-input" required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="SARL Congo Tech" />
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Email *</label>
                <input type="email" className="sa-form-input" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@entreprise.cg" />
              </div>
              <div className="sa-form-row">
                <div className="sa-form-group">
                  <label className="sa-form-label">Téléphone</label>
                  <input type="tel" className="sa-form-input"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+242 06 000 0000" />
                </div>
                <div className="sa-form-group">
                  <label className="sa-form-label">Ville</label>
                  <input type="text" className="sa-form-input"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    placeholder="Brazzaville" />
                </div>
              </div>
              <div className="sa-form-group">
                <label className="sa-form-label">Plan</label>
                <select className="sa-form-select"
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                >
                  <option value="">Sélectionner un plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="sa-btn sa-btn-primary sa-btn-block sa-btn-lg"
                style={{ marginTop: 8 }}>
                <Plus size={16} /> Créer l'entreprise
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdmin;
