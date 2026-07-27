import { useState, useEffect } from "react";
import sitesService from "../../services/sitesService";
import "./style.css";

function Sites() {
    const [sites, setSites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        nom: "", code: "", adresse: "", ville: "", pays: "Côte d'Ivoire",
        telephone: "", email: "", horaire_ouverture: "", horaire_fermeture: "",
    });
    const [message, setMessage] = useState("");

    useEffect(() => { loadSites(); }, []);

    const loadSites = async () => {
        setIsLoading(true);
        try {
            const res = await sitesService.getAll();
            setSites(res.data || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const openAdd = () => {
        setEditing(null);
        setFormData({ nom: "", code: "", adresse: "", ville: "", pays: "Côte d'Ivoire", telephone: "", email: "", horaire_ouverture: "", horaire_fermeture: "" });
        setShowForm(true);
    };

    const openEdit = (s) => {
        setEditing(s.id);
        setFormData({
            nom: s.nom, code: s.code || "", adresse: s.adresse || "", ville: s.ville || "",
            pays: s.pays || "Côte d'Ivoire", telephone: s.telephone || "", email: s.email || "",
            horaire_ouverture: s.horaire_ouverture ? s.horaire_ouverture.slice(0, 5) : "",
            horaire_fermeture: s.horaire_fermeture ? s.horaire_fermeture.slice(0, 5) : "",
        });
        setShowForm(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await sitesService.update(editing, formData);
                setMessage("Site modifié !");
            } else {
                await sitesService.create(formData);
                setMessage("Site créé !");
            }
            setShowForm(false);
            loadSites();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Erreur : " + (err.message || ""));
        }
    };

    return (
        <div>
            <h1 className="page-title">Sites / Agences</h1>
            <p className="page-description">Gérez les différents sites et agences de votre entreprise</p>

            {message && (
                <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold",
                    background: "#d4edda", color: "#155724" }}>{message}</div>
            )}

            <div className="employes-actions">
                <button className="employes-btn employes-btn-primary" onClick={openAdd}>
                    + Ajouter un site
                </button>
            </div>

            {showForm && (
                <div className="config-section" style={{ marginBottom: 24 }}>
                    <h3 className="config-section-title">{editing ? "Modifier" : "Nouveau site"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="config-option">
                            <div><strong>Nom *</strong></div>
                            <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="config-input" required />
                        </div>
                        <div className="config-option">
                            <div><strong>Code</strong></div>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} className="config-input" placeholder="SIEGE" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="config-option">
                                <div><strong>Ville</strong></div>
                                <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="config-input" />
                            </div>
                            <div className="config-option">
                                <div><strong>Pays</strong></div>
                                <input type="text" name="pays" value={formData.pays} onChange={handleChange} className="config-input" />
                            </div>
                        </div>
                        <div className="config-option">
                            <div><strong>Adresse</strong></div>
                            <textarea name="adresse" value={formData.adresse} onChange={handleChange} className="config-input" rows={2} style={{ resize: "vertical", fontFamily: "inherit" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="config-option">
                                <div><strong>Téléphone</strong></div>
                                <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className="config-input" />
                            </div>
                            <div className="config-option">
                                <div><strong>Email</strong></div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="config-input" />
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="config-option">
                                <div><strong>Horaire ouverture</strong></div>
                                <input type="time" name="horaire_ouverture" value={formData.horaire_ouverture} onChange={handleChange} className="config-input" />
                            </div>
                            <div className="config-option">
                                <div><strong>Horaire fermeture</strong></div>
                                <input type="time" name="horaire_fermeture" value={formData.horaire_fermeture} onChange={handleChange} className="config-input" />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button type="submit" className="employes-btn employes-btn-primary">{editing ? "Enregistrer" : "Créer"}</button>
                            <button type="button" className="employes-btn" onClick={() => setShowForm(false)}
                                style={{ background: "#dc3545", color: "white" }}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr><th>Nom</th><th>Code</th><th>Ville</th><th>Pays</th><th>Employés</th><th>Équipes</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {sites.map(s => (
                            <tr key={s.id}>
                                <td><strong>{s.nom}</strong></td>
                                <td><code>{s.code || "-"}</code></td>
                                <td>{s.ville || "-"}</td>
                                <td>{s.pays || "-"}</td>
                                <td>{s.nb_employes || 0}</td>
                                <td>{s.nb_equipes || 0}</td>
                                <td>
                                    <button className="employes-btn" onClick={() => openEdit(s)}
                                        style={{ background: "var(--color-primary)", color: "white", padding: "6px 10px", fontSize: "12px" }}>
                                        Modifier
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sites.length === 0 && (
                            <tr><td colSpan={7} className="employes-empty">Aucun site</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Sites;
