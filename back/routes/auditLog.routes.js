const express = require("express");
const router = express.Router();
const controller = require("../controllers/auditLog.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", checkRole(["Administrateur", "RH", "Directeur"]), controller.getAll);
router.get("/stats", checkRole(["Administrateur", "RH"]), controller.getStats);
router.get("/employe/:employe_id", controller.getByEmploye);

module.exports = router;
