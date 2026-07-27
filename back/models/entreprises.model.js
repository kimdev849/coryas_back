// ================================================================
// entreprises.model.js - Gestion des entreprises clients (SaaS)
// ================================================================

const pool = require("../config/database");

async function getAll() {
    const result = await pool.query(`
        SELECT e.*, p.nom AS plan_nom, p.code AS plan_code,
               (SELECT COUNT(*) FROM employes emp WHERE emp.entreprise_id = e.id AND emp.statut = 'Actif') AS nb_employes_actifs,
               (SELECT COUNT(*) FROM employes emp WHERE emp.entreprise_id = e.id) AS nb_employes_total,
               (SELECT COUNT(*) FROM abonnements a WHERE a.entreprise_id = e.id AND a.statut = 'Actif') AS abonnement_actif
        FROM entreprises e
        LEFT JOIN plans p ON p.id = e.plan_id
        ORDER BY e.created_at DESC
    `);
    return result.rows;
}

async function getById(id) {
    const result = await pool.query(`
        SELECT e.*, p.nom AS plan_nom, p.code AS plan_code,
               (SELECT COUNT(*) FROM employes emp WHERE emp.entreprise_id = e.id) AS nb_employes_total
        FROM entreprises e
        LEFT JOIN plans p ON p.id = e.plan_id
        WHERE e.id = $1
    `, [id]);
    return result.rows[0];
}

async function getBySlug(slug) {
    const result = await pool.query(`
        SELECT e.*, p.nom AS plan_nom, p.code AS plan_code
        FROM entreprises e
        LEFT JOIN plans p ON p.id = e.plan_id
        WHERE e.slug = $1
    `, [slug]);
    return result.rows[0];
}

async function create(data) {
    const { nom, slug, email, telephone, ville, pays, secteur, plan_id, nb_employes_max, notes } = data;
    // Génère automatiquement un slug à partir du nom si non fourni
    // Exemple: "SARL Congo Tech" → "sarl-congo-tech"
    const generatedSlug = slug || (nom
        ? nom.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
            .replace(/[^a-z0-9]+/g, '-') // remplace caractères spéciaux par -
            .replace(/^-+|-+$/g, '') // enlève les - au début/fin
            + '-' + Date.now() // ajoute timestamp pour unicité
        : 'entreprise-' + Date.now());
    const result = await pool.query(`
        INSERT INTO entreprises (nom, slug, email, telephone, ville, pays, secteur, plan_id, nb_employes_max, notes, actif)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
    `, [nom, generatedSlug, email, telephone || null, ville || null, pays || 'Congo', secteur || null,
        plan_id || null, nb_employes_max || 10, notes || null, true]);
    return result.rows[0];
}

async function update(id, data) {
    const { nom, email, telephone, ville, pays, secteur, plan_id, nb_employes_max, actif, notes } = data;
    const result = await pool.query(`
        UPDATE entreprises SET
            nom = COALESCE($2, nom),
            email = COALESCE($3, email),
            telephone = COALESCE($4, telephone),
            ville = COALESCE($5, ville),
            pays = COALESCE($6, pays),
            secteur = COALESCE($7, secteur),
            plan_id = COALESCE($8, plan_id),
            nb_employes_max = COALESCE($9, nb_employes_max),
            actif = COALESCE($10, actif),
            notes = COALESCE($11, notes),
            date_activation = CASE WHEN $10 = true AND actif = false THEN NOW() ELSE date_activation END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `, [id, nom, email, telephone, ville, pays, secteur, plan_id, nb_employes_max, actif, notes]);
    return result.rows[0];
}

async function getStats() {
    const result = await pool.query(`
        SELECT
            COUNT(*) AS total_entreprises,
            COUNT(*) FILTER (WHERE actif = true) AS entreprises_actives,
            COUNT(*) FILTER (WHERE actif = false) AS en_attente,
            (SELECT COUNT(*) FROM employes WHERE statut = 'Actif') AS total_employes,
            (SELECT COUNT(*) FROM presences WHERE date_presence = CURRENT_DATE) AS presences_aujourdhui
        FROM entreprises
    `);
    return result.rows[0];
}

async function getDemandesInscription() {
    const result = await pool.query(`
        SELECT * FROM demandes_inscription ORDER BY created_at DESC
    `);
    return result.rows;
}

async function createDemandeInscription(data) {
    const { nom_entreprise, email, telephone, ville, pays, message, plan_souhaite } = data;
    const result = await pool.query(`
        INSERT INTO demandes_inscription (nom_entreprise, email, telephone, ville, pays, message, plan_souhaite)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `, [nom_entreprise, email, telephone || null, ville || null, pays || 'Congo', message || null, plan_souhaite || 'Pro']);
    return result.rows[0];
}

module.exports = { getAll, getById, getBySlug, create, update, getStats, getDemandesInscription, createDemandeInscription };
