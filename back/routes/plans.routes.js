const express = require("express");
const router = express.Router();
const controller = require("../controllers/plans.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

// Routes publiques (liste des plans)
router.get("/", controller.getAll);

// Routes super admin
router.post("/", verifyToken, checkRole(["SuperAdmin"]), controller.create);
router.put("/:id", verifyToken, checkRole(["SuperAdmin"]), controller.update);

module.exports = router;
