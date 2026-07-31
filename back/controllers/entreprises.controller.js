// ================================================================
// entreprises.controller.js - Gestion SaaS des entreprises clients
// ================================================================

const entreprisesModel = require("../models/entreprises.model");
const pool = require("../config/database");
const bcrypt = require("bcrypt");

const getAll = async (req, res) => {
    try {
        const data = await entreprisesModel.getAll();
        res.json({ message: "Liste des entreprises", data });
    } catch (error) {
        console.error("❌ getAllEntreprises:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getById = async (req, res) => {
    try {
        const data = await entreprisesModel.getById(req.params.id);
        if (!data) return res.status(404).json({ message: "Entreprise introuvable", data: null });
        res.json({ message: "Entreprise trouvée", data });
    } catch (error) {
        console.error("❌ getEntrepriseById:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const create = async (req, res) => {
    const client = await pool.connect();
    try {
        const { nom, email, telephone, ville, pays, secteur, plan_id, nb_employes_max, notes, slug } = req.body;
        
        // Générer le slug
        const generatedSlug = slug || (nom
            ? nom.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                + '-' + Date.now()
            : 'entreprise-' + Date.now());

        const defaultPassword = "admin123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await client.query("BEGIN");

        // 1. Créer l'entreprise
        const entrepriseRes = await client.query(`
            INSERT INTO entreprises (nom, slug, email, telephone, ville, pays, secteur, plan_id, nb_employes_max, notes, actif)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
            RETURNING *
        `, [nom, generatedSlug, email, telephone || null, ville || null, pays || 'Congo', secteur || null,
            plan_id || null, nb_employes_max || 10, notes || null]);
        
        const entreprise = entrepriseRes.rows[0];
        const entrepriseId = entreprise.id;

        // 2. Créer le matricule admin
        const adminMatricule = "ADM-" + String(entrepriseId).padStart(3, '0');

        // 3. Créer l'employé admin
        const employeRes = await client.query(`
            INSERT INTO employes (matricule, nom, prenom, telephone, statut, entreprise_id, date_embauche)
            VALUES ($1, $2, $3, $4, 'Actif', $5, CURRENT_DATE)
            RETURNING *
        `, [adminMatricule, nom || 'Admin', 'Admin', telephone || null, entrepriseId]);
        
        const adminEmploye = employeRes.rows[0];

        // 4. Créer l'utilisateur admin (rôle Administrateur = 1)
        await client.query(`
            INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif, entreprise_id)
            VALUES ($1, 1, $2, $3, true, $4)
        `, [adminEmploye.id, email, hashedPassword, entrepriseId]);

        // 5. Créer les paramètres par défaut pour l'entreprise
        await client.query(`
            INSERT INTO parametres (nom_entreprise, email_entreprise, telephone, entreprise_id)
            VALUES ($1, $2, $3, $4)
        `, [nom, email, telephone || null, entrepriseId]);

        await client.query("COMMIT");

        console.log(`✅ Entreprise créée : ${nom} (ID: ${entrepriseId}) — Admin: ${email} / ${defaultPassword}`);

        res.status(201).json({
            message: "Entreprise créée avec succès",
            data: {
                ...entreprise,
                admin: {
                    email: email,
                    password: defaultPassword,
                    matricule: adminMatricule,
                    nom: adminEmploye.prenom + ' ' + adminEmploye.nom,
                }
            }
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        if (error.code === '23505') {
            const detail = error.detail || "";
            if (detail.includes("slug")) {
                return res.status(400).json({ message: "Ce slug est déjà utilisé", data: null });
            }
            if (detail.includes("email")) {
                return res.status(400).json({ message: "Cet email est déjà utilisé par une autre entreprise", data: null });
            }
            return res.status(400).json({ message: "Cet email est déjà utilisé", data: null });
        }
        console.error("❌ createEntreprise:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    } finally {
        client.release();
    }
};

// ----------------------------------------------------------------
// DELETE /api/entreprises/:id - Supprimer définitivement une entreprise
// ----------------------------------------------------------------
// Supprime TOUTES les données liées (employés, utilisateurs, présences,
// congés, sites, équipes, départements, paramètres, abonnements...)
// ----------------------------------------------------------------
const remove = async (req, res) => {
    try {
        const entreprise = await entreprisesModel.getById(req.params.id);
        if (!entreprise) {
            return res.status(404).json({ message: "Entreprise introuvable", data: null });
        }

        const deleted = await entreprisesModel.remove(req.params.id);
        console.log(`🗑️ Entreprise supprimée définitivement : ${deleted?.nom} (ID: ${req.params.id})`);

        res.json({ message: `Entreprise "${deleted?.nom || req.params.id}" et toutes ses données ont été supprimées définitivement.`, data: deleted });
    } catch (error) {
        console.error("❌ deleteEntreprise:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const update = async (req, res) => {
    try {
        const data = await entreprisesModel.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Entreprise introuvable", data: null });

        // Si le statut actif change, on active/désactive aussi tous les utilisateurs
        if (req.body.actif !== undefined) {
            const newActif = req.body.actif === true || req.body.actif === "true";
            await pool.query(`
                UPDATE utilisateurs SET
                    actif = $1,
                    updated_at = NOW()
                WHERE entreprise_id = $2
            `, [newActif, req.params.id]);
            console.log(`🔐 Utilisateurs de l'entreprise ${req.params.id} ${newActif ? 'activés' : 'désactivés'}`);
        }

        res.json({ message: "Entreprise mise à jour", data });
    } catch (error) {
        console.error("❌ updateEntreprise:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const getStats = async (req, res) => {
    try {
        const data = await entreprisesModel.getStats();
        res.json({ message: "Statistiques Présencia", data });
    } catch (error) {
        console.error("❌ getStats:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// Demandes d'inscription (formulaire public)
const getDemandes = async (req, res) => {
    try {
        const data = await entreprisesModel.getDemandesInscription();
        res.json({ message: "Demandes d'inscription", data });
    } catch (error) {
        console.error("❌ getDemandes:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

const creerDemande = async (req, res) => {
    try {
        const data = await entreprisesModel.createDemandeInscription(req.body);
        res.status(201).json({ message: "Demande d'inscription envoyée ! Nous vous contacterons sous 24h.", data });
    } catch (error) {
        console.error("❌ creerDemande:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// PUT /api/entreprises/demande/:id/accepter - Accepter une demande
// ----------------------------------------------------------------
// Convertit une demande d'inscription en véritable entreprise
// avec admin, paramètres par défaut, etc.
// ----------------------------------------------------------------
const accepterDemande = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { plan_id, nb_employes_max } = req.body;

        // Récupérer la demande
        const demandeRes = await client.query(`
            SELECT * FROM demandes_inscription WHERE id = $1
        `, [id]);
        const demande = demandeRes.rows[0];
        if (!demande) {
            return res.status(404).json({ message: "Demande introuvable", data: null });
        }

        const defaultPassword = "admin123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const slug = (demande.nom_entreprise || 'entreprise')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '-' + Date.now();

        await client.query("BEGIN");

        // 1. Créer l'entreprise
        const entRes = await client.query(`
            INSERT INTO entreprises (nom, slug, email, telephone, ville, pays, plan_id, nb_employes_max, notes, actif)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
            RETURNING *
        `, [
            demande.nom_entreprise, slug, demande.email, demande.telephone,
            demande.ville || null, demande.pays || 'Congo',
            plan_id || null, nb_employes_max || 50,
            demande.message || null
        ]);
        const entreprise = entRes.rows[0];
        const entrepriseId = entreprise.id;

        // 2. Créer l'employé admin
        const adminMatricule = "ADM-" + String(entrepriseId).padStart(3, '0');
        const empRes = await client.query(`
            INSERT INTO employes (matricule, nom, prenom, telephone, statut, entreprise_id, date_embauche)
            VALUES ($1, $2, $3, $4, 'Actif', $5, CURRENT_DATE)
            RETURNING *
        `, [adminMatricule, demande.nom_entreprise || 'Admin', 'Admin', demande.telephone || null, entrepriseId]);
        const adminEmploye = empRes.rows[0];

        // 3. Créer l'utilisateur admin (Administrateur = role_id 1)
        await client.query(`
            INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif, entreprise_id)
            VALUES ($1, 1, $2, $3, true, $4)
        `, [adminEmploye.id, demande.email, hashedPassword, entrepriseId]);

        // 4. Créer les paramètres par défaut
        await client.query(`
            INSERT INTO parametres (nom_entreprise, email_entreprise, telephone, entreprise_id)
            VALUES ($1, $2, $3, $4)
        `, [demande.nom_entreprise, demande.email, demande.telephone || null, entrepriseId]);

        // 5. Marquer la demande comme acceptée
        await client.query(`
            UPDATE demandes_inscription SET statut = 'Acceptee' WHERE id = $1
        `, [id]);

        await client.query("COMMIT");

        console.log(`✅ Demande #${id} acceptée → Entreprise créée : ${demande.nom_entreprise} (ID: ${entrepriseId})`);

        res.json({
            message: `Demande acceptée. Entreprise "${demande.nom_entreprise}" créée !`,
            data: {
                entreprise,
                admin: {
                    email: demande.email,
                    password: defaultPassword,
                    matricule: adminMatricule,
                }
            }
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("❌ accepterDemande:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    } finally {
        client.release();
    }
};

// ----------------------------------------------------------------
// DELETE /api/entreprises/demande/:id/refuser - Refuser une demande
// ----------------------------------------------------------------
const refuserDemande = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            UPDATE demandes_inscription SET statut = 'Refusee' WHERE id = $1 RETURNING *
        `, [id]);
        if (!result.rows[0]) {
            return res.status(404).json({ message: "Demande introuvable", data: null });
        }
        res.json({ message: "Demande refusée", data: result.rows[0] });
    } catch (error) {
        console.error("❌ refuserDemande:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

module.exports = { getAll, getById, create, update, remove, getStats, getDemandes, creerDemande, accepterDemande, refuserDemande };
