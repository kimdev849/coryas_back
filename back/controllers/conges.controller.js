// ================================================================
// conges.controller.js - Gere les demandes de conges
// ================================================================
// Ce fichier contient 6 fonctions :
// getAllConges      -> lister toutes les demandes
// creerDemande      -> creer une demande de conge
// getCongeById      -> voir une demande
// appouverConge     -> approuver (admin/RH seulement)
// rejeterConge      -> rejeter (admin/RH seulement)
// supprimerDemande  -> supprimer (admin/RH seulement)
// ================================================================

// congesModel contient les fonctions qui font les requetes SQL
const congesModel = require("../models/conges.model");
const notificationsModel = require("../models/notifications.model");

// ----------------------------------------------------------------
// GET /api/conges - Liste toutes les demandes de conges
// ----------------------------------------------------------------
const getAllConges = async (req, res) => {
    try {
        const { employe_id } = req.query;
        const conges = await congesModel.getAll({ employe_id });
        res.json({ message: "Liste des demandes de conges", data: conges });
    } catch (error) {
        console.error("Erreur getAllConges:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/conges - Creer une demande de conge
// ----------------------------------------------------------------
// 1. Recupere les donnees du formulaire
// 2. Accepte camelCase (dateDebut) OU snake_case (date_debut)
// 3. Verifie que tous les champs sont presents
// 4. Enregistre dans la base avec le statut "En attente"
// ----------------------------------------------------------------
const creerDemande = async (req, res) => {
    try {
        // On recupere les champs en camelCase ET snake_case
        // pour que le frontend puisse envoyer l'un ou l'autre
        const { employe_id, date_debut, date_fin, motif, commentaire, dateDebut, dateFin, raison, type_conge_id } = req.body;

        // Si employe_id est dans le body, on l'utilise. Sinon, on prend celui du token JWT.
        const finalEmployeId = employe_id || req.user?.employe_id;
        const finalDateDebut = date_debut || dateDebut;
        const finalDateFin = date_fin || dateFin;
        const finalMotif = motif || raison;

        if (!finalEmployeId || !finalDateDebut || !finalDateFin || !finalMotif) {
            return res.status(400).json({
                message: "Champs obligatoires : employe_id, date_debut, date_fin, motif", data: null
            });
        }

        // On enregistre la demande dans la base (statut initial = "En attente")
        const nouveauConge = await congesModel.create({
            employe_id: finalEmployeId, date_debut: finalDateDebut,
            date_fin: finalDateFin, motif: finalMotif,
            commentaire, type_conge_id: type_conge_id || undefined,
        });

        res.status(201).json({ message: "Demande de conge creee", data: nouveauConge });
    } catch (error) {
        console.error("Erreur creerDemande:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/conges/:id - Voir une demande par son ID
// ----------------------------------------------------------------
const getCongeById = async (req, res) => {
    try {
        const { id } = req.params;
        const conge = await congesModel.getById(id);

        if (!conge) {
            return res.status(404).json({ message: "Demande non trouvee", data: null });
        }

        res.json({ message: "Demande trouvee", data: conge });
    } catch (error) {
        console.error("Erreur getCongeById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// PUT /api/conges/:id/approve - Approuver une demande
// ----------------------------------------------------------------
// Seuls les administrateurs et RH peuvent approuver.
// La verification du role se fait dans le middleware auth.
// ----------------------------------------------------------------
const appouverConge = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentaire } = req.body;

        // approve() change le statut de "En attente" a "Approuve"
        const conge = await congesModel.approve(id, commentaire);

        if (!conge) {
            // Peut etre introuvable, ou deja traitee
            return res.status(404).json({ message: "Demande introuvable ou deja traitee", data: null });
        }

        // Créer une notification pour l'employé
        try {
            await notificationsModel.create({
                employe_id: conge.employe_id,
                titre: "Congé approuvé ✅",
                message: `Votre demande de congé du ${conge.date_debut} au ${conge.date_fin} a été approuvée.`,
                type: "success",
                lien: "/(tabs)/conges",
            });
        } catch (notifError) {
            console.error("Erreur création notification:", notifError);
        }

        res.json({ message: "Demande approuvee", data: conge });
    } catch (error) {
        console.error("Erreur appouverConge:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// PUT /api/conges/:id/reject - Rejeter une demande
// ----------------------------------------------------------------
// Le commentaire du RH est optionnel.
// ----------------------------------------------------------------
const rejeterConge = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentaire } = req.body;

        // reject() change le statut de "En attente" a "Rejete"
        const conge = await congesModel.reject(id, commentaire);

        if (!conge) {
            return res.status(404).json({ message: "Demande introuvable ou deja traitee", data: null });
        }

        // Créer une notification pour l'employé
        try {
            const notifMessage = commentaire
                ? `Votre demande de congé du ${conge.date_debut} au ${conge.date_fin} a été refusée. Motif : ${commentaire}`
                : `Votre demande de congé du ${conge.date_debut} au ${conge.date_fin} a été refusée.`;
            await notificationsModel.create({
                employe_id: conge.employe_id,
                titre: "Congé refusé ❌",
                message: notifMessage,
                type: "warning",
                lien: "/(tabs)/conges",
            });
        } catch (notifError) {
            console.error("Erreur création notification:", notifError);
        }

        res.json({ message: "Demande rejetee", data: conge });
    } catch (error) {
        console.error("Erreur rejeterConge:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// DELETE /api/conges/:id - Supprimer une demande
// ----------------------------------------------------------------
// Seulement si le statut est encore "En attente".
// ----------------------------------------------------------------
const supprimerDemande = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await congesModel.remove(id);

        if (!deleted) {
            return res.status(404).json({ message: "Demande introuvable ou deja traitee", data: null });
        }

        res.json({ message: "Demande supprimee", data: { id: parseInt(id) } });
    } catch (error) {
        console.error("Erreur supprimerDemande:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// On exporte les 6 fonctions pour les utiliser dans les routes
module.exports = { getAllConges, creerDemande, getCongeById, appouverConge, rejeterConge, supprimerDemande };

