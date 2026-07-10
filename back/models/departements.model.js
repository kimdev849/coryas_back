// ================================================================
// departements.model.js - Requete SQL pour les departements
// ================================================================
// Recupere la liste des departements depuis la vraie table departements.
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// getDepartements() - Liste tous les departements
// ----------------------------------------------------------------
async function getDepartements() {
    const result = await pool.query(`
        SELECT id, nom
        FROM departements
        ORDER BY nom ASC
    `);
    // On renvoie un tableau d'objets: [{ id: 1, nom: "Informatique" }, ...]
    return result.rows;
}

module.exports = { getDepartements };
