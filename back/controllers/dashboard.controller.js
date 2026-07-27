// ================================================================
// dashboard.controller.js - Statistiques du tableau de bord
// ================================================================
// Ce fichier contient 1 fonction : getDashboardStats.
// Elle calcule en temps reel : nombre d'employes, presents du jour,
// absents, retards, conges en attente, taux de presence.
// ================================================================

// dashboardModel contient la requete SQL qui calcule les stats
const dashboardModel = require("../models/dashboard.model");

// ----------------------------------------------------------------
// GET /api/dashboard - Recuperer les statistiques
// ----------------------------------------------------------------
// 1. Appelle dashboardModel.getStats() qui lance 4 requetes SQL
// 2. Renvoie le resultat au frontend
// ----------------------------------------------------------------
const getDashboardStats = async (req, res) => {
    try {
        // On demande les stats au modele (qui fait les requetes SQL)
        const stats = await dashboardModel.getStats(req.user?.entreprise_id);
        // On renvoie les stats au frontend
        res.json({ message: "Statistiques du dashboard", data: stats });
    } catch (error) {
        // Si la base de donnees est indisponible, on renvoie 500
        console.error("❌ Dashboard getStats error:", error.message);
        console.error("   Stack:", error.stack?.split('\n').slice(0, 5).join('\n'));
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// On exporte la fonction pour l'utiliser dans les routes
module.exports = { getDashboardStats };

