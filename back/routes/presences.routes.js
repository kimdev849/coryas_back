// ================================================================
// presences.routes.js - Routes pour le pointage
// ================================================================
// URL de base : /api/presences
// ================================================================

const express = require("express");
const router = express.Router();
const presencesController = require("../controllers/presences.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", presencesController.getAllPresences);                   // GET /api/presences -> liste (filtrée selon le rôle dans le contrôleur)
router.get("/stats/aujourdhui", checkRole(["SuperAdmin", "Administrateur", "RH", "Directeur"]), presencesController.getTodayStats);    // GET /api/presences/stats/aujourdhui -> stats du jour
router.post("/checkin", presencesController.checkIn);                   // POST /api/presences/checkin -> arrivee
router.post("/checkout", presencesController.checkOut);                 // POST /api/presences/checkout -> depart
router.get("/active", presencesController.getActivePresence);           // GET /api/presences/active -> presence en cours
router.get("/:id", presencesController.getPresenceById);                // GET /api/presences/5 -> detail (accessible à tous : utilisé par le mobile)
router.put("/:id/rattrapage", checkRole(["SuperAdmin", "Administrateur", "RH", "Directeur"]), presencesController.rattrapage);         // PUT /api/presences/5/rattrapage -> corriger

module.exports = router;

