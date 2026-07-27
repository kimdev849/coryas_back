import { useState, useEffect } from "react";
import { MapPin, Target, Navigation, Globe } from "lucide-react";
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
        latitude: "", longitude: "", rayon_gps: 100,
    });
    const [gpsDetecting, setGpsDetecting] = useState(false);
    const [gpsError, setGpsError] = useState("");
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
        setFormData({ nom: "", code: "", adresse: "", ville: "", pays: "Côte d'Ivoire", telephone: "", email: "", horaire_ouverture: "", horaire_fermeture: "", latitude: "", longitude: "", rayon_gps: 100 });
        setGpsError("");
        setShowForm(true);
    };

    const openEdit = (s) => {
        setEditing(s.id);
        setFormData({
            nom: s.nom, code: s.code || "", adresse: s.adresse || "", ville: s.ville || "",
            pays: s.pays || "Côte d'Ivoire", telephone: s.telephone || "", email: s.email || "",
            horaire_ouverture: s.horaire_ouverture ? s.horaire_ouverture.slice(0, 5) : "",
            horaire_fermeture: s.horaire_fermeture ? s.horaire_fermeture.slice(0, 5) : "",
            latitude: s.latitude || "", longitude: s.longitude || "", rayon_gps: s.rayon_gps || 100,
        });
        setGpsError("");
        setShowForm(true);
    };

    const handleChange = (e) => {
        const value = e.target.name === "rayon_gps" ? Number(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    // 📍 Détection automatique de la position GPS
    const detectLocation = () => {
        if (!navigator.geolocation) {
            setGpsError("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }
        setGpsDetecting(true);
        setGpsError("");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude.toFixed(7),
                    longitude: position.coords.longitude.toFixed(7),
                    rayon_gps: formData.rayon_gps || 100,
                });
                setGpsDetecting(false);
            },
            (error) => {
                setGpsDetecting(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setGpsError("Vous avez refusé la géolocalisation. Veuillez autoriser l'accès à votre position.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setGpsError("Position indisponible. Vérifiez que le GPS est activé.");
                        break;
                    case error.TIMEOUT:
                        setGpsError("La demande de position a expiré. Réessayez.");
                        break;
                    default:
                        setGpsError("Erreur de géolocalisation : " + error.message);
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
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

    const formatCoords = (lat, lng) => {
        if (!lat && !lng) return "—";
        return `${lat}, ${lng}`;
    };

    return (
        <div>
            <h1 className="page-title">Sites / Agences</h1>
            <p className="page-description">Gérez les sites de votre entreprise avec géolocalisation GPS anti-triche</p>

            {message && (
                <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold",
                    background: message.includes("Erreur") ? "#f8d7da" : "#d4edda",
                    color: message.includes("Erreur") ? "#721c24" : "#155724" }}>{message}</div>
            )}

            <div className="employes-actions">
                <button className="employes-btn employes-btn-primary" onClick={openAdd}>
                    + Ajouter un site
                </button>
            </div>

            {showForm && (
                <div className="config-section" style={{ marginBottom: 24 }}>
                    <h3 className="config-section-title">
                        <MapPin size={18} style={{ color: "var(--color-primary)" }} />
                        {editing ? "Modifier le site" : "Nouveau site"}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        {/* Nom */}
                        <div className="config-option">
                            <div><strong>Nom du site *</strong><div className="config-description">Ex: Siège Brazzaville, Dépôt Pointe-Noire</div></div>
                            <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="config-input" required />
                        </div>
                        {/* Code */}
                        <div className="config-option">
                            <div><strong>Code</strong><div className="config-description">Code court optionnel</div></div>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} className="config-input" placeholder="SIEGE" />
                        </div>
                        {/* Ville + Pays */}
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
                        {/* Adresse */}
                        <div className="config-option">
                            <div><strong>Adresse</strong></div>
                            <textarea name="adresse" value={formData.adresse} onChange={handleChange} className="config-input" rows={2} style={{ resize: "vertical", fontFamily: "inherit" }} />
                        </div>
                        {/* Téléphone + Email */}
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
                        {/* Horaires */}
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

                        {/* ===== GÉOLOCALISATION GPS ===== */}
                        <div style={{ marginTop: 24, padding: "16px", background: "#F0F7FF", borderRadius: "12px", border: "1px solid #DBEAFE" }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1E40AF", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                <Navigation size={16} />
                                📍 Géolocalisation GPS (anti-triche)
                            </h4>
                            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
                                Les employés devront être à proximité de ce site pour pouvoir pointer.
                                Utilisez le bouton ci-dessous pour détecter automatiquement votre position actuelle.
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                <div className="config-option" style={{ border: "none", padding: 0 }}>
                                    <div><strong>Latitude</strong></div>
                                    <input type="text" name="latitude" value={formData.latitude}
                                        onChange={handleChange} className="config-input"
                                        placeholder="Ex: -4.2694417" style={{ fontFamily: "monospace", fontSize: 13 }} />
                                </div>
                                <div className="config-option" style={{ border: "none", padding: 0 }}>
                                    <div><strong>Longitude</strong></div>
                                    <input type="text" name="longitude" value={formData.longitude}
                                        onChange={handleChange} className="config-input"
                                        placeholder="Ex: 15.2738844" style={{ fontFamily: "monospace", fontSize: 13 }} />
                                </div>
                                <div className="config-option" style={{ border: "none", padding: 0 }}>
                                    <div><strong>Rayon GPS (m)</strong></div>
                                    <input type="number" name="rayon_gps" value={formData.rayon_gps}
                                        onChange={handleChange} className="config-input"
                                        min={10} max={1000} style={{ fontFamily: "monospace" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                                <button type="button" onClick={detectLocation} disabled={gpsDetecting}
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                        padding: "8px 16px", borderRadius: "8px", border: "2px solid #2563EB",
                                        background: gpsDetecting ? "#DBEAFE" : "#EFF6FF",
                                        color: "#1D4ED8", fontWeight: 600, fontSize: 13, cursor: "pointer",
                                        fontFamily: "inherit", transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { if (!gpsDetecting) e.target.style.background = "#DBEAFE"; }}
                                    onMouseLeave={(e) => { if (!gpsDetecting) e.target.style.background = "#EFF6FF"; }}
                                >
                                    {gpsDetecting ? (
                                        <>⏳ Détection en cours...</>
                                    ) : (
                                        <><Target size={14} /> Détecter ma position</>
                                    )}
                                </button>
                                {formData.latitude && formData.longitude && (
                                    <span style={{ fontSize: 12, color: "#059669", fontWeight: 500 }}>
                                        ✅ Position détectée
                                    </span>
                                )}
                                {gpsError && (
                                    <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 500 }}>
                                        ⚠️ {gpsError}
                                    </span>
                                )}
                            </div>
                            {formData.latitude && formData.longitude && (
                                <div style={{ marginTop: 8, fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                                    <Globe size={12} />
                                    <span>
                                        <a href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                                           target="_blank" rel="noopener noreferrer"
                                           style={{ color: "#2563EB", textDecoration: "underline" }}>
                                            Voir sur Google Maps
                                        </a>
                                        {formData.rayon_gps && ` — Rayon de ${formData.rayon_gps}m autour de ce point`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button type="submit" className="employes-btn employes-btn-primary">
                                {editing ? "Enregistrer" : "Créer le site"}
                            </button>
                            <button type="button" className="employes-btn" onClick={() => setShowForm(false)}
                                style={{ background: "#dc3545", color: "white" }}>Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ===== TABLEAU DES SITES ===== */}
            <div className="employes-table-container">
                <table className="employes-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Code</th>
                            <th>Ville</th>
                            <th>📍 GPS</th>
                            <th>Rayon</th>
                            <th>Employés</th>
                            <th>Équipes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sites.map(s => (
                            <tr key={s.id}>
                                <td><strong>{s.nom}</strong></td>
                                <td><code>{s.code || "—"}</code></td>
                                <td>{s.ville || "—"}</td>
                                <td style={{ fontFamily: "monospace", fontSize: 12, color: s.latitude ? "#2563EB" : "#9CA3AF" }}>
                                    {s.latitude ? (
                                        <span title={`${s.latitude}, ${s.longitude}`}>
                                            📍 {s.latitude?.toFixed ? s.latitude.toFixed(4) : s.latitude?.toString().slice(0, 8)}...
                                        </span>
                                    ) : "Non défini"}
                                </td>
                                <td>{s.rayon_gps ? `${s.rayon_gps}m` : "—"}</td>
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
                            <tr><td colSpan={8} className="employes-empty">Aucun site. Créez le premier avec sa position GPS !</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Sites;
