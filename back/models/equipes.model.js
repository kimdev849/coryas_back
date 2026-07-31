// ================================================================
// equipes.model.js - Équipes dans les départements
// ================================================================

const pool = require("../config/database");

async function getAll(entrepriseId = null) {
    let sql = `
        SELECT eq.*,
               d.nom AS departement_nom,
               s.nom AS site_nom,
               (e.nom || ' ' || e.prenom) AS responsable_nom,
               (SELECT COUNT(*) FROM employes emp WHERE emp.equipe_id = eq.id AND emp.statut = 'Actif') AS nb_employes
        FROM equipes eq
        LEFT JOIN departements d ON d.id = eq.departement_id
        LEFT JOIN sites s ON s.id = eq.site_id
        LEFT JOIN employes e ON e.id = eq.responsable_id
        WHERE 1=1
    `;
    const params = [];
    if (entrepriseId) {
        // ⚠️ N'afficher que les équipes DE cette entreprise.
        // Les équipes avec entreprise_id NULL (jamais assignées) ne
        // doivent PAS apparaître chez tout le monde.
        sql += ` AND eq.entreprise_id = $1`;
        params.push(entrepriseId);
    } else {
        // SuperAdmin (pas d'entreprise) : ne voit pas non plus les
        // équipes fantômes non assignées.
        sql += ` AND eq.entreprise_id IS NOT NULL`;
    }
    sql += ` ORDER BY eq.nom ASC`;
    const result = await pool.query(sql, params);
    return result.rows;
}

async function getById(id, entrepriseId = null) {
    let sql = `
        SELECT eq.*,
               d.nom AS departement_nom,
               s.nom AS site_nom,
               (e.nom || ' ' || e.prenom) AS responsable_nom
        FROM equipes eq
        LEFT JOIN departements d ON d.id = eq.departement_id
        LEFT JOIN sites s ON s.id = eq.site_id
        LEFT JOIN employes e ON e.id = eq.responsable_id
        WHERE eq.id = $1
    `;
    const params = [id];
    if (entrepriseId) {
        sql += ` AND eq.entreprise_id = $2`;
        params.push(entrepriseId);
    }
    const result = await pool.query(sql, params);
    return result.rows[0];
}

// getById reste inchangé : accessible par ID (le front ne l'utilise pas)

async function create(data) {
    const { nom, code, departement_id, site_id, responsable_id, entreprise_id } = data;
    const result = await pool.query(`
        INSERT INTO equipes (nom, code, departement_id, site_id, responsable_id, entreprise_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `, [nom, code || null, departement_id || null, site_id || null, responsable_id || null, entreprise_id || null]);
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
