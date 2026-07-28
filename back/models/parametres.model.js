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
        theme, entreprise_id,
        slogan, description, site_web, logo_url,
        jours_ouvrables, tolerance_retard,
        auto_checkout, heure_auto_checkout, geo_restriction,
        conges_annuel_default, conges_maladie_annee,
        jours_max_consecutifs, delai_demande_jours,
        notif_pointage, notif_retard, notif_absence,
        notif_conge_demande, notif_conge_valide, notif_rapport_hebdo,
        ip_restriction, ip_autorisees, double_auth, session_timeout
    } = data;

    // Convertir jours_ouvrables array -> JSON pour stockage
    const joursOuvrablesJson = Array.isArray(jours_ouvrables)
        ? JSON.stringify(jours_ouvrables)
        : (jours_ouvrables || null);

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
                slogan = COALESCE($11, slogan),
                description = COALESCE($12, description),
                site_web = COALESCE($13, site_web),
                logo_url = COALESCE($14, logo_url),
                jours_ouvrables = COALESCE($15::jsonb, jours_ouvrables),
                tolerance_retard = COALESCE($16, tolerance_retard),
                auto_checkout = COALESCE($17, auto_checkout),
                heure_auto_checkout = COALESCE($18, heure_auto_checkout),
                geo_restriction = COALESCE($19, geo_restriction),
                updated_at = NOW()
            WHERE id = 1
            RETURNING *
        `, [nom_entreprise, heure_ouverture, heure_fermeture,
            retard_apres, depart_anticipe, duree_pause,
            email_entreprise, telephone, adresse,
            theme || 'bleu', slogan, description, site_web, logo_url,
            joursOuvrablesJson, tolerance_retard,
            auto_checkout, heure_auto_checkout, geo_restriction]);
        return result.rows[0];
    }

    // UPSERT avec entreprise_id
    const result = await pool.query(`
        INSERT INTO parametres (
            entreprise_id, nom_entreprise, heure_ouverture, heure_fermeture,
            retard_apres, depart_anticipe, duree_pause,
            email_entreprise, telephone, adresse, theme,
            slogan, description, site_web, logo_url,
            jours_ouvrables, tolerance_retard,
            auto_checkout, heure_auto_checkout, geo_restriction,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16::jsonb, $17,
                $18, $19, $20, NOW())
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
            slogan = COALESCE($12, parametres.slogan),
            description = COALESCE($13, parametres.description),
            site_web = COALESCE($14, parametres.site_web),
            logo_url = COALESCE($15, parametres.logo_url),
            jours_ouvrables = COALESCE($16::jsonb, parametres.jours_ouvrables),
            tolerance_retard = COALESCE($17, parametres.tolerance_retard),
            auto_checkout = COALESCE($18, parametres.auto_checkout),
            heure_auto_checkout = COALESCE($19, parametres.heure_auto_checkout),
            geo_restriction = COALESCE($20, parametres.geo_restriction),
            updated_at = NOW()
        RETURNING *
    `, [entreprise_id, nom_entreprise, heure_ouverture, heure_fermeture,
        retard_apres, depart_anticipe, duree_pause,
        email_entreprise, telephone, adresse,
        theme || 'bleu', slogan, description, site_web, logo_url,
        joursOuvrablesJson, tolerance_retard,
        auto_checkout, heure_auto_checkout, geo_restriction]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// isWorkingDay(entrepriseId) - Vérifie si aujourd'hui est un jour ouvrable
// ----------------------------------------------------------------
// Lit jours_ouvrables depuis la BDD (configuré dans la page Configuration).
// Si la config n'existe pas, fallback : samedi/dimanche = week-end.
// ----------------------------------------------------------------
async function isWorkingDay(entrepriseId = null) {
    try {
        const p = await get(entrepriseId);
        if (p?.jours_ouvrables && Array.isArray(p.jours_ouvrables)) {
            const joursMap = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
            const aujourdhui = new Date();
            const jourNom = joursMap[aujourdhui.getDay()];
            return p.jours_ouvrables.includes(jourNom);
        }
    } catch (e) {
        console.warn("⚠️ isWorkingDay: impossible de lire jours_ouvrables:", e.message);
    }
    // Fallback : samedi et dimanche sont week-end
    const jourSemaine = new Date().getDay();
    return jourSemaine !== 0 && jourSemaine !== 6;
}

module.exports = { get, save, isWorkingDay };
