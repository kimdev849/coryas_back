// ================================================================
// parametres.controller.js - Gere les parametres
// ================================================================

const parametresModel = require("../models/parametres.model");

// ----------------------------------------------------------------
// GET /api/parametres - Recuperer les parametres
// ----------------------------------------------------------------
async function getParametres(req, res) {
    try {
        const data = await parametresModel.get();
        res.json({ message: "Parametres", data });
    } catch (error) {
        console.error("Erreur getParametres:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

// ----------------------------------------------------------------
// PUT /api/parametres - Sauvegarder les parametres
// ----------------------------------------------------------------
async function saveParametres(req, res) {
    try {
        const data = await parametresModel.save(req.body);
        res.json({ message: "Parametres sauvegardes", data });
    } catch (error) {
        console.error("Erreur saveParametres:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

module.exports = { getParametres, saveParametres };
