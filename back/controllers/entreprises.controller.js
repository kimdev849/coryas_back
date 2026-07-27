// ================================================================
// entreprises.controller.js - Gestion SaaS des entreprises clients
// ================================================================

const entreprisesModel = require("../models/entreprises.model");
const pool = require("../config/database");

const getAll = async (req, res) => {
    try {
        const data = await entreprisesModel.getAll();
        res.json({ message: "Liste des entreprises", data });
    } catch (error) {
        console.error("❌ getAllEntreprises:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getById = async (req, res) => {
    try {
        const data = await entreprisesModel.getById(req.params.id);
        if (!data) return res.status(404).json({ message: "Entreprise introuvable", data: null });
        res.json({ message: "Entreprise trouvée", data });
    } catch (error) {
        console.error("❌ getEntrepriseById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const create = async (req, res) => {
    try {
        const data = await entreprisesModel.create(req.body);
        res.status(201).json({ message: "Entreprise créée", data });
    } catch (error) {
        if (error.code === '23505') { // Duplicate slug
            return res.status(400).json({ message: "Ce slug est déjà utilisé", data: null });
        }
        console.error("❌ createEntreprise:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const update = async (req, res) => {
    try {
        const data = await entreprisesModel.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Entreprise introuvable", data: null });

        // Si le statut actif change, on active/désactive aussi tous les utilisateurs
        if (req.body.actif !== undefined) {
            const newActif = req.body.actif === true || req.body.actif === "true";
            await pool.query(`
                UPDATE utilisateurs SET
                    actif = $1,
                    updated_at = NOW()
                WHERE entreprise_id = $2
            `, [newActif, req.params.id]);
            console.log(`🔐 Utilisateurs de l'entreprise ${req.params.id} ${newActif ? 'activés' : 'désactivés'}`);
        }

        res.json({ message: "Entreprise mise à jour", data });
    } catch (error) {
        console.error("❌ updateEntreprise:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getStats = async (req, res) => {
    try {
        const data = await entreprisesModel.getStats();
        res.json({ message: "Statistiques Présencia", data });
    } catch (error) {
        console.error("❌ getStats:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// Demandes d'inscription (formulaire public)
const getDemandes = async (req, res) => {
    try {
        const data = await entreprisesModel.getDemandesInscription();
        res.json({ message: "Demandes d'inscription", data });
    } catch (error) {
        console.error("❌ getDemandes:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const creerDemande = async (req, res) => {
    try {
        const data = await entreprisesModel.createDemandeInscription(req.body);
        res.status(201).json({ message: "Demande d'inscription envoyée ! Nous vous contacterons sous 24h.", data });
    } catch (error) {
        console.error("❌ creerDemande:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAll, getById, create, update, getStats, getDemandes, creerDemande };
