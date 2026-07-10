// ================================================================
// conges.routes.js - Routes pour les demandes de conges
// ================================================================
// Les employes connectes peuvent creer et voir les demandes.
// Les admins et RH peuvent approuver, rejeter ou supprimer.
// checkRole(["Administrateur", "RH"]) limite l'acces a ces roles.
// URL de base : /api/conges
// ================================================================

const express = require("express");
const router = express.Router();
const congesController = require("../controllers/conges.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

// Toutes les routes demandent un token valide
router.use(verifyToken);

// Routes accessibles a tout employe connecte
router.get("/", congesController.getAllConges);       // GET /api/conges -> liste
router.post("/", congesController.creerDemande);      // POST /api/conges -> creer
router.get("/:id", congesController.getCongeById);    // GET /api/conges/5 -> detail

// Ces routes sont reservees aux Administrateurs et RH
// checkRole verifie que le role est dans la liste
router.put("/:id/approve",
  checkRole(["Administrateur", "RH"]),   // Seulement Admin et RH
  congesController.appouverConge           // Approuver
);
router.put("/:id/reject",
  checkRole(["Administrateur", "RH"]),   // Seulement Admin et RH
  congesController.rejeterConge            // Rejeter
);
router.delete("/:id",
  checkRole(["Administrateur", "RH"]),   // Seulement Admin et RH
  congesController.supprimerDemande        // Supprimer
);

module.exports = router;
