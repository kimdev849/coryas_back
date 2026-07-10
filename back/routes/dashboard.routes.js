// ================================================================
// dashboard.routes.js - Routes pour le tableau de bord
// ================================================================
// Donne les statistiques (nombre d'employes, presences, etc.)
// Necessite un token JWT valide (verifyToken).
// URL de base : /api/dashboard
// ================================================================

// Importe Express pour creer les routes
const express = require("express");
const router = express.Router();

// Importe le controlleur et le middleware d'auth
const dashboardController = require("../controllers/dashboard.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Route : GET /api/dashboard/stats
// verifyToken : d'abord on verifie le token
// dashboardController.getDashboardStats : ensuite on renvoie les stats
router.get("/stats", verifyToken, dashboardController.getDashboardStats);

module.exports = router;

