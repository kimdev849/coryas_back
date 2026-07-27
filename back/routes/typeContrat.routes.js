const express = require("express");
const router = express.Router();
const controller = require("../controllers/typeContrat.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", checkRole(["SuperAdmin", "Administrateur", "RH"]), controller.create);
router.put("/:id", checkRole(["SuperAdmin", "Administrateur", "RH"]), controller.update);

module.exports = router;
