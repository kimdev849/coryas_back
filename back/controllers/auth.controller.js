// ================================================================
// auth.controller.js - Gere la connexion et l'inscription
// ================================================================
// Ce fichier contient 3 fonctions : login, register et logout.
// login    -> verifie l'email + mot de passe, cree un token JWT
// register -> cree un nouvel utilisateur dans la base
// logout   -> repond simplement "deconnexion reussie"
// ================================================================

// jsonwebtoken (JWT) sert a creer des tokens de connexion
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// authModel contient les fonctions qui parlent a la base de donnees
const authModel = require("../models/auth.model");

// ----------------------------------------------------------------
// POST /api/auth/login - Connecter un utilisateur
// ----------------------------------------------------------------
// 1. On recupere l'email et le mot de passe envoyes par le formulaire
// 2. On cherche l'utilisateur dans la base avec findByEmail()
// 3. On verifie que le mot de passe correspond (comparaison en clair)
// 4. On cree un token JWT et on le renvoie au frontend
// ----------------------------------------------------------------
const login = async (req, res) => {
    try {
        // req.body contient les donnees envoyees par le formulaire (email + password)
        const { email, password } = req.body;

        // Si l'email ou le mot de passe sont vides, on renvoie une erreur 400
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe obligatoires", data: null });
        }

        // Va chercher l'utilisateur dans la base de donnees avec son email
        const user = await authModel.findByEmail(email);
        // Si aucun utilisateur trouve avec cet email, on renvoie une erreur 401
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect", data: null });
        }

        // Si le compte est desactive (actif = false), on refuse la connexion
        if (!user.actif) {
            return res.status(403).json({ message: "Compte desactive", data: null });
        }

        // Compare le mot de passe entré avec le hash stocké
        const passwordMatch = await bcrypt.compare(password, user.mot_de_passe);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect", data: null });
        }

        // Met a jour la date de derniere connexion dans la base
        await authModel.updateLastLogin(user.id);

        // On cree un "payload" : un objet JSON avec les infos de l'utilisateur
        // Ces infos seront encodees DANS le token JWT
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role_nom,           // ex: "Administrateur" ou "RH"
            employe_id: user.employe_id,
            nom: user.employe_nom,
            prenom: user.employe_prenom,
        };
        // jwt.sign() cree le token : on melange le payload avec la clef secrete (JWT_SECRET)
        // Le token expire automatiquement apres 24h
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        });

        // On renvoie le token et les infos utilisateur au frontend
        res.json({
            message: "Connexion reussie",
            data: {
                token: token,  // Le frontend stockera ce token dans localStorage
                user: {
                    id: user.id, email: user.email, nom: user.employe_nom,
                    prenom: user.employe_prenom, role: user.role_nom, employe_id: user.employe_id,
                },
            },
        });
    } catch (error) {
        // Si une erreur arrive (ex: base de donnees indisponible), on log et on renvoie 500
        console.error("Erreur login:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/auth/register - Creer un compte utilisateur
// ----------------------------------------------------------------
// 1. On verifie que tous les champs sont fournis
// 2. On verifie que l'email n'est pas deja utilise
// 3. On stocke le mot de passe en clair
// 4. On insere le nouvel utilisateur dans la base
// ----------------------------------------------------------------
const register = async (req, res) => {
    try {
        // On recupere les donnees envoyees par le formulaire d'inscription
        const { employe_id, role_id, email, password } = req.body;

        // Si un champ est manquant, on renvoie une erreur 400
        if (!employe_id || !role_id || !email || !password) {
            return res.status(400).json({
                message: "employe_id, role_id, email et mot de passe obligatoires", data: null
            });
        }

        // On verifie si un compte existe deja avec cet email
        const exists = await authModel.emailExists(email);
        if (exists) {
            return res.status(400).json({ message: "Cet email est deja utilise", data: null });
        }

        // Hash le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // On cree l'utilisateur dans la base
        const newUser = await authModel.create({ employe_id, role_id, email, mot_de_passe: hashedPassword });

        // 201 = "Created" : l'utilisateur a ete cree avec succes
        res.status(201).json({
            message: "Inscription reussie",
            data: { user: { id: newUser.id, email: newUser.email, actif: newUser.actif } }
        });
    } catch (error) {
        console.error("Erreur register:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// ----------------------------------------------------------------
// POST /api/auth/logout - Deconnecter
// ----------------------------------------------------------------
// Le frontend gere lui-meme la deconnexion en supprimant le token.
// Le backend repond juste "ok" pour confirmer.
// ----------------------------------------------------------------
const logout = (req, res) => {
    try {
        res.json({ message: "Deconnexion reussie", data: null });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message, data: null });
    }
};

// On exporte les 3 fonctions pour les utiliser dans les routes
module.exports = { login, register, logout };

