// ================================================================
// parametres.controller.js - Gere les parametres de l'entreprise
// ================================================================
// Ce fichier contient 2 fonctions :
// getParametres  -> recupere les reglages (horaires, infos societe)
// saveParametres -> sauvegarde les reglages
// ================================================================

const parametresModel = require("../models/parametres.model");
const pool = require("../config/database");

// ----------------------------------------------------------------
// getEntrepriseId - Récupère l'entreprise_id depuis la base de données
// ----------------------------------------------------------------
// ⚠️ IMPORTANT : on ne se fie PAS au JWT car entreprise_id peut être
// obsolète (ex: employé déplacé vers une autre entreprise sans
// réauthentification). On fait une vraie requête DB pour être sûr.
// ----------------------------------------------------------------
async function getEntrepriseId(req) {
    // 1. Si l'utilisateur a un employe_id, on cherche dans la table employes
    if (req.user?.employe_id) {
        try {
            const result = await pool.query(
                'SELECT entreprise_id FROM employes WHERE id = $1',
                [req.user.employe_id]
            );
            if (result.rows[0]?.entreprise_id) {
                return result.rows[0].entreprise_id;
            }
        } catch (e) {
            console.warn("⚠️ getEntrepriseId lookup error:", e.message);
        }
    }
    // 2. Fallback sur le JWT (au cas où)
    return req.user?.entreprise_id || null;
}

// ----------------------------------------------------------------
// GET /api/parametres - Recuperer les parametres
// ----------------------------------------------------------------
// Retourne les reglages de l'entreprise : horaires d'ouverture,
// seuil de retard, nom de la societe, telephone, adresse...
// ----------------------------------------------------------------
async function getParametres(req, res) {
    try {
        const entrepriseId = await getEntrepriseId(req);
        console.log(`📋 GET /parametres — user.id=${req.user?.id} employe_id=${req.user?.employe_id} jwt_entreprise_id=${req.user?.entreprise_id} db_entreprise_id=${entrepriseId}`);
        const data = await parametresModel.get(entrepriseId);
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
// On utilise aussi getEntrepriseId pour garantir le bon scope.
// ----------------------------------------------------------------
async function saveParametres(req, res) {
    try {
        const entrepriseId = await getEntrepriseId(req);
        const data = await parametresModel.save({ ...req.body, entreprise_id: entrepriseId });
        res.json({ message: "Parametres sauvegardes", data });
    } catch (error) {
        console.error("Erreur saveParametres:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

module.exports = { getParametres, saveParametres };
