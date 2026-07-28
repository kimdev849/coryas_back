// ================================================================
// stats.model.js - Statistiques de ponctualité des employés
// ================================================================
// Fournit des requêtes SQL pour :
// - Classement des employés les plus ponctuels / en retard
// - Stats par semaine, par mois
// - Comparaison avec l'heure d'ouverture configurée
// ================================================================

const pool = require("../config/database");
const parametresModel = require("./parametres.model");

// ----------------------------------------------------------------
// getPunctualite(periode) - Stats de ponctualité
// ----------------------------------------------------------------
// periode : "semaine" | "mois" | "annee"
// Retourne :
//   - topPonctuels : employés qui arrivent le plus tôt
//   - topRetards   : employés qui arrivent le plus en retard
//   - statsGlobales : résumé (total, ponctuels, retards)
//   - statsParJour : stats jour par jour sur la période
// ----------------------------------------------------------------
async function getPunctualite(periode = "mois", entrepriseId = null) {
    // 1. Récupérer les paramètres (heure d'ouverture + retard_apres)
    const params = await parametresModel.get(entrepriseId);
    const heureOuverture = params?.heure_ouverture || "08:00";
    const retardApres = params?.retard_apres || 0;

    // Calculer l'heure limite (ouverture + tolérance)
    const [h, m] = heureOuverture.split(":").map(Number);
    const heureLimiteMinutes = h * 60 + m + retardApres;
    const heureLimite = String(Math.floor(heureLimiteMinutes / 60)).padStart(2, "0")
        + ":" + String(heureLimiteMinutes % 60).padStart(2, "0");

    // 2. Déterminer la date de début selon la période
    let dateDebut;
    const maintenant = new Date();
    if (periode === "semaine") {
        // Lundi de cette semaine
        const lundi = new Date(maintenant);
        const jour = maintenant.getDay();
        const diff = jour === 0 ? 6 : jour - 1;
        lundi.setDate(maintenant.getDate() - diff);
        dateDebut = lundi.toISOString().split("T")[0];
    } else if (periode === "mois") {
        dateDebut = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}-01`;
    } else {
        dateDebut = `${maintenant.getFullYear()}-01-01`;
    }

    // 3. Build the filter params and SQL
    const queryParams = [dateDebut, heureLimite];
    let entrepriseFilter = '';
    let paramIndex = 2;
    if (entrepriseId) {
        paramIndex++;
        entrepriseFilter = ` AND e.entreprise_id = $${paramIndex}`;
        queryParams.push(entrepriseId);
    }

    // Requête : tous les employés avec leurs stats de présence sur la période
    const result = await pool.query(`
        SELECT
            e.id,
            e.nom,
            e.prenom,
            e.matricule,
            d.nom AS departement,
            COUNT(p.id) AS total_presences,
            COUNT(*) FILTER (
                WHERE p.heure_entree IS NOT NULL
                  AND p.heure_entree <= $2::time
            ) AS arrivees_a_l_heure,
            COUNT(*) FILTER (
                WHERE p.heure_entree IS NOT NULL
                  AND p.heure_entree > $2::time
            ) AS arrivees_en_retard,
            COUNT(*) FILTER (
                WHERE p.heure_entree IS NOT NULL
                  AND p.statut = 'Retard'
            ) AS retards_statut,
            MIN(p.heure_entree) AS heure_la_plus_tot,
            MAX(p.heure_entree) AS heure_la_plus_tard
        FROM employes e
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN presences p ON p.employe_id = e.id
            AND p.date_presence >= $1::date
            AND p.date_presence <= CURRENT_DATE
        WHERE e.statut = 'Actif'${entrepriseFilter}
        GROUP BY e.id, e.nom, e.prenom, e.matricule, d.nom
        ORDER BY arrivees_a_l_heure DESC
    `, queryParams);

    const employes = result.rows;

    // 4. Stats globales
    const totalEmployes = employes.length;
    let totalPresences = 0;
    let totalPonctuels = 0;
    let totalRetards = 0;

    employes.forEach(emp => {
        totalPresences += parseInt(emp.total_presences) || 0;
        totalPonctuels += parseInt(emp.arrivees_a_l_heure) || 0;
        totalRetards += parseInt(emp.arrivees_en_retard) || 0;
    });

    // 5. Top 10 des plus ponctuels (ceux avec le plus d'arrivées à l'heure)
    const topPonctuels = [...employes]
        .sort((a, b) => (parseInt(b.arrivees_a_l_heure) || 0) - (parseInt(a.arrivees_a_l_heure) || 0))
        .slice(0, 10)
        .map(emp => ({
            id: emp.id,
            nom: emp.nom,
            prenom: emp.prenom,
            matricule: emp.matricule,
            departement: emp.departement,
            totalPresences: parseInt(emp.total_presences) || 0,
            arriveesALHeure: parseInt(emp.arrivees_a_l_heure) || 0,
            arriveesEnRetard: parseInt(emp.arrivees_en_retard) || 0,
            ponctualite: (parseInt(emp.total_presences) || 0) > 0
                ? Math.round((parseInt(emp.arrivees_a_l_heure) || 0) / (parseInt(emp.total_presences) || 1) * 100)
                : 0,
        }));

    // 6. Top 10 des plus en retard
    const topRetards = [...employes]
        .sort((a, b) => (parseInt(b.arrivees_en_retard) || 0) - (parseInt(a.arrivees_en_retard) || 0))
        .slice(0, 10)
        .map(emp => ({
            id: emp.id,
            nom: emp.nom,
            prenom: emp.prenom,
            matricule: emp.matricule,
            departement: emp.departement,
            totalPresences: parseInt(emp.total_presences) || 0,
            arriveesALHeure: parseInt(emp.arrivees_a_l_heure) || 0,
            arriveesEnRetard: parseInt(emp.arrivees_en_retard) || 0,
            ponctualite: (parseInt(emp.total_presences) || 0) > 0
                ? Math.round((parseInt(emp.arrivees_a_l_heure) || 0) / (parseInt(emp.total_presences) || 1) * 100)
                : 0,
        }));

    // 7. Stats jour par jour sur la période
    const statsParJour = await pool.query(`
        SELECT
            p.date_presence,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE p.heure_entree IS NOT NULL AND p.heure_entree <= $2::time) AS ponctuels,
            COUNT(*) FILTER (WHERE p.heure_entree IS NOT NULL AND p.heure_entree > $2::time) AS retards,
            COUNT(*) FILTER (WHERE p.statut = 'Retard') AS retards_statut
        FROM presences p
        WHERE p.date_presence >= $1::date
          AND p.date_presence <= CURRENT_DATE
        GROUP BY p.date_presence
        ORDER BY p.date_presence DESC
    `, [dateDebut, heureLimite]);

    return {
        periode,
        dateDebut,
        heureLimite,
        heureOuverture,
        retardApres,
        statsGlobales: {
            totalEmployes,
            totalPresences,
            totalPonctuels,
            totalRetards,
            tauxPonctualite: totalPresences > 0
                ? Math.round((totalPonctuels / totalPresences) * 100)
                : 0,
        },
        topPonctuels,
        topRetards,
        statsParJour: statsParJour.rows.map(j => ({
            date: j.date_presence,
            total: parseInt(j.total) || 0,
            ponctuels: parseInt(j.ponctuels) || 0,
            retards: parseInt(j.retards) || 0,
            retardsStatut: parseInt(j.retards_statut) || 0,
        })),
    };
}

module.exports = { getPunctualite };
