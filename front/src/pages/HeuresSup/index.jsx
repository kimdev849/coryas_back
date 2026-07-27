import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import heuresSupService from "../../services/heuresSupService";
import "./style.css";

function HeuresSup() {
    const { user } = useAuth();
    const isAdmin = user?.role === "Administrateur" || user?.role === "RH" || user?.role === "Directeur";
    const [list, setList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ nb_heures: "1", motif: "", date_heure_sup: new Date().toISOString().split("T")[0] });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await heuresSupService.getAll();
            setList(res.data || []);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await heuresSupService.create(formData);
            setMessage("Heure sup enregistrée !");
            setMessageType("success");
            setShowForm(false);
            load();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Erreur : " + (err.message || ""));
            setMessageType("error");
        }
    };

    const handleAction = async (id, action) => {
        const comment = action === "reject" ? prompt("Motif du refus :") : "";
        if (action === "reject" && !comment) return;
        try {
            action === "approve" ? await heuresSupService.approve(id) : await heuresSupService.reject(id, comment);
            setMessage(action === "approve" ? "Approuvée !" : "Refusée !");
            setMessageType("success");
            load();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Erreur : " + (err.message || ""));
            setMessageType("error");
        }
    };

    const badge = (statut) => {
        const colors = { "En attente": { bg: "#fff3cd", c: "#856404" }, "Approuve": { bg: "#d4edda", c: "#155724" }, "Rejete": { bg: "#f8d7da", c: "#721c24" } };
        const s = colors[statut] || { bg: "#e2e3e5", c: "#383d41" };
        return <span style={{ padding: "4px 12px", borderRadius: 12, fontWeight: 600, fontSize: 12, background: s.bg, color: s.c }}>{statut}</span>;
    };

    return (
        <div>
            <h1 className="page-title">Heures supplémentaires</h1>
            <p className="page-description">Gérez les heures supplémentaires des employés</p>

            {message && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold", background: messageType === "success" ? "#d4edda" : "#f8d7da", color: messageType === "success" ? "#155724" : "#721c24" }}>{message}</div>}

            <div className="employes-actions">
                {isAdmin && (
                    <button className="employes-btn employes-btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Fermer" : "+ Nouvelle heure sup"}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="config-section" style={{ marginBottom: 24 }}>
                    <h3 className="config-section-title">Nouvelle heure supplémentaire</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="config-option">
                                <div><strong>Date</strong></div>
                                <input type="date" className="config-input" value={formData.date_heure_sup}
                                    onChange={(e) => setFormData({ ...formData, date_heure_sup: e.target.value })} max={today} required />
                            </div>
                            <div className="config-option">
                                <div><strong>Nombre d'heures</strong></div>
                                <input type="number" step="0.5" min="0.5" max="12" className="config-input"
                                    value={formData.nb_heures}
                                    onChange={(e) => setFormData({ ...formData, nb_heures: e.target.value })} required />
                            </div>
                        </div>
                        <div className="config-option">
                            <div><strong>Motif</strong></div>
                            <textarea className="config-input" rows={2} value={formData.motif}
                                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                                placeholder="Raison des heures supplémentaires..." style={{ resize: "vertical", fontFamily: "inherit" }} />
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button type="submit" className="employes-btn employes-btn-primary">Enregistrer</button>
                            <button type="button" className="employes-btn" onClick={() => setShowForm(false)}
                                style={{ background: "#dc3545", color: "white" }}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr><th>Employé</th><th>Date</th><th>Heures</th><th>Taux</th><th>Motif</th><th>Statut</th>{isAdmin && <th>Actions</th>}</tr>
                    </thead>
                    <tbody>
                        {list.map(hs => (
                            <tr key={hs.id}>
                                <td><strong>{hs.employe_nom}</strong></td>
                                <td>{new Date(hs.date_heure_sup + "T12:00:00").toLocaleDateString("fr-FR")}</td>
                                <td style={{ fontWeight: 700 }}>{hs.nb_heures}h</td>
                                <td>x{hs.taux_majoration}</td>
                                <td>{hs.motif || "-"}</td>
                                <td>{badge(hs.statut)}</td>
                                {isAdmin && (
                                    <td>{hs.statut === "En attente" && (
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <button onClick={() => handleAction(hs.id, "approve")}
                                                style={{ background: "#22c55e", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓</button>
                                            <button onClick={() => handleAction(hs.id, "reject")}
                                                style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✗</button>
                                        </div>
                                    )}</td>
                                )}
                            </tr>
                        ))}
                        {list.length === 0 && <tr><td colSpan={isAdmin ? 7 : 6} className="employes-empty">Aucune heure sup</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HeuresSup;
