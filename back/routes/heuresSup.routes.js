const express = require("express");
const router = express.Router();
const controller = require("../controllers/heuresSup.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", controller.getAll);
router.get("/stats", controller.getStats);
router.get("/:id", controller.getById);
router.post("/", checkRole(["Administrateur", "RH"]), controller.create);
router.put("/:id/approve", checkRole(["Administrateur", "RH"]), controller.approve);
router.put("/:id/reject", checkRole(["Administrateur", "RH"]), controller.reject);
router.delete("/:id", controller.remove);

module.exports = router;
