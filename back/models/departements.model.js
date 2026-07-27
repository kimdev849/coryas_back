// ================================================================
// departements.model.js - Requetes SQL pour les departements
// ================================================================
// Chaque entreprise a ses propres departements (multi-tenant).
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// getDepartements(entrepriseId) - Liste les departements d'une entreprise
// ----------------------------------------------------------------
async function getDepartements(entrepriseId = null) {
    let sql = `
        SELECT d.*,
               (SELECT COUNT(*) FROM employes e WHERE e.departement_id = d.id AND e.statut = 'Actif') AS nb_employes
        FROM departements d
        WHERE 1=1
    `;
    const params = [];
    if (entrepriseId) {
        sql += ` AND d.entreprise_id = $1`;
        params.push(entrepriseId);
    }
    sql += ` ORDER BY d.nom ASC`;
    const result = await pool.query(sql, params);
    return result.rows;
}

// ----------------------------------------------------------------
// getDepartementById(id, entrepriseId) - Voir un departement par son ID
// ----------------------------------------------------------------
async function getDepartementById(id, entrepriseId = null) {
    let sql = `SELECT d.* FROM departements d WHERE d.id = $1`;
    const params = [id];
    if (entrepriseId) {
        sql += ` AND d.entreprise_id = $2`;
        params.push(entrepriseId);
    }
    const result = await pool.query(sql, params);
    return result.rows[0];
}

// ----------------------------------------------------------------
// create(data) - Creer un departement
// ----------------------------------------------------------------
async function create(data) {
    const { nom, code, entreprise_id } = data;
    const result = await pool.query(`
        INSERT INTO departements (nom, code, entreprise_id)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [nom, code || null, entreprise_id || null]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// update(id, data) - Modifier un departement
// ----------------------------------------------------------------
async function update(id, data) {
    const { nom, code } = data;
    const result = await pool.query(`
        UPDATE departements SET
            nom = COALESCE($2, nom),
            code = COALESCE($3, code),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, nom, code]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// remove(id) - Supprimer un departement
// ----------------------------------------------------------------
async function remove(id) {
    const result = await pool.query(`
        DELETE FROM departements WHERE id = $1 RETURNING id
    `, [id]);
    return result.rows[0];
}

module.exports = { getDepartements, getDepartementById, create, update, remove };
