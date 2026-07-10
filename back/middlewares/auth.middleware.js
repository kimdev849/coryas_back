// ================================================================
// auth.middleware.js - Verifie le token JWT et les roles
// ================================================================
// Un middleware = une fonction qui s'execute AVANT le controlleur.
// verifyToken : verifie que le client a le droit d'acceder a la route
// checkRole : verifie que l'utilisateur a le bon role (Admin, RH...)
// ================================================================

// Importe jsonwebtoken pour decoder les tokens JWT
const jwt = require("jsonwebtoken");

// ================================================================
// verifyToken - Verifie que le client a un token valide
// ================================================================
// Le frontend envoie le token dans le header Authorization
// Exemple: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
//
// Si le token est valide :
//   -> on met les infos (id, email, role) dans req.user
//   -> on appelle next() pour passer au controlleur
//
// Si le token est invalide ou expire :
//   -> on renvoie 401 (non autorise)
// ================================================================
const verifyToken = (req, res, next) => {
    try {
        // Recupere le header Authorization envoye par le frontend
        const authHeader = req.headers.authorization;

        // Si le header n'existe pas, le client n'a pas de token
        if (!authHeader) {
            return res.status(401).json({ message: "Token manquant", data: null });
        }
        // Le header doit commencer par "Bearer " (format standard)
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Format: 'Bearer token'", data: null });
        }

        // Enleve "Bearer " pour ne garder que le token
        const token = authHeader.substring(7);
        if (!token) {
            return res.status(401).json({ message: "Token invalide", data: null });
        }

        // jwt.verify() decode le token en utilisant la cle secrete
        // Si le token a ete modifie ou expire, ca lance une erreur
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Stocke les infos de l'utilisateur dans req.user
        // Les controlleurs pourront les utiliser plus tard
        req.user = {
            id: decoded.id,           // ID de l'utilisateur
            email: decoded.email,     // Email
            role: decoded.role,       // Role (Administrateur, RH, Employe)
            employe_id: decoded.employe_id, // ID de l'employe lie
        };

        next(); // Token valide -> on passe au controlleur
    } catch (error) {
        // Si le token est expire
        let message = "Token invalide";
        if (error.name === "TokenExpiredError") message = "Token expire";
        else if (error.name === "JsonWebTokenError") message = "Token falsifie";
        return res.status(401).json({ message, error: error.message, data: null });
    }
};

// ================================================================
// checkRole - Verifie le role de l'utilisateur
// ================================================================
// Utilisation : checkRole(["Administrateur", "RH"])
//
// Si le role de l'utilisateur est dans la liste -> on laisse passer
// Sinon -> on renvoie 403 (interdit)
//
// Attention : doit etre utilise APRES verifyToken
// (sinon req.user n'existe pas)
// ================================================================
const checkRole = (rolesRequis) => {
    // Retourne une fonction middleware
    return (req, res, next) => {
        try {
            // Si req.user n'existe pas, l'utilisateur n'est pas connecte
            if (!req.user) {
                return res.status(401).json({ message: "Non authentifie", data: null });
            }

            // Si rolesRequis est une chaine, on la transforme en tableau
            const roles = Array.isArray(rolesRequis) ? rolesRequis : [rolesRequis];

            // Verifie si le role de l'utilisateur est dans la liste autorisee
            if (!roles.includes(req.user.role)) {
                // 403 = Forbidden (interdit)
                return res.status(403).json({
                    message: "Acces refuse. Role requis : " + roles.join(", "),
                    data: null,
                });
            }

            next(); // Role autorise -> on continue
        } catch (error) {
            res.status(500).json({ message: "Erreur de verification du role", error: error.message });
        }
    };
};

// Exporte les deux middlewares pour les utiliser dans les routes
module.exports = { verifyToken, checkRole };

