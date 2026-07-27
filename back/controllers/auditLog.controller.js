// ================================================================
// auditLog.controller.js - Journal d'audit
// ================================================================

const auditLogModel = require("../models/auditLog.model");

const getAll = async (req, res) => {
    try {
        const { table_name, employe_id, action, limit, offset } = req.query;
        const data = await auditLogModel.getAll({
            table_name, employe_id, action,
            limit: parseInt(limit) || 100,
            offset: parseInt(offset) || 0,
        });
        res.json({ message: "Journal d'audit", data });
    } catch (error) {
        console.error("❌ getAuditLog:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getStats = async (req, res) => {
    try {
        const data = await auditLogModel.getStats();
        res.json({ message: "Statistiques audit", data });
    } catch (error) {
        console.error("❌ getAuditStats:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getByEmploye = async (req, res) => {
    try {
        const employe_id = req.params.employe_id || req.user?.employe_id;
        const data = await auditLogModel.getRecentByEmploye(employe_id);
        res.json({ message: "Activité de l'employé", data });
    } catch (error) {
        console.error("❌ getAuditByEmploye:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAll, getStats, getByEmploye };
