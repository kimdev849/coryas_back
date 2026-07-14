// ================================================================
// stats.routes.js - Routes pour les statistiques
// ================================================================
// URL de base : /api/stats
// ================================================================

const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/punctualite", statsController.getPunctualite);

module.exports = router;
