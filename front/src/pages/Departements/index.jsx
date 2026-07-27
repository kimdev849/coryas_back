import { useState, useEffect } from "react";
import departementsService from "../../services/departementsService";
import "./style.css";

function Departements() {
    const [departements, setDepartements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ nom: "", code: "" });
    const [message, setMessage] = useState("");

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await departementsService.getAll();
            setDepartements(res.data || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const openAdd = () => {
        setEditing(null);
        setFormData({ nom: "", code: "" });
        setShowForm(true);
    };

    const openEdit = (d) => {
        setEditing(d.id);
        setFormData({ nom: d.nom, code: d.code || "" });
        setShowForm(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await departementsService.update(editing, formData);
                setMessage("✅ Département modifié !");
            } else {
                await departementsService.create(formData);
                setMessage("✅ Département créé !");
            }
            setShowForm(false);
            load();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("❌ " + (err.message || "Erreur"));
        }
    };

    const handleDelete = async (id, nom) => {
        if (!window.confirm(`Supprimer le département "${nom}" ? Les employés liés ne seront plus affectés.`)) return;
        try {
            await departementsService.remove(id);
            setMessage(`🗑️ Département "${nom}" supprimé`);
            load();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("❌ " + (err.message || "Impossible de supprimer ce département"));
        }
    };

    return (
        <div>
            <h1 className="page-title">Départements</h1>
            <p className="page-description">Gérez les départements de votre entreprise</p>

            {message && (
                <div style={{
                    padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold",
                    background: message.includes("❌") ? "#f8d7da" : "#d4edda",
                    color: message.includes("❌") ? "#721c24" : "#155724"
                }}>{message}</div>
            )}

            <div className="employes-actions">
                <button className="employes-btn employes-btn-primary" onClick={openAdd}>
                    + Ajouter un département
                </button>
            </div>

            {showForm && (
                <div className="config-section" style={{ marginBottom: 24 }}>
                    <h3 className="config-section-title">
                        {editing ? "Modifier le département" : "Nouveau département"}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="config-option">
                            <div><strong>Nom *</strong><p className="config-description">Ex: Ressources Humaines</p></div>
                            <input type="text" name="nom" value={formData.nom} onChange={handleChange}
                                className="config-input" required placeholder="Commercial, RH, Technique..." />
                        </div>
                        <div className="config-option">
                            <div><strong>Code</strong><p className="config-description">Code court optionnel</p></div>
                            <input type="text" name="code" value={formData.code} onChange={handleChange}
                                className="config-input" placeholder="RH" />
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button type="submit" className="employes-btn employes-btn-primary">
                                {editing ? "Enregistrer" : "Créer"}
                            </button>
                            <button type="button" className="employes-btn" onClick={() => setShowForm(false)}
                                style={{ background: "#dc3545", color: "white" }}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Code</th>
                            <th>Employés</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departements.map(d => (
                            <tr key={d.id}>
                                <td><strong>{d.nom}</strong></td>
                                <td><code>{d.code || "—"}</code></td>
                                <td>{d.nb_employes ?? 0}</td>
                                <td style={{ display: "flex", gap: 6 }}>
                                    <button className="employes-btn" onClick={() => openEdit(d)}
                                        style={{ background: "var(--color-primary)", color: "white", padding: "6px 10px", fontSize: "12px" }}>
                                        Modifier
                                    </button>
                                    <button className="employes-btn" onClick={() => handleDelete(d.id, d.nom)}
                                        style={{ background: "#dc3545", color: "white", padding: "6px 10px", fontSize: "12px" }}
                                        disabled={(d.nb_employes ?? 0) > 0}
                                        title={(d.nb_employes ?? 0) > 0 ? "Supprimez d'abord les employés de ce département" : "Supprimer"}>
                                        {(d.nb_employes ?? 0) > 0 ? "🔒" : "🗑️"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {departements.length === 0 && (
                            <tr><td colSpan={4} className="employes-empty">Aucun département. Créez le premier !</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Departements;
