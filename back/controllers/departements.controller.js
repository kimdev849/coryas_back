// ================================================================
// departements.controller.js - Gere les departements (multi-entreprise)
// ================================================================
// Chaque entreprise a ses propres departements.
// ================================================================

const departementModel = require("../models/departements.model");
const auditLogModel = require("../models/auditLog.model");
const pool = require("../config/database");

// ----------------------------------------------------------------
// GET /api/departements - Lister les departements de l'entreprise
// ----------------------------------------------------------------
async function getDepartements(req, res) {
    try {
        const departements = await departementModel.getDepartements(req.user?.entreprise_id);
        res.json({ message: "Liste des departements", data: departements });
    } catch (error) {
        console.error("Erreur getDepartements:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

// ----------------------------------------------------------------
// GET /api/departements/:id - Voir un departement
// ----------------------------------------------------------------
async function getDepartementById(req, res) {
    try {
        const data = await departementModel.getDepartementById(req.params.id, req.user?.entreprise_id);
        if (!data) return res.status(404).json({ message: "Departement introuvable", data: null });
        res.json({ message: "Departement trouvé", data });
    } catch (error) {
        console.error("Erreur getDepartementById:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

// ----------------------------------------------------------------
// POST /api/departements - Creer un departement
// ----------------------------------------------------------------
async function createDepartement(req, res) {
    try {
        const data = await departementModel.create({ ...req.body, entreprise_id: req.user?.entreprise_id });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "CREATE", table_name: "departements", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom },
        }).catch(() => {});
        res.status(201).json({ message: "Departement créé", data });
    } catch (error) {
        console.error("Erreur createDepartement:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

// ----------------------------------------------------------------
// PUT /api/departements/:id - Modifier un departement
// ----------------------------------------------------------------
async function updateDepartement(req, res) {
    try {
        const data = await departementModel.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Departement introuvable", data: null });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "UPDATE", table_name: "departements", record_id: data.id,
            nouvelles_valeurs: { nom: data.nom },
        }).catch(() => {});
        res.json({ message: "Departement modifié", data });
    } catch (error) {
        console.error("Erreur updateDepartement:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

// ----------------------------------------------------------------
// DELETE /api/departements/:id - Supprimer un departement
// ----------------------------------------------------------------
// Vérifie d'abord qu'aucun employé actif n'est lié à ce département.
// Si des employés existent, la suppression est refusée.
// ----------------------------------------------------------------
async function deleteDepartement(req, res) {
    try {
        const { id } = req.params;

        // Vérifier si des employés sont liés à ce département
        const empCheck = await pool.query(`
            SELECT COUNT(*) AS total FROM employes WHERE departement_id = $1 AND statut = 'Actif'
        `, [id]);
        const nbEmployes = parseInt(empCheck.rows[0].total) || 0;

        if (nbEmployes > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer ce département : ${nbEmployes} employé(s) actif(s) y sont liés. Transférez-les d'abord vers un autre département.`,
                data: null
            });
        }

        const data = await departementModel.remove(id);
        if (!data) return res.status(404).json({ message: "Departement introuvable", data: null });
        await auditLogModel.create({
            employe_id: req.user?.employe_id, employe_nom: req.user?.email,
            action: "DELETE", table_name: "departements", record_id: parseInt(id),
            nouvelles_valeurs: {},
        }).catch(() => {});
        res.json({ message: "Departement supprimé", data });
    } catch (error) {
        console.error("Erreur deleteDepartement:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

module.exports = { getDepartements, getDepartementById, createDepartement, updateDepartement, deleteDepartement };
