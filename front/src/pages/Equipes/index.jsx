import { useState, useEffect } from "react";
import equipesService from "../../services/equipesService";
import departementsService from "../../services/departementsService";
import sitesService from "../../services/sitesService";
import employesService from "../../services/employesService";
import "./style.css";

function Equipes() {
    const [equipes, setEquipes] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [sites, setSites] = useState([]);
    const [employes, setEmployes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ nom: "", code: "", departement_id: "", site_id: "", responsable_id: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [eq, dep, sit, emp] = await Promise.all([
                equipesService.getAll(),
                departementsService.getAll(),
                sitesService.getAll(),
                employesService.getAll(),
            ]);
            setEquipes(eq.data || []);
            setDepartements(dep.data || []);
            setSites(sit.data || []);
            setEmployes(emp.data || []);
        } catch (e) { console.error(e); }
    };

    const openAdd = () => {
        setEditing(null);
        setFormData({ nom: "", code: "", departement_id: "", site_id: "", responsable_id: "" });
        setShowForm(true);
    };

    const openEdit = (e) => {
        setEditing(e.id);
        setFormData({ nom: e.nom, code: e.code || "", departement_id: e.departement_id || "", site_id: e.site_id || "", responsable_id: e.responsable_id || "" });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            editing ? await equipesService.update(editing, formData) : await equipesService.create(formData);
            setMessage(editing ? "Équipe modifiée !" : "Équipe créée !");
            setShowForm(false);
            loadAll();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Erreur : " + (err.message || ""));
        }
    };

    return (
        <div>
            <h1 className="page-title">Équipes</h1>
            <p className="page-description">Gérez les équipes dans les départements</p>

            {message && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold", background: "#d4edda", color: "#155724" }}>{message}</div>}

            <div className="employes-actions">
                <button className="employes-btn employes-btn-primary" onClick={openAdd}>+ Ajouter une équipe</button>
            </div>

            {showForm && (
                <div className="config-section" style={{ marginBottom: 24 }}>
                    <h3 className="config-section-title">{editing ? "Modifier" : "Nouvelle équipe"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="config-option">
                            <div><strong>Nom *</strong></div>
                            <input type="text" name="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="config-input" required />
                        </div>
                        <div className="config-option">
                            <div><strong>Code</strong></div>
                            <input type="text" name="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="config-input" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <div className="config-option">
                                <div><strong>Département</strong></div>
                                <select name="departement_id" value={formData.departement_id} onChange={(e) => setFormData({ ...formData, departement_id: e.target.value })} className="config-input">
                                    <option value="">-- Aucun --</option>
                                    {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                                </select>
                            </div>
                            <div className="config-option">
                                <div><strong>Site</strong></div>
                                <select name="site_id" value={formData.site_id} onChange={(e) => setFormData({ ...formData, site_id: e.target.value })} className="config-input">
                                    <option value="">-- Aucun --</option>
                                    {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                                </select>
                            </div>
                            <div className="config-option">
                                <div><strong>Responsable</strong></div>
                                <select name="responsable_id" value={formData.responsable_id} onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })} className="config-input">
                                    <option value="">-- Aucun --</option>
                                    {employes.filter(e => e.statut === "Actif").map(e =>
                                        <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button type="submit" className="employes-btn employes-btn-primary">{editing ? "Enregistrer" : "Créer"}</button>
                            <button type="button" className="employes-btn" onClick={() => setShowForm(false)} style={{ background: "#dc3545", color: "white" }}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr><th>Nom</th><th>Département</th><th>Site</th><th>Responsable</th><th>Employés</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {equipes.map(eq => (
                            <tr key={eq.id}>
                                <td><strong>{eq.nom}</strong></td>
                                <td>{eq.departement_nom || "-"}</td>
                                <td>{eq.site_nom || "-"}</td>
                                <td>{eq.responsable_nom || "-"}</td>
                                <td>{eq.nb_employes || 0}</td>
                                <td>
                                    <button className="employes-btn" onClick={() => openEdit(eq)}
                                        style={{ background: "#F5A623", color: "black", padding: "6px 10px", fontSize: "12px" }}>
                                        Modifier
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {equipes.length === 0 && <tr><td colSpan={6} className="employes-empty">Aucune équipe</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Equipes;
