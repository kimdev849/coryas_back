// ================================================================
// presences.controller.js - Gere le pointage des employes
// ================================================================

const presencesModel = require("../models/presences.model");
const parametresModel = require("../models/parametres.model");

// ----------------------------------------------------------------
// GET /api/presences - Liste toutes les presences (avec filtres)
// ----------------------------------------------------------------
// Query params optionnels : employe_id, date_debut, date_fin
// ----------------------------------------------------------------
const getAllPresences = async (req, res) => {
    try {
        const { employe_id, date_debut, date_fin } = req.query;
        const presences = await presencesModel.getAll({ employe_id, date_debut, date_fin });
        res.json({ message: "Liste des presences", data: presences });
    } catch (error) {
        console.error("Erreur getAllPresences:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/presences/checkin - Enregistrer une arrivee
// ----------------------------------------------------------------
// 1. On recupere l'ID de l'employe qui veut pointer
// 2. On prend la date et l'heure actuelle (ou celle envoyee par le front)
// 3. Si l'employe arrive apres 09:00, le statut est "Retard"
// 4. On enregistre dans la base
// ----------------------------------------------------------------
const checkIn = async (req, res) => {
    try {
        const { employe_id, heure_entree: frontHeure } = req.body;

        if (!employe_id) {
            return res.status(400).json({ message: "employe_id obligatoire", data: null });
        }

        // ============================================================
        // 1. VÉRIFICATION : Un seul pointage par jour
        // ============================================================
        const todayPresence = await presencesModel.getTodayPresence(employe_id);
        if (todayPresence) {
            if (!todayPresence.heure_sortie) {
                // L'employé est déjà arrivé mais n'est pas encore parti
                return res.status(400).json({
                    message: "Vous avez déjà pointé votre arrivée aujourd'hui. Un seul pointage par jour.",
                    data: null
                });
            } else {
                // L'employé a déjà fait sa journée complète
                return res.status(400).json({
                    message: "Vous avez déjà pointé aujourd'hui. Un seul pointage par jour est autorisé.",
                    data: null
                });
            }
        }

        // ============================================================
        // 2. RÉCUPÉRER LES PARAMÈTRES DE L'ENTREPRISE
        // ============================================================
        const params = await parametresModel.get();

        // ============================================================
        // 3. DÉTERMINER L'HEURE D'ARRIVÉE
        // ============================================================
        let heure_entree;
        if (frontHeure) {
            heure_entree = frontHeure;
        } else {
            const now = new Date();
            const paris = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
            const h = String(paris.getHours()).padStart(2, "0");
            const m = String(paris.getMinutes()).padStart(2, "0");
            heure_entree = h + ":" + m;
        }

        // ============================================================
        // 4. VALIDATION : Horaires de l'entreprise
        // ============================================================
        const heureOuverture = params?.heure_ouverture || "07:00";
        const heureFermeture = params?.heure_fermeture || "19:00";

        if (heure_entree < heureOuverture) {
            return res.status(400).json({
                message: `L'entreprise ouvre à ${heureOuverture}. Vous ne pouvez pas pointer avant.`,
                data: null
            });
        }

        if (heure_entree > heureFermeture) {
            return res.status(400).json({
                message: `L'entreprise ferme à ${heureFermeture}. Vous ne pouvez plus pointer.`,
                data: null
            });
        }

        // ============================================================
        // 5. Auto-fermeture des présences des jours précédents oubliées
        // ============================================================
        const closedPresences = await presencesModel.autoCloseStalePresences(employe_id);

        // ============================================================
        // 6. DÉTERMINER LE STATUT (Présent ou Retard)
        // ============================================================
        // Si l'heure d'arrivée dépasse l'heure d'ouverture + la marge de retard
        const retardApres = params?.retard_apres || 0;
        let heureLimite = heureOuverture;
        if (retardApres > 0) {
            const [h, m] = heureLimite.split(":").map(Number);
            const totalMinutes = h * 60 + m + retardApres;
            heureLimite = String(Math.floor(totalMinutes / 60)).padStart(2, "0") + ":" + String(totalMinutes % 60).padStart(2, "0");
        }
        const statut = heure_entree > heureLimite ? "Retard" : "Present";

        // ============================================================
        // 7. ENREGISTRER LA PRÉSENCE
        // ============================================================
        const date = new Date().toISOString().split('T')[0];
        const newPresence = await presencesModel.checkIn({
            employe_id, date_presence: date, heure_entree, statut,
        });

        const message = closedPresences.length > 0
            ? `Arrivee enregistree (${closedPresences.length} presence(s) precedente(s) fermee(s) automatiquement)`
            : "Arrivee enregistree";

        res.status(201).json({
            message,
            data: newPresence,
            autoClosed: closedPresences,
        });
    } catch (error) {
        console.error("Erreur checkIn:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/presences/checkout - Enregistrer un depart
// ----------------------------------------------------------------
// 1. On recupere l'ID de la presence (pas l'employe)
// 2. On prend l'heure actuelle comme heure de sortie
// 3. On met a jour la presence dans la base
// ----------------------------------------------------------------
const checkOut = async (req, res) => {
    try {
        const { presenceId, heure_sortie: frontHeure } = req.body;

        if (!presenceId) {
            return res.status(400).json({ message: "ID de presence obligatoire", data: null });
        }

        // ============================================================
        // 1. RÉCUPÉRER LA PRÉSENCE POUR VALIDER
        // ============================================================
        const presenceActuelle = await presencesModel.getById(presenceId);
        if (!presenceActuelle) {
            return res.status(404).json({ message: "Presence non trouvee", data: null });
        }

        // ============================================================
        // 2. DÉTERMINER L'HEURE DE DÉPART
        // ============================================================
        let heure_sortie;
        if (frontHeure) {
            heure_sortie = frontHeure;
        } else {
            const now = new Date();
            const paris = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
            const h = String(paris.getHours()).padStart(2, "0");
            const m = String(paris.getMinutes()).padStart(2, "0");
            heure_sortie = h + ":" + m;
        }

        // ============================================================
        // 3. VALIDATION : L'heure de départ doit être après l'arrivée
        // ============================================================
        if (presenceActuelle.heure_entree && heure_sortie <= presenceActuelle.heure_entree) {
            return res.status(400).json({
                message: "L'heure de départ doit être après l'heure d'arrivée.",
                data: null
            });
        }

        // ============================================================
        // 4. ENREGISTRER LE DÉPART
        // ============================================================
        const presence = await presencesModel.checkOut(presenceId, heure_sortie);

        if (!presence) {
            return res.status(404).json({ message: "Presence non trouvee ou deja partie", data: null });
        }

        res.json({ message: "Depart enregistre", data: presence });
    } catch (error) {
        console.error("Erreur checkOut:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/presences/:id - Voir une presence par son ID
// ----------------------------------------------------------------
const getPresenceById = async (req, res) => {
    try {
        const { id } = req.params;
        const presence = await presencesModel.getById(id);

        if (!presence) {
            return res.status(404).json({ message: "Presence non trouvee", data: null });
        }

        res.json({ message: "Presence trouvee", data: presence });
    } catch (error) {
        console.error("Erreur getPresenceById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/presences/active - Presence active d'un employe
// ----------------------------------------------------------------
// Sert a savoir si un employe est arrive mais pas encore parti.
// req.query.employe_id = l'ID passe dans l'URL (ex: /api/presences/active?employe_id=5)
// ----------------------------------------------------------------
const getActivePresence = async (req, res) => {
    try {
        const { employe_id } = req.query;

        if (!employe_id) {
            return res.status(400).json({ message: "employe_id requis", data: null });
        }

        // Cherche dans la base une presence aujourd'hui sans heure de sortie
        const presence = await presencesModel.getActivePresence(employe_id);

        // Si presence existe, l'employe est encore la. Sinon, il n'est pas venu ou il est parti.
        res.json({
            message: presence ? "Presence active trouvee" : "Aucune presence active",
            data: presence
        });
    } catch (error) {
        console.error("Erreur getActivePresence:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// PUT /api/presences/:id/rattrapage - Corriger un depart oublie
// ----------------------------------------------------------------
// Permet à l'admin de definir manuellement l'heure de depart
// et d'ajouter une remarque (ex: "Rattrapage - oubli de pointage")
// ----------------------------------------------------------------
const rattrapage = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérification que req.body existe (express.json() doit être configuré)
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: "Corps de requete invalide", data: null });
        }

        const { heure_sortie, remarque } = req.body;

        if (!heure_sortie) {
            return res.status(400).json({ message: "L'heure de départ est obligatoire", data: null });
        }

        // Validation du format HH:MM
        if (!/^\d{2}:\d{2}$/.test(heure_sortie)) {
            return res.status(400).json({ message: "Format d'heure invalide. Utilisez HH:MM", data: null });
        }

        // Validation : l'heure doit être entre 00:00 et 23:59
        const [h, m] = heure_sortie.split(':').map(Number);
        if (h > 23 || m > 59) {
            return res.status(400).json({ message: "Heure invalide (00:00 - 23:59)", data: null });
        }

        const presence = await presencesModel.rattrapage(id, { heure_sortie, remarque });

        if (!presence) {
            return res.status(404).json({ message: "Presence introuvable. Verifiez l'ID.", data: null });
        }

        console.log(`✅ Rattrapage: presence #${id} → heure_sortie = ${heure_sortie}`);

        res.json({ message: "Rattrapage enregistre avec succes", data: presence });
    } catch (error) {
        console.error("❌ Erreur rattrapage:", error);
        res.status(500).json({ message: "Erreur serveur lors du rattrapage", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// GET /api/presences/stats/aujourdhui - Stats du jour
// ----------------------------------------------------------------
const getTodayStats = async (req, res) => {
    try {
        const stats = await presencesModel.getTodayStats();
        res.json({ message: "Stats du jour", data: stats });
    } catch (error) {
        console.error("Erreur getTodayStats:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = {
    getAllPresences, checkIn, checkOut,
    getPresenceById, getActivePresence,
    rattrapage, getTodayStats,
};

