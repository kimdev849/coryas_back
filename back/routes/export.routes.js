const express = require("express");
const router = express.Router();
const controller = require("../controllers/export.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/presences", checkRole(["SuperAdmin", "Administrateur", "RH", "Directeur"]), controller.exportPresencesCSV);
router.get("/conges", checkRole(["SuperAdmin", "Administrateur", "RH", "Directeur"]), controller.exportCongesCSV);
router.get("/employes", checkRole(["SuperAdmin", "Administrateur", "RH", "Directeur"]), controller.exportEmployesCSV);
router.get("/heures-sup", checkRole(["SuperAdmin", "Administrateur", "RH", "Directeur"]), controller.exportHeuresSupCSV);

module.exports = router;
