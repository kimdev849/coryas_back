// ================================================================
// auth.model.js - Requetes SQL pour l'authentification
// ================================================================
// Ce fichier contient 4 fonctions qui parlent a la base de donnees :
// findByEmail     -> cherche un utilisateur par email (pour login)
// create          -> cree un nouvel utilisateur (pour register)
// emailExists     -> verifie si un email est deja pris
// updateLastLogin -> met a jour la date de derniere connexion
// ================================================================

// pool = la connexion a la base de donnees Supabase (PostgreSQL)
const pool = require("../config/database");

// ----------------------------------------------------------------
// findByEmail(email) - Cherche un utilisateur par email
// ----------------------------------------------------------------
// Utilisee par login. Cette requete fait 3 JOIN pour recuperer
// les infos de l'utilisateur + son employe + son role en une seule fois.
// ----------------------------------------------------------------
// $1 = l'email qu'on cherche
// result.rows[0] = le premier resultat (ou undefined si rien trouve)
// ----------------------------------------------------------------
async function findByEmail(email) {
    const result = await pool.query(`
        -- On selectionne les colonnes des 3 tables liees
        SELECT u.id, u.email, u.mot_de_passe, u.actif,
               e.id AS employe_id, e.nom AS employe_nom, e.prenom AS employe_prenom,
               r.nom AS role_nom
        -- Table principale : utilisateurs (alias u)
        FROM utilisateurs u
        -- JOIN avec la table employes pour avoir le nom et prenom
        JOIN employes e ON e.id = u.employe_id
        -- JOIN avec la table roles pour avoir le nom du role
        JOIN roles r ON r.id = u.role_id
        -- On filtre par email (WHERE)
        WHERE u.email = $1
    `, [email]);
    // rows[0] = le premier (et unique) utilisateur trouve
    return result.rows[0];
}

// ----------------------------------------------------------------
// create({ employe_id, role_id, email, mot_de_passe })
// ----------------------------------------------------------------
// Cree un nouvel utilisateur dans la table "utilisateurs".
// RETURNING permet de recuperer l'ID cree directement.
// ----------------------------------------------------------------
async function create({ employe_id, role_id, email, mot_de_passe }) {
    const result = await pool.query(`
        -- INSERT dans la table utilisateurs
        INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe)
        -- $1, $2, $3, $4 = les valeurs envoyees dans l'ordre
        VALUES ($1, $2, $3, $4)
        -- RETURNING renvoie les colonnes creees
        RETURNING id, email, actif
    `, [employe_id, role_id, email, mot_de_passe]);
    return result.rows[0];
}

// ----------------------------------------------------------------
// emailExists(email) - Verifie si un email est deja utilise
// ----------------------------------------------------------------
// Renvoie true si l'email existe deja, false sinon.
// ----------------------------------------------------------------
async function emailExists(email) {
    // On compte si au moins 1 ligne correspond a cet email
    const result = await pool.query(
        "SELECT id FROM utilisateurs WHERE email = $1", [email]
    );
    // Si result.rows.length > 0, l'email existe
    return result.rows.length > 0;
}

// ----------------------------------------------------------------
// updateLastLogin(userId) - Met a jour la derniere connexion
// ----------------------------------------------------------------
// Appelee apres un login reussi pour enregistrer la date/heure.
// NOW() = la date et l'heure actuelles du serveur PostgreSQL.
// ----------------------------------------------------------------
async function updateLastLogin(userId) {
    await pool.query(
        "UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = $1",
        [userId]
    );
}

// On exporte les 4 fonctions pour les utiliser dans le controleur
module.exports = { findByEmail, create, emailExists, updateLastLogin };

