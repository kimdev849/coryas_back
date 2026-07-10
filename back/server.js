// ================================================================
// server.js - Point de demarrage du serveur
// ================================================================
// Ce fichier cree le serveur Express, branche les middlewares
// et les routes, puis demarre sur le port 3000.
// ================================================================

// Importe Express pour creer le serveur web
const express = require("express");

// ================================================================
// GESTION DES ERREURS GLOBALES (empeche le crash du serveur)
// ================================================================
process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED REJECTION:", reason?.message || reason);
});
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err?.message || err);
});

// Cree une instance de l'application Express
const app = express();

// Connecte a la base de donnees Supabase (voir config/database.js)
require("./config/database");

// === Imports des fichiers de routes ===
// Chaque fichier .routes.js definit les URLs d'une partie de l'app
const authRoutes = require("./routes/auth.routes");       // Routes pour login/register
const dashboardRoutes = require("./routes/dashboard.routes"); // Routes pour les stats
const employesRoutes = require("./routes/employes.routes");  // Routes pour les employes
const presencesRoutes = require("./routes/presences.routes"); // Routes pour les pointages
const congesRoutes = require("./routes/conges.routes");     // Routes pour les conges
const departementsRoutes = require("./routes/departements.routes"); // Routes pour les departements
const parametresRoutes = require("./routes/parametres.routes"); // Routes pour les parametres

// === Imports des middlewares ===
// Les middlewares sont des fonctions qui s'executent avant les routes
const loggerMiddleware = require("./middlewares/logger.middleware");  // Affiche les requetes
const corsMiddleware = require("./middlewares/cors.middleware");      // Autorise le frontend
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler.middleware");

// ================================================================
// MIDDLEWARES (s'executent avant les routes)
// ================================================================

// Transforme le JSON du body en objet JavaScript
// Exemple: si on envoie {"nom":"Jean"}, on recoit req.body.nom = "Jean"
app.use(express.json());

// Pareil pour les formulaires HTML (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Autorise le navigateur du frontend a appeler cette API
// Sans CORS, le navigateur bloquerait les requetes
app.use(corsMiddleware);

// Affiche chaque requete dans la console (pour le debogage)
// Exemple: [14:30:00] GET /api/employes -> 200
app.use(loggerMiddleware);

// ================================================================
// ROUTES (chaque URL = une page ou une action)
// ================================================================

// Route de test : si on va sur http://localhost:3000/
app.get("/", (req, res) => {
  res.send("Serveur Presence Coryas fonctionne !");
});

// Branche chaque fichier de routes sur une URL de base
// Exemple: /api/auth/login appelle la route login du fichier auth.routes.js
app.use("/api/auth", authRoutes);           // Connexion, inscription
app.use("/api/dashboard", dashboardRoutes); // Statistiques du tableau de bord
app.use("/api/employes", employesRoutes);   // Gestion des employes
app.use("/api/presences", presencesRoutes); // Pointage arrivee/depart
app.use("/api/conges", congesRoutes);       // Demandes de conges
app.use("/api/departements", departementsRoutes); // Departements
app.use("/api/parametres", parametresRoutes);     // Parametres

// ================================================================
// GESTION DES ERREURS
// ================================================================

// Si l'URL demandee n'existe pas, renvoie une erreur 404
app.use(notFoundHandler);

// Si une erreur survient pendant le traitement, renvoie 500
app.use(errorHandler);

// ================================================================
// DEMARRAGE
// ================================================================

// Lance le serveur sur le port 3000
// Le serveur ecoute et attend les requetes
app.listen(3000, () => {
  console.log("Serveur sur port 3000");
});
     