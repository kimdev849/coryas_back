// ================================================================
// notifications.controller.js - API des notifications
// ================================================================

const notificationsModel = require("../models/notifications.model");

// ----------------------------------------------------------------
// GET /api/notifications - Notifications de l'employé connecté
// ----------------------------------------------------------------
const getMesNotifications = async (req, res) => {
    try {
        const employe_id = req.user?.employe_id;
        if (!employe_id) {
            return res.status(400).json({ message: "Utilisateur non authentifié", data: null });
        }

        const notifications = await notificationsModel.getByEmploye(employe_id);
        const nonLues = await notificationsModel.getUnreadCount(employe_id);

        res.json({
            message: "Notifications récupérées",
            data: notifications,
            nonLues,
        });
    } catch (error) {
        console.error("Erreur getMesNotifications:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/notifications/non-lues - Compter les non lues
// ----------------------------------------------------------------
const getNonLues = async (req, res) => {
    try {
        const employe_id = req.user?.employe_id;
        if (!employe_id) {
            return res.status(400).json({ message: "Utilisateur non authentifié", data: 0 });
        }

        const count = await notificationsModel.getUnreadCount(employe_id);
        res.json({ message: "Notifications non lues", data: count });
    } catch (error) {
        console.error("Erreur getNonLues:", error);
        res.status(500).json({ message: "Erreur serveur", data: 0 });
    }
};

// ----------------------------------------------------------------
// PUT /api/notifications/:id/lire - Marquer une notification comme lue
// ----------------------------------------------------------------
const marquerLue = async (req, res) => {
    try {
        const { id } = req.params;
        const notif = await notificationsModel.markAsRead(id);

        if (!notif) {
            return res.status(404).json({ message: "Notification introuvable", data: null });
        }

        res.json({ message: "Notification marquée comme lue", data: notif });
    } catch (error) {
        console.error("Erreur marquerLue:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// PUT /api/notifications/tout-lire - Tout marquer comme lu
// ----------------------------------------------------------------
const toutLire = async (req, res) => {
    try {
        const employe_id = req.user?.employe_id;
        if (!employe_id) {
            return res.status(400).json({ message: "Utilisateur non authentifié", data: null });
        }

        const count = await notificationsModel.markAllAsRead(employe_id);
        res.json({ message: `${count} notification(s) marquée(s) comme lue(s)`, data: count });
    } catch (error) {
        console.error("Erreur toutLire:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getMesNotifications, getNonLues, marquerLue, toutLire };
