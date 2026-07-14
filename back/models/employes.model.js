// ================================================================
// employes.model.js - Requetes SQL pour les employes
// ================================================================
// Vraie structure Supabase :
//   id, matricule, nom, prenom, sexe, telephone,
//   date_naissance, date_embauche, departement_id, statut
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// getEmployes() - Liste tous les employes avec leur departement ET utilisateur
// ----------------------------------------------------------------
async function getEmployes() {
    const result = await pool.query(`
        SELECT e.id, e.matricule, e.nom, e.prenom, e.sexe, e.telephone,
               e.date_naissance, e.date_embauche, e.departement_id,
               d.nom AS departement_nom, e.statut,
               e.created_at, e.updated_at,
               u.email, u.role_id
        FROM employes e
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN utilisateurs u ON u.employe_id = e.id
        ORDER BY e.id ASC
    `);
    return result.rows;
}

// ----------------------------------------------------------------
// getEmployeById(id) - Voir un employe par son ID
// ----------------------------------------------------------------
async function getEmployeById(id) {
    const result = await pool.query(`
        SELECT e.*, d.nom AS departement_nom, u.email, u.role_id
        FROM employes e
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN utilisateurs u ON u.employe_id = e.id
        WHERE e.id = $1
    `, [id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// create({ matricule, nom, prenom, sexe, telephone,
//          date_naissance, date_embauche, departement_id })
// ----------------------------------------------------------------
async function create({ matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id }) {
    const result = await pool.query(`
        INSERT INTO employes (matricule, nom, prenom, sexe, telephone,
                              date_naissance, date_embauche, departement_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `, [matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// update(id, { matricule, nom, prenom, sexe, telephone,
//              date_naissance, date_embauche, departement_id, statut })
// ----------------------------------------------------------------
async function update(id, { matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id, statut }) {
    const result = await pool.query(`
        UPDATE employes SET
            matricule = COALESCE($2, matricule),
            nom = COALESCE($3, nom),
            prenom = COALESCE($4, prenom),
            sexe = COALESCE($5, sexe),
            telephone = COALESCE($6, telephone),
            date_naissance = COALESCE($7, date_naissance),
            date_embauche = COALESCE($8, date_embauche),
            departement_id = COALESCE($9, departement_id),
            statut = COALESCE($10, statut),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id, statut]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// remove(id) - Supprimer un employe
// ----------------------------------------------------------------
// Note : plus utilise. On utilise desactivation (statut='Inactif') a la place.
// Conservee pour compatibilite, mais preferer la desactivation.
// ----------------------------------------------------------------
async function remove(id) {
    const result = await pool.query(
        "DELETE FROM employes WHERE id = $1 RETURNING id", [id]
    );
    return result.rows[0];
}

// ----------------------------------------------------------------
// getEmployeStats(id) - Statistiques d'un employé
// ----------------------------------------------------------------
async function getEmployeStats(id) {
    // Stats des présences
    const today = new Date();
    const debutMois = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const debutAnnee = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    const finMois = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    // Mois précédent
    const moisPrec = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const debutMoisPrec = moisPrec.toISOString().split('T')[0];
    const finMoisPrec = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];

    const [statsMois, statsAnnee, conges, dernieresPresences] = await Promise.all([
        // Stats du mois en cours
        pool.query(`
            SELECT
                COUNT(*) AS total_jours,
                COUNT(*) FILTER (WHERE statut = 'Present') AS presents,
                COUNT(*) FILTER (WHERE statut = 'Retard') AS retards,
                COUNT(*) FILTER (WHERE heure_sortie IS NULL AND date_presence < CURRENT_DATE) AS oublis
            FROM presences
            WHERE employe_id = $1
              AND date_presence >= $2
              AND date_presence <= $3
        `, [id, debutMois, finMois]),

        // Stats de l'année
        pool.query(`
            SELECT
                COUNT(*) AS total_jours,
                COUNT(*) FILTER (WHERE statut = 'Present') AS presents,
                COUNT(*) FILTER (WHERE statut = 'Retard') AS retards
            FROM presences
            WHERE employe_id = $1
              AND date_presence >= $2
        `, [id, debutAnnee]),

        // Demandes de congés
        pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE statut = 'En attente') AS en_attente,
                COUNT(*) FILTER (WHERE statut = 'Approuve') AS approuves,
                COUNT(*) FILTER (WHERE statut = 'Rejete') AS refusés
            FROM conges
            WHERE employe_id = $1
              AND date_debut >= $2
        `, [id, debutAnnee]),

        // 10 dernières présences
        pool.query(`
            SELECT date_presence, heure_entree, heure_sortie, statut
            FROM presences
            WHERE employe_id = $1
            ORDER BY date_presence DESC
            LIMIT 10
        `, [id]),
    ]);

    const m = statsMois.rows[0];
    const a = statsAnnee.rows[0];
    const c = conges.rows[0];

    // Calcul du taux de présence du mois
    const joursOuvrables = await pool.query(`
        SELECT COUNT(*) AS total FROM (
            SELECT generate_series($1::date, $2::date, '1 day') AS jour
        ) jours
        WHERE EXTRACT(DOW FROM jour) NOT IN (0, 6)
    `, [debutMois, finMois]);

    const totalJoursOuvrables = parseInt(joursOuvrables.rows[0].total) || 1;
    const totalPresentMois = parseInt(m.total_jours) || 0;
    const tauxPresence = Math.round((totalPresentMois / totalJoursOuvrables) * 100);

    const totalPresentsMois = (parseInt(m.presents) || 0) + (parseInt(m.retards) || 0);
    const totalPresentsAnnee = (parseInt(a.presents) || 0) + (parseInt(a.retards) || 0);

    return {
        mois: {
            debut: debutMois,
            fin: finMois,
            joursOuvrables: totalJoursOuvrables,
            presents: parseInt(m.presents) || 0,
            retards: parseInt(m.retards) || 0,
            oublis: parseInt(m.oublis) || 0,
            totalPresences: totalPresentMois,
            totalPresents: totalPresentsMois,
            tauxPresence: Math.min(tauxPresence, 100),
        },
        annee: {
            totalPresences: parseInt(a.total_jours) || 0,
            presents: parseInt(a.presents) || 0,
            retards: parseInt(a.retards) || 0,
            totalPresents: totalPresentsAnnee,
        },
        conges: {
            enAttente: parseInt(c.en_attente) || 0,
            approuves: parseInt(c.approuves) || 0,
            refusés: parseInt(c.refusés) || 0,
        },
        dernieresPresences: dernieresPresences.rows,
    };
}

module.exports = { getEmployes, getEmployeById, create, update, remove, getEmployeStats };
