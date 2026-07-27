// ================================================================
// typeConge.model.js - Types de congés configurables + Soldes
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// Types de congés
// ----------------------------------------------------------------
async function getAllTypes() {
    const result = await pool.query(`
        SELECT * FROM type_conge ORDER BY nom ASC
    `);
    return result.rows;
}

async function getTypeById(id) {
    const result = await pool.query(`
        SELECT * FROM type_conge WHERE id = $1
    `, [id]);
    return result.rows[0];
}

async function createType(data) {
    const { nom, code, description, paye, jours_max, couleur } = data;
    const result = await pool.query(`
        INSERT INTO type_conge (nom, code, description, paye, jours_max, couleur)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `, [nom, code, description, paye ?? true, jours_max || null, couleur || '#3b82f6']);
    return result.rows[0];
}

async function updateType(id, data) {
    const { nom, code, description, paye, jours_max, couleur, actif } = data;
    const result = await pool.query(`
        UPDATE type_conge SET
            nom = COALESCE($2, nom),
            code = COALESCE($3, code),
            description = COALESCE($4, description),
            paye = COALESCE($5, paye),
            jours_max = COALESCE($6, jours_max),
            couleur = COALESCE($7, couleur),
            actif = COALESCE($8, actif),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, nom, code, description, paye, jours_max, couleur, actif]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// Soldes de congés par employé
// ----------------------------------------------------------------
async function getSoldeByEmploye(employe_id, annee) {
    if (!annee) annee = new Date().getFullYear();
    const result = await pool.query(`
        SELECT sc.*, tc.nom AS type_conge_nom, tc.code AS type_conge_code,
               tc.couleur, tc.paye, tc.jours_max AS max_autorise,
               (sc.total_jours - sc.jours_pris) AS jours_restants
        FROM solde_conge sc
        JOIN type_conge tc ON tc.id = sc.type_conge_id
        WHERE sc.employe_id = $1 AND sc.annee = $2
        ORDER BY tc.nom ASC
    `, [employe_id, annee]);
    return result.rows;
}

async function getAllSoldes(annee) {
    if (!annee) annee = new Date().getFullYear();
    const result = await pool.query(`
        SELECT sc.*, tc.nom AS type_conge_nom, tc.code AS type_conge_code,
               tc.couleur,
               e.nom || ' ' || e.prenom AS employe_nom,
               e.matricule,
               d.nom AS departement_nom,
               (sc.total_jours - sc.jours_pris) AS jours_restants
        FROM solde_conge sc
        JOIN type_conge tc ON tc.id = sc.type_conge_id
        JOIN employes e ON e.id = sc.employe_id
        LEFT JOIN departements d ON d.id = e.departement_id
        WHERE sc.annee = $1
        ORDER BY e.nom, tc.nom
    `, [annee]);
    return result.rows;
}

async function updateSolde(id, data) {
    const { total_jours, jours_pris } = data;
    const result = await pool.query(`
        UPDATE solde_conge SET
            total_jours = COALESCE($2, total_jours),
            jours_pris = COALESCE($3, jours_pris),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, total_jours, jours_pris]);
    return result.rows[0];
}

async function creerSolde(data) {
    const { employe_id, type_conge_id, total_jours, annee } = data;
    const an = annee || new Date().getFullYear();
    const result = await pool.query(`
        INSERT INTO solde_conge (employe_id, type_conge_id, total_jours, annee)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (employe_id, type_conge_id, annee)
        DO UPDATE SET total_jours = EXCLUDED.total_jours, updated_at = NOW()
        RETURNING *
    `, [employe_id, type_conge_id, total_jours || 0, an]);
    return result.rows[0];
}

async function ajouterJoursPris(employe_id, type_conge_id, jours, annee) {
    const an = annee || new Date().getFullYear();
    const result = await pool.query(`
        UPDATE solde_conge SET
            jours_pris = jours_pris + $3,
            updated_at = NOW()
        WHERE employe_id = $1 AND type_conge_id = $2 AND annee = $4
        RETURNING *
    `, [employe_id, type_conge_id, jours, an]);
    return result.rows[0];
}

async function getSoldeByEmployeAndType(employe_id, type_conge_id, annee) {
    const an = annee || new Date().getFullYear();
    const result = await pool.query(`
        SELECT sc.*, tc.nom AS type_conge_nom, tc.code AS type_conge_code,
               tc.jours_max AS max_autorise,
               (sc.total_jours - sc.jours_pris) AS jours_restants
        FROM solde_conge sc
        JOIN type_conge tc ON tc.id = sc.type_conge_id
        WHERE sc.employe_id = $1 AND sc.type_conge_id = $2 AND sc.annee = $3
    `, [employe_id, type_conge_id, an]);
    return result.rows[0];
}

module.exports = {
    getAllTypes, getTypeById, createType, updateType,
    getSoldeByEmploye, getAllSoldes, updateSolde, creerSolde,
    ajouterJoursPris, getSoldeByEmployeAndType,
};
