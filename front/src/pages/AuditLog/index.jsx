import { useState, useEffect } from "react";
import auditLogService from "../../services/auditLogService";
import "./style.css";

function AuditLog() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ table_name: "" });

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [filters]);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const res = await auditLogService.getAll(filters);
            setLogs(res.data || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const loadStats = async () => {
        try {
            const res = await auditLogService.getStats();
            setStats(res.data || null);
        } catch (e) { /* silencieux */ }
    };

    const formatAction = (action) => {
        const colors = { CREATE: { bg: "#d4edda", c: "#155724" }, UPDATE: { bg: "#fff3cd", c: "#856404" }, DELETE: { bg: "#f8d7da", c: "#721c24" } };
        const s = colors[action] || { bg: "#e2e3e5", c: "#383d41" };
        return <span style={{ padding: "2px 8px", borderRadius: 8, fontWeight: 600, fontSize: 11, background: s.bg, color: s.c }}>{action}</span>;
    };

    const formatDate = (d) => {
        const date = new Date(d);
        return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const tables = ["", "type_conge", "type_contrat", "sites", "equipes", "heures_sup", "employes", "conges", "presences", "parametres"];

    return (
        <div>
            <h1 className="page-title">Journal d'audit</h1>
            <p className="page-description">Traçabilité de toutes les actions effectuées dans l'application</p>

            {/* Stats */}
            {stats && (
                <div className="dashboard-cards" style={{ marginBottom: 24 }}>
                    <div className="dashboard-card">
                        <p className="dashboard-number" style={{ color: "#3b82f6", fontSize: 24 }}>{stats.total_entrees}</p>
                        <p className="dashboard-card-desc">Actions totales</p>
                    </div>
                    <div className="dashboard-card">
                        <p className="dashboard-number" style={{ color: "#22c55e", fontSize: 24 }}>{stats.aujourd_hui}</p>
                        <p className="dashboard-card-desc">Aujourd'hui</p>
                    </div>
                    <div className="dashboard-card">
                        <p className="dashboard-number" style={{ color: "#8b5cf6", fontSize: 24 }}>{stats.tables_suivies}</p>
                        <p className="dashboard-card-desc">Tables suivies</p>
                    </div>
                    <div className="dashboard-card">
                        <p className="dashboard-number" style={{ color: "#f59e0b", fontSize: 24 }}>{stats.employes_actifs}</p>
                        <p className="dashboard-card-desc">Utilisateurs actifs</p>
                    </div>
                </div>
            )}

            {/* Filtres */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>Filtrer par table :</label>
                <select value={filters.table_name} onChange={(e) => setFilters({ ...filters, table_name: e.target.value })}
                    className="config-input" style={{ maxWidth: 250 }}>
                    {tables.map(t => <option key={t} value={t}>{t || "Toutes les tables"}</option>)}
                </select>
                <button className="employes-btn" onClick={loadLogs}
                    style={{ background: "#6c757d", color: "white", padding: "8px 16px", fontSize: 13 }}>
                    Actualiser
                </button>
            </div>

            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Table</th><th>Enregistrement</th><th>Détails</th></tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6}><div className="loading-spinner" style={{ padding: 30 }}><span className="loading-spinner-text">Chargement...</span></div></td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={6} className="employes-empty">Aucune activité pour le moment. Les actions sont tracées automatiquement.</td></tr>
                        ) : logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{formatDate(log.created_at)}</td>
                                <td>{log.employe_nom || "Système"}</td>
                                <td>{formatAction(log.action)}</td>
                                <td><code style={{ fontSize: 12 }}>{log.table_name}</code></td>
                                <td>{log.record_id || "-"}</td>
                                <td style={{ fontSize: 12, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {log.nouvelles_valeurs ? JSON.stringify(log.nouvelles_valeurs) : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AuditLog;
