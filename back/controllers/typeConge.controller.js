// ================================================================
// typeConge.controller.js - Types de congés + Soldes
// ================================================================

const typeCongeModel = require("../models/typeConge.model");
const auditLogModel = require("../models/auditLog.model");

// --- Types de congés ---
const getAllTypes = async (req, res) => {
    try {
        const data = await typeCongeModel.getAllTypes();
        res.json({ message: "Types de congés", data });
    } catch (error) {
        console.error("❌ getAllTypes:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getTypeById = async (req, res) => {
    try {
        const data = await typeCongeModel.getTypeById(req.params.id);
        if (!data) return res.status(404).json({ message: "Type introuvable", data: null });
        res.json({ message: "Type trouvé", data });
    } catch (error) {
        console.error("❌ getTypeById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const createType = async (req, res) => {
    try {
        const data = await typeCongeModel.createType(req.body);
        await auditLogModel.create({
            employe_id: req.user?.employe_id,
            employe_nom: req.user?.role || "Admin",
            action: "CREATE", table_name: "type_conge", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom, code: data.code },
        });
        res.status(201).json({ message: "Type de congé créé", data });
    } catch (error) {
        console.error("❌ createType:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const updateType = async (req, res) => {
    try {
        const ancien = await typeCongeModel.getTypeById(req.params.id);
        const data = await typeCongeModel.updateType(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Type introuvable", data: null });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "UPDATE", table_name: "type_conge", record_id: data.id,
            anciennes_valeurs: { nom: ancien?.nom },
            nouvelles_valeurs: { nom: data.nom },
        });
        res.json({ message: "Type modifié", data });
    } catch (error) {
        console.error("❌ updateType:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// --- Soldes de congés ---
const getSoldeByEmploye = async (req, res) => {
    try {
        const employe_id = req.params.employe_id || req.user?.employe_id;
        const annee = req.query.annee || new Date().getFullYear();
        const data = await typeCongeModel.getSoldeByEmploye(employe_id, annee);
        res.json({ message: "Soldes de congés", data });
    } catch (error) {
        console.error("❌ getSoldeByEmploye:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getAllSoldes = async (req, res) => {
    try {
        const annee = req.query.annee || new Date().getFullYear();
        const data = await typeCongeModel.getAllSoldes(annee);
        res.json({ message: "Soldes de congés", data });
    } catch (error) {
        console.error("❌ getAllSoldes:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const updateSolde = async (req, res) => {
    try {
        const data = await typeCongeModel.updateSolde(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Solde introuvable", data: null });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "UPDATE", table_name: "solde_conge", record_id: data.id,
            nouvelles_valeurs: { total_jours: data.total_jours, jours_pris: data.jours_pris },
        });
        res.json({ message: "Solde mis à jour", data });
    } catch (error) {
        console.error("❌ updateSolde:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const creerSolde = async (req, res) => {
    try {
        const data = await typeCongeModel.creerSolde(req.body);
        res.status(201).json({ message: "Solde créé", data });
    } catch (error) {
        console.error("❌ creerSolde:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAllTypes, getTypeById, createType, updateType, getSoldeByEmploye, getAllSoldes, updateSolde, creerSolde };
