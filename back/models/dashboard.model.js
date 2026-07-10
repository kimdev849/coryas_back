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
    // On lance 4 requetes SQL en parallele
    const [totalEmployes, presencesAujourdhui, congesEnAttente, congesApprouves] = await Promise.all([

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
    ]);

    // On extrait les valeurs des resultats SQL
    // parseInt() convertit le texte en nombre. Si c'est null, on met 0.
    const employesActifs = parseInt(totalEmployes.rows[0].total) || 0;
    const p = presencesAujourdhui.rows[0];
    const presents = parseInt(p.presents) || 0;
    const retards = parseInt(p.retards) || 0;

    // Les absents = employes actifs - ceux qui sont venus aujourd'hui
    const absents = employesActifs - (parseInt(p.total) || 0);

    const congesAttente = parseInt(congesEnAttente.rows[0].total) || 0;
    const congesApprouvesCeMois = parseInt(congesApprouves.rows[0].total) || 0;

    // Taux de presence = (presents / total employes) * 100
    // Math.round() arrondit a l'entier le plus proche
    const tauxPresence = employesActifs > 0
        ? Math.round((presents / employesActifs) * 100)
        : 0;

    // On renvoie un objet avec toutes les stats
    // Le controleur l'enverra au frontend
    return {
        totalEmployes: employesActifs,
        presentAujourdhui: presents,
        absents: absents,
        retrards: retards,
        congesEnAttente: congesAttente,
        congesApprouves: congesApprouvesCeMois,
        presensTaux: tauxPresence,
    };
}

// On exporte la fonction pour l'utiliser dans le controleur
module.exports = { getStats };

