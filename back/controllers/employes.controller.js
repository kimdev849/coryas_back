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
const { sendCredentials } = require("../services/email");

// ----------------------------------------------------------------
// GET /api/employes - Lister tous les employes
// ----------------------------------------------------------------
async function getEmployes(req, res) {
    try {
        const employes = await employeModel.getEmployes();
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
        const employe = await employeModel.getEmployeById(req.params.id);
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
        const employeRes = await client.query(`
            INSERT INTO employes (matricule, nom, prenom, sexe, telephone,
                                  date_naissance, date_embauche, departement_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [nouveauMatricule, nom, prenom, sexe || null, telephone || null,
            date_naissance || null, date_embauche || new Date().toISOString().split('T')[0],
            departement_id]);

        const newEmploye = employeRes.rows[0];

        // 2. Creer l'utilisateur lie
        await client.query(`
            INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif)
            VALUES ($1, $2, $3, $4, true)
        `, [newEmploye.id, role_id, email, hashedPassword]);

        await client.query("COMMIT");

        // Envoyer les identifiants par email (non bloquant)
        sendCredentials(email, {
            prenom, nom, email, password, matricule: nouveauMatricule
        }).catch(() => {});

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

        // Mettre à jour l'employé dans la transaction
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

        // Mettre à jour l'utilisateur si email/role sont fournis
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
// DELETE /api/employes/:id - Supprimer un employe
// ----------------------------------------------------------------
async function deleteEmploye(req, res) {
    const client = await require("../config/database").connect();
    try {
        const { id } = req.params;

        await client.query("BEGIN");

        // Supprimer les conges liés
        await client.query("DELETE FROM conges WHERE employe_id = $1", [id]);

        // Supprimer les presences liées
        await client.query("DELETE FROM presences WHERE employe_id = $1", [id]);

        // Supprimer l'utilisateur lié
        await client.query("DELETE FROM utilisateurs WHERE employe_id = $1", [id]);

        // Supprimer l'employé dans la transaction
        const deleteRes = await client.query(
            "DELETE FROM employes WHERE id = $1 RETURNING id", [id]
        );
        const deleted = deleteRes.rows[0];

        if (!deleted) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Employe introuvable", data: null });
        }

        await client.query("COMMIT");

        res.json({ message: "Employe supprime avec succes", data: { id: parseInt(id) } });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Erreur deleteEmploye:", error);
        // Détecter les erreurs de clé étrangère PostgreSQL
        if (error.code === '23503') {
            return res.status(400).json({
                message: "Impossible de supprimer : l'employe a des enregistrements lies dans d'autres tables",
                data: null
            });
        }
        res.status(500).json({ message: "Erreur serveur", data: null });
    } finally {
        client.release();
    }
}

module.exports = { getEmployes, getEmployeById, createEmploye, updateEmploye, deleteEmploye };
