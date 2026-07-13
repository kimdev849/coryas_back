// ================================================================
// parametres.routes.js - Routes pour les paramètres
// ================================================================
// URL de base : /api/parametres
// ================================================================

const express = require("express");
const router = express.Router();
const parametresController = require("../controllers/parametres.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", parametresController.getParametres);   // GET  /api/parametres
router.put("/", checkRole(["Administrateur", "RH", "Directeur"]), parametresController.saveParametres);  // PUT  /api/parametres -> admin only

module.exports = router;
