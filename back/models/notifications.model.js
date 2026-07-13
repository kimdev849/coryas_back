// ================================================================
// notifications.model.js - Requêtes SQL pour les notifications
// ================================================================

const pool = require("../config/database");

// ----------------------------------------------------------------
// getByEmploye(employe_id, limit = 50) - Notifications d'un employé
// ----------------------------------------------------------------
async function getByEmploye(employe_id, limit = 50) {
    const result = await pool.query(`
        SELECT * FROM notifications
        WHERE employe_id = $1
        ORDER BY created_at DESC
        LIMIT $2
    `, [employe_id, limit]);
    return result.rows;
}

// ----------------------------------------------------------------
// getUnreadCount(employe_id) - Nombre de notifications non lues
// ----------------------------------------------------------------
async function getUnreadCount(employe_id) {
    const result = await pool.query(`
        SELECT COUNT(*) AS total FROM notifications
        WHERE employe_id = $1 AND lu = FALSE
    `, [employe_id]);
    return parseInt(result.rows[0].total) || 0;
}

// ----------------------------------------------------------------
// create({ employe_id, titre, message, type, lien }) - Créer une notif
// ----------------------------------------------------------------
async function create({ employe_id, titre, message, type = "info", lien = null }) {
    const result = await pool.query(`
        INSERT INTO notifications (employe_id, titre, message, type, lien)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [employe_id, titre, message, type, lien]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// markAsRead(id) - Marquer une notification comme lue
// ----------------------------------------------------------------
async function markAsRead(id) {
    const result = await pool.query(`
        UPDATE notifications SET lu = TRUE
        WHERE id = $1
        RETURNING *
    `, [id]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// markAllAsRead(employe_id) - Tout marquer comme lu
// ----------------------------------------------------------------
async function markAllAsRead(employe_id) {
    const result = await pool.query(`
        UPDATE notifications SET lu = TRUE
        WHERE employe_id = $1 AND lu = FALSE
        RETURNING id
    `, [employe_id]);
    return result.rowCount;
}

// ----------------------------------------------------------------
// deleteOld(days = 30) - Supprimer les notifications de + de 30 jours
// ----------------------------------------------------------------
async function deleteOld(days = 30) {
    const result = await pool.query(`
        DELETE FROM notifications
        WHERE created_at < NOW() - INTERVAL '1 day' * $1
    `, [days]);
    return result.rowCount;
}

module.exports = { getByEmploye, getUnreadCount, create, markAsRead, markAllAsRead, deleteOld };
