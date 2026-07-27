// ================================================================
// equipes.controller.js - Équipes
// ================================================================

const equipesModel = require("../models/equipes.model");
const auditLogModel = require("../models/auditLog.model");

const getAll = async (req, res) => {
    try {
        const data = await equipesModel.getAll();
        res.json({ message: "Liste des équipes", data });
    } catch (error) {
        console.error("❌ getAllEquipes:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getById = async (req, res) => {
    try {
        const data = await equipesModel.getById(req.params.id);
        if (!data) return res.status(404).json({ message: "Équipe introuvable", data: null });
        res.json({ message: "Équipe trouvée", data });
    } catch (error) {
        console.error("❌ getEquipeById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const create = async (req, res) => {
    try {
        const data = await equipesModel.create(req.body);
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "CREATE", table_name: "equipes", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom },
        });
        res.status(201).json({ message: "Équipe créée", data });
    } catch (error) {
        console.error("❌ createEquipe:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const update = async (req, res) => {
    try {
        const data = await equipesModel.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Équipe introuvable", data: null });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "UPDATE", table_name: "equipes", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom },
        });
        res.json({ message: "Équipe modifiée", data });
    } catch (error) {
        console.error("❌ updateEquipe:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAll, getById, create, update };
