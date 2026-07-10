// ================================================================
// cors.middleware.js - Autorise le frontend a appeler l'API
// ================================================================
// Probleme : le frontend tourne sur http://localhost:5173
//            le backend tourne sur http://localhost:3000
// Sans CORS, le navigateur dirait : "Non, tu n'as pas le droit !"
// Ce middleware dit : "Si, c'est autorise"
// ================================================================

const corsMiddleware = (req, res, next) => {
  // * = autorise TOUS les domaines (pas de restriction)
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Autorise ces methodes HTTP : GET, POST, PUT, DELETE, OPTIONS
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Autorise ces headers dans la requete : Content-Type et Authorization
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Si le navigateur envoie une requete OPTIONS (pre-vol)
  // On repond directement 200 sans aller plus loin
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next(); // Continue vers le middleware suivant ou le controlleur
};

module.exports = corsMiddleware;


