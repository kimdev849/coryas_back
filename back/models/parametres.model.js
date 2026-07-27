// ================================================================
// parametres.model.js - Requete SQL pour la table parametres
// ================================================================
// La table parametres contient UNE SEULE ligne avec tous les reglages.
// get  -> SELECT la premiere ligne (id=1)
// save -> UPSERT (INSERT ou UPDATE si la ligne existe deja)
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// get() - Recupere les parametres
// ----------------------------------------------------------------
async function get() {
    const result = await pool.query(`
        SELECT * FROM parametres WHERE id = 1
    `);
    return result.rows[0] || null;
}

// ----------------------------------------------------------------
// save(data) - Sauvegarde les parametres (upsert)
// ----------------------------------------------------------------
// UPSERT = si la ligne id=1 existe, on UPDATE. Sinon on INSERT.
// ----------------------------------------------------------------
async function save(data) {
    const {
        nom_entreprise, heure_ouverture, heure_fermeture,
        retard_apres, depart_anticipe, duree_pause,
        email_entreprise, telephone, adresse,
        theme
    } = data;

    const result = await pool.query(`
        INSERT INTO parametres (id, nom_entreprise, heure_ouverture, heure_fermeture,
                                retard_apres, depart_anticipe, duree_pause,
                                email_entreprise, telephone, adresse,
                                theme, updated_at)
        VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
            nom_entreprise = COALESCE($1, parametres.nom_entreprise),
            heure_ouverture = COALESCE($2, parametres.heure_ouverture),
            heure_fermeture = COALESCE($3, parametres.heure_fermeture),
            retard_apres = COALESCE($4, parametres.retard_apres),
            depart_anticipe = COALESCE($5, parametres.depart_anticipe),
            duree_pause = COALESCE($6, parametres.duree_pause),
            email_entreprise = COALESCE($7, parametres.email_entreprise),
            telephone = COALESCE($8, parametres.telephone),
            adresse = COALESCE($9, parametres.adresse),
            theme = COALESCE($10, parametres.theme),
            updated_at = NOW()
        RETURNING *
    `, [nom_entreprise, heure_ouverture, heure_fermeture,
        retard_apres, depart_anticipe, duree_pause,
        email_entreprise, telephone, adresse,
        theme || 'bleu']);
    return result.rows[0];
}

module.exports = { get, save };
