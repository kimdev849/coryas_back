// ================================================================
// parametres.controller.js - Gere les parametres de l'entreprise
// ================================================================
// Ce fichier contient 2 fonctions :
// getParametres  -> recupere les reglages (horaires, infos societe)
// saveParametres -> sauvegarde les reglages
// ================================================================

const parametresModel = require("../models/parametres.model");

// ----------------------------------------------------------------
// GET /api/parametres - Recuperer les parametres
// ----------------------------------------------------------------
// Retourne les reglages de l'entreprise : horaires d'ouverture,
// seuil de retard, nom de la societe, telephone, adresse...
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
// Recoit les donnees du formulaire de configuration et les
// enregistre dans la table parametres (UPSERT = update ou insert).
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
