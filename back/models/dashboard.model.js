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
async function getStats(entrepriseId = null) {
    // ============================================================
    // VERIFICATION : Si on est samedi (6) ou dimanche (0),
    // on ne compte pas les absents (les employes ne travaillent pas)
    // ============================================================
    const aujourdhui = new Date();
    const jourSemaine = aujourdhui.getDay(); // 0=Dimanche, 6=Samedi
    const estWeekend = jourSemaine === 0 || jourSemaine === 6;

    // Helper pour ajouter le filtre entreprise_id
    const entrepriseFilter = entrepriseId ? ` WHERE entreprise_id = $1` : '';
    const entrepriseFilterEmp = entrepriseId ? ` AND e.entreprise_id = $1` : '';
    const entrepriseFilterPres = entrepriseId ? ` AND p.entreprise_id = $1` : '';
    const entrepriseFilterConge = entrepriseId ? ` AND c.entreprise_id = $1` : '';
    const entrepriseParams = entrepriseId ? [entrepriseId] : [];

    // On lance 5 requetes SQL en parallele
    const [totalEmployes, presencesAujourdhui, congesEnAttente, congesApprouves, employesEnConge] = await Promise.all([

        // Requete 1 : compte les employes avec statut 'Actif'
        pool.query(`SELECT COUNT(*) AS total FROM employes WHERE statut = 'Actif'${entrepriseFilterEmp}`, entrepriseParams),

        // Requete 2 : compte les presences d'aujourd'hui
        pool.query(`
            SELECT COUNT(*) AS total,
                   COUNT(*) FILTER (WHERE statut = 'Present') AS presents,
                   COUNT(*) FILTER (WHERE statut = 'Retard') AS retards
            FROM presences p
            WHERE date_presence = CURRENT_DATE${entrepriseFilterPres}
        `, entrepriseParams),

        // Requete 3 : compte les conges en attente
        pool.query(`SELECT COUNT(*) AS total FROM conges c WHERE statut = 'En attente'${entrepriseFilterConge}`, entrepriseParams),

        // Requete 4 : compte les conges approuves ce mois-ci
        pool.query(`
            SELECT COUNT(*) AS total FROM conges c
            WHERE statut = 'Approuve'
              AND EXTRACT(MONTH FROM c.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)${entrepriseFilterConge}
        `, entrepriseParams),

        // Requete 5 : compte les employés EN CONGÉ AUJOURD'HUI
        pool.query(`
            SELECT COUNT(DISTINCT c.employe_id) AS total
            FROM conges c
            JOIN employes e ON e.id = c.employe_id
            WHERE c.statut = 'Approuve'
              AND c.date_debut <= CURRENT_DATE
              AND c.date_fin >= CURRENT_DATE${entrepriseFilterEmp}
        `, entrepriseParams),
    ]);

    // On extrait les valeurs des resultats SQL
    const employesActifs = parseInt(totalEmployes.rows[0].total) || 0;
    const enConge = parseInt(employesEnConge.rows[0].total) || 0;
    const p = presencesAujourdhui.rows[0];
    const totalPresents = parseInt(p.total) || 0;
    const presents = parseInt(p.presents) || 0;
    const retards = parseInt(p.retards) || 0;

    const congesAttente = parseInt(congesEnAttente.rows[0].total) || 0;
    const congesApprouvesCeMois = parseInt(congesApprouves.rows[0].total) || 0;

    let absents = 0;
    let tauxPresence = 0;

    if (!estWeekend && employesActifs > 0) {
        const employesAttendus = employesActifs - enConge;
        absents = Math.max(0, employesAttendus - totalPresents);
        tauxPresence = employesAttendus > 0
            ? Math.round((presents / employesAttendus) * 100)
            : 0;
    }

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

