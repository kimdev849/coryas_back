// ================================================================
// departements.controller.js - Gere les departements
// ================================================================
// Ce fichier contient 1 fonction : getDepartements.
// Les departements sont charges dans le formulaire employe
// (menu deroulant pour choisir le service de l'employe).
// ================================================================

const departementModel = require("../models/departements.model");

// ----------------------------------------------------------------
// GET /api/departements - Lister tous les departements
// ----------------------------------------------------------------
// Retourne la liste des departements (ex: Informatique, RH, etc.)
// Utilise par le frontend pour remplir le select du formulaire.
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
