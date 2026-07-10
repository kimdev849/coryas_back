// ================================================================
// departements.controller.js - Gere les departements
// ================================================================

const departementModel = require("../models/departements.model");

// ----------------------------------------------------------------
// GET /api/departements - Lister tous les departements
// ----------------------------------------------------------------
async function getDepartements(req, res) {
    try {
        const departements = await departementModel.getDepartements();
        res.json({ message: "Liste des departements", data: departements });
    } catch (error) {
        console.error("Erreur getDepartements:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

module.exports = { getDepartements };
