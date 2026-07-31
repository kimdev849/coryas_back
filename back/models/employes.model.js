// ================================================================
// employes.model.js - Requetes SQL pour les employes
// ================================================================
// Vraie structure Supabase :
//   id, matricule, nom, prenom, sexe, telephone,
//   date_naissance, date_embauche, departement_id, statut
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// getEmployes() - Liste tous les employes avec leurs infos complètes
// ----------------------------------------------------------------
async function getEmployes(entrepriseId = null) {
    let sql = `
        SELECT e.id, e.matricule, e.nom, e.prenom, e.sexe, e.telephone,
               e.date_naissance, e.date_embauche, e.departement_id,
               d.nom AS departement_nom, e.statut,
               e.type_contrat_id, e.date_fin_contrat,
               e.periode_essai_jours, e.date_fin_essai,
               e.poste, e.salaire, e.numero_securite_sociale,
               e.adresse_domicile, e.ville,
               e.site_id, e.equipe_id, e.responsable_id,
               e.created_at, e.updated_at,
               u.email, u.role_id,
               tc.nom AS type_contrat_nom,
               s.nom AS site_nom,
               eq.nom AS equipe_nom,
               (resp.nom || ' ' || resp.prenom) AS responsable_nom
        FROM employes e
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN utilisateurs u ON u.employe_id = e.id
        LEFT JOIN type_contrat tc ON tc.id = e.type_contrat_id
        LEFT JOIN sites s ON s.id = e.site_id
        LEFT JOIN equipes eq ON eq.id = e.equipe_id
        LEFT JOIN employes resp ON resp.id = e.responsable_id
        WHERE 1=1
    `;
    const params = [];
    if (entrepriseId) {
        sql += ` AND e.entreprise_id = $${params.length + 1}`;
        params.push(entrepriseId);
    }
    // Exclure les utilisateurs sans entreprise (seed SuperAdmin, utilisateurs legacy)
    sql += ` AND e.entreprise_id IS NOT NULL`;
    // Exclure les Administrateur (role_id=1) et SuperAdmin (role_id=5) de la liste employés
    // La liste employés est réservée aux rôles : RH (2), Employé (3), Directeur (4)
    sql += ` AND (u.role_id IS NULL OR (u.role_id NOT IN (1, 5)))`;
    sql += ` ORDER BY e.id ASC`;
    const result = await pool.query(sql, params);
    return result.rows;
}

// ----------------------------------------------------------------
// getEmployeById(id) - Voir un employe par son ID
// ----------------------------------------------------------------
async function getEmployeById(id, entrepriseId = null) {
    let sql = `
        SELECT e.*, d.nom AS departement_nom, u.email, u.role_id,
               tc.nom AS type_contrat_nom,
               s.nom AS site_nom,
               s.horaire_ouverture AS site_horaire_ouverture,
               s.horaire_fermeture AS site_horaire_fermeture,
               eq.nom AS equipe_nom,
               (resp.nom || ' ' || resp.prenom) AS responsable_nom
        FROM employes e
        LEFT JOIN departements d ON d.id = e.departement_id
        LEFT JOIN utilisateurs u ON u.employe_id = e.id
        LEFT JOIN type_contrat tc ON tc.id = e.type_contrat_id
        LEFT JOIN sites s ON s.id = e.site_id
        LEFT JOIN equipes eq ON eq.id = e.equipe_id
        LEFT JOIN employes resp ON resp.id = e.responsable_id
        WHERE e.id = $1
    `;
    const params = [id];
    if (entrepriseId) {
        sql += ` AND e.entreprise_id = $2`;
        params.push(entrepriseId);
    }
    const result = await pool.query(sql, params);
    return result.rows[0];
}

// ----------------------------------------------------------------
// create({ matricule, nom, prenom, sexe, telephone,
//          date_naissance, date_embauche, departement_id, ... })
// ----------------------------------------------------------------
async function create({ matricule, nom, prenom, sexe, telephone,
    date_naissance, date_embauche, departement_id,
    type_contrat_id, date_fin_contrat, periode_essai_jours, date_fin_essai,
    poste, salaire, numero_securite_sociale, adresse_domicile, ville,
    site_id, equipe_id, responsable_id }) {
    const result = await pool.query(`
        INSERT INTO employes (matricule, nom, prenom, sexe, telephone,
                              date_naissance, date_embauche, departement_id,
                              type_contrat_id, date_fin_contrat, periode_essai_jours, date_fin_essai,
                              poste, salaire, numero_securite_sociale, adresse_domicile, ville,
                              site_id, equipe_id, responsable_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
    `, [matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id,
        type_contrat_id || null, date_fin_contrat || null, periode_essai_jours || null, date_fin_essai || null,
        poste || null, salaire || null, numero_securite_sociale || null, adresse_domicile || null, ville || null,
        site_id || null, equipe_id || null, responsable_id || null]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// update(id, { ... toutes les colonnes ... })
// ----------------------------------------------------------------
async function update(id, { matricule, nom, prenom, sexe, telephone,
    date_naissance, date_embauche, departement_id, statut,
    type_contrat_id, date_fin_contrat, periode_essai_jours, date_fin_essai,
    poste, salaire, numero_securite_sociale, adresse_domicile, ville,
    site_id, equipe_id, responsable_id }) {
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
            type_contrat_id = COALESCE($11, type_contrat_id),
            date_fin_contrat = COALESCE($12, date_fin_contrat),
            periode_essai_jours = COALESCE($13, periode_essai_jours),
            date_fin_essai = COALESCE($14, date_fin_essai),
            poste = COALESCE($15, poste),
            salaire = COALESCE($16, salaire),
            numero_securite_sociale = COALESCE($17, numero_securite_sociale),
            adresse_domicile = COALESCE($18, adresse_domicile),
            ville = COALESCE($19, ville),
            site_id = COALESCE($20, site_id),
            equipe_id = COALESCE($21, equipe_id),
            responsable_id = COALESCE($22, responsable_id),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id, statut,
        type_contrat_id, date_fin_contrat, periode_essai_jours, date_fin_essai,
        poste, salaire, numero_securite_sociale, adresse_domicile, ville,
        site_id, equipe_id, responsable_id]);
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
    // Stats des présences + soldes congés
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
        soldeConges: null, // Sera rempli plus tard si besoin
    };
}

module.exports = { getEmployes, getEmployeById, create, update, remove, getEmployeStats };
