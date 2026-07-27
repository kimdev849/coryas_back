// ================================================================
// export.controller.js - Export CSV des données
// ================================================================
// Pas de dépendance lourde : on génère du CSV directement.
// Le navigateur pourra l'ouvrir dans Excel/LibreOffice.

const pool = require("../config/database");

// ----------------------------------------------------------------
// GET /api/export/presences?employe_id=&date_debut=&date_fin=
// ----------------------------------------------------------------
const exportPresencesCSV = async (req, res) => {
    try {
        const { employe_id, date_debut, date_fin } = req.query;
        let sql = `
            SELECT p.date_presence, p.heure_entree, p.heure_sortie, p.statut,
                   e.nom || ' ' || e.prenom AS employe_nom, e.matricule,
                   d.nom AS departement_nom
            FROM presences p
            JOIN employes e ON e.id = p.employe_id
            LEFT JOIN departements d ON d.id = e.departement_id
            WHERE 1=1
        `;
        const params = [];
        let idx = 1;
        if (employe_id) { sql += ` AND p.employe_id = $${idx++}`; params.push(employe_id); }
        if (date_debut) { sql += ` AND p.date_presence >= $${idx++}`; params.push(date_debut); }
        if (date_fin) { sql += ` AND p.date_presence <= $${idx++}`; params.push(date_fin); }
        sql += ` ORDER BY p.date_presence DESC, e.nom`;

        const result = await pool.query(sql, params);

        // Génération CSV
        const headers = ["Date", "Employé", "Matricule", "Département", "Arrivée", "Départ", "Statut"];
        const rows = result.rows.map(r => [
            r.date_presence, r.employe_nom, r.matricule, r.departement_nom || "",
            r.heure_entree || "", r.heure_sortie || "", r.statut || ""
        ]);

        let csv = headers.join(",") + "\n";
        rows.forEach(row => {
            csv += row.map(cell => `"${cell || ""}"`).join(",") + "\n";
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename=presences_${date_debut || "debut"}_${date_fin || "fin"}.csv`);
        res.send("\uFEFF" + csv); // BOM UTF-8 pour Excel
    } catch (error) {
        console.error("❌ exportPresencesCSV:", error);
        res.status(500).json({ message: "Erreur export", error: error.message });
    }
};

// ----------------------------------------------------------------
// GET /api/export/conges?statut=&date_debut=&date_fin=
// ----------------------------------------------------------------
const exportCongesCSV = async (req, res) => {
    try {
        const { statut, date_debut, date_fin } = req.query;
        let sql = `
            SELECT c.date_debut, c.date_fin, c.motif, c.statut, c.created_at,
                   e.nom || ' ' || e.prenom AS employe_nom, e.matricule,
                   d.nom AS departement_nom
            FROM conges c
            JOIN employes e ON e.id = c.employe_id
            LEFT JOIN departements d ON d.id = e.departement_id
            WHERE 1=1
        `;
        const params = [];
        let idx = 1;
        if (statut) { sql += ` AND c.statut = $${idx++}`; params.push(statut); }
        if (date_debut) { sql += ` AND c.date_debut >= $${idx++}`; params.push(date_debut); }
        if (date_fin) { sql += ` AND c.date_fin <= $${idx++}`; params.push(date_fin); }
        sql += ` ORDER BY c.created_at DESC`;

        const result = await pool.query(sql, params);

        const headers = ["Employé", "Matricule", "Département", "Début", "Fin", "Motif", "Statut", "Créé le"];
        const rows = result.rows.map(r => [
            r.employe_nom, r.matricule, r.departement_nom || "",
            r.date_debut, r.date_fin, r.motif, r.statut, r.created_at
        ]);

        let csv = headers.join(",") + "\n";
        rows.forEach(row => {
            csv += row.map(cell => `"${cell || ""}"`).join(",") + "\n";
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename=conges_export.csv`);
        res.send("\uFEFF" + csv);
    } catch (error) {
        console.error("❌ exportCongesCSV:", error);
        res.status(500).json({ message: "Erreur export", error: error.message });
    }
};

// ----------------------------------------------------------------
// GET /api/export/employes
// ----------------------------------------------------------------
const exportEmployesCSV = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.matricule, e.nom, e.prenom, e.sexe, e.telephone,
                   e.date_naissance, e.date_embauche, e.poste, e.statut,
                   d.nom AS departement_nom,
                   s.nom AS site_nom,
                   u.email
            FROM employes e
            LEFT JOIN departements d ON d.id = e.departement_id
            LEFT JOIN sites s ON s.id = e.site_id
            LEFT JOIN utilisateurs u ON u.employe_id = e.id
            ORDER BY e.nom
        `);

        const headers = ["Matricule", "Nom", "Prénom", "Sexe", "Téléphone", "Date naissance",
                         "Date embauche", "Poste", "Statut", "Département", "Site", "Email"];
        const rows = result.rows.map(r => [
            r.matricule, r.nom, r.prenom, r.sexe || "", r.telephone || "",
            r.date_naissance || "", r.date_embauche || "", r.poste || "",
            r.statut || "", r.departement_nom || "", r.site_nom || "", r.email || ""
        ]);

        let csv = headers.join(",") + "\n";
        rows.forEach(row => {
            csv += row.map(cell => `"${cell || ""}"`).join(",") + "\n";
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=employes_export.csv");
        res.send("\uFEFF" + csv);
    } catch (error) {
        console.error("❌ exportEmployesCSV:", error);
        res.status(500).json({ message: "Erreur export", error: error.message });
    }
};

// ----------------------------------------------------------------
// GET /api/export/heures-sup
// ----------------------------------------------------------------
const exportHeuresSupCSV = async (req, res) => {
    try {
        const { employe_id, statut, date_debut, date_fin } = req.query;
        let sql = `
            SELECT hs.date_heure_sup, hs.nb_heures, hs.taux_majoration, hs.motif, hs.statut,
                   e.nom || ' ' || e.prenom AS employe_nom, e.matricule,
                   d.nom AS departement_nom
            FROM heures_sup hs
            JOIN employes e ON e.id = hs.employe_id
            LEFT JOIN departements d ON d.id = e.departement_id
            WHERE 1=1
        `;
        const params = [];
        let idx = 1;
        if (employe_id) { sql += ` AND hs.employe_id = $${idx++}`; params.push(employe_id); }
        if (statut) { sql += ` AND hs.statut = $${idx++}`; params.push(statut); }
        if (date_debut) { sql += ` AND hs.date_heure_sup >= $${idx++}`; params.push(date_debut); }
        if (date_fin) { sql += ` AND hs.date_heure_sup <= $${idx++}`; params.push(date_fin); }
        sql += ` ORDER BY hs.date_heure_sup DESC`;

        const result = await pool.query(sql, params);

        const headers = ["Employé", "Matricule", "Département", "Date", "Heures", "Taux", "Motif", "Statut"];
        const rows = result.rows.map(r => [
            r.employe_nom, r.matricule, r.departement_nom || "",
            r.date_heure_sup, r.nb_heures, "x" + r.taux_majoration, r.motif || "", r.statut
        ]);

        let csv = headers.join(",") + "\n";
        rows.forEach(row => { csv += row.map(cell => `"${cell || ""}"`).join(",") + "\n"; });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=heures_sup_export.csv");
        res.send("\uFEFF" + csv);
    } catch (error) {
        console.error("❌ exportHeuresSupCSV:", error);
        res.status(500).json({ message: "Erreur export", error: error.message });
    }
};

module.exports = { exportPresencesCSV, exportCongesCSV, exportEmployesCSV, exportHeuresSupCSV };
