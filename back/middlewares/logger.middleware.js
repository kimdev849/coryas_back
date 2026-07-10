// ================================================================
// logger.middleware.js - Affiche les requetes dans la console
// ================================================================
// Affiche dans le terminal du serveur chaque requete recue :
// Exemple : [14:30:00] GET /api/employes -> 200 | IP: ::1
// Cela permet de voir ce qui se passe et de detecter les erreurs.
// ================================================================

const loggerMiddleware = (req, res, next) => {
  // Recupere la methode (GET, POST...) et le chemin (/api/...)
  const { method, path } = req;

  // Cree un horodatage lisible : [14:30:00]
  const now = new Date();
  const timestamp = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  // Recupere l'adresse IP du client
  const ip = req.ip || req.connection.remoteAddress || "UNKNOWN";

  // Attend que la reponse soit envoyee au client
  res.on("finish", () => {
    // Recupere le code HTTP renvoye (200 = succes, 404 = pas trouve, 500 = erreur)
    const statusCode = res.statusCode;

    // Affiche : [heure] METHODE /chemin -> code | IP
    console.log("[" + timestamp + "] " + method + " " + path + " -> " + statusCode + " | IP: " + ip);

    // Si la requete contenait des donnees (POST/PUT), on les affiche aussi
    if (req.body && Object.keys(req.body).length > 0) {
      console.log("  Body:", JSON.stringify(req.body));
    }
  });

  next(); // Continue vers le middleware suivant ou le controlleur
};

module.exports = loggerMiddleware;


