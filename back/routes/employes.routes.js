// ================================================================
// employes.routes.js - Routes pour les employes
// ================================================================
// Permet de :
// - lister tous les employes (GET)
// - voir un employe (GET /:id)
// - creer un employe (POST)
// - modifier un employe (PUT /:id)
// - supprimer un employe (DELETE /:id)
// Toutes ces routes necessitent un token JWT.
// URL de base : /api/employes
// ================================================================

const express = require("express");
const router = express.Router();
const employesController = require("../controllers/employes.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");
const { validateEmploye } = require("../middlewares/validation.middleware");

// router.use = applique verifyToken a TOUTES les routes en dessous
router.use(verifyToken);
router.use(checkRole(["Administrateur", "RH", "Directeur"]));

router.get("/", employesController.getEmployes);         // GET /api/employes -> liste
router.post("/", validateEmploye, employesController.createEmploye);      // POST /api/employes -> creer
router.get("/:id/stats", employesController.getEmployeStats);   // GET /api/employes/5/stats -> stats
router.get("/:id", employesController.getEmployeById);   // GET /api/employes/5 -> voir
router.put("/:id", employesController.updateEmploye);    // PUT /api/employes/5 -> modifier
router.put("/:id/deactivate", employesController.deactivateEmploye); // PUT /api/employes/5/deactivate -> desactiver

module.exports = router;
