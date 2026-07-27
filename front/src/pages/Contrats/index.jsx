import { useState, useEffect } from "react";
import typeContratService from "../../services/typeContratService";
import "./style.css";

function Contrats() {
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ nom: "", code: "", duree_essai_jours: 0 });
    const [message, setMessage] = useState("");

    useEffect(() => { loadTypes(); }, []);

    const loadTypes = async () => {
        setIsLoading(true);
        try {
            const res = await typeContratService.getAll();
            setTypes(res.data || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const openAdd = () => {
        setEditing(null);
        setFormData({ nom: "", code: "", duree_essai_jours: 0 });
        setShowForm(true);
    };

    const openEdit = (t) => {
        setEditing(t.id);
        setFormData({ nom: t.nom, code: t.code, duree_essai_jours: t.duree_essai_jours || 0 });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await typeContratService.update(editing, formData);
                setMessage("Type de contrat modifié !");
            } else {
                await typeContratService.create(formData);
                setMessage("Type de contrat créé !");
            }
            setShowForm(false);
            loadTypes();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Erreur : " + (err.message || ""));
        }
    };

    return (
        <div>
            <h1 className="page-title">Types de contrats</h1>
            <p className="page-description">Gérez les types de contrats (CDI, CDD, Stage, Freelance...)</p>

            {message && (
                <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold",
                    background: "#d4edda", color: "#155724" }}>
                    {message}
                </div>
            )}

            <div className="employes-actions">
                <button className="employes-btn employes-btn-primary" onClick={openAdd}>
                    + Ajouter un type
                </button>
            </div>

            {showForm && (
                <div className="config-section" style={{ marginBottom: 24 }}>
                    <h3 className="config-section-title">
                        {editing ? "Modifier" : "Nouveau type de contrat"}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="config-option">
                            <div><strong>Nom *</strong><p className="config-description">Ex: CDI, CDD</p></div>
                            <input type="text" name="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                className="config-input" required />
                        </div>
                        <div className="config-option">
                            <div><strong>Code *</strong><p className="config-description">Ex: CDI, CDD, STAGE</p></div>
                            <input type="text" name="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="config-input" required placeholder="CDI" />
                        </div>
                        <div className="config-option">
                            <div><strong>Période d'essai (jours)</strong></div>
                            <input type="number" name="duree_essai_jours" value={formData.duree_essai_jours}
                                onChange={(e) => setFormData({ ...formData, duree_essai_jours: parseInt(e.target.value) || 0 })}
                                className="config-input" min="0" />
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button type="submit" className="employes-btn employes-btn-primary">
                                {editing ? "Enregistrer" : "Créer"}
                            </button>
                            <button type="button" className="employes-btn"
                                onClick={() => setShowForm(false)} style={{ background: "#dc3545", color: "white" }}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr><th>Nom</th><th>Code</th><th>Essai (jours)</th><th>Actif</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {types.map(t => (
                            <tr key={t.id}>
                                <td><strong>{t.nom}</strong></td>
                                <td><code>{t.code}</code></td>
                                <td>{t.duree_essai_jours || 0} jours</td>
                                <td>{t.actif ? "✅" : "❌"}</td>
                                <td>
                                    <button className="employes-btn" onClick={() => openEdit(t)}
                                        style={{ background: "var(--color-primary)", color: "white", padding: "6px 10px", fontSize: "12px" }}>
                                        Modifier
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {types.length === 0 && (
                            <tr><td colSpan={5} className="employes-empty">Aucun type de contrat</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Contrats;
