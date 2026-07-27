const express = require("express");
const router = express.Router();
const controller = require("../controllers/export.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/presences", checkRole(["Administrateur", "RH", "Directeur"]), controller.exportPresencesCSV);
router.get("/conges", checkRole(["Administrateur", "RH", "Directeur"]), controller.exportCongesCSV);
router.get("/employes", checkRole(["Administrateur", "RH", "Directeur"]), controller.exportEmployesCSV);
router.get("/heures-sup", checkRole(["Administrateur", "RH", "Directeur"]), controller.exportHeuresSupCSV);

module.exports = router;
