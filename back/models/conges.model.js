// ================================================================
// conges.model.js - Requetes SQL pour les conges
// ================================================================
// Ce fichier contient 6 fonctions :
// getAll   -> SELECT toutes les demandes
// getById  -> SELECT une demande par ID
// create   -> INSERT une nouvelle demande (statut = "En attente")
// approve  -> UPDATE pour mettre le statut a "Approuve"
// reject   -> UPDATE pour mettre le statut a "Rejete"
// remove   -> DELETE une demande (seulement si "En attente")
// ================================================================

// pool = la connexion a la base de donnees Supabase (PostgreSQL)
const pool = require("../config/database");

// ----------------------------------------------------------------
// getAll(filters) - Liste toutes les demandes de conges
// ----------------------------------------------------------------
// JOIN avec employes pour afficher le nom de l'employe.
// Filtre par entreprise_id si fourni (multi-tenant).
// ORDER BY created_at DESC affiche les plus recentes en premier.
// ----------------------------------------------------------------
async function getAll(filters = {}) {
    const { employe_id, entreprise_id } = filters;
    let query = `
        SELECT c.id, c.employe_id,
               e.nom || ' ' || e.prenom AS employe_nom,
               c.date_debut, c.date_fin, c.motif, c.statut,
               c.commentaire, c.commentaire_rh, c.created_at, c.updated_at
        FROM conges c
        JOIN employes e ON e.id = c.employe_id
        WHERE 1=1
    `;
    const params = [];

    if (employe_id) {
        query += ` AND c.employe_id = $${params.length + 1}`;
        params.push(employe_id);
    }

    if (entreprise_id) {
        query += ` AND e.entreprise_id = $${params.length + 1}`;
        params.push(entreprise_id);
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
}

// ----------------------------------------------------------------
// getById(id) - Voir une demande par son ID
// ----------------------------------------------------------------
// Meme requete que getAll() mais avec WHERE c.id = $1
// ----------------------------------------------------------------
async function getById(id) {
    const result = await pool.query(`
        SELECT c.id, c.employe_id,
               e.nom || ' ' || e.prenom AS employe_nom,
               c.date_debut, c.date_fin, c.motif, c.statut,
               c.commentaire, c.commentaire_rh, c.created_at, c.updated_at
        FROM conges c
        JOIN employes e ON e.id = c.employe_id
        WHERE c.id = $1
    `, [id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// create({ employe_id, date_debut, date_fin, motif })
// ----------------------------------------------------------------
// INSERT une nouvelle demande. Le statut par defaut est "En attente"
// (defini dans la table SQL, pas besoin de le passer ici).
// ----------------------------------------------------------------
async function create({ employe_id, date_debut, date_fin, motif, commentaire, type_conge_id }) {
    const result = await pool.query(`
        INSERT INTO conges (employe_id, date_debut, date_fin, motif, commentaire, type_conge_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `, [employe_id, date_debut, date_fin, motif, commentaire || null, type_conge_id || null]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// approve(id, commentaire_rh) - Approuver une demande
// ----------------------------------------------------------------
// UPDATE change le statut de "En attente" a "Approuve".
// WHERE statut = 'En attente' empeche d'approuver 2 fois.
// COALESCE($2, commentaire_rh) garde l'ancien commentaire si rien de nouveau.
// ----------------------------------------------------------------
async function approve(id, commentaire_rh = null) {
    const result = await pool.query(`
        UPDATE conges SET
            statut = 'Approuve',
            commentaire_rh = COALESCE($2, commentaire_rh),
            updated_at = NOW()
        WHERE id = $1
          AND statut = 'En attente'  -- Seulement si pas deja traite
        RETURNING *
    `, [id, commentaire_rh]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// reject(id, commentaire_rh) - Rejeter une demande
// ----------------------------------------------------------------
// Meme principe que approve() mais avec le statut "Rejete".
// ----------------------------------------------------------------
async function reject(id, commentaire_rh = null) {
    const result = await pool.query(`
        UPDATE conges SET
            statut = 'Rejete',
            commentaire_rh = COALESCE($2, commentaire_rh),
            updated_at = NOW()
        WHERE id = $1
          AND statut = 'En attente'  -- Seulement si pas deja traite
        RETURNING *
    `, [id, commentaire_rh]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// remove(id) - Supprimer une demande
// ----------------------------------------------------------------
// DELETE seulement si le statut est "En attente".
// RETURNING id confirme la suppression.
// ----------------------------------------------------------------
async function remove(id) {
    const result = await pool.query(
        "DELETE FROM conges WHERE id = $1 AND statut = 'En attente' RETURNING id",
        [id]
    );
    return result.rows[0];
}

// On exporte les 6 fonctions pour les utiliser dans le controleur
module.exports = { getAll, getById, create, approve, reject, remove };

