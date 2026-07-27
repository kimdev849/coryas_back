// ================================================================
// parametres.model.js - Paramètres par entreprise
// ================================================================
// Chaque entreprise a SA propre ligne de paramètres,
// identifiée par entreprise_id.
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// get(entrepriseId) - Récupère les paramètres d'une entreprise
// ----------------------------------------------------------------
async function get(entrepriseId = null) {
    if (!entrepriseId) {
        // Fallback pour SuperAdmin ou données legacy
        const result = await pool.query(`SELECT * FROM parametres LIMIT 1`);
        return result.rows[0] || null;
    }
    const result = await pool.query(`
        SELECT * FROM parametres WHERE entreprise_id = $1
    `, [entrepriseId]);
    return result.rows[0] || null;
}

// ----------------------------------------------------------------
// save(data) - Sauvegarde les paramètres d'une entreprise
// ----------------------------------------------------------------
// UPSERT avec entreprise_id comme clé unique
// ----------------------------------------------------------------
async function save(data) {
    const {
        nom_entreprise, heure_ouverture, heure_fermeture,
        retard_apres, depart_anticipe, duree_pause,
        email_entreprise, telephone, adresse,
        theme, entreprise_id
    } = data;

    if (!entreprise_id) {
        const result = await pool.query(`
            UPDATE parametres SET
                nom_entreprise = COALESCE($1, nom_entreprise),
                heure_ouverture = COALESCE($2, heure_ouverture),
                heure_fermeture = COALESCE($3, heure_fermeture),
                retard_apres = COALESCE($4, retard_apres),
                depart_anticipe = COALESCE($5, depart_anticipe),
                duree_pause = COALESCE($6, duree_pause),
                email_entreprise = COALESCE($7, email_entreprise),
                telephone = COALESCE($8, telephone),
                adresse = COALESCE($9, adresse),
                theme = COALESCE($10, theme),
                updated_at = NOW()
            WHERE id = 1
            RETURNING *
        `, [nom_entreprise, heure_ouverture, heure_fermeture,
            retard_apres, depart_anticipe, duree_pause,
            email_entreprise, telephone, adresse,
            theme || 'bleu']);
        return result.rows[0];
    }

    // UPSERT avec entreprise_id
    const result = await pool.query(`
        INSERT INTO parametres (entreprise_id, nom_entreprise, heure_ouverture, heure_fermeture,
                                retard_apres, depart_anticipe, duree_pause,
                                email_entreprise, telephone, adresse, theme, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (entreprise_id) DO UPDATE SET
            nom_entreprise = COALESCE($2, parametres.nom_entreprise),
            heure_ouverture = COALESCE($3, parametres.heure_ouverture),
            heure_fermeture = COALESCE($4, parametres.heure_fermeture),
            retard_apres = COALESCE($5, parametres.retard_apres),
            depart_anticipe = COALESCE($6, parametres.depart_anticipe),
            duree_pause = COALESCE($7, parametres.duree_pause),
            email_entreprise = COALESCE($8, parametres.email_entreprise),
            telephone = COALESCE($9, parametres.telephone),
            adresse = COALESCE($10, parametres.adresse),
            theme = COALESCE($11, parametres.theme),
            updated_at = NOW()
        RETURNING *
    `, [entreprise_id, nom_entreprise, heure_ouverture, heure_fermeture,
        retard_apres, depart_anticipe, duree_pause,
        email_entreprise, telephone, adresse,
        theme || 'bleu']);
    return result.rows[0];
}

module.exports = { get, save };
