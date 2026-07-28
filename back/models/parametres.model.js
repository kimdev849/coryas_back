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
// ⚠️ IMPORTANT : si entrepriseId est null (SuperAdmin, employé sans
// entreprise), on retourne NULL. Surtout PAS de fallback LIMIT 1
// qui retournerait les paramètres d'une AUTRE entreprise aléatoire !
// ----------------------------------------------------------------
async function get(entrepriseId = null) {
    if (!entrepriseId) {
        return null;
    }
    const result = await pool.query(`
        SELECT * FROM parametres WHERE entreprise_id = $1
    `, [entrepriseId]);
    return result.rows[0] || null;
}

// ----------------------------------------------------------------
// save(data) - Sauvegarde résiliente des paramètres
// ----------------------------------------------------------------
// ESSAI en 3 niveaux (du plus complet au plus minimal) :
//
// Niveau 1 (complet) : toutes les colonnes modernes
// Niveau 2 (moyen)   : colonnes de base + anciens noms (email_contact)
// Niveau 3 (minimal) : juste nom_entreprise + horaires
//
// Chaque niveau peut échouer si la colonne n'existe pas dans la table.
// On descend au niveau suivant jusqu'à ce que ça passe.
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
        pause_debut,
    } = data;

    // Convertir jours_ouvrables array -> JSON pour stockage
    const joursOuvrablesJson = Array.isArray(jours_ouvrables)
        ? JSON.stringify(jours_ouvrables)
        : (jours_ouvrables || null);

    const defaultTheme = theme || 'bleu';

    // Helper : exécute une requête et retourne la ligne, ou null si échec
    const safeQuery = async (sql, params) => {
        try {
            const result = await pool.query(sql, params);
            return result.rows[0] || null;
        } catch (e) {
            return null; // La colonne n'existe probablement pas
        }
    };

    // ================================================================
    // NIVEAU 1 : Sauvegarde COMPLÈTE (toutes les colonnes)
    // ================================================================

    // UPDATE sans entreprise_id
    const tryFullUpdate = async () => {
        const sql = `
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
                theme = COALESCE($10, theme || 'bleu'),
                slogan = COALESCE($11, slogan),
                description = COALESCE($12, description),
                site_web = COALESCE($13, site_web),
                logo_url = COALESCE($14, logo_url),
                jours_ouvrables = COALESCE($15::jsonb, jours_ouvrables),
                tolerance_retard = COALESCE($16, tolerance_retard),
                auto_checkout = COALESCE($17, auto_checkout),
                heure_auto_checkout = COALESCE($18, heure_auto_checkout),
                geo_restriction = COALESCE($19, geo_restriction),
                pause_debut = COALESCE($20, pause_debut),
                updated_at = NOW()
            WHERE id = 1
            RETURNING *
        `;
        const params = [nom_entreprise, heure_ouverture, heure_fermeture,
            retard_apres, depart_anticipe, duree_pause,
            email_entreprise, telephone, adresse,
            defaultTheme, slogan, description, site_web, logo_url,
            joursOuvrablesJson, tolerance_retard,
            auto_checkout, heure_auto_checkout, geo_restriction,
            pause_debut];
        return safeQuery(sql, params);
    };

    // UPSERT avec entreprise_id
    const tryFullUpsert = async () => {
        const sql = `
            INSERT INTO parametres (
                entreprise_id, nom_entreprise, heure_ouverture, heure_fermeture,
                retard_apres, depart_anticipe, duree_pause,
                email_entreprise, telephone, adresse, theme,
                slogan, description, site_web, logo_url,
                jours_ouvrables, tolerance_retard,
                auto_checkout, heure_auto_checkout, geo_restriction,
                pause_debut,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                    $12, $13, $14, $15, $16::jsonb, $17,
                    $18, $19, $20, $21, NOW())
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
                pause_debut = COALESCE($21, parametres.pause_debut),
                updated_at = NOW()
            RETURNING *
        `;
        const params = [entreprise_id, nom_entreprise, heure_ouverture, heure_fermeture,
            retard_apres, depart_anticipe, duree_pause,
            email_entreprise, telephone, adresse,
            defaultTheme, slogan, description, site_web, logo_url,
            joursOuvrablesJson, tolerance_retard,
            auto_checkout, heure_auto_checkout, geo_restriction,
            pause_debut];
        return safeQuery(sql, params);
    };

    // ================================================================
    // NIVEAU 2 : Colonnes DE BASE + anciens noms (email_contact, telephone_contact)
    // ================================================================

    const tryBaseUpdate = async () => {
        const sql = `
            UPDATE parametres SET
                nom_entreprise = COALESCE($1, nom_entreprise),
                heure_ouverture = COALESCE($2, heure_ouverture),
                heure_fermeture = COALESCE($3, heure_fermeture),
                retard_apres = COALESCE($4, retard_apres),
                depart_anticipe = COALESCE($5, depart_anticipe),
                duree_pause = COALESCE($6, duree_pause),
                email_contact = COALESCE($7, email_contact),
                telephone_contact = COALESCE($8, telephone_contact),
                adresse = COALESCE($9, adresse),
                theme = COALESCE($10, theme || 'bleu'),
                updated_at = NOW()
            WHERE id = 1
            RETURNING *
        `;
        const params = [nom_entreprise, heure_ouverture, heure_fermeture,
            retard_apres, depart_anticipe, duree_pause,
            email_entreprise, telephone, adresse, defaultTheme];
        return safeQuery(sql, params);
    };

    // ================================================================
    // NIVEAU 3 : Ultra MINIMAL — juste nom + horaires
    // ================================================================

    const tryMinimalUpdate = async () => {
        const sql = `
            UPDATE parametres SET
                nom_entreprise = COALESCE($1, nom_entreprise),
                heure_ouverture = COALESCE($2, heure_ouverture),
                heure_fermeture = COALESCE($3, heure_fermeture),
                updated_at = NOW()
            WHERE id = 1
            RETURNING *
        `;
        const params = [nom_entreprise, heure_ouverture, heure_fermeture];
        return safeQuery(sql, params);
    };

    // ================================================================
    // EXÉCUTION : Tente chaque niveau dans l'ordre
    // ================================================================

    let result = null;

    // Niveau 1 complet : rows[0] = UPSERT (si entreprise_id existe)
    if (entreprise_id) {
        result = await tryFullUpsert();
    }

    if (!result) {
        // Niveau 1 complet: UPDATE WHERE id=1
        result = await tryFullUpdate();
    }

    if (!result) {
        // Niveau 2 : colonnes de base avec anciens noms (email_contact, telephone_contact)
        result = await tryBaseUpdate();
    }

    if (!result) {
        // Niveau 3 : ultra minimal (nom + horaires)
        result = await tryMinimalUpdate();
    }

    if (!result) {
        // Si tout a échoué : faire un INSERT minimal
        result = await safeQuery(`
            INSERT INTO parametres (nom_entreprise, heure_ouverture, heure_fermeture, updated_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `, [nom_entreprise, heure_ouverture, heure_fermeture]);
    }

    // ================================================================
    // SYNCHRONISATION : Si le nom de l'entreprise a été modifié,
    // on le propage aussi dans la table `entreprises` (source autoritaire
    // pour la page de connexion et l'affichage mobile).
    // ================================================================
    if (result && nom_entreprise && entreprise_id) {
        try {
            await pool.query(`UPDATE entreprises SET nom = $1, updated_at = NOW() WHERE id = $2`, [nom_entreprise, entreprise_id]);
            console.log(`🔄 Nom entreprise synchronisé : entreprises.id=${entreprise_id} → "${nom_entreprise}"`);
        } catch (e) {
            console.warn("⚠️ Impossible de synchroniser le nom dans la table entreprises:", e.message);
        }
    }

    if (result) return result;

    // Dernier recours : la requête échoue pour de bon
    throw new Error("Impossible de sauvegarder les paramètres — vérifiez que la table 'parametres' existe.");
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
