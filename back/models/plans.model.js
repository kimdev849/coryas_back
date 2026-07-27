const pool = require("../config/database");

async function getAll() {
    const result = await pool.query("SELECT * FROM plans ORDER BY prix_par_employe ASC");
    return result.rows;
}

async function getById(id) {
    const result = await pool.query("SELECT * FROM plans WHERE id = $1", [id]);
    return result.rows[0];
}

async function create(data) {
    const { nom, code, description, prix_par_employe, max_employes, fonctionnalites } = data;
    const result = await pool.query(`
        INSERT INTO plans (nom, code, description, prix_par_employe, max_employes, fonctionnalites)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [nom, code, description || null, prix_par_employe || 0, max_employes || null,
        fonctionnalites ? JSON.stringify(fonctionnalites) : '[]']);
    return result.rows[0];
}

async function update(id, data) {
    const { nom, code, description, prix_par_employe, max_employes, fonctionnalites, actif } = data;
    const result = await pool.query(`
        UPDATE plans SET
            nom = COALESCE($2, nom), code = COALESCE($3, code),
            description = COALESCE($4, description),
            prix_par_employe = COALESCE($5, prix_par_employe),
            max_employes = COALESCE($6, max_employes),
            fonctionnalites = COALESCE($7, fonctionnalites),
            actif = COALESCE($8, actif)
        WHERE id = $1 RETURNING *
    `, [id, nom, code, description, prix_par_employe, max_employes, fonctionnalites, actif]);
    return result.rows[0];
}

module.exports = { getAll, getById, create, update };
