// ================================================================
// presences.controller.js - Gere le pointage des employes
// ================================================================

const presencesModel = require("../models/presences.model");
const parametresModel = require("../models/parametres.model");
const heuresSupModel = require("../models/heuresSup.model");
const notificationsModel = require("../models/notifications.model");
const pool = require("../config/database");

// ----------------------------------------------------------------
// Calcule la distance entre deux points GPS (formule de Haversine)
// ----------------------------------------------------------------
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en mètres
}

// ----------------------------------------------------------------
// GET /api/presences - Liste toutes les presences (avec filtres)
// ----------------------------------------------------------------
// Query params optionnels : employe_id, date_debut, date_fin
// ----------------------------------------------------------------
const getAllPresences = async (req, res) => {
    try {
        // Si l'utilisateur est un employé, il ne voit que ses propres présences
        let { employe_id, date_debut, date_fin } = req.query;
        if (req.user?.role === "Employé") {
            employe_id = req.user.employe_id;
        }
        // Filtrer par entreprise (sauf SuperAdmin)
        const entreprise_id = req.user?.entreprise_id;
        const presences = await presencesModel.getAll({ employe_id, date_debut, date_fin, entreprise_id });
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
// 3. Le statut "Retard" est determine selon heure_ouverture + retard_apres
// 4. L'employe peut arriver a tout moment (meme avant l'ouverture)
// 5. On enregistre dans la base
// ----------------------------------------------------------------
const checkIn = async (req, res) => {
    try {
        const { employe_id, heure_entree: frontHeure, latitude: gpsLat, longitude: gpsLng } = req.body;

        if (!employe_id) {
            return res.status(400).json({ message: "employe_id obligatoire", data: null });
        }

        // ============================================================
        // 1. RÉCUPÉRER L'EMPLOYÉ (entreprise_id + site_id)
        // ============================================================
        const empRes = await pool.query(`
            SELECT e.entreprise_id, e.site_id FROM employes e WHERE e.id = $1
        `, [employe_id]);
        const emp = empRes.rows[0];
        if (!emp) {
            return res.status(404).json({ message: "Employé introuvable", data: null });
        }
        const entrepriseId = emp.entreprise_id;

        // ============================================================
        // 2. VÉRIFICATION : Jour ouvrable
        // ============================================================
        if (!(await parametresModel.isWorkingDay(entrepriseId))) {
            const paramsData = await parametresModel.get(entrepriseId);
            const joursConfig = paramsData?.jours_ouvrables 
                ? paramsData.jours_ouvrables.map(j => j.charAt(0).toUpperCase() + j.slice(1)).join(', ')
                : 'Lundi à Vendredi';
            return res.status(400).json({
                message: `Aujourd'hui n'est pas un jour ouvrable. Jours travaillés : ${joursConfig}`,
                data: null
            });
        }

        // ============================================================
        // 3. VÉRIFICATION : Un seul pointage par jour
        // ============================================================
        const todayPresence = await presencesModel.getTodayPresence(employe_id);
        if (todayPresence) {
            if (!todayPresence.heure_sortie) {
                return res.status(400).json({
                    message: "Vous avez déjà pointé votre arrivée aujourd'hui.",
                    data: null
                });
            } else {
                return res.status(400).json({
                    message: "Vous avez déjà pointé aujourd'hui.",
                    data: null
                });
            }
        }

        // ============================================================
        // 4. DÉTERMINER L'HEURE D'ARRIVÉE
        // ============================================================
        let heure_entree;
        if (frontHeure) {
            heure_entree = frontHeure;
        } else {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, "0");
            const m = String(now.getMinutes()).padStart(2, "0");
            heure_entree = h + ":" + m;
        }

        // ============================================================
        // 5. RÉCUPÉRER LES PARAMÈTRES DE L'ENTREPRISE
        // ============================================================
        const params = await parametresModel.get(entrepriseId);
        const heureOuverture = params?.heure_ouverture || "07:00";
        const heureFermeture = params?.heure_fermeture || "19:00";

        // ============================================================
        // 6. VALIDATION : Heure de fermeture
        // ============================================================
        if (heure_entree > heureFermeture) {
            return res.status(400).json({
                message: `L'entreprise ferme à ${heureFermeture}. Vous ne pouvez plus pointer.`,
                data: null
            });
        }

        // ============================================================
        // 7. Auto-fermeture des présences des jours précédents oubliées
        // ============================================================
        const closedPresences = await presencesModel.autoCloseStalePresences(employe_id);

        // ============================================================
        // 8. VÉRIFICATION GPS (géolocalisation) — BLOQUANTE
        // ============================================================
        if (emp.site_id) {
            const siteRes = await pool.query(`
                SELECT latitude, longitude, rayon_gps FROM sites WHERE id = $1
            `, [emp.site_id]);
            const site = siteRes.rows[0];
            if (site && site.latitude && site.longitude) {
                if (!gpsLat || !gpsLng) {
                    return res.status(400).json({
                        message: "Votre position GPS est requise pour pointer. Activez la localisation.",
                        data: null
                    });
                }
                const distance = haversineDistance(
                    parseFloat(gpsLat), parseFloat(gpsLng),
                    parseFloat(site.latitude), parseFloat(site.longitude)
                );
                const rayon = site.rayon_gps || 100;
                if (distance > rayon) {
                    return res.status(400).json({
                        message: `Vous êtes à ${Math.round(distance)}m du site. Vous devez être à moins de ${rayon}m pour pointer.`,
                        data: null
                    });
                }
            }
        }

        // ============================================================
        // 9. DÉTERMINER LE STATUT (Présent ou Retard)
        // ============================================================
        // Statut "Retard" si heure_arrivée > heure_ouverture + retard_apres.
        // Exemple : ouverture 09:00, retard_apres=15 → Retard si > 09:15
        // Si retard_apres = 0 ou NULL → tous les pointages sont "Present"
        // (configurable par le RH dans la page Configuration).
        // ============================================================
        const retardApres = params?.retard_apres;

        let statut;
        if (!retardApres || retardApres <= 0) {
            statut = "Present";
        } else {
            // Heure limite = ouverture + retard_apres minutes
            const [h, m] = heureOuverture.split(":").map(Number);
            const totalMinutes = h * 60 + m + retardApres;
            const heureLimite = String(Math.floor(totalMinutes / 60)).padStart(2, "0")
                + ":" + String(totalMinutes % 60).padStart(2, "0");
            statut = heure_entree > heureLimite ? "Retard" : "Present";
        }

        // ============================================================
        // 10. ENREGISTRER LA PRÉSENCE avec GPS si fourni
        // ============================================================
        const newPresence = await presencesModel.checkIn({
            employe_id, heure_entree, statut,
        });

        // Créer une notification pour l'employé
        try {
            const notifTitre = statut === "Retard" ? "Arrivée en retard ⏰" : "Arrivée enregistrée ✅";
            const notifMessage = statut === "Retard"
                ? `Vous êtes arrivé à ${heure_entree} (en retard).`
                : `Vous êtes arrivé à ${heure_entree}. Bonne journée !`;
            await notificationsModel.create({
                employe_id,
                titre: notifTitre,
                message: notifMessage,
                type: statut === "Retard" ? "warning" : "success",
                lien: "/(tabs)/presences",
            });
        } catch (notifError) {
            console.error("Erreur création notification check-in:", notifError);
        }

        const message = closedPresences.length > 0
            ? `Arrivée enregistrée (${closedPresences.length} présence(s) précédente(s) fermée(s) automatiquement)`
            : "Arrivée enregistrée";

        res.status(201).json({
            message,
            data: newPresence,
            autoClosed: closedPresences,
        });
    } catch (error) {
        // Vérifie si c'est une violation de contrainte UNIQUE (double pointage)
        if (error.code === '23505') {
            return res.status(400).json({
                message: "Vous avez déjà pointé aujourd'hui. Un seul pointage par jour est autorisé.",
                data: null
            });
        }
        console.error("Erreur checkIn:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/presences/checkout - Enregistrer un depart
// ----------------------------------------------------------------
// VALIDATIONS :
// 1. L'heure de depart doit etre apres l'heure d'arrivee
// 2. L'employe ne peut pas partir avant l'heure de fermeture
//    (sauf tolerance definie dans parametres.depart_anticipe)
// 3. On verifie aussi que le depart n'est pas apres la fermeture + 2h
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
        // 2. RÉCUPÉRER LES PARAMÈTRES (horaires de l'entreprise)
        // ============================================================
        // Récupérer l'entreprise de l'employé via la présence
        const empCheckoutRes = await pool.query(`
            SELECT e.entreprise_id FROM employes e
            JOIN presences p ON p.employe_id = e.id
            WHERE p.id = $1
        `, [presenceId]);
        const entrepriseCheckoutId = empCheckoutRes.rows[0]?.entreprise_id;
        const params = await parametresModel.get(entrepriseCheckoutId);
        const heureFermeture = params?.heure_fermeture || "17:00";
        const departAnticipe = params?.depart_anticipe || 0;

        // ============================================================
        // 3. DÉTERMINER L'HEURE DE DÉPART
        // ============================================================
        let heure_sortie;
        if (frontHeure) {
            heure_sortie = frontHeure;
        } else {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, "0");
            const m = String(now.getMinutes()).padStart(2, "0");
            heure_sortie = h + ":" + m;
        }

        // ============================================================
        // 4. VALIDATION : L'heure de départ doit être après l'arrivée
        // ============================================================
        if (presenceActuelle.heure_entree && heure_sortie <= presenceActuelle.heure_entree) {
            return res.status(400).json({
                message: "L'heure de départ doit être après l'heure d'arrivée.",
                data: null
            });
        }

        // ============================================================
        // 4b. VALIDATION : Temps de travail minimum (3h = 180 min)
        // ============================================================
        if (presenceActuelle.heure_entree) {
            const [ah, am] = presenceActuelle.heure_entree.split(":").map(Number);
            const [dh, dm] = heure_sortie.split(":").map(Number);
            const minutesWorked = (dh * 60 + dm) - (ah * 60 + am);
            if (minutesWorked < 180) {
                return res.status(400).json({
                    message: "Le temps de travail minimum est de 3h. Vous ne pouvez pas partir si tôt. Contactez les RH si besoin.",
                    data: null
                });
            }
        }

        // ============================================================
        // 5. VALIDATION : Départ anticipé
        // ============================================================
        // Calcule l'heure minimale de départ autorisée
        // Exemple : fermeture à 17:00, tolérance 15min → départ autorisé à partir de 16:45
        const [fh, fm] = heureFermeture.split(":").map(Number);
        let fermetureMinutes = fh * 60 + fm;         // Heure de fermeture en minutes
        let minimumMinutes = fermetureMinutes - departAnticipe; // Heure min de départ
        
        const [sh, sm] = heure_sortie.split(":").map(Number);
        const sortieMinutes = sh * 60 + sm;

        if (sortieMinutes < minimumMinutes) {
            const heureMin = String(Math.floor(minimumMinutes / 60)).padStart(2, "0") 
                + ":" + String(minimumMinutes % 60).padStart(2, "0");
            
            return res.status(400).json({
                message: `Vous ne pouvez pas partir avant ${heureMin}. `
                    + `L'entreprise ferme à ${heureFermeture}.`,
                data: null
            });
        }

        // ============================================================
        // 6. VALIDATION : Départ trop tard (après fermeture + 2h max)
        // ============================================================
        const maxMinutes = fermetureMinutes + 120; // 2h après fermeture
        if (sortieMinutes > maxMinutes) {
            return res.status(400).json({
                message: `L'heure de départ semble incorrecte. `
                    + `L'entreprise ferme à ${heureFermeture}.`,
                data: null
            });
        }

        // ============================================================
        // 7. ENREGISTRER LE DÉPART
        // ============================================================
        const presence = await presencesModel.checkOut(presenceId, heure_sortie);

        if (!presence) {
            return res.status(404).json({ message: "Presence non trouvee ou deja partie", data: null });
        }

        // ============================================================
        // 7b. CALCUL DES HEURES SUPPLÉMENTAIRES
        // ============================================================
        // Temps travaillé = (départ - arrivée) en minutes
        // Temps normal = (fermeture - ouverture - pause) en minutes
        // Heures sup = max(0, temps_travaillé - temps_normal)
        // ============================================================
        try {
            if (presenceActuelle.heure_entree) {
                const [ah, am] = presenceActuelle.heure_entree.split(":").map(Number);
                const [dh, dm] = heure_sortie.split(":").map(Number);
                const [oh, om] = heureFermeture.split(":").map(Number);
                const dureePause = params?.duree_pause || 0;

                const tempsTravaille = (dh * 60 + dm) - (ah * 60 + am); // minutes totales à l'entreprise
                const tempsNormal = (oh * 60 + om) - dureePause; // minutes normales de travail

                // Heures sup = temps passé - temps normal
                if (tempsTravaille > tempsNormal && tempsNormal > 0) {
                    const minutesSup = tempsTravaille - tempsNormal;
                    const heuresSup = parseFloat((minutesSup / 60).toFixed(2));

                    // Créer une entrée heures_sup automatiquement (si > 0)
                    if (heuresSup > 0) {
                        await heuresSupModel.create({
                            employe_id: presenceActuelle.employe_id,
                            date_heure_sup: new Date().toISOString().split('T')[0],
                            nb_heures: heuresSup,
                            taux_majoration: 1.5,
                            motif: `Auto - Départ à ${heure_sortie}`,
                        });
                    }
                }
            }
        } catch (hsError) {
            console.error("⚠️ Erreur calcul heures sup (non bloquante):", hsError.message);
        }

        // ============================================================
        // 7c. CORRECTION DU STATUT : Si l'employé était "Retard" mais
        //     a travaillé au moins 6h (360 min), on passe à "Present".
        // ============================================================
        try {
            if (presenceActuelle.heure_entree) {
                const [ah, am] = presenceActuelle.heure_entree.split(":").map(Number);
                const [dh, dm] = heure_sortie.split(":").map(Number);
                const minutesWorked = (dh * 60 + dm) - (ah * 60 + am);
                if (minutesWorked >= 360 && presence.statut === "Retard") {
                    const presenceCorrigee = await presencesModel.updateStatut(presenceId, "Present");
                    if (presenceCorrigee) presence.statut = "Present";
                }
            }
        } catch (correctionError) {
            console.error("⚠️ Erreur correction statut (non bloquante):", correctionError.message);
        }

        // Créer une notification pour l'employé
        try {
            await notificationsModel.create({
                employe_id: presenceActuelle.employe_id,
                titre: "Départ enregistré 👋",
                message: `Vous avez quitté à ${heure_sortie}. Bonne fin de journée !`,
                type: "info",
                lien: "/(tabs)/presences",
            });
        } catch (notifError) {
            console.error("Erreur création notification check-out:", notifError);
        }

        res.json({ message: "Départ enregistré. Bonne fin de journée !", data: presence });
    } catch (error) {
        console.error("❌ Erreur checkOut:", error);
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
        // Si l'utilisateur est un employé, il ne voit que sa propre présence active
        let { employe_id } = req.query;
        if (req.user?.role === "Employé") {
            employe_id = req.user.employe_id;
        } else if (!employe_id && req.user?.employe_id) {
            employe_id = req.user.employe_id;
        }
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
        const stats = await presencesModel.getTodayStats(req.user?.entreprise_id);
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

