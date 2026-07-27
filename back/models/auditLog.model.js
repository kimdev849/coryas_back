// ================================================================
// auditLog.model.js - Journal d'audit (traçabilité)
// ================================================================

const pool = require("../config/database");

async function getAll(filters = {}) {
    const { table_name, employe_id, action, limit = 100, offset = 0 } = filters;
    let sql = `
        SELECT al.*
        FROM audit_log al
        WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (employe_id) { sql += ` AND al.employe_id = $${idx++}`; params.push(employe_id); }
    if (table_name) { sql += ` AND al.table_name = $${idx++}`; params.push(table_name); }
    if (action) { sql += ` AND al.action = $${idx++}`; params.push(action); }

    sql += ` ORDER BY al.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    return result.rows;
}

async function create({ employe_id, employe_nom, action, table_name, record_id, anciennes_valeurs, nouvelles_valeurs, ip_address }) {
    const result = await pool.query(`
        INSERT INTO audit_log (employe_id, employe_nom, action, table_name, record_id, anciennes_valeurs, nouvelles_valeurs, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at
    `, [employe_id || null, employe_nom || null, action, table_name, record_id || null,
        anciennes_valeurs ? JSON.stringify(anciennes_valeurs) : null,
        nouvelles_valeurs ? JSON.stringify(nouvelles_valeurs) : null,
        ip_address || null]);
    return result.rows[0];
}

async function getStats() {
    const result = await pool.query(`
        SELECT
            COUNT(*) AS total_entrees,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS aujourd_hui,
            COUNT(DISTINCT table_name) AS tables_suivies,
            COUNT(DISTINCT employe_id) AS employes_actifs
        FROM audit_log
    `);
    return result.rows[0];
}

async function getRecentByEmploye(employe_id, limit = 20) {
    const result = await pool.query(`
        SELECT * FROM audit_log
        WHERE employe_id = $1
        ORDER BY created_at DESC
        LIMIT $2
    `, [employe_id, limit]);
    return result.rows;
}

module.exports = { getAll, create, getStats, getRecentByEmploye };
