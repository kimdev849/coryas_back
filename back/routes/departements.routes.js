// ================================================================
// departements.routes.js - Routes pour les departements
// ================================================================
// URL de base : /api/departements
// ================================================================

const express = require("express");
const router = express.Router();
const departementsController = require("../controllers/departements.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.use(verifyToken);

router.get("/", departementsController.getDepartements);  // GET /api/departements -> liste

module.exports = router;
