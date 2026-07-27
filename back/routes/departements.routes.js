// ================================================================
// departements.routes.js - Routes pour les departements
// ================================================================
// URL de base : /api/departements
// GET    /              → Liste des departements (multi-entreprise)
// GET    /:id           → Détail d'un departement
// POST   /              → Créer un departement
// PUT    /:id           → Modifier un departement
// DELETE /:id           → Supprimer un departement
// ================================================================

const express = require("express");
const router = express.Router();
const controller = require("../controllers/departements.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", controller.getDepartements);
router.get("/:id", controller.getDepartementById);
router.post("/", checkRole(["SuperAdmin", "Administrateur", "RH"]), controller.createDepartement);
router.put("/:id", checkRole(["SuperAdmin", "Administrateur", "RH"]), controller.updateDepartement);
router.delete("/:id", checkRole(["SuperAdmin", "Administrateur", "RH"]), controller.deleteDepartement);

module.exports = router;
