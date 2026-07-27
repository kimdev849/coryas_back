import { useState, useEffect } from "react";
import typeCongeService from "../../services/typeCongeService";
import "./style.css";

function TypeConges() {
    const [types, setTypes] = useState([]);
    const [soldes, setSoldes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        nom: "", code: "", description: "", paye: true,
        jours_max: "", couleur: "#3b82f6", actif: true,
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadTypes();
        loadSoldes();
    }, []);

    const loadTypes = async () => {
        try {
            const res = await typeCongeService.getAllTypes();
            setTypes(res.data || []);
        } catch (e) { console.error(e); }
    };

    const loadSoldes = async () => {
        try {
            const res = await typeCongeService.getAllSoldes();
            setSoldes(res.data || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const openAdd = () => {
        setEditing(null);
        setFormData({ nom: "", code: "", description: "", paye: true, jours_max: "", couleur: "#3b82f6", actif: true });
        setShowForm(true);
    };

    const openEdit = (t) => {
        setEditing(t.id);
        setFormData({
            nom: t.nom, code: t.code, description: t.description || "",
            paye: t.paye, jours_max: t.jours_max || "", couleur: t.couleur || "#3b82f6",
            actif: t.actif,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await typeCongeService.updateType(editing, formData);
                setMessage("Type modifié !");
            } else {
                await typeCongeService.createType(formData);
                setMessage("Type créé !");
                setShowForm(false);
            }
            loadTypes();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Erreur : " + (err.message || ""));
        }
    };

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: inputType === "checkbox" ? checked : value,
        }));
    };

    return (
        <div>
            <h1 className="page-title">Types de congés</h1>
            <p className="page-description">Gérez les types de congés et les soldes annuels par employé</p>

            {message && (
                <div className="conges-message conges-message-success" style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold" }}>
                    {message}
                </div>
            )}

            <div className="employes-actions">
                <button className="employes-btn employes-btn-primary" onClick={openAdd}>
                    + Ajouter un type
                </button>
                <button className="employes-btn" onClick={() => { loadTypes(); loadSoldes(); }}
                    style={{ background: "#6c757d", color: "white", marginLeft: "8px" }}>
                    Recharger
                </button>
            </div>

            {showForm && (
                <div className="config-section" style={{ marginBottom: 24 }}>
                    <h3 className="config-section-title">
                        {editing ? "Modifier le type" : "Nouveau type de congé"}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="config-option">
                            <div><strong>Nom *</strong><p className="config-description">Ex: Congé annuel</p></div>
                            <input type="text" name="nom" value={formData.nom} onChange={handleChange}
                                className="config-input" required />
                        </div>
                        <div className="config-option">
                            <div><strong>Code *</strong><p className="config-description">Ex: ANNUEL</p></div>
                            <input type="text" name="code" value={formData.code} onChange={handleChange}
                                className="config-input" required placeholder="ANNUEL" />
                        </div>
                        <div className="config-option">
                            <div><strong>Description</strong></div>
                            <textarea name="description" value={formData.description} onChange={handleChange}
                                className="config-input" rows={2} style={{ resize: "vertical", fontFamily: "inherit" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <div className="config-option">
                                <div><strong>Jours max/an</strong></div>
                                <input type="number" name="jours_max" value={formData.jours_max} onChange={handleChange}
                                    className="config-input" placeholder="30 (vide = illimité)" min="0" />
                            </div>
                            <div className="config-option">
                                <div><strong>Couleur</strong></div>
                                <input type="color" name="couleur" value={formData.couleur} onChange={handleChange}
                                    className="config-input" style={{ height: 40, padding: 4 }} />
                            </div>
                            <div className="config-option">
                                <div><strong>Payé</strong></div>
                                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                                    <input type="checkbox" name="paye" checked={formData.paye} onChange={handleChange} />
                                    Congé rémunéré
                                </label>
                            </div>
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

            {/* Tableau des types */}
            <div className="employes-table-container" style={{ marginBottom: 32 }}>
                <h3 style={{ marginBottom: 12, color: "#1a1a2e" }}>Types de congés</h3>
                <table className="employes-table">
                    <thead>
                        <tr>
                            <th>Couleur</th>
                            <th>Nom</th>
                            <th>Code</th>
                            <th>Payé</th>
                            <th>Jours max</th>
                            <th>Actif</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {types.map(t => (
                            <tr key={t.id}>
                                <td><div style={{ width: 24, height: 24, borderRadius: "50%", background: t.couleur }} /></td>
                                <td><strong>{t.nom}</strong></td>
                                <td><code>{t.code}</code></td>
                                <td>{t.paye ? "✅" : "❌"}</td>
                                <td>{t.jours_max || "∞"}</td>
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
                            <tr><td colSpan={7} className="employes-empty">Aucun type de congé</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tableau des soldes */}
            <div className="employes-table-container">
                <h3 style={{ marginBottom: 12, color: "#1a1a2e" }}>Soldes de congés</h3>
                <table className="employes-table">
                    <thead>
                        <tr>
                            <th>Employé</th>
                            <th>Matricule</th>
                            <th>Département</th>
                            <th>Type</th>
                            <th>Total</th>
                            <th>Pris</th>
                            <th>Restants</th>
                        </tr>
                    </thead>
                    <tbody>
                        {soldes.map(s => (
                            <tr key={s.id}>
                                <td><strong>{s.employe_nom}</strong></td>
                                <td>{s.matricule}</td>
                                <td>{s.departement_nom || "-"}</td>
                                <td>
                                    <span style={{
                                        display: "inline-block", padding: "2px 10px", borderRadius: 12,
                                        background: s.couleur + "20", color: s.couleur, fontWeight: 600, fontSize: 12,
                                    }}>
                                        {s.type_conge_nom}
                                    </span>
                                </td>
                                <td>{s.total_jours}</td>
                                <td style={{ color: s.jours_pris > s.total_jours * 0.8 ? "#ef4444" : "#f59e0b", fontWeight: 600 }}>
                                    {s.jours_pris}
                                </td>
                                <td style={{ fontWeight: 700, color: s.jours_restants < 5 ? "#ef4444" : "#22c55e" }}>
                                    {s.jours_restants}
                                </td>
                            </tr>
                        ))}
                        {soldes.length === 0 && (
                            <tr><td colSpan={7} className="employes-empty">Aucun solde - Exécutez la migration SQL</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TypeConges;
