import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import heuresSupService from "../../services/heuresSupService";
import { Clock, Zap } from "lucide-react";
import "./style.css";

function HeuresSup() {
    const { user } = useAuth();
    const canManage = user?.role === "Administrateur" || user?.role === "RH";
    const [list, setList] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await heuresSupService.getAll();
            setList(res.data || []);
        } catch (e) { console.error(e); }
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
            <h1 className="page-title">
                <Zap size={22} style={{ verticalAlign: "middle", marginRight: 8 }} />
                Heures supplémentaires
            </h1>
            <p className="page-description">
                <Clock size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                Les heures sup sont calculées automatiquement au pointage de départ.
                {canManage ? " Approuvez ou refusez les demandes ci-dessous." : ""}
            </p>

            {message && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold", background: messageType === "success" ? "#d4edda" : "#f8d7da", color: messageType === "success" ? "#155724" : "#721c24" }}>{message}</div>}

            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr><th>Employé</th><th>Date</th><th>Heures</th><th>Taux</th><th>Motif</th><th>Statut</th>{canManage && <th>Actions</th>}</tr>
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
                                {canManage && (
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
                        {list.length === 0 && <tr><td colSpan={canManage ? 7 : 6} className="employes-empty">Aucune heure sup</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HeuresSup;
