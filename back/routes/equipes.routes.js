const express = require("express");
const router = express.Router();
const controller = require("../controllers/equipes.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", checkRole(["Administrateur"]), controller.create);
router.put("/:id", checkRole(["Administrateur"]), controller.update);

module.exports = router;
