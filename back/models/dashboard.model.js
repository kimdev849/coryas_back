// ================================================================
// dashboard.model.js - Requetes SQL pour les stats
// ================================================================
// Lance 5 requetes independantes avec try-catch individuel.
// Si une requete echoue, les autres renvoient leurs resultats.
// ================================================================

const pool = require("../config/database");
const { isWorkingDay } = require("./parametres.model");

// Helper : execute une requete et retourne le resultat ou null
async function safeQuery(sql, params = []) {
    try {
        const result = await pool.query(sql, params);
        return result;
    } catch (error) {
        console.error("❌ Dashboard query error:", error.message);
        console.error("   SQL:", sql.substring(0, 200));
        console.error("   Params:", JSON.stringify(params));
        return null;
    }
}

// ----------------------------------------------------------------
// getStats() - Calcule toutes les stats du tableau de bord
// ----------------------------------------------------------------
async function getStats(entrepriseId = null) {
    const estWeekend = !(await isWorkingDay(entrepriseId));

    const params = entrepriseId ? [entrepriseId] : [];
    const entrepriseFilter = entrepriseId ? ' AND e.entreprise_id = $1' : '';

    // Lance 5 requetes SQL en parallele avec try-catch individuel
    const [totalEmployes, presencesAujourdhui, congesEnAttente, congesApprouves, employesEnConge] = await Promise.all([

        // Requete 1 : employes actifs
        safeQuery(`
            SELECT COUNT(*) AS total FROM employes e
            WHERE e.statut = 'Actif'${entrepriseFilter}
        `, params),

        // Requete 2 : presences du jour (CASE WHEN au lieu de FILTER pour compatibilité)
        safeQuery(`
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN p.statut = 'Present' THEN 1 END) AS presents,
                COUNT(CASE WHEN p.statut = 'Retard' THEN 1 END) AS retards
            FROM presences p
            JOIN employes e ON e.id = p.employe_id
            WHERE p.date_presence = CURRENT_DATE${entrepriseFilter}
        `, params),

        // Requete 3 : conges en attente
        safeQuery(`
            SELECT COUNT(*) AS total FROM conges c
            JOIN employes e ON e.id = c.employe_id
            WHERE c.statut = 'En attente'${entrepriseFilter}
        `, params),

        // Requete 4 : conges approuves ce mois (avec filtre année pour éviter mélange)
        safeQuery(`
            SELECT COUNT(*) AS total FROM conges c
            JOIN employes e ON e.id = c.employe_id
            WHERE c.statut = 'Approuve'
              AND EXTRACT(YEAR FROM c.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
              AND EXTRACT(MONTH FROM c.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)${entrepriseFilter}
        `, params),

        // Requete 5 : employés en congé aujourd'hui
        safeQuery(`
            SELECT COUNT(DISTINCT c.employe_id) AS total
            FROM conges c
            JOIN employes e ON e.id = c.employe_id
            WHERE c.statut = 'Approuve'
              AND c.date_debut <= CURRENT_DATE
              AND c.date_fin >= CURRENT_DATE${entrepriseFilter}
        `, params),
    ]);

    // Extraction securisee des valeurs (avec fallback 0 si requete a echoue)
    const employesActifs = parseInt(totalEmployes?.rows?.[0]?.total) || 0;
    const enConge = parseInt(employesEnConge?.rows?.[0]?.total) || 0;

    const p = presencesAujourdhui?.rows?.[0] || {};
    const totalPresents = parseInt(p.total) || 0;
    const presents = parseInt(p.presents) || 0;
    const retards = parseInt(p.retards) || 0;

    const congesAttente = parseInt(congesEnAttente?.rows?.[0]?.total) || 0;
    const congesApprouvesCeMois = parseInt(congesApprouves?.rows?.[0]?.total) || 0;

    // Calcul des absents et taux de presence
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

module.exports = { getStats };
