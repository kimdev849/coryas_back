// ================================================================
// presences.routes.js - Routes pour le pointage
// ================================================================
// URL de base : /api/presences
// ================================================================

const express = require("express");
const router = express.Router();
const presencesController = require("../controllers/presences.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", presencesController.getAllPresences);                   // GET /api/presences -> liste (avec ?employe_id=&date_debut=&date_fin=)
router.get("/stats/aujourdhui", presencesController.getTodayStats);    // GET /api/presences/stats/aujourdhui -> stats du jour
router.post("/checkin", presencesController.checkIn);                   // POST /api/presences/checkin -> arrivee
router.post("/checkout", presencesController.checkOut);                 // POST /api/presences/checkout -> depart
router.get("/active", presencesController.getActivePresence);           // GET /api/presences/active -> presence en cours
router.get("/:id", presencesController.getPresenceById);                // GET /api/presences/5 -> detail
router.put("/:id/rattrapage", presencesController.rattrapage);         // PUT /api/presences/5/rattrapage -> corriger

module.exports = router;

