// ================================================================
// heuresSup.model.js - Heures supplémentaires
// ================================================================

const pool = require("../config/database");

async function getAll(filters = {}) {
    const { employe_id, statut, date_debut, date_fin } = filters;
    let sql = `
        SELECT hs.*,
               e.nom || ' ' || e.prenom AS employe_nom,
               e.matricule,
               d.nom AS departement_nom,
               v.nom || ' ' || v.prenom AS valide_par_nom
        FROM heures_sup hs
        JOIN employes e ON e.id = hs.employe_id
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN employes v ON v.id = hs.valide_par
        WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (employe_id) { sql += ` AND hs.employe_id = $${idx++}`; params.push(employe_id); }
    if (statut) { sql += ` AND hs.statut = $${idx++}`; params.push(statut); }
    if (date_debut) { sql += ` AND hs.date_heure_sup >= $${idx++}`; params.push(date_debut); }
    if (date_fin) { sql += ` AND hs.date_heure_sup <= $${idx++}`; params.push(date_fin); }

    sql += ` ORDER BY hs.created_at DESC`;
    const result = await pool.query(sql, params);
    return result.rows;
}

async function getById(id) {
    const result = await pool.query(`
        SELECT hs.*,
               e.nom || ' ' || e.prenom AS employe_nom,
               e.matricule,
               v.nom || ' ' || v.prenom AS valide_par_nom
        FROM heures_sup hs
        JOIN employes e ON e.id = hs.employe_id
        LEFT JOIN employes v ON v.id = hs.valide_par
        WHERE hs.id = $1
    `, [id]);
    return result.rows[0];
}

async function create(data) {
    const { employe_id, date_heure_sup, nb_heures, taux_majoration, motif } = data;
    const result = await pool.query(`
        INSERT INTO heures_sup (employe_id, date_heure_sup, nb_heures, taux_majoration, motif)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [employe_id, date_heure_sup || new Date().toISOString().split('T')[0], nb_heures, taux_majoration || 1.5, motif || null]);
    return result.rows[0];
}

async function approve(id, valide_par, commentaire) {
    const result = await pool.query(`
        UPDATE heures_sup SET
            statut = 'Approuve',
            valide_par = $2,
            commentaire_validation = $3,
            updated_at = NOW()
        WHERE id = $1 AND statut = 'En attente'
        RETURNING *
    `, [id, valide_par, commentaire || null]);
    return result.rows[0];
}

async function reject(id, valide_par, commentaire) {
    const result = await pool.query(`
        UPDATE heures_sup SET
            statut = 'Rejete',
            valide_par = $2,
            commentaire_validation = $3,
            updated_at = NOW()
        WHERE id = $1 AND statut = 'En attente'
        RETURNING *
    `, [id, valide_par, commentaire || null]);
    return result.rows[0];
}

async function remove(id) {
    const result = await pool.query(
        "DELETE FROM heures_sup WHERE id = $1 AND statut = 'En attente' RETURNING id",
        [id]
    );
    return result.rows[0];
}

async function getStats(employe_id, date_debut, date_fin) {
    let sql = `
        SELECT COUNT(*) AS total,
               SUM(nb_heures) AS total_heures,
               SUM(nb_heures * taux_majoration) AS total_heures_majorees,
               COUNT(*) FILTER (WHERE statut = 'Approuve') AS approuvees,
               SUM(nb_heures) FILTER (WHERE statut = 'Approuve') AS heures_approuvees
        FROM heures_sup
        WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (employe_id) { sql += ` AND employe_id = $${idx++}`; params.push(employe_id); }
    if (date_debut) { sql += ` AND date_heure_sup >= $${idx++}`; params.push(date_debut); }
    if (date_fin) { sql += ` AND date_heure_sup <= $${idx++}`; params.push(date_fin); }
    const result = await pool.query(sql, params);
    return result.rows[0];
}

module.exports = { getAll, getById, create, approve, reject, remove, getStats };
