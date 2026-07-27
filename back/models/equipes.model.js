// ================================================================
// equipes.model.js - Équipes dans les départements
// ================================================================

const pool = require("../config/database");

async function getAll() {
    const result = await pool.query(`
        SELECT eq.*,
               d.nom AS departement_nom,
               s.nom AS site_nom,
               (e.nom || ' ' || e.prenom) AS responsable_nom,
               (SELECT COUNT(*) FROM employes emp WHERE emp.equipe_id = eq.id AND emp.statut = 'Actif') AS nb_employes
        FROM equipes eq
        LEFT JOIN departements d ON d.id = eq.departement_id
        LEFT JOIN sites s ON s.id = eq.site_id
        LEFT JOIN employes e ON e.id = eq.responsable_id
        ORDER BY eq.nom ASC
    `);
    return result.rows;
}

async function getById(id) {
    const result = await pool.query(`
        SELECT eq.*,
               d.nom AS departement_nom,
               s.nom AS site_nom,
               (e.nom || ' ' || e.prenom) AS responsable_nom
        FROM equipes eq
        LEFT JOIN departements d ON d.id = eq.departement_id
        LEFT JOIN sites s ON s.id = eq.site_id
        LEFT JOIN employes e ON e.id = eq.responsable_id
        WHERE eq.id = $1
    `, [id]);
    return result.rows[0];
}

async function create(data) {
    const { nom, code, departement_id, site_id, responsable_id } = data;
    const result = await pool.query(`
        INSERT INTO equipes (nom, code, departement_id, site_id, responsable_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [nom, code || null, departement_id || null, site_id || null, responsable_id || null]);
    return result.rows[0];
}

async function update(id, data) {
    const { nom, code, departement_id, site_id, responsable_id, actif } = data;
    const result = await pool.query(`
        UPDATE equipes SET
            nom = COALESCE($2, nom),
            code = COALESCE($3, code),
            departement_id = COALESCE($4, departement_id),
            site_id = COALESCE($5, site_id),
            responsable_id = COALESCE($6, responsable_id),
            actif = COALESCE($7, actif),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, nom, code, departement_id, site_id, responsable_id, actif]);
    return result.rows[0];
}

module.exports = { getAll, getById, create, update };
