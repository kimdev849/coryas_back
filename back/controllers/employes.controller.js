// ================================================================
// employes.controller.js - Gere les employes
// ================================================================
// Création d'un employé = double insertion :
//   1. INSERT dans la table employes
//   2. INSERT dans la table utilisateurs (email + mot de passe)
// ================================================================

const employeModel = require("../models/employes.model");
const authModel = require("../models/auth.model");
const bcrypt = require("bcrypt");

// ----------------------------------------------------------------
// GET /api/employes - Lister tous les employes
// ----------------------------------------------------------------
async function getEmployes(req, res) {
    try {
        const employes = await employeModel.getEmployes(req.user?.entreprise_id);
        res.json({ message: "Liste des employes", data: employes });
    } catch (error) {
        console.error("Erreur getEmployes:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

// ----------------------------------------------------------------
// GET /api/employes/:id - Voir un employe par son ID
// ----------------------------------------------------------------
async function getEmployeById(req, res) {
    try {
        const employe = await employeModel.getEmployeById(req.params.id, req.user?.entreprise_id);
        if (!employe) {
            return res.status(404).json({ message: "Employe introuvable", data: null });
        }
        res.json({ message: "Employe trouve", data: employe });
    } catch (error) {
        console.error("Erreur getEmployeById:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

// ----------------------------------------------------------------
// POST /api/employes - Creer un employe + son compte utilisateur
// ----------------------------------------------------------------
// req.body :
//   employe : { matricule, nom, prenom, sexe, telephone,
//               date_naissance, date_embauche, departement_id }
//   email, password, role_id  → pour la table utilisateurs
// ----------------------------------------------------------------
async function createEmploye(req, res) {
    const client = await require("../config/database").connect();
    try {
        const {
            matricule, nom, prenom, sexe, telephone,
            date_naissance, date_embauche, departement_id,
            email, password, role_id
        } = req.body;

        // Verifie les champs obligatoires
        if (!nom || !prenom || !departement_id || !email || !password || !role_id) {
            return res.status(400).json({
                message: "Champs obligatoires : nom, prenom, departement, email, mot de passe, role",
                data: null
            });
        }

        // Verifie si l'email est deja pris
        const emailExiste = await authModel.emailExists(email);
        if (emailExiste) {
            return res.status(400).json({ message: "Cet email est deja utilise", data: null });
        }

        // 🔢 GENERATION AUTO DU MATRICULE
        // On cherche le dernier matricule cree (ex: EMP005) et on incremente
        const maxMatricule = await client.query(`
            SELECT matricule FROM employes
            WHERE matricule ~ '^EMP[0-9]+$'
            ORDER BY CAST(SUBSTRING(matricule FROM 4) AS INTEGER) DESC
            LIMIT 1
        `);
        let nouveauMatricule;
        if (maxMatricule.rows.length > 0) {
            // Prend le numero maximum et ajoute 1
            const dernierNum = parseInt(maxMatricule.rows[0].matricule.replace('EMP', ''));
            nouveauMatricule = 'EMP' + String(dernierNum + 1).padStart(3, '0');
        } else {
            // Premier employé : EMP001
            nouveauMatricule = 'EMP001';
        }

        // Hash le mot de passe avant de l'enregistrer
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction : on insere l'employe puis l'utilisateur
        await client.query("BEGIN");

        // 1. Creer l'employe avec le matricule auto-genere
        const entrepriseId = req.user?.entreprise_id;
        const employeRes = await client.query(`
            INSERT INTO employes (matricule, nom, prenom, sexe, telephone,
                                  date_naissance, date_embauche, departement_id, entreprise_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [nouveauMatricule, nom, prenom, sexe || null, telephone || null,
            date_naissance || null, date_embauche || new Date().toISOString().split('T')[0],
            departement_id, entrepriseId]);

        const newEmploye = employeRes.rows[0];

        // 2. Creer l'utilisateur lie
        await client.query(`
            INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif)
            VALUES ($1, $2, $3, $4, true)
        `, [newEmploye.id, role_id, email, hashedPassword]);

        // 3. Créer les soldes de congés par défaut pour l'employé
        //    (Congé annuel: 22 jours, Congé maladie: ∞, Mariage: 5, Décès: 3, Naissance: 3)
        const anneeCourante = new Date().getFullYear();
        const typesCongeResult = await client.query(`
            SELECT id, code, jours_max FROM type_conge WHERE actif = true
        `);
        for (const type of typesCongeResult.rows) {
            const totalJours = type.jours_max || 0;
            await client.query(`
                INSERT INTO solde_conge (employe_id, type_conge_id, total_jours, jours_pris, annee)
                VALUES ($1, $2, $3, 0, $4)
                ON CONFLICT (employe_id, type_conge_id, annee) DO NOTHING
            `, [newEmploye.id, type.id, totalJours, anneeCourante]);
        }

        await client.query("COMMIT");

        // On renvoie l'employe cree AVEC ses identifiants
        res.status(201).json({
            message: `Employe cree avec succes (matricule: ${nouveauMatricule})`,
            data: {
                ...newEmploye,
                email,
                credentials: { email, password, matricule: nouveauMatricule }
            }
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Erreur createEmploye:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    } finally {
        client.release();
    }
}

// ----------------------------------------------------------------
// PUT /api/employes/:id - Modifier un employe
// ----------------------------------------------------------------
// 1. Recupere l'ID dans l'URL (req.params) et les donnees dans le body
// 2. Met a jour la table employes (COALESCE = ne change que si fourni)
// 3. Si email ou role sont fournis, met aussi a jour la table utilisateurs
// 4. Tout est dans une transaction : si une erreur arrive, on ROLLBACK
// ----------------------------------------------------------------
async function updateEmploye(req, res) {
    const client = await require("../config/database").connect();
    try {
        const { id } = req.params;
        const {
            matricule, nom, prenom, sexe, telephone,
            date_naissance, date_embauche, departement_id, statut,
            email, role_id
        } = req.body;

        await client.query("BEGIN");

        // Met à jour l'employe dans la transaction
        // COALESCE($2, matricule) = si $2 est null, garde l'ancienne valeur
        const updateRes = await client.query(`
            UPDATE employes SET
                matricule = COALESCE($2, matricule),
                nom = COALESCE($3, nom),
                prenom = COALESCE($4, prenom),
                sexe = COALESCE($5, sexe),
                telephone = COALESCE($6, telephone),
                date_naissance = COALESCE($7, date_naissance),
                date_embauche = COALESCE($8, date_embauche),
                departement_id = COALESCE($9, departement_id),
                statut = COALESCE($10, statut),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id, matricule, nom, prenom, sexe, telephone, date_naissance, date_embauche, departement_id, statut]);

        const updatedEmploye = updateRes.rows[0];

        if (!updatedEmploye) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Employe introuvable", data: null });
        }

        // Si l'admin a aussi modifie l'email ou le role, on met a jour le compte utilisateur
        if (email || role_id !== undefined) {
            await client.query(`
                UPDATE utilisateurs 
                SET email = COALESCE($2, email), 
                    role_id = COALESCE($3, role_id),
                    updated_at = NOW()
                WHERE employe_id = $1
            `, [id, email, role_id]);
        }

        await client.query("COMMIT");

        res.json({ message: "Employe modifie avec succes", data: updatedEmploye });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Erreur updateEmploye:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    } finally {
        client.release();
    }
}

// ----------------------------------------------------------------
// PUT /api/employes/:id/deactivate - Desactiver un employe
// ----------------------------------------------------------------
// Au lieu de supprimer l'employe (ce qui perd ses donnees), on le
// DESACTIVE :
//   1. employes.statut = 'Inactif'
//   2. utilisateurs.actif = false (l'employe ne peut plus se connecter)
//
// AVANTAGE : toutes les presences, conges et historique sont conserves.
// ----------------------------------------------------------------
async function deactivateEmploye(req, res) {
    const client = await require("../config/database").connect();
    try {
        const { id } = req.params;

        await client.query("BEGIN");

        // 1. Desactiver l'employe (statut = Inactif)
        const updateRes = await client.query(`
            UPDATE employes SET
                statut = 'Inactif',
                updated_at = NOW()
            WHERE id = $1
              AND statut != 'Inactif'
            RETURNING id, nom, prenom, statut
        `, [id]);

        const employe = updateRes.rows[0];

        if (!employe) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message: "Employe introuvable ou deja inactif",
                data: null
            });
        }

        // 2. Desactiver le compte utilisateur
        await client.query(`
            UPDATE utilisateurs SET
                actif = false,
                updated_at = NOW()
            WHERE employe_id = $1
        `, [id]);

        await client.query("COMMIT");

        console.log(`👤 Employe desactive: ${employe.prenom} ${employe.nom} (id=${id})`);

        res.json({
            message: `${employe.prenom} ${employe.nom} a ete desactive avec succes. Ses donnees sont conservees.`,
            data: employe
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Erreur deactivateEmploye:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    } finally {
        client.release();
    }
}

// ----------------------------------------------------------------
// GET /api/employes/:id/stats - Statistiques d'un employé
// ----------------------------------------------------------------
async function getEmployeStats(req, res) {
    try {
        const stats = await employeModel.getEmployeStats(req.params.id);
        if (!stats) {
            return res.status(404).json({ message: "Employe introuvable", data: null });
        }
        res.json({ message: "Statistiques de l'employe", data: stats });
    } catch (error) {
        console.error("Erreur getEmployeStats:", error);
        res.status(500).json({ message: "Erreur serveur", data: null });
    }
}

module.exports = { getEmployes, getEmployeById, createEmploye, updateEmploye, deactivateEmploye, getEmployeStats };
