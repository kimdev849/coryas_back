// ================================================================
// typeContrat.controller.js - Types de contrats
// ================================================================

const typeContratModel = require("../models/typeContrat.model");
const auditLogModel = require("../models/auditLog.model");

const getAll = async (req, res) => {
    try {
        const data = await typeContratModel.getAll();
        res.json({ message: "Types de contrat", data });
    } catch (error) {
        console.error("❌ getAllContrats:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getById = async (req, res) => {
    try {
        const data = await typeContratModel.getById(req.params.id);
        if (!data) return res.status(404).json({ message: "Type introuvable", data: null });
        res.json({ message: "Type trouvé", data });
    } catch (error) {
        console.error("❌ getContratById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const create = async (req, res) => {
    try {
        const data = await typeContratModel.create(req.body);
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "CREATE", table_name: "type_contrat", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom, code: data.code },
        });
        res.status(201).json({ message: "Type de contrat créé", data });
    } catch (error) {
        console.error("❌ createContrat:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const update = async (req, res) => {
    try {
        const data = await typeContratModel.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Type introuvable", data: null });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "UPDATE", table_name: "type_contrat", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom },
        });
        res.json({ message: "Type modifié", data });
    } catch (error) {
        console.error("❌ updateContrat:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAll, getById, create, update };
