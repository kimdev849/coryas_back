// ================================================================
// errorHandler.middleware.js - Gere les erreurs
// ================================================================
// Quand une erreur se produit dans un controlleur,
// ce middleware l'attrape et renvoie une reponse JSON propre.
// Sans lui, le serveur planterait et afficherait une page vide.
// ================================================================

// errorHandler : attrape les erreurs et renvoie un message clair
const errorHandler = (err, req, res, next) => {
  try {
    // Prend le code d'erreur (400, 404, 500...) ou 500 par defaut
    const status = err.status || err.statusCode || 500;
    // Prend le message d'erreur ou un message par defaut
    const message = err.message || "Erreur serveur interne";
    const details = err.details || null;

    // Affiche l'erreur dans la console du serveur
    console.error("ERREUR:", { status, message, path: req.path, method: req.method });

    // Renvoie une reponse JSON avec les details de l'erreur
    res.status(status).json({
      message: message,
      status: status,
      error: details,
      timestamp: new Date().toISOString(), // Horodatage
    });
  } catch (error) {
    // Si meme le gestionnaire d'erreurs plante...
    console.error("Erreur critique :", error);
    res.status(500).json({ message: "Erreur serveur critique", status: 500 });
  }
};

// notFoundHandler : si l'URL demandee n'existe pas
const notFoundHandler = (req, res, next) => {
  // Cree une erreur avec le chemin qui n'existe pas
  const error = new Error("Route non trouvee : " + req.method + " " + req.path);
  error.status = 404;
  next(error); // Passe l'erreur a errorHandler
};

module.exports = { errorHandler, notFoundHandler };

