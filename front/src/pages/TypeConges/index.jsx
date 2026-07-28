import { useState, useEffect } from "react";
import typeCongeService from "../../services/typeCongeService";
import "./style.css";

function TypeConges() {
  const [isLoading, setIsLoading] = useState(true);
    const [types, setTypes] = useState([]);
    const [soldes, setSoldes] = useState([]);
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
        <div className="type-conges-page">
            <h1 className="page-title">Types de congés</h1>
            <p className="page-description">Gérez les types de congés et les soldes annuels par employé</p>

            {message && (
                <div className="type-conges-message">
                    {message}
                </div>
            )}

            <div className="tc-actions">
                <button className="tc-btn tc-btn-primary" onClick={openAdd}>
                    + Ajouter un type
                </button>
                <button className="tc-btn tc-btn-secondary" onClick={() => { loadTypes(); loadSoldes(); }}>
                    Recharger
                </button>
            </div>

            {showForm && (
                <div className="tc-form">
                    <h3 className="tc-form-title">
                        {editing ? "Modifier le type" : "Nouveau type de congé"}
                    </h3>
                    <form onSubmit={handleSubmit} className="tc-form-grid">
                        <div className="tc-form-row">
                            <label>Nom *</label>
                            <input type="text" name="nom" value={formData.nom} onChange={handleChange} required placeholder="Congé annuel" />
                        </div>
                        <div className="tc-form-row">
                            <label>Code *</label>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="ANNUEL" />
                        </div>
                        <div className="tc-form-row">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} />
                        </div>
                        <div className="tc-form-inline">
                            <div className="tc-form-row">
                                <label>Jours max/an</label>
                                <input type="number" name="jours_max" value={formData.jours_max} onChange={handleChange} placeholder="30" min="0" />
                            </div>
                            <div className="tc-form-row">
                                <label>Couleur</label>
                                <input type="color" name="couleur" value={formData.couleur} onChange={handleChange} style={{ height: 40, padding: 4 }} />
                            </div>
                            <div className="tc-form-row">
                                <label>Payé</label>
                                <label className="tc-form-checkbox">
                                    <input type="checkbox" name="paye" checked={formData.paye} onChange={handleChange} />
                                    Congé rémunéré
                                </label>
                            </div>
                        </div>
                        <div className="tc-form-btns">
                            <button type="submit" className="tc-btn tc-btn-primary">
                                {editing ? "Enregistrer" : "Créer"}
                            </button>
                            <button type="button" className="tc-btn tc-btn-danger" onClick={() => setShowForm(false)}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tableau des types */}
            <div className="tc-section">
                <h3 className="tc-section-title">Types de congés</h3>
                <div className="tc-table-wrap">
                    <table className="tc-table">
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
                                    <td><span className="tc-color-dot" style={{ background: t.couleur }} /></td>
                                    <td><strong>{t.nom}</strong></td>
                                    <td><code>{t.code}</code></td>
                                    <td>{t.paye ? "✅" : "❌"}</td>
                                    <td>{t.jours_max || "∞"}</td>
                                    <td>{t.actif ? "✅" : "❌"}</td>
                                    <td>
                                        <button className="tc-btn tc-btn-secondary" onClick={() => openEdit(t)} style={{ padding: "6px 12px", fontSize: 12 }}>
                                            Modifier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {types.length === 0 && (
                                <tr><td colSpan={7} className="tc-empty">Aucun type de congé</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tableau des soldes */}
            <div className="tc-section">
                <h3 className="tc-section-title">Soldes de congés</h3>
                <div className="tc-table-wrap">
                    <table className="tc-table">
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
                                        <span className="tc-type-badge" style={{
                                            background: s.couleur + "20", color: s.couleur
                                        }}>
                                            {s.type_conge_nom}
                                        </span>
                                    </td>
                                    <td>{s.total_jours}</td>
                                    <td className={`tc-soldes-pris ${s.jours_pris > s.total_jours * 0.8 ? 'high' : 'normal'}`}>
                                        {s.jours_pris}
                                    </td>
                                    <td className={`tc-soldes-restants ${s.jours_restants < 5 ? 'low' : 'ok'}`}>
                                        {s.jours_restants}
                                    </td>
                                </tr>
                            ))}
                            {soldes.length === 0 && (
                                <tr><td colSpan={7} className="tc-empty">Aucun solde - Exécutez la migration SQL</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TypeConges;
