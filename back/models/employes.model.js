// ================================================================
// employes.model.js - Requetes SQL pour les employes
// ================================================================
// Vraie structure Supabase :
//   id, matricule, nom, prenom, sexe, telephone,
//   date_naissance, date_embauche, departement_id, statut
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// getEmployes() - Liste tous les employes avec leur departement ET utilisateur
// ----------------------------------------------------------------
async function getEmployes() {
    const result = await pool.query(`
        SELECT e.id, e.matricule, e.nom, e.prenom, e.sexe, e.telephone,
               e.date_naissance, e.date_embauche, e.departement_id,
               d.nom AS departement_nom, e.statut,
               e.created_at, e.updated_at,
               u.email, u.role_id
        FROM employes e
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN utilisateurs u ON u.employe_id = e.id
        ORDER BY e.id ASC
    `);
    return result.rows;
}

// ----------------------------------------------------------------
// getEmployeById(id) - Voir un employe par son ID
// ----------------------------------------------------------------
async function getEmployeById(id) {
    const result = await pool.query(`
        SELECT e.*, d.nom AS departement_nom, u.email, u.role_id
        FROM employes e
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN utilisateurs u ON u.employe_id = e.id
        WHERE e.id = $1
    `, [id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// create({ matricule, nom, prenom, sexe, telephone,
//          date_naissance, date_embauche, departement_id })
// ----------------------------------------------------------------
async function create({ matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id }) {
    const result = await pool.query(`
        INSERT INTO employes (matricule, nom, prenom, sexe, telephone,
                              date_naissance, date_embauche, departement_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `, [matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// update(id, { matricule, nom, prenom, sexe, telephone,
//              date_naissance, date_embauche, departement_id, statut })
// ----------------------------------------------------------------
async function update(id, { matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id, statut }) {
    const result = await pool.query(`
        UPDATE employes SET
            matricule = COALESCE($2, matricule),
            nom = COALESCE($3, nom),
            prenom = COALESCE($4, prenom),
            sexe = COALESCE($5, sexe),
            telephone = COALESCE($6, telephone),
            date_naissance = COALESCE($7, date_naissance),
            date_embauche = COALESCE($8, date_embauche),
            departement_id = COALESCE($9, departement_id),
            statut = COALESCE($10, statut),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id, statut]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// remove(id) - Supprimer un employe
// ----------------------------------------------------------------
async function remove(id) {
    const result = await pool.query(
        "DELETE FROM employes WHERE id = $1 RETURNING id", [id]
    );
    return result.rows[0];
}

module.exports = { getEmployes, getEmployeById, create, update, remove };
