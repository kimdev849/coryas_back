// ================================================================
// typeConge.controller.js - Types de congés + Soldes
// ================================================================

const typeCongeModel = require("../models/typeConge.model");
const auditLogModel = require("../models/auditLog.model");
const pool = require("../config/database");

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
        const data = await typeCongeModel.getAllSoldes(annee, req.user?.entreprise_id);
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

// ----------------------------------------------------------------
// POST /api/conges-types/soldes/backfill - Backfill des soldes
// ----------------------------------------------------------------
// Crée les soldes manquants pour tous les employés de l'entreprise
// qui n'ont pas encore de solde pour l'année en cours.
// ----------------------------------------------------------------
const backfillSoldes = async (req, res) => {
    try {
        const entrepriseId = req.user?.entreprise_id;
        const annee = req.query.annee || new Date().getFullYear();

        const result = await pool.query(`
            INSERT INTO solde_conge (employe_id, type_conge_id, total_jours, jours_pris, annee)
            SELECT e.id, tc.id, COALESCE(tc.jours_max, 0), 0, $1
            FROM employes e
            CROSS JOIN type_conge tc
            WHERE tc.actif = true
              AND ($2 IS NULL OR e.entreprise_id = $2)
              AND NOT EXISTS (
                  SELECT 1 FROM solde_conge sc
                  WHERE sc.employe_id = e.id
                    AND sc.type_conge_id = tc.id
                    AND sc.annee = $1
              )
            RETURNING id
        `, [annee, entrepriseId]);

        res.json({
            message: `${result.rows.length} solde(s) créé(s) avec succès`,
            data: { total: result.rows.length },
        });
    } catch (error) {
        console.error("❌ backfillSoldes:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAllTypes, getTypeById, createType, updateType, getSoldeByEmploye, getAllSoldes, updateSolde, creerSolde, backfillSoldes };
