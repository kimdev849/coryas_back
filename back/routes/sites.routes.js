const express = require("express");
const router = express.Router();
const controller = require("../controllers/sites.controller");
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", checkRole(["SuperAdmin", "Administrateur"]), controller.create);
router.put("/:id", checkRole(["SuperAdmin", "Administrateur"]), controller.update);

module.exports = router;
