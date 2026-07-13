// ================================================================
// dashboard.model.js - Requetes SQL pour les stats
// ================================================================
// Ce fichier contient 1 fonction : getStats().
// Elle lance 4 requetes SQL en meme temps pour recuperer :
// - Le nombre d'employes actifs
// - Les presences du jour (presents, retards)
// - Les conges en attente
// - Les conges approuves ce mois-ci
// ================================================================

// pool = la connexion a la base de donnees Supabase (PostgreSQL)
const pool = require("../config/database");

// ----------------------------------------------------------------
// getStats() - Calcule toutes les stats du tableau de bord
// ----------------------------------------------------------------
// Promise.all() permet de lancer plusieurs requetes EN MEME TEMPS
// au lieu de les faire une par une (beaucoup plus rapide).
// ----------------------------------------------------------------
async function getStats() {
    // ============================================================
    // VERIFICATION : Si on est samedi (6) ou dimanche (0),
    // on ne compte pas les absents (les employes ne travaillent pas)
    // ============================================================
    const aujourdhui = new Date();
    const jourSemaine = aujourdhui.getDay(); // 0=Dimanche, 6=Samedi
    const estWeekend = jourSemaine === 0 || jourSemaine === 6;

    // On lance 5 requetes SQL en parallele
    const [totalEmployes, presencesAujourdhui, congesEnAttente, congesApprouves, employesEnConge] = await Promise.all([

        // Requete 1 : compte les employes avec statut 'Actif'
        pool.query("SELECT COUNT(*) AS total FROM employes WHERE statut = 'Actif'"),

        // Requete 2 : compte les presences d'aujourd'hui
        // FILTER (WHERE ...) permet de compter avec des conditions
        pool.query(`
            SELECT COUNT(*) AS total,
                   -- Compte ceux qui ont le statut 'Present'
                   COUNT(*) FILTER (WHERE statut = 'Present') AS presents,
                   -- Compte ceux qui ont le statut 'Retard'
                   COUNT(*) FILTER (WHERE statut = 'Retard') AS retards
            FROM presences
            -- Seulement les presences d'aujourd'hui (CURRENT_DATE)
            WHERE date_presence = CURRENT_DATE
        `),

        // Requete 3 : compte les conges en attente (non traites)
        pool.query("SELECT COUNT(*) AS total FROM conges WHERE statut = 'En attente'"),

        // Requete 4 : compte les conges approuves ce mois-ci
        // EXTRACT(MONTH FROM ...) prend le numero du mois (1-12)
        pool.query(`
            SELECT COUNT(*) AS total FROM conges
            WHERE statut = 'Approuve'
            -- Meme mois que la date actuelle
            AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        `),

        // Requete 5 : compte les employés EN CONGÉ AUJOURD'HUI
        // Ceux-ci ne doivent PAS être comptés comme absents
        pool.query(`
            SELECT COUNT(DISTINCT employe_id) AS total
            FROM conges
            WHERE statut = 'Approuve'
              AND date_debut <= CURRENT_DATE
              AND date_fin >= CURRENT_DATE
        `),
    ]);

    // On extrait les valeurs des resultats SQL
    // parseInt() convertit le texte en nombre. Si c'est null, on met 0.
    const employesActifs = parseInt(totalEmployes.rows[0].total) || 0;
    const enConge = parseInt(employesEnConge.rows[0].total) || 0;
    const p = presencesAujourdhui.rows[0];
    const totalPresents = parseInt(p.total) || 0;
    const presents = parseInt(p.presents) || 0;
    const retards = parseInt(p.retards) || 0;

    const congesAttente = parseInt(congesEnAttente.rows[0].total) || 0;
    const congesApprouvesCeMois = parseInt(congesApprouves.rows[0].total) || 0;

    // Si c'est le week-end, on ne compte pas les absents
    // Les employés qui ne sont pas venus samedi/dimanche ne sont PAS absents
    let absents = 0;
    let tauxPresence = 0;

    if (!estWeekend && employesActifs > 0) {
        // Les employés attendus = actifs - ceux en congé
        const employesAttendus = employesActifs - enConge;
        absents = Math.max(0, employesAttendus - totalPresents);
        tauxPresence = employesAttendus > 0
            ? Math.round((presents / employesAttendus) * 100)
            : 0;
    }

    // On renvoie un objet avec toutes les stats
    // Le controleur l'enverra au frontend
    return {
        totalEmployes: employesActifs,
        presentAujourdhui: presents,
        enConge: enConge,
        absents: absents,
        retards: retards,
        congesEnAttente: congesAttente,
        congesApprouves: congesApprouvesCeMois,
        tauxPresence: tauxPresence,
        estWeekend: estWeekend,
    };
}

// On exporte la fonction pour l'utiliser dans le controleur
module.exports = { getStats };

