// ================================================================
// presences.model.js - Requetes SQL pour les presences
// ================================================================
// Ce fichier contient 8 fonctions :
// getAll            -> SELECT toutes les presences (avec filtres optionnels)
// getById           -> SELECT une presence par ID
// getActivePresence -> SELECT la presence en cours d'un employe
// checkIn           -> INSERT une arrivee
// checkOut          -> UPDATE pour enregistrer le depart
// rattrapage        -> UPDATE pour corriger un depart oublie (admin)
// getTodayStats     -> SELECT les stats du jour
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// getAll({ employe_id, date_debut, date_fin }) - Liste filtrée
// ----------------------------------------------------------------
// Construit la requete SQL dynamiquement selon les filtres passes.
// Si aucun filtre, retourne toutes les presences.
// ----------------------------------------------------------------
async function getAll(filters = {}) {
    const { employe_id, date_debut, date_fin } = filters;
    let sql = `
        SELECT p.id, p.employe_id,
               e.nom || ' ' || e.prenom AS employe_nom,
               e.nom AS employe_nom_seul,
               e.prenom AS employe_prenom,
               p.date_presence, p.heure_entree, p.heure_sortie,
               p.statut, p.remarque, p.created_at,
               -- Calcule la duree de travail en minutes si heure_sortie est renseignee
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
// checkIn({ employe_id, date_presence, heure_entree, statut })
// ----------------------------------------------------------------
// INSERT une nouvelle ligne de presence (arrivee).
// Le statut est "Present" si arrive avant 09:00, "Retard" sinon.
// Le controle est fait dans le controleur, pas ici.
// ----------------------------------------------------------------
async function checkIn({ employe_id, date_presence, heure_entree, statut }) {
    const result = await pool.query(`
        INSERT INTO presences (employe_id, date_presence, heure_entree, statut)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [employe_id, date_presence, heure_entree, statut]);
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
            heure_sortie = $2,
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
// Met aussi a jour le statut pour indiquer que c'est un rattrapage.
// ----------------------------------------------------------------
async function rattrapage(id, { heure_sortie, remarque }) {
    const result = await pool.query(`
        UPDATE presences SET
            heure_sortie = COALESCE($2, heure_sortie),
            remarque = CASE
                WHEN $3 IS NOT NULL AND $3 != '' THEN $3
                ELSE COALESCE(remarque, '')
            END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, heure_sortie, remarque]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// getTodayStats() - Stats du jour
// ----------------------------------------------------------------
// Retourne : total, presents, retards, absents, actifs (pas encore partis)
// ----------------------------------------------------------------
async function getTodayStats() {
    const [totalEmployes, presencesAujourdhui] = await Promise.all([
        pool.query("SELECT COUNT(*) AS total FROM employes WHERE statut = 'Actif'"),
        pool.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE statut = 'Present') AS presents,
                COUNT(*) FILTER (WHERE statut = 'Retard') AS retards,
                COUNT(*) FILTER (WHERE heure_sortie IS NULL) AS en_cours
            FROM presences
            WHERE date_presence = CURRENT_DATE
        `),
    ]);

    const employesActifs = parseInt(totalEmployes.rows[0].total) || 0;
    const p = presencesAujourdhui.rows[0];
    const totalPresents = parseInt(p.total) || 0;
    const presents = parseInt(p.presents) || 0;
    const retards = parseInt(p.retards) || 0;
    const enCours = parseInt(p.en_cours) || 0;
    const absents = employesActifs - totalPresents;
    const tauxPresence = employesActifs > 0 ? Math.round((totalPresents / employesActifs) * 100) : 0;

    return {
        employesActifs,
        totalPresents,
        presents,
        retards,
        absents: absents < 0 ? 0 : absents,
        enCours,
        tauxPresence,
    };
}

module.exports = { getAll, getById, getActivePresence, checkIn, checkOut, rattrapage, getTodayStats };

