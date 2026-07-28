// ================================================================
// presences.model.js - Requetes SQL pour les presences
// ================================================================
// Ce fichier contient 9 fonctions :
// getAll            -> SELECT toutes les presences (avec filtres optionnels)
// getById           -> SELECT une presence par ID
// getActivePresence -> SELECT la presence en cours d'un employe
// getTodayPresence  -> SELECT si l'employe a deja une presence aujourd'hui
// checkIn           -> INSERT une arrivee
// checkOut          -> UPDATE pour enregistrer le depart
// rattrapage        -> UPDATE pour corriger un depart oublie (admin)
// getTodayStats     -> SELECT les stats du jour
// autoCloseStalePresences -> UPDATE fermeture auto des oublis
// ================================================================

const pool = require("../config/database");
const { isWorkingDay } = require("./parametres.model");

// ----------------------------------------------------------------
// getAll({ employe_id, date_debut, date_fin }) - Liste filtrée
// ----------------------------------------------------------------
// Construit la requete SQL dynamiquement selon les filtres passes.
// Si aucun filtre, retourne toutes les presences.
// ----------------------------------------------------------------
async function getAll(filters = {}) {
    const { employe_id, date_debut, date_fin, entreprise_id } = filters;
    let sql = `
        SELECT p.id, p.employe_id,
               e.nom || ' ' || e.prenom AS employe_nom,
               e.nom AS employe_nom_seul,
               e.prenom AS employe_prenom,
               p.date_presence, p.heure_entree, p.heure_sortie,
               p.statut, p.remarque, p.created_at,
               CASE
                   WHEN p.heure_entree IS NOT NULL AND p.heure_sortie IS NOT NULL THEN
                       EXTRACT(EPOCH FROM (p.heure_sortie - p.heure_entree)) / 60
                   ELSE NULL
               END AS duree_minutes
        FROM presences p
        JOIN employes e ON e.id = p.employe_id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (employe_id) {
        sql += ` AND p.employe_id = $${paramIndex++}`;
        params.push(employe_id);
    }
    if (date_debut) {
        sql += ` AND p.date_presence >= $${paramIndex++}`;
        params.push(date_debut);
    }
    if (date_fin) {
        sql += ` AND p.date_presence <= $${paramIndex++}`;
        params.push(date_fin);
    }
    if (entreprise_id) {
        sql += ` AND e.entreprise_id = $${paramIndex++}`;
        params.push(entreprise_id);
    }

    sql += ` ORDER BY p.date_presence DESC, p.heure_entree DESC`;

    const result = await pool.query(sql, params);
    return result.rows;
}

// ----------------------------------------------------------------
// getById(id) - Voir une presence par son ID
// ----------------------------------------------------------------
// Meme requete que getAll() mais avec un filtre WHERE p.id = $1
// ----------------------------------------------------------------
async function getById(id) {
    const result = await pool.query(`
        SELECT p.id, p.employe_id,
               e.nom || ' ' || e.prenom AS employe_nom,
               p.date_presence, p.heure_entree, p.heure_sortie,
               p.statut, p.remarque, p.created_at
        FROM presences p
        JOIN employes e ON e.id = p.employe_id
        WHERE p.id = $1
    `, [id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// getActivePresence(employe_id) - Presence active d'un employe
// ----------------------------------------------------------------
// Cherche si l'employe est arrive aujourd'hui mais pas encore parti.
// Condition : date_presence = aujourd'hui ET heure_sortie IS NULL.
// LIMIT 1 renvoie une seule ligne (la plus recente).
// ----------------------------------------------------------------
async function getActivePresence(employe_id) {
    const result = await pool.query(`
        SELECT * FROM presences
        WHERE employe_id = $1
          AND date_presence = CURRENT_DATE   -- Aujourd'hui
          AND heure_sortie IS NULL           -- Pas encore parti
        ORDER BY created_at DESC LIMIT 1
    `, [employe_id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// getTodayPresence(employe_id) - Présence d'aujourd'hui (même complète)
// ----------------------------------------------------------------
// Vérifie si l'employé a DÉJÀ une présence aujourd'hui, qu'elle
// soit complète (arrivée + départ) ou non.
// Utilisée pour empêcher le double pointage.
// ----------------------------------------------------------------
async function getTodayPresence(employe_id) {
    const result = await pool.query(`
        SELECT * FROM presences
        WHERE employe_id = $1
          AND date_presence = CURRENT_DATE
        LIMIT 1
    `, [employe_id]);
    return result.rows[0] || null;
}

// ----------------------------------------------------------------
// checkIn({ employe_id, date_presence, heure_entree, statut })
// ----------------------------------------------------------------
// INSERT une nouvelle ligne de presence (arrivee).
// ----------------------------------------------------------------
async function checkIn({ employe_id, heure_entree, statut }) {
    const result = await pool.query(`
        INSERT INTO presences (employe_id, date_presence, heure_entree, statut)
        VALUES ($1, CURRENT_DATE, $2, $3)
        RETURNING *
    `, [employe_id, heure_entree, statut]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// checkOut(id, heure_sortie) - Enregistrer le depart
// ----------------------------------------------------------------
// UPDATE la ligne de presence pour ajouter l'heure de sortie.
// WHERE heure_sortie IS NULL empeche de pointer un depart 2 fois.
// ----------------------------------------------------------------
async function checkOut(id, heure_sortie) {
    const result = await pool.query(`
        UPDATE presences SET
            heure_sortie = $2::time,
            updated_at = NOW()
        WHERE id = $1
          AND heure_sortie IS NULL
        RETURNING *
    `, [id, heure_sortie]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// rattrapage(id, { heure_sortie, remarque }) - Corriger un depart
// ----------------------------------------------------------------
// Permet à l'admin de corriger une presence (rattrapage).
// Utile quand un employe a oublie de pointer son depart.
// Met à jour l'heure de sortie et la remarque.
// NOTE : CAST explicite $2::time pour éviter les erreurs de typage
//        entre le paramètre texte et la colonne TIME.
// ----------------------------------------------------------------
async function rattrapage(id, { heure_sortie, remarque }) {
    try {        const result = await pool.query(`
            UPDATE presences SET
                heure_sortie = $2::time,
                remarque = $3,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id, heure_sortie, remarque || null]);
        
        return result.rows[0];
    } catch (error) {
        console.error("❌ SQL rattrapage erreur:", error.message);
        throw error; // Laisse le controller gérer l'erreur
    }
}

