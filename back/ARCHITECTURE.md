
═══════════════════════════════════════════════════════════════════

back/
│
├── server.js                    ✅ Fichier principal (Express)
│
├── routes/                      📍 Définit les CHEMINS API
│   ├── auth.routes.js
│   ├── dashboard.routes.js
│   ├── employes.routes.js
│   ├── presences.routes.js
│   └── conges.routes.js
│
├── controllers/                 🎯 TRAITE les requêtes
│   ├── auth.controller.js
│   ├── dashboard.controller.js
│   ├── employes.controller.js
│   ├── presences.controller.js
│   └── conges.controller.js
│
├── models/                      📋 STRUCTURE des données
│   ├── auth.model.js
│   ├── dashboard.model.js
│   ├── employes.model.js
│   ├── presences.model.js
│   └── conges.model.js
│
└── middlewares/                 🛠️ TRAITEMENT avant les routes
    ├── auth.middleware.js       🔐 Authentification
    ├── logger.middleware.js     📝 Logging
    ├── cors.middleware.js       🌐 CORS
    ├── errorHandler.middleware.js  ⚠️ Gestion erreurs
    ├── validation.middleware.js    ✅ Validation données
    └── README.md                📖 Guide d'utilisation


═══════════════════════════════════════════════════════════════════
ARCHITECTURE MVC (Model-View-Controller)
═══════════════════════════════════════════════════════════════════

Requête HTTP
    ↓
1️⃣ MIDDLEWARE
   - Vérifier authentification
   - Valider données
   - Logger la requête
    ↓
2️⃣ ROUTES (routes/*.js)
   - Définir le chemin (/api/conges)
   - Diriger vers le contrôleur
    ↓
3️⃣ CONTRÔLEURS (controllers/*.js)
   - Logique métier
   - Appeler les modèles
   - Retourner la réponse
    ↓
4️⃣ MODÈLES (models/*.js)
   - Structure des données
   - Validations
   - Exemples
    ↓
Réponse JSON


═══════════════════════════════════════════════════════════════════
ROUTES API DISPONIBLES
═══════════════════════════════════════════════════════════════════

🔐 AUTHENTIFICATION (/api/auth)
────────────────────────────────
POST   /api/auth/login          Connexion
POST   /api/auth/register       Inscription
POST   /api/auth/logout         Déconnexion


📊 TABLEAU DE BORD (/api/dashboard)
────────────────────────────────────
GET    /api/dashboard           Toutes les statistiques
GET    /api/dashboard/employes  Stats employés
GET    /api/dashboard/conges    Stats congés


👥 EMPLOYÉS (/api/employes)
────────────────────────────
GET    /api/employes            Lister tous
POST   /api/employes            Créer un employé
GET    /api/employes/:id        Détails d'un employé
PUT    /api/employes/:id        Modifier un employé
DELETE /api/employes/:id        Supprimer un employé


📍 PRÉSENCES (/api/presences)
─────────────────────────────
GET    /api/presences           Lister toutes
POST   /api/presences/checkin   Enregistrer arrivée
POST   /api/presences/checkout  Enregistrer départ
GET    /api/presences/:id       Détails d'une présence


🏖️ CONGÉS (/api/conges)
────────────────────────
GET    /api/conges             Lister toutes les demandes
POST   /api/conges             Créer une demande
GET    /api/conges/:id         Détails d'une demande
PUT    /api/conges/:id/approve Approuver (admin)
PUT    /api/conges/:id/reject  Rejeter (admin)
DELETE /api/conges/:id         Supprimer une demande


═══════════════════════════════════════════════════════════════════
MIDDLEWARES DISPONIBLES
═══════════════════════════════════════════════════════════════════

🔐 AUTHENTIFICATION
────────────────────
verifyToken          Vérifier le token JWT
checkRole(role)      Vérifier le rôle (admin, responsable, employe)

✅ VALIDATION
──────────────
validateConge        Valider une demande de congé
validateLogin        Valider email + password
validateEmploye      Valider les données d'un employé

📝 LOGGING
──────────
loggerMiddleware     Enregistre chaque requête

🌐 CORS
────────
corsMiddleware       Permet les requêtes cross-origin

⚠️ GESTION ERREURS
───────────────────
errorHandler         Centralise les erreurs
notFoundHandler      Capture les routes 404


═══════════════════════════════════════════════════════════════════
EXEMPLES D'UTILISATION
═══════════════════════════════════════════════════════════════════

✅ EXEMPLE 1 : Créer une demande de congé (authentifié + validé)
──────────────────────────────────────────────────────────────────

// Dans routes/conges.routes.js
const { verifyToken } = require("../middlewares/auth.middleware");
const { validateConge } = require("../middlewares/validation.middleware");

router.post(
  "/",
  verifyToken,        // Vérifier authentification
  validateConge,      // Valider les données
  crierDemande        // Créer la demande
);

// Requête :
POST /api/conges
Header: Authorization: Bearer token123
Body: {
  "dateDebut": "2024-01-15",
  "dateFin": "2024-01-20",
  "raison": "Congé annuel"
}

// Flux :
1. verifyToken() → Vérifie le token
2. validateConge() → Vérifie les dates et formats
3. crierDemande() → Crée la demande
4. Response 201 Created


✅ EXEMPLE 2 : Approuver une demande (admin only)
──────────────────────────────────────────────────

// Dans routes/conges.routes.js
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

router.put(
  "/:id/approve",
  verifyToken,           // Vérifier authentification
  checkRole("admin"),    // Vérifier que c'est un admin
  appouverConge          // Approuver
);

// Requête :
PUT /api/conges/1/approve
Header: Authorization: Bearer admin_token123

// Flux :
1. verifyToken() → Vérifie le token
2. checkRole("admin") → Vérifie role = "admin"
3. appouverConge() → Approuve la demande
4. Response 200 OK


═══════════════════════════════════════════════════════════════════
STATUTS HTTP UTILISÉS
═══════════════════════════════════════════════════════════════════

✅ 200 OK                  Succès (GET, PUT, DELETE)
✅ 201 Created             Ressource créée (POST)
❌ 400 Bad Request         Validation échouée
❌ 401 Unauthorized        Token manquant/invalide
❌ 403 Forbidden           Rôle insuffisant
❌ 404 Not Found           Ressource non trouvée
❌ 500 Server Error        Erreur serveur


═══════════════════════════════════════════════════════════════════
STRUCTURE DES RÉPONSES JSON
═══════════════════════════════════════════════════════════════════

✅ Succès :
{
  "message": "✅ Opération réussie",
  "data": { ... }
}

❌ Erreur :
{
  "message": "❌ Description de l'erreur",
  "data": null
}


═══════════════════════════════════════════════════════════════════
PROCHAINES ÉTAPES
═══════════════════════════════════════════════════════════════════

1. Connecter une vraie base de données ( PostgreSQL)
2. Implémenter JWT pour l'authentification
3. Ajouter bcrypt pour hasher les mots de passe
4. Tester avec Postman/Insomnia
5. Créer des contrôleurs pour les autres domaines
6. Ajouter les middlewares aux routes existantes


═══════════════════════════════════════════════════════════════════
