// ================================================================
// typeConge.routes.js - Types de congés et soldes
// ================================================================

const express = require("express");
const router = express.Router();
const controller = require("../controllers/typeConge.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

// Types de congés
router.get("/types", controller.getAllTypes);
router.get("/types/:id", controller.getTypeById);
router.post("/types", checkRole(["Administrateur", "RH"]), controller.createType);
router.put("/types/:id", checkRole(["Administrateur", "RH"]), controller.updateType);

// Soldes de congés
router.get("/soldes", checkRole(["Administrateur", "RH", "Directeur"]), controller.getAllSoldes);
router.get("/soldes/:employe_id", controller.getSoldeByEmploye);
router.put("/soldes/:id", checkRole(["Administrateur", "RH"]), controller.updateSolde);
router.post("/soldes", checkRole(["Administrateur", "RH"]), controller.creerSolde);

module.exports = router;
