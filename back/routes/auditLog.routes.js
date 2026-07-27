const express = require("express");
const router = express.Router();
const controller = require("../controllers/auditLog.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", checkRole(["SuperAdmin", "Administrateur", "RH", "Directeur"]), controller.getAll);
router.get("/stats", checkRole(["SuperAdmin", "Administrateur", "RH"]), controller.getStats);
router.get("/employe/:employe_id", controller.getByEmploye);

module.exports = router;
