// ================================================================
// typeContrat.model.js - Types de contrats (CDI, CDD, Stage...)
// ================================================================

const pool = require("../config/database");

async function getAll() {
    const result = await pool.query(`
        SELECT * FROM type_contrat ORDER BY nom ASC
    `);
    return result.rows;
}

async function getById(id) {
    const result = await pool.query(`
        SELECT * FROM type_contrat WHERE id = $1
    `, [id]);
    return result.rows[0];
}

async function create(data) {
    const { nom, code, duree_essai_jours } = data;
    const result = await pool.query(`
        INSERT INTO type_contrat (nom, code, duree_essai_jours)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [nom, code, duree_essai_jours || 0]);
    return result.rows[0];
}

async function update(id, data) {
    const { nom, code, duree_essai_jours, actif } = data;
    const result = await pool.query(`
        UPDATE type_contrat SET
            nom = COALESCE($2, nom),
            code = COALESCE($3, code),
            duree_essai_jours = COALESCE($4, duree_essai_jours),
            actif = COALESCE($5, actif),
            created_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, nom, code, duree_essai_jours, actif]);
    return result.rows[0];
}

module.exports = { getAll, getById, create, update };
