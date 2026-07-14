// ================================================================
// conges.routes.js - Routes pour les demandes de conges
// ================================================================
// Les employes connectes peuvent creer et voir les demandes.
// Les admins et RH peuvent approuver, rejeter ou supprimer.
// checkRole(["Administrateur", "RH", "Directeur"]) limite l'acces a ces roles.
// URL de base : /api/conges
// ================================================================

const express = require("express");
const router = express.Router();
const congesController = require("../controllers/conges.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");
const { validateConge } = require("../middlewares/validation.middleware");

// Toutes les routes demandent un token valide
router.use(verifyToken);

// Routes accessibles a tout employe connecte
router.get("/", congesController.getAllConges);       // GET /api/conges -> liste
router.post("/", validateConge, congesController.creerDemande);      // POST /api/conges -> creer
router.get("/:id", congesController.getCongeById);    // GET /api/conges/5 -> detail

// Ces routes sont reservees aux Administrateurs, RH et Directeur
// checkRole verifie que le role est dans la liste
router.put("/:id/approve",
  checkRole(["Administrateur", "RH", "Directeur"]),   // Seulement Admin, RH et Directeur
  congesController.appouverConge           // Approuver
);
router.put("/:id/reject",
  checkRole(["Administrateur", "RH", "Directeur"]),   // Seulement Admin, RH et Directeur
  congesController.rejeterConge            // Rejeter
);
router.delete("/:id",
  checkRole(["Administrateur", "RH", "Directeur"]),   // Seulement Admin, RH et Directeur
  congesController.supprimerDemande        // Supprimer
);

module.exports = router;
