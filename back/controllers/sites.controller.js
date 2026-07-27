// ================================================================
// sites.controller.js - Multi-sites / Agences
// ================================================================

const sitesModel = require("../models/sites.model");
const auditLogModel = require("../models/auditLog.model");

const getAll = async (req, res) => {
    try {
        const data = await sitesModel.getAll();
        res.json({ message: "Liste des sites", data });
    } catch (error) {
        console.error("❌ getAllSites:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getById = async (req, res) => {
    try {
        const data = await sitesModel.getById(req.params.id);
        if (!data) return res.status(404).json({ message: "Site introuvable", data: null });
        res.json({ message: "Site trouvé", data });
    } catch (error) {
        console.error("❌ getSiteById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const create = async (req, res) => {
    try {
        const data = await sitesModel.create(req.body);
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "CREATE", table_name: "sites", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom, ville: data.ville },
        });
        res.status(201).json({ message: "Site créé", data });
    } catch (error) {
        console.error("❌ createSite:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const update = async (req, res) => {
    try {
        const data = await sitesModel.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Site introuvable", data: null });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "UPDATE", table_name: "sites", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom },
        });
        res.json({ message: "Site modifié", data });
    } catch (error) {
        console.error("❌ updateSite:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAll, getById, create, update };