// ----------------------------------------------------------------
// updateStatut(id, statut) - Met à jour le statut d'une présence
// ----------------------------------------------------------------
// Utilisé par checkOut pour corriger le statut "Retard" en "Present"
// si l'employé a travaillé assez longtemps.
// ----------------------------------------------------------------
async function updateStatut(id, statut) {
    const result = await pool.query(`
        UPDATE presences SET
            statut = $2,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, statut]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// getTodayStats() - Stats du jour
// ----------------------------------------------------------------
// Retourne : total, presents, retards, absents, actifs (pas encore partis)
// ----------------------------------------------------------------
async function getTodayStats(entrepriseId = null) {
    // ============================================================
    // VERIFICATION : Vérifie si aujourd'hui est un jour ouvrable
    // selon la configuration jours_ouvrables de l'entreprise
    // ============================================================
    let estWeekend = !(await isWorkingDay(entrepriseId));

    const entrepriseFilterEmp = entrepriseId ? ` AND e.entreprise_id = $1` : '';
    const entrepriseParams = entrepriseId ? [entrepriseId] : [];

    const [totalEmployes, presencesAujourdhui, employesEnConge] = await Promise.all([
        pool.query(`SELECT COUNT(*) AS total FROM employes e WHERE e.statut = 'Actif'${entrepriseFilterEmp}`, entrepriseParams),
        pool.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE p.statut = 'Present') AS presents,
                COUNT(*) FILTER (WHERE p.statut = 'Retard') AS retards,
                COUNT(*) FILTER (WHERE p.heure_sortie IS NULL) AS en_cours
            FROM presences p
            JOIN employes e ON e.id = p.employe_id
            WHERE p.date_presence = CURRENT_DATE${entrepriseFilterEmp}
        `, entrepriseParams),
        pool.query(`
            SELECT COUNT(DISTINCT c.employe_id) AS total
            FROM conges c
            JOIN employes e ON e.id = c.employe_id
            WHERE c.statut = 'Approuve'
              AND c.date_debut <= CURRENT_DATE
              AND c.date_fin >= CURRENT_DATE${entrepriseFilterEmp}
        `, entrepriseParams),
    ]);

    const employesActifs = parseInt(totalEmployes.rows[0].total) || 0;
    const enConge = parseInt(employesEnConge.rows[0].total) || 0;
    const p = presencesAujourdhui.rows[0];
    const totalPresents = parseInt(p.total) || 0;
    const presents = parseInt(p.presents) || 0;
    const retards = parseInt(p.retards) || 0;
    const enCours = parseInt(p.en_cours) || 0;

    let absents = 0;
    let tauxPresence = 0;

    if (!estWeekend && employesActifs > 0) {
        const employesAttendus = employesActifs - enConge;
        absents = Math.max(0, employesAttendus - totalPresents);
        tauxPresence = employesAttendus > 0
            ? Math.round((totalPresents / employesAttendus) * 100)
            : 0;
    }

    return {
        employesActifs,
        enConge,
        totalPresents,
        presents,
        retards,
        absents,
        enCours,
        tauxPresence,
        estWeekend,
    };
}

// ----------------------------------------------------------------
// autoCloseStalePresences(employe_id) - Fermeture auto des oublis
// ----------------------------------------------------------------
// Quand un employe check-in le matin, si une presence de la veille
// (ou avant) est encore ouverte (heure_sortie NULL), on la ferme
// automatiquement avec une heure par defaut et une remarque.
// ----------------------------------------------------------------
async function autoCloseStalePresences(employe_id) {
    const result = await pool.query(`
        UPDATE presences SET
            heure_sortie = '19:00',
            remarque = 'Fermeture automatique (jour suivant)',
            updated_at = NOW()
        WHERE employe_id = $1
          AND heure_sortie IS NULL
          AND date_presence < CURRENT_DATE
        RETURNING id, date_presence, heure_entree
    `, [employe_id]);
    return result.rows;
}

module.exports = { getAll, getById, getActivePresence, getTodayPresence, checkIn, checkOut, rattrapage, updateStatut, getTodayStats, autoCloseStalePresences };
