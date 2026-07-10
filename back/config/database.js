// ================================================================
// database.js - Connexion a Supabase
// ================================================================
// Ce fichier se connecte a la base de donnees PostgreSQL
// hebergee sur Supabase.
// ================================================================

// Charge les variables du fichier .env (DB_HOST, DB_PASSWORD, etc.)
require("dotenv").config();

// Importe Pool depuis la bibliotheque "pg" (PostgreSQL)
// Pool = un groupe de connexions a la base de donnees
const { Pool } = require("pg");

// Cree une nouvelle connexion avec les infos du .env
const pool = new Pool({
    host: process.env.DB_HOST,       // Adresse du serveur Supabase
    port: process.env.DB_PORT,       // Port (5432 par defaut)
    database: process.env.DB_NAME,   // Nom de la base
    user: process.env.DB_USER,       // Nom d'utilisateur
    password: process.env.DB_PASSWORD, // Mot de passe
    ssl: {
        rejectUnauthorized: false    // SSL = connexion securisee
    }
});

// Test : on verifie qu'on peut se connecter
pool.connect()
  .then((client) => {
    console.log("Connecte a Supabase !");
    client.release();
  })
  .catch((err) => {
    console.error("Erreur de connexion :", err.message);
  });

// Exporte le pool pour qu'il soit utilisable dans les autres fichiers
module.exports = pool;