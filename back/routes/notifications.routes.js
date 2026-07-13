// ================================================================
// notifications.routes.js - Routes pour les notifications
// ================================================================

const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

// GET /api/notifications - Liste des notifications de l'employé
router.get("/", notificationsController.getMesNotifications);

// GET /api/notifications/non-lues - Nombre de notifications non lues
router.get("/non-lues", notificationsController.getNonLues);

// PUT /api/notifications/:id/lire - Marquer une notification comme lue
router.put("/:id/lire", notificationsController.marquerLue);

// PUT /api/notifications/tout-lire - Tout marquer comme lu
router.put("/tout-lire", notificationsController.toutLire);

module.exports = router;
