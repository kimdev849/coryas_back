// ================================================================
// server.js - Point d'entrée du serveur Express
// ================================================================
// Ce fichier :
// 1. Charge les variables d'environnement (.env)
// 2. Configure Express (JSON, CORS, logger)
// 3. Monte toutes les routes (/api/auth, /api/presences, etc.)
// 4. Gère les erreurs 404 et les erreurs serveur
// 5. Démarre le serveur sur le port configuré (3000 par défaut)
// ================================================================

// ================================================================
// 0. CONFIGURATION DU FUSEAU HORAIRE (Afrique/Abidjan = UTC+0)
// ================================================================
// IMPORTANT : Ce réglage assure que new Date() et CURRENT_DATE
// utilisent le bon fuseau horaire pour les pointages (check-in/out).
// Sans cela, un décalage horaire peut bloquer les départs.
process.env.TZ = "Africa/Brazzaville";

// ================================================================
// 1. CHARGEMENT DES VARIABLES D'ENVIRONNEMENT
// ================================================================
require("dotenv").config();

// ================================================================
// 2. IMPORT DES BIBLIOTHÈQUES
// ================================================================
const express = require("express");
const app = express();

// ================================================================
// 3. IMPORT DES ROUTES
// ================================================================
const authRoutes = require("./routes/auth.routes");
const presencesRoutes = require("./routes/presences.routes");
const congesRoutes = require("./routes/conges.routes");
const employesRoutes = require("./routes/employes.routes");
const departementsRoutes = require("./routes/departements.routes");
const parametresRoutes = require("./routes/parametres.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const statsRoutes = require("./routes/stats.routes");
const typeCongeRoutes = require("./routes/typeConge.routes");
const typeContratRoutes = require("./routes/typeContrat.routes");
const sitesRoutes = require("./routes/sites.routes");
const equipesRoutes = require("./routes/equipes.routes");
const heuresSupRoutes = require("./routes/heuresSup.routes");
const auditLogRoutes = require("./routes/auditLog.routes");
const exportRoutes = require("./routes/export.routes");
const entreprisesRoutes = require("./routes/entreprises.routes");
const plansRoutes = require("./routes/plans.routes");

// ================================================================
// 4. IMPORT DES MIDDLEWARES
// ================================================================
const corsMiddleware = require("./middlewares/cors.middleware");
const loggerMiddleware = require("./middlewares/logger.middleware");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler.middleware");

// ================================================================
// 5. CONFIGURATION DES MIDDLEWARES GLOBAUX
// ================================================================

// Middleware CORS : autorise le frontend à appeler l'API
app.use(corsMiddleware);

// Middleware pour lire le JSON dans le corps des requêtes (req.body)
app.use(express.json());

// Middleware logger : affiche chaque requête dans la console
app.use(loggerMiddleware);

// ================================================================
// 6. MONTAGE DES ROUTES
// ================================================================
// Chaque groupe de routes est monté sur un préfixe :
//   /api/auth        → routes/auth.routes.js
//   /api/presences   → routes/presences.routes.js
//   /api/conges      → routes/conges.routes.js
//   /api/employes    → routes/employes.routes.js
//   /api/departements → routes/departements.routes.js
//   /api/parametres  → routes/parametres.routes.js
//   /api/dashboard   → routes/dashboard.routes.js
// ================================================================

app.use("/api/auth", authRoutes);
app.use("/api/presences", presencesRoutes);
app.use("/api/conges", congesRoutes);
app.use("/api/employes", employesRoutes);
app.use("/api/departements", departementsRoutes);
app.use("/api/parametres", parametresRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/conges-types", typeCongeRoutes);
app.use("/api/contrats-types", typeContratRoutes);
app.use("/api/sites", sitesRoutes);
app.use("/api/equipes", equipesRoutes);
app.use("/api/heures-sup", heuresSupRoutes);
app.use("/api/audit", auditLogRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/entreprises", entreprisesRoutes);
app.use("/api/plans", plansRoutes);

// ================================================================
// 7. ROUTE DE TEST (vérifier que le serveur répond)
// ================================================================
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Serveur Présencia opérationnel 💪" });
});

// ================================================================
// 8. GESTION DES ERREURS
// ================================================================
// Si aucune route n'a été trouvée → 404
app.use(notFoundHandler);

// Attrape toutes les erreurs non gérées → 500
app.use(errorHandler);

// ================================================================
// 9. DÉMARRAGE DU SERVEUR
// ================================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("");
    console.log("🚀 ====================================");
    console.log(`   Présencia API en ligne !`);
    console.log(`   📡 Port : ${PORT}`);
    console.log(`   🌍 http://localhost:${PORT}/api/health`);
    console.log("====================================");
    console.log("");
});

module.exports = app;
