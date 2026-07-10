// ================================================================
// presences.controller.js - Gere le pointage des employes
// ================================================================

const presencesModel = require("../models/presences.model");

// ----------------------------------------------------------------
// GET /api/presences - Liste toutes les presences (avec filtres)
// ----------------------------------------------------------------
// Query params optionnels : employe_id, date_debut, date_fin
// ----------------------------------------------------------------
const getAllPresences = async (req, res) => {
    try {
        const { employe_id, date_debut, date_fin } = req.query;
        const presences = await presencesModel.getAll({ employe_id, date_debut, date_fin });
        res.json({ message: "Liste des presences", data: presences });
    } catch (error) {
        console.error("Erreur getAllPresences:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/presences/checkin - Enregistrer une arrivee
// ----------------------------------------------------------------
// 1. On recupere l'ID de l'employe qui veut pointer
// 2. On prend la date et l'heure actuelle
// 3. Si l'employe arrive apres 09:00, le statut est "Retard"
// 4. On enregistre dans la base
// ----------------------------------------------------------------
const checkIn = async (req, res) => {
    try {
        // L'ID de l'employe vient du formulaire ou du token JWT
        const { employe_id } = req.body;

        if (!employe_id) {
            return res.status(400).json({ message: "employe_id obligatoire", data: null });
        }

        // On recupere la date et l'heure actuelles du serveur
        const now = new Date();
        const date = now.toISOString().split('T')[0];          // ex: "2026-07-09"
        const heure = String(now.getHours()).padStart(2, "0"); // ex: "08"
        const minutes = String(now.getMinutes()).padStart(2, "0"); // ex: "30"
        const heure_entree = heure + ":" + minutes;          // ex: "08:30"

        // Si l'heure d'arrivee est apres 09:00, l'employe est en retard
        // S'il arrive avant ou a 09:00, il est "Present"
        const statut = heure_entree > "09:00" ? "Retard" : "Present";

        // On enregistre l'arrivee dans la base de donnees
        const newPresence = await presencesModel.checkIn({
            employe_id, date_presence: date, heure_entree, statut,
        });

        // 201 = la presence a ete cree
        res.status(201).json({ message: "Arrivee enregistree", data: newPresence });
    } catch (error) {
        console.error("Erreur checkIn:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/presences/checkout - Enregistrer un depart
// ----------------------------------------------------------------
// 1. On recupere l'ID de la presence (pas l'employe)
// 2. On prend l'heure actuelle comme heure de sortie
// 3. On met a jour la presence dans la base
// ----------------------------------------------------------------
const checkOut = async (req, res) => {
    try {
        // presenceId = l'ID de la ligne de presence a mettre a jour
        const { presenceId } = req.body;

        if (!presenceId) {
            return res.status(400).json({ message: "ID de presence obligatoire", data: null });
        }

        // Heure de depart = heure actuelle
        const now = new Date();
        const heure = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const heure_sortie = heure + ":" + minutes;

        // On met a jour la presence avec l'heure de sortie
        const presence = await presencesModel.checkOut(presenceId, heure_sortie);

        if (!presence) {
            return res.status(404).json({ message: "Presence non trouvee ou deja partie", data: null });
        }

        res.json({ message: "Depart enregistre", data: presence });
    } catch (error) {
        console.error("Erreur checkOut:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/presences/:id - Voir une presence par son ID
// ----------------------------------------------------------------
const getPresenceById = async (req, res) => {
    try {
        const { id } = req.params;
        const presence = await presencesModel.getById(id);

        if (!presence) {
            return res.status(404).json({ message: "Presence non trouvee", data: null });
        }

        res.json({ message: "Presence trouvee", data: presence });
    } catch (error) {
        console.error("Erreur getPresenceById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/presences/active - Presence active d'un employe
// ----------------------------------------------------------------
// Sert a savoir si un employe est arrive mais pas encore parti.
// req.query.employe_id = l'ID passe dans l'URL (ex: /api/presences/active?employe_id=5)
// ----------------------------------------------------------------
const getActivePresence = async (req, res) => {
    try {
        const { employe_id } = req.query;

        if (!employe_id) {
            return res.status(400).json({ message: "employe_id requis", data: null });
        }

        // Cherche dans la base une presence aujourd'hui sans heure de sortie
        const presence = await presencesModel.getActivePresence(employe_id);

        // Si presence existe, l'employe est encore la. Sinon, il n'est pas venu ou il est parti.
        res.json({
            message: presence ? "Presence active trouvee" : "Aucune presence active",
            data: presence
        });
    } catch (error) {
        console.error("Erreur getActivePresence:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// PUT /api/presences/:id/rattrapage - Corriger un depart oublie
// ----------------------------------------------------------------
// Permet à l'admin de definir manuellement l'heure de depart
// et d'ajouter une remarque (ex: "Rattrapage - oubli de pointage")
// ----------------------------------------------------------------
const rattrapage = async (req, res) => {
    try {
        const { id } = req.params;
        const { heure_sortie, remarque } = req.body;

        if (!heure_sortie) {
            return res.status(400).json({ message: "heure_sortie obligatoire", data: null });
        }

        const presence = await presencesModel.rattrapage(id, { heure_sortie, remarque });

        if (!presence) {
            return res.status(404).json({ message: "Presence non trouvee", data: null });
        }

        res.json({ message: "Rattrapage enregistre avec succes", data: presence });
    } catch (error) {
        console.error("Erreur rattrapage:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/presences/stats/aujourdhui - Stats du jour
// ----------------------------------------------------------------
const getTodayStats = async (req, res) => {
    try {
        const stats = await presencesModel.getTodayStats();
        res.json({ message: "Stats du jour", data: stats });
    } catch (error) {
        console.error("Erreur getTodayStats:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = {
    getAllPresences, checkIn, checkOut,
    getPresenceById, getActivePresence,
    rattrapage, getTodayStats,
};

