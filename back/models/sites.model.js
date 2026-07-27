// ================================================================
// sites.model.js - Multi-sites / Agences
// ================================================================

const pool = require("../config/database");

async function getAll() {
    const result = await pool.query(`
        SELECT s.*,
               (SELECT COUNT(*) FROM employes e WHERE e.site_id = s.id AND e.statut = 'Actif') AS nb_employes,
               (SELECT COUNT(*) FROM equipes eq WHERE eq.site_id = s.id AND eq.actif = true) AS nb_equipes
        FROM sites s
        ORDER BY s.nom ASC
    `);
    return result.rows;
}

async function getById(id) {
    const result = await pool.query(`
        SELECT s.*,
               (SELECT COUNT(*) FROM employes e WHERE e.site_id = s.id AND e.statut = 'Actif') AS nb_employes
        FROM sites s WHERE s.id = $1
    `, [id]);
    return result.rows[0];
}

async function create(data) {
    const { nom, code, adresse, ville, pays, telephone, email, horaire_ouverture, horaire_fermeture, latitude, longitude, rayon_gps } = data;
    const result = await pool.query(`
        INSERT INTO sites (nom, code, adresse, ville, pays, telephone, email, horaire_ouverture, horaire_fermeture, latitude, longitude, rayon_gps)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
    `, [nom, code || null, adresse || null, ville || null, pays || "Côte d'Ivoire", telephone || null, email || null, horaire_ouverture || null, horaire_fermeture || null, latitude || null, longitude || null, rayon_gps || 100]);
    return result.rows[0];
}

async function update(id, data) {
    const { nom, code, adresse, ville, pays, telephone, email, horaire_ouverture, horaire_fermeture, actif, latitude, longitude, rayon_gps } = data;
    const result = await pool.query(`
        UPDATE sites SET
            nom = COALESCE($2, nom),
            code = COALESCE($3, code),
            adresse = COALESCE($4, adresse),
            ville = COALESCE($5, ville),
            pays = COALESCE($6, pays),
            telephone = COALESCE($7, telephone),
            email = COALESCE($8, email),
            horaire_ouverture = COALESCE($9, horaire_ouverture),
            horaire_fermeture = COALESCE($10, horaire_fermeture),
            actif = COALESCE($11, actif),
            latitude = COALESCE($12, latitude),
            longitude = COALESCE($13, longitude),
            rayon_gps = COALESCE($14, rayon_gps),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, nom, code, adresse, ville, pays, telephone, email, horaire_ouverture, horaire_fermeture, actif, latitude, longitude, rayon_gps]);
    return result.rows[0];
}

module.exports = { getAll, getById, create, update };
