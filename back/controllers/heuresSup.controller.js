// ================================================================
// heuresSup.controller.js - Heures supplémentaires
// ================================================================

const heuresSupModel = require("../models/heuresSup.model");
const notificationsModel = require("../models/notifications.model");
const auditLogModel = require("../models/auditLog.model");

const getAll = async (req, res) => {
    try {
        let filters = { ...req.query };
        // Si employé, ne voit que ses propres heures sup
        if (req.user?.role === "Employé") filters.employe_id = req.user.employe_id;
        const data = await heuresSupModel.getAll(filters);
        res.json({ message: "Heures supplémentaires", data });
    } catch (error) {
        console.error("❌ getAllHeuresSup:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getById = async (req, res) => {
    try {
        const data = await heuresSupModel.getById(req.params.id);
        if (!data) return res.status(404).json({ message: "Heure sup introuvable", data: null });
        res.json({ message: "Heure sup trouvée", data });
    } catch (error) {
        console.error("❌ getHeureSupById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const create = async (req, res) => {
    try {
        const employe_id = req.body.employe_id || req.user?.employe_id;
        const data = await heuresSupModel.create({ ...req.body, employe_id });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "CREATE", table_name: "heures_sup", record_id: data.id,
            nouvelles_valeurs: { nb_heures: data.nb_heures, date: data.date_heure_sup },
        });
        res.status(201).json({ message: "Heure supplémentaire enregistrée", data });
    } catch (error) {
        console.error("❌ createHeureSup:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const approve = async (req, res) => {
    try {
        const data = await heuresSupModel.approve(req.params.id, req.user?.employe_id, req.body.commentaire);
        if (!data) return res.status(404).json({ message: "Heure sup introuvable ou déjà traitée", data: null });
        try {
            await notificationsModel.create({
                employe_id: data.employe_id,
                titre: "Heures sup approuvées ✅",
                message: `Vos heures supplémentaires du ${data.date_heure_sup} (${data.nb_heures}h) ont été approuvées.`,
                type: "success", lien: "/heures-sup",
            });
        } catch (e) { console.error("Notif error:", e); }
        res.json({ message: "Heures sup approuvées", data });
    } catch (error) {
        console.error("❌ approveHeureSup:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const reject = async (req, res) => {
    try {
        const data = await heuresSupModel.reject(req.params.id, req.user?.employe_id, req.body.commentaire);
        if (!data) return res.status(404).json({ message: "Heure sup introuvable ou déjà traitée", data: null });
        try {
            const msg = req.body.commentaire ? ` Motif : ${req.body.commentaire}` : "";
            await notificationsModel.create({
                employe_id: data.employe_id,
                titre: "Heures sup refusées ❌",
                message: `Vos heures supplémentaires du ${data.date_heure_sup} (${data.nb_heures}h) ont été refusées.${msg}`,
                type: "warning", lien: "/heures-sup",
            });
        } catch (e) { console.error("Notif error:", e); }
        res.json({ message: "Heures sup refusées", data });
    } catch (error) {
        console.error("❌ rejectHeureSup:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getStats = async (req, res) => {
    try {
        const { employe_id, date_debut, date_fin } = req.query;
        const data = await heuresSupModel.getStats(employe_id, date_debut, date_fin);
        res.json({ message: "Statistiques heures sup", data });
    } catch (error) {
        console.error("❌ getStatsHeuresSup:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const remove = async (req, res) => {
    try {
        const deleted = await heuresSupModel.remove(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Introuvable ou déjà traitée", data: null });
        res.json({ message: "Heure sup supprimée", data: deleted });
    } catch (error) {
        console.error("❌ removeHeureSup:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAll, getById, create, approve, reject, getStats, remove };
