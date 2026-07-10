// ================================================================
// parametres.routes.js - Routes pour les paramètres
// ================================================================
// URL de base : /api/parametres
// ================================================================

const express = require("express");
const router = express.Router();
const parametresController = require("../controllers/parametres.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", parametresController.getParametres);   // GET  /api/parametres
router.put("/", parametresController.saveParametres);  // PUT  /api/parametres

module.exports = router;
