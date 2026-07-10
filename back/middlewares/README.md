// ================================================================
// 📄 FICHIER : middlewares/README.md
// ----------------------------------------
// GUIDE D'UTILISATION DES MIDDLEWARES
// ================================================================

// ================================================================
// 📚 QU'EST-CE QU'UN MIDDLEWARE ?
// ================================================================
// Un middleware est une fonction qui s'exécute AVANT la route.
// Elle peut :
// - Logger les requêtes
// - Vérifier l'authentification
// - Valider les données
// - Modifier la requête
// - Bloquer l'accès (retourner une erreur)
//
// Structure :
// Requête → Middleware 1 → Middleware 2 → Route → Réponse

// ================================================================
// 🛠️ MIDDLEWARES DISPONIBLES
// ================================================================

// 1️⃣ AUTHENTIFICATION (auth.middleware.js)
// ──────────────────────────────────────────
//   verifyToken() : Vérifie que l'utilisateur a un token valide
//   checkRole(role) : Vérifie que l'utilisateur a le bon rôle
//
// Exemple d'utilisation dans une route :
// ──────────────────────────────────────────
// const { verifyToken, checkRole } = require("../middlewares/auth.middleware");
//
// router.delete(
//   "/:id",
//   verifyToken,           // Vérifier le token
//   checkRole("admin"),    // Vérifier que c'est un admin
//   deleteEmploye          // Contrôleur
// );
//
// Flux :
// GET /api/employes/1/delete
//   → verifyToken() : vérifie le header Authorization
//   → checkRole("admin") : vérifie le rôle = "admin"
//   → deleteEmploye() : exécute la fonction
//   → Réponse


// 2️⃣ VALIDATION (validation.middleware.js)
// ──────────────────────────────────────────
//   validateConge() : Valide une demande de congé
//   validateLogin() : Valide email + password
//   validateEmploye() : Valide les données d'un employé
//
// Exemple d'utilisation dans une route :
// ──────────────────────────────────────────
// const { validateConge } = require("../middlewares/validation.middleware");
//
// router.post(
//   "/",
//   validateConge,     // Valider les données
//   crierDemande       // Contrôleur
// );
//
// Flux :
// POST /api/conges
// Body: { dateDebut: "2024-01-10", dateFin: "2024-01-15", raison: "..." }
//   → validateConge() : vérifie les dates, formats, etc.
//   → crierDemande() : crée la demande
//   → Réponse


// 3️⃣ LOGGING (logger.middleware.js)
// ──────────────────────────────────
//   loggerMiddleware() : Enregistre chaque requête
//
// ✅ DÉJÀ ENREGISTRÉ GLOBALEMENT dans server.js
// Toutes les requêtes sont automatiquement loggées.
//
// Exemple de log :
// [14:30:25] POST /api/conges → 201 | IP: 127.0.0.1


// 4️⃣ CORS (cors.middleware.js)
// ──────────────────────────────
//   corsMiddleware() : Gère les requêtes cross-origin
//
// ✅ DÉJÀ ENREGISTRÉ GLOBALEMENT dans server.js
// Permet au frontend sur un autre domaine d'accéder l'API.


// 5️⃣ GESTION DES ERREURS (errorHandler.middleware.js)
// ────────────────────────────────────────────────────
//   errorHandler() : Centralise les erreurs
//   notFoundHandler() : Capture les routes 404
//
// ✅ DÉJÀ ENREGISTRÉS GLOBALEMENT dans server.js
// Pas besoin de les ajouter sur chaque route.


// ================================================================
// 💡 EXEMPLES COMPLETS D'UTILISATION
// ================================================================

// EXEMPLE 1 : Route avec authentification et validation
// ────────────────────────────────────────────────────
// File: routes/conges.routes.js

// const express = require("express");
// const congesController = require("../controllers/conges.controller");
// const { verifyToken, checkRole } = require("../middlewares/auth.middleware");
// const { validateConge } = require("../middlewares/validation.middleware");
//
// const router = express.Router();
//
// // Route publique (sans authentification)
// router.get("/", congesController.getAllConges);
//
// // Route protégée : créer une demande (employé authentifié)
// router.post(
//   "/",
//   verifyToken,        // Vérifier l'authentification
//   validateConge,      // Valider les données
//   congesController.crierDemande
// );
//
// // Route admin only : approuver une demande
// router.put(
//   "/:id/approve",
//   verifyToken,           // Vérifier l'authentification
//   checkRole("admin"),    // Vérifier le rôle = admin
//   congesController.appouverConge
// );
//
// module.exports = router;


// EXEMPLE 2 : Middleware personnalisé pour un cas spécifique
// ──────────────────────────────────────────────────────────
// // Dans une route :
//
// const checkDateRange = (req, res, next) => {
//   const { dateDebut, dateFin } = req.body;
//   const debut = new Date(dateDebut);
//   const fin = new Date(dateFin);
//
//   // Maximum 30 jours de congé
//   const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
//
//   if (jours > 30) {
//     return res.status(400).json({
//       message: "Maximum 30 jours de congé par demande"
//     });
//   }
//
//   next(); // Continuer si OK
// };
//
// router.post(
//   "/",
//   verifyToken,
//   validateConge,
//   checkDateRange,      // Middleware personnalisé
//   crierDemande
// );


// ================================================================
// 🔐 ORDRE D'ENREGISTREMENT DES MIDDLEWARES
// ================================================================
//
// L'ORDRE EST IMPORTANT ! Les middlewares s'exécutent dans l'ordre
// où ils sont enregistrés.
//
// Ordre recommandé dans server.js :
// 1. Parser JSON/URL
// 2. CORS
// 3. Logger
// 4. Routes API
// 5. 404 Handler
// 6. Error Handler
//
// ⚠️ Le 404 et Error Handler DOIVENT ÊTRE EN DERNIER


// ================================================================
// ❌ ERREURS COURANTES
// ================================================================

// ❌ ERREUR 1 : Oublier verifyToken sur une route protégée
// ✅ SOLUTION : Ajouter verifyToken en premier middleware
//
// ❌ ERREUR 2 : Error handler enregistré trop tôt
// ✅ SOLUTION : Enregistrer errorHandler EN DERNIER
//
// ❌ ERREUR 3 : Oublier next() dans un middleware
// ✅ SOLUTION : Toujours appeler next() après le traitement
//
// ❌ ERREUR 4 : Valider après la route
// ✅ SOLUTION : Validation = middleware (AVANT la route)


// ================================================================
// 📤 FICHIERS DE MIDDLEWARES
// ================================================================
//
// ✅ auth.middleware.js
//    - verifyToken() : Vérifier le JWT
//    - checkRole() : Vérifier le rôle
//
// ✅ logger.middleware.js
//    - loggerMiddleware() : Logger les requêtes
//
// ✅ cors.middleware.js
//    - corsMiddleware() : Gérer CORS
//
// ✅ errorHandler.middleware.js
//    - errorHandler() : Gérer les erreurs
//    - notFoundHandler() : Gérer les 404
//
// ✅ validation.middleware.js
//    - validateConge() : Valider un congé
//    - validateLogin() : Valider login
//    - validateEmploye() : Valider employé
