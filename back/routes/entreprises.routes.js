const express = require("express");
const router = express.Router();
const controller = require("../controllers/entreprises.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

// Routes publiques
router.post("/inscription", controller.creerDemande);

// Routes super admin uniquement
router.get("/", verifyToken, checkRole(["SuperAdmin"]), controller.getAll);
router.get("/stats", verifyToken, checkRole(["SuperAdmin"]), controller.getStats);
router.get("/demandes", verifyToken, checkRole(["SuperAdmin"]), controller.getDemandes);
router.get("/:id", verifyToken, checkRole(["SuperAdmin"]), controller.getById);
router.post("/", verifyToken, checkRole(["SuperAdmin"]), controller.create);
router.put("/:id", verifyToken, checkRole(["SuperAdmin"]), controller.update);

module.exports = router;
