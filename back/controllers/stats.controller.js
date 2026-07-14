// ================================================================
// stats.controller.js - Statistiques de ponctualité
// ================================================================

const statsModel = require("../models/stats.model");

// ----------------------------------------------------------------
// GET /api/stats/punctualite - Statistiques de ponctualité
// ----------------------------------------------------------------
// Query params :
//   periode : "semaine" | "mois" (défaut) | "annee"
// ----------------------------------------------------------------
const getPunctualite = async (req, res) => {
    try {
        const periode = req.query.periode || "mois";
        const data = await statsModel.getPunctualite(periode);
        res.json({ message: "Statistiques de ponctualité", data });
    } catch (error) {
        console.error("❌ Erreur getPunctualite:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

module.exports = { getPunctualite };
