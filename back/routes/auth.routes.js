// ================================================================
// auth.routes.js - Routes pour l'authentification
// ================================================================
// Quand quelqu'un appelle /api/auth/login, on execute
// la fonction authController.login (dans controllers/auth.controller.js)
// ================================================================

// Importe Express pour creer les routes
const express = require("express");
// Cree un routeur (un groupe de routes)
const router = express.Router();

// Importe le controlleur qui contient les fonctions a executer
const authController = require("../controllers/auth.controller");

// Route pour se connecter : POST /api/auth/login
router.post("/login", authController.login);

// Route pour creer un compte : POST /api/auth/register
router.post("/register", authController.register);

// Route pour se deconnecter : POST /api/auth/logout
router.post("/logout", authController.logout);

// Exporte le routeur pour l'utiliser dans server.js
module.exports = router;

