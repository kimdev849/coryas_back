# 📚 PRÉSENCE CORYAS — Documentation Complète

> *Le projet expliqué simplement — même un enfant de 12 ans peut comprendre !* 🧒

---

## 📋 SOMMAIRE

| N° | Section | 🔍 Pour comprendre |
|---|---|---|
| ① | [🎯 Le projet, c'est quoi ?](#1-🎯-le-projet-cest-quoi) | Les fonctionnalités et les rôles |
| ② | [🧰 Les technologies (et pourquoi)](#2-🧰-les-technologies-et-pourquoi) | Outils utilisés et leur utilité |
| ③ | [🏗️ L'architecture générale](#3-🏗️-larchitecture-générale) | Comment tout s'assemble |
| ④ | [🖥️ Le Backend (dossier `back/`)](#4-🖥️-le-backend-dossier-back) | Le serveur Node.js |
| ⑤ | [🌐 L'App Web (dossier `front/`)](#5-🌐-lapp-web-dossier-front) | React + Vite |
| ⑥ | [📱 L'App Mobile (dossier `App_Coryas/`)](#6-📱-lapp-mobile-dossier-app_coryas) | React Native + Expo |
| ⑦ | [🗄️ La Base de Données](#7-🗄️-la-base-de-données) | PostgreSQL / Supabase |
| ⑧ | [🚀 Le Déploiement](#8-🚀-le-déploiement) | Mettre l'app en ligne |
| ⑨ | [📖 Lexique complet](#9-📖-lexique-complet) | Tous les mots expliqués |

---

## 🚀 GUIDE DE DÉMARRAGE RAPIDE (Quick Start)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/presence_coryas.git
cd presence_coryas
```

### 2. Configurer la base de données (Supabase)

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans **SQL Editor** → collez le contenu de `back/sql/init.sql` → **Run**

4. Notez les identifiants de connexion :
   - `DB_HOST` (l'URL du projet)
   - `DB_NAME` (postgres)
   - `DB_USER` (postgres)
   - `DB_PASSWORD` (votre mot de passe)

### 3. Lancer le backend

Créez un fichier `.env` dans le dossier `back/` :
```env
PORT=3000
JWT_SECRET=ma_cle_secrete_longue_et_difficile
JWT_EXPIRES_IN=24h
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

```bash
cd back
npm install
npm run dev    # → http://localhost:3000/api/health
```

### 4. Lancer l'app web

```bash
cd front
npm install
npm run dev    # → http://localhost:5173
```

### 5. Lancer l'app mobile

```bash
cd App_Coryas
npm install
npx expo start --clear    # → Scanner le QR code avec Expo Go
```

### 6. Identifiants de test

| Rôle | Email | Mot de passe |
|---|---|---|
| 👑 Admin | admin@coryas.com | admin123 |
| 📋 RH | sophie@coryas.com | admin123 |
| 🧑‍💼 Employé | jean@coryas.com | admin123 |

---

## 1. 🎯 LE PROJET, C'EST QUOI ?

**Présence Coryas** est une application pour **gérer les présences des employés** dans une entreprise.  
Elle remplace les fiches papier et les tableaux Excel par du numérique !

### ✨ Ce qu'on peut faire

| Fonctionnalité | 👤 Qui peut le faire | 📝 Comment |
|---|---|---|
| 🔐 **Se connecter** | Tout le monde | Email + mot de passe |
| ⏱️ **Pointer l'arrivée** | Employés | Check-in le matin |
| ⏱️ **Pointer le départ** | Employés | Check-out le soir |
| 📊 **Voir le tableau de bord** | Tout le monde | Stats du jour en direct |
| 📅 **Voir l'historique** | Employés | Toutes ses présences |
| 📋 **Demander un congé** | Employés | Formulaire simple |
| ✅ **Approuver un congé** | Admin / RH | Un clic |
| ❌ **Rejeter un congé** | Admin / RH | Avec motif |
| 👥 **Gérer les employés** | Admin / RH | Ajouter / Modifier / Supprimer |
| ⏱️ **Rattrapage** | Admin / RH | Corriger un oubli de pointage |
| ⚙️ **Configuration** | Admin / RH | Horaires, contact entreprise |

### 👥 Les rôles — Qui a le droit de faire quoi ?

```
👑 Administrateur ──── Peut TOUT faire
├── 📋 RH ──────────── Presque tout (sauf supprimer)
├── 👔 Directeur ───── Voir les stats, approuver des congés
└── 🧑‍💼 Employé ────── Pointer, voir ses présences, demander congés
```

---

## 2. 🧰 LES TECHNOLOGIES (ET POURQUOI)

### 2.1. 🖥️ Backend : Node.js + Express

**📌 Node.js** — *C'est quoi ?*  
C'est un logiciel qui permet d'exécuter du JavaScript **sur un serveur**, pas seulement dans un navigateur.

**💡 Pourquoi lui ?**  
- On peut utiliser **le même langage** (JavaScript) partout : frontend ET backend
- Très rapide pour gérer plusieurs utilisateurs en même temps
- Immense communauté (plein d'aide en ligne)

**📌 Express** — *C'est quoi ?*  
C'est une **bibliothèque** (outil) pour Node.js qui simplifie la création d'un serveur web.

**💡 Pourquoi lui ?**  
- Sans Express, on devrait écrire 100 lignes pour ce qu'on fait en 5 lignes
- C'est le standard pour les API REST en Node.js
- Très léger et rapide

### 2.2. 🗄️ Base de données : PostgreSQL + Supabase

**📌 PostgreSQL** — *C'est quoi ?*  
C'est une **base de données relationnelle** : les données sont organisées en tableaux (tables) reliés entre eux.

**💡 Pourquoi lui ?**  
- Très fiable (utilisé par les banques, les gouvernements)
- Permet de faire des liens entre les données (ex: une présence → un employé)
- Gratuit et open source

**📌 Supabase** — *C'est quoi ?*  
C'est un service qui **héberge** PostgreSQL dans le cloud et ajoute une interface visuelle.

**💡 Pourquoi lui ?**  
- On voit les données comme dans Excel en ligne
- Pas besoin d'installer PostgreSQL sur son ordinateur
- Version gratuite généreuse

### 2.3. 🌐 Frontend Web : React + Vite

**📌 React** — *C'est quoi ?*  
C'est une bibliothèque pour créer des **interfaces utilisateur** avec des composants réutilisables (comme des Legos 🧱).

**💡 Pourquoi lui ?**  
- **Composants réutilisables** : un bouton écrit une fois, utilisé partout
- **Mise à jour automatique** : si une donnée change, l'écran se met à jour tout seul
- C'est la bibliothèque frontend la plus utilisée au monde

**📌 Vite** — *C'est quoi ?*  
C'est un **outil de construction** qui transforme notre code React en code que le navigateur comprend.

**💡 Pourquoi lui ?**  
- **Ultra-rapide** : les changements s'affichent en temps réel
- Remplace les anciens outils comme Webpack (beaucoup plus lent)

### 2.4. 📱 App Mobile : React Native + Expo

**📌 React Native** — *C'est quoi ?*  
C'est une version de React pour créer **de vraies apps mobiles** (iPhone et Android).

**💡 Pourquoi lui ?**  
- On écrit le code **une seule fois** pour les deux téléphones
- On réutilise les concepts React qu'on connaît déjà
- Pas besoin d'apprendre Swift (iPhone) ou Kotlin (Android)

**📌 Expo** — *C'est quoi ?*  
C'est une boîte à outils qui simplifie le développement d'apps React Native.

**💡 Pourquoi lui ?**  
- Pas besoin de configurer Xcode ou Android Studio
- On peut tester l'app sur son téléphone avec un QR code
- Expo Router : navigation par fichiers (simple et intuitif)

### 2.5. 🔐 Authentification : JWT (JSON Web Token)

**📌 JWT** — *C'est quoi ?*  
C'est un **pass numérique** que le serveur donne au frontend quand l'utilisateur se connecte.

**💡 Pourquoi lui ?**  
- Pas besoin de stocker le mot de passe à chaque requête
- Le token contient les infos de l'utilisateur (id, nom, rôle)
- Il expire automatiquement après 24h (sécurité)

### 2.6. 🔧 Les autres outils

| Outil | 🎯 Rôle | 📝 Explication simple |
|---|---|---|
| **bcrypt** | 🔒 Sécurité | Transforme les mots de passe en code illisible (hash) |
| **jsonwebtoken** | 🎫 JWT | Crée et vérifie les passes numériques |
| **pg** | 🗄️ PostgreSQL | Permet à Node.js de parler à PostgreSQL |
| **Axios** | 🌐 Requêtes HTTP | Comme fetch() mais plus puissant (mobile) |
| **AsyncStorage** | 💾 Stockage local | Sauvegarde des données sur le téléphone |
| **Expo Router** | 🧭 Navigation | Chaque fichier = une page de l'app |

---

## 3. 🏗️ L'ARCHITECTURE GÉNÉRALE

### 3.1. Le schéma de connexion

```
📱 APP MOBILE (React Native)
   │
   │  📡 Appelle https://coryas-api.onrender.com/api/...
   │  📦 Via Axios (bibliothèque HTTP)
   │
   ├─────────────────────────────────────┐
   │                                     │
   ▼                                     │
🌐 APP WEB (React)                       │
   │                                     │
   │  📡 Appelle /api/... (proxy Vite)   │
   │  📦 Via fetch() + fetchWithAuth()   │
   │                                     │
   └─────────────┬───────────────────────┘
                 │
                 ▼
         🖥️ BACKEND Node.js + Express
         📍 https://coryas-api.onrender.com
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
   🔍 Middleware     📋 Contrôleur
   (vérifie token)   (logique métier)
         │               │
         └───────┬───────┘
                 ▼
         🗄️ MODÈLE (requêtes SQL)
                 │
                 ▼
         🐘 PostgreSQL (Supabase)
```

### 3.2. Le cycle d'une requête — Exemple concret

**Quand un employé clique "Pointer l'arrivée" :**

```
1️⃣  L'employé appuie sur le bouton
    ↓
2️⃣  Le frontend envoie { employe_id: 1 } à POST /api/presences/checkin
    ↓
3️⃣  Le middleware auth vérifie le token JWT → OK
    ↓
4️⃣  Le contrôleur checkIn() :
      • Calcule l'heure actuelle (08:12)
      • Compare avec 09:00 → en retard ? Non → statut = "Present"
      • Appelle le modèle
    ↓
5️⃣  Le modèle exécute la requête SQL :
      INSERT INTO presences (employe_id, date_presence, heure_entree, statut)
      VALUES (1, '2026-07-10', '08:12', 'Present')
      RETURNING *
    ↓
6️⃣  Le backend renvoie la réponse au frontend
    ↓
7️⃣  L'écran s'affiche : "Arrivée enregistrée ✅"
```

### 3.3. La structure des dossiers

```
📁 presence_coryas/                 ← Racine du projet
│
├── 📁 back/                        ← Le serveur (Node.js + Express)
│   ├── 📁 config/                  ← Connexion à la base de données
│   ├── 📁 controllers/             ← La logique métier
│   ├── 📁 middlewares/             ← Les vérifications (token, validation)
│   ├── 📁 models/                  ← Les requêtes SQL
│   ├── 📁 routes/                  ← Les URLs de l'API
│   └── server.js                   ← Point de démarrage
│
├── 📁 front/                       ← L'application web (React + Vite)
│   ├── 📁 public/                  ← Fichiers statiques (logo)
│   └── 📁 src/
│       ├── 📁 components/          ← Barre du haut + menu latéral
│       ├── 📁 contexts/            ← Contexte d'authentification
│       ├── 📁 layouts/             ← Structure des pages
│       ├── 📁 pages/               ← Chaque page (Login, Dashboard...)
│       ├── 📁 services/            ← Appels API
│       └── 📁 styles/              ← Styles CSS
│
├── 📁 App_Coryas/                  ← L'application mobile (React Native)
│   ├── 📁 app/                     ← Pages (Expo Router)
│   │   ├── 📁 (tabs)/             ← Onglets après connexion
│   │   ├── _layout.tsx             ← Navigation principale
│   │   ├── index.tsx               ← Écran de démarrage (splash)
│   │   └── login.tsx               ← Connexion
│   ├── 📁 assets/                  ← Images (icône, logo, splash)
│   └── 📁 src/
│       ├── 📁 constants/           ← Couleurs de l'app
│       └── 📁 services/            ← Appels API
│
└── 📄 DOCUMENTATION.md             ← Ce fichier !
```

---

## 4. 🖥️ LE BACKEND (dossier `back/`)

### 4.1. L'organisation en 3 couches

```
🌐 ROUTES ────> 💡 CONTROLLEURS ────> 🗄️ MODÈLES
   (URLs)         (logique)             (SQL)
```

**Pourquoi 3 couches ?**  
C'est ce qu'on appelle l'**architecture MVC** (Modèle-Vue-Contrôleur) :
- **Routes** : l'annuaire (qui fait quoi)
- **Contrôleurs** : le cerveau (la logique)
- **Modèles** : les mains (le SQL)

Chaque couche a un rôle précis. Si on mélange tout, c'est le bazar ! 🎪

### 4.2. `server.js` — Le démarrage du serveur

```javascript
const express = require("express");      // J'importe Express
const app = express();                    // Je crée l'application

app.use(express.json());                 // Pour lire le JSON envoyé par le frontend
app.use("/api/auth", authRoutes);        // Route pour l'authentification
app.use("/api/presences", presencesRoutes); // Route pour les présences
app.use("/api/conges", congesRoutes);     // Route pour les congés
// ...

app.listen(5000, () => {                  // Je lance le serveur sur le port 5000
    console.log("🚀 Serveur démarré !");
});
```

**🔍 Décryptage :**
| Mot | Sens |
|---|---|
| `require()` | "Va chercher ce fichier" (comme `import`) |
| `app.use(chemin, routes)` | "Quand quelqu'un visite ce chemin, utilise ces routes" |
| `app.listen(port)` | "Écoute sur ce port" (comme une porte d'entrée) |

### 4.3. Les ROUTES — L'annuaire de l'API

```
URL complète : https://coryas-api.onrender.com/api/presences/checkin
                              └─┬──┘   └──────┬──────┘  └──┬──┘
                           serveur         groupe       action
```

#### 📋 Le tableau de toutes les routes

| Méthode | URL | Action | 📁 Fichier contrôleur |
|---|---|---|---|
| `POST` | `/api/auth/login` | Se connecter | `auth.controller.js` |
| `POST` | `/api/auth/register` | Créer un compte | `auth.controller.js` |
| `POST` | `/api/auth/logout` | Se déconnecter | `auth.controller.js` |
| `POST` | `/api/auth/change-password` | Changer le mot de passe 🔒 | `auth.controller.js` |
| `GET` | `/api/presences` | Voir les présences (filtres: `?employe_id=&date_debut=&date_fin=`) | `presences.controller.js` |
| `GET` | `/api/presences/active` | Présence en cours de l'employé | `presences.controller.js` |
| `POST` | `/api/presences/checkin` | Pointer l'arrivée | `presences.controller.js` |
| `POST` | `/api/presences/checkout` | Pointer le départ | `presences.controller.js` |
| `PUT` | `/api/presences/:id/rattrapage` | Corriger un départ oublié | `presences.controller.js` |
| `GET` | `/api/presences/stats/aujourdhui` | Stats du jour (présents, retards, absents) | `presences.controller.js` |
| `GET` | `/api/presences/:id` | Détail d'une présence | `presences.controller.js` |
| `POST` | `/api/conges` | Créer une demande de congé | `conges.controller.js` |
| `GET` | `/api/conges` | Voir les congés (filtre: `?employe_id=`) | `conges.controller.js` |
| `GET` | `/api/conges/:id` | Détail d'un congé | `conges.controller.js` |
| `PUT` | `/api/conges/:id/approve` | ✅ Approuver (admin/RH) | `conges.controller.js` |
| `PUT` | `/api/conges/:id/reject` | ❌ Rejeter (admin/RH) | `conges.controller.js` |
| `DELETE` | `/api/conges/:id` | 🗑️ Supprimer (admin/RH) | `conges.controller.js` |
| `GET` | `/api/employes` | Lister tous les employés | `employes.controller.js` |
| `POST` | `/api/employes` | Créer un employé | `employes.controller.js` |
| `GET` | `/api/employes/:id` | Voir un employé | `employes.controller.js` |
| `PUT` | `/api/employes/:id` | Modifier un employé | `employes.controller.js` |
| `PUT` | `/api/employes/:id/deactivate` | Désactiver un employé | `employes.controller.js` |
| `GET` | `/api/departements` | Lister les départements | `departements.controller.js` |
| `GET` | `/api/dashboard/stats` | Stats du tableau de bord | `dashboard.controller.js` |
| `GET` | `/api/parametres` | Voir la configuration | `parametres.controller.js` |
| `PUT` | `/api/parametres` | Modifier la configuration | `parametres.controller.js` |
| `GET` | `/api/health` | Santé du serveur (test) | Direct dans `server.js` |

#### Les méthodes HTTP

| Méthode | 🔄 Action | 📖 Analogue à |
|---|---|---|
| `GET` | **Lire** des données | Ouvrir un livre 📖 |
| `POST` | **Créer** des données | Écrire une lettre ✉️ |
| `PUT` | **Modifier** des données | Corriger une lettre 🖊️ |
| `DELETE` | **Supprimer** des données | Déchirer une lettre 🗑️ |

#### Les parties d'une route

| Élément | Exemple | Explication |
|---|---|---|
| `:id` | `/conges/:id/approve` | L'ID est variable (`/conges/5/approve`) |
| `req.params` | `req.params.id` | Récupère l'ID depuis l'URL |
| `req.query` | `?employe_id=1` | Récupère les filtres depuis l'URL |
| `req.body` | `{ email, password }` | Récupère les données envoyées |

### 4.4. Les CONTROLLEURS — Le cerveau

**C'est ici que la magie opère** 🧠  
Le contrôleur reçoit la requête, réfléchit, et répond.

#### Exemple : `checkIn` (pointer l'arrivée)

```javascript
const checkIn = async (req, res) => {
    // 1️⃣ Je récupère l'ID de l'employé
    const { employe_id } = req.body;

    // 2️⃣ Je vérifie que l'ID est présent
    if (!employe_id) {
        return res.status(400).json({ message: "ID obligatoire" });
    }

    // 3️⃣ Je calcule l'heure actuelle (fuseau Paris)
    const maintenant = new Date();
    const heure = String(maintenant.getHours()).padStart(2, "0");
    const minute = String(maintenant.getMinutes()).padStart(2, "0");
    const heureArrivee = heure + ":" + minute;

    // 4️⃣ Si après 09:00 → Retard, sinon → Présent
    const statut = heureArrivee > "09:00" ? "Retard" : "Present";

    // 5️⃣ J'enregistre dans la base de données
    const presence = await presencesModel.checkIn({
        employe_id, heureArrivee, statut
    });

    // 6️⃣ Je réponds au frontend
    res.status(201).json({
        message: "Arrivée enregistrée",
        data: presence
    });
};
```

**🔍 Les mots clés :**

| Mot | Signification | 💡 Analogue |
|---|---|---|
| `req` = **request** | Ce que le frontend envoie | La lettre qu'on reçoit 📨 |
| `res` = **response** | Ce que le backend renvoie | La lettre qu'on envoie 📤 |
| `req.body` | Les données du formulaire | Le contenu de la lettre |
| `req.params` | Les infos dans l'URL | L'adresse sur l'enveloppe |
| `req.query` | Les filtres dans l'URL | "URGENT" écrit sur l'enveloppe |
| `res.status(400)` | Code d'erreur | "404 = Page non trouvée" |
| `res.json()` | Réponse formatée JSON | "Voici la réponse en français" |
| `async` | Fonction qui prend du temps | "Je dois attendre la base de données" |
| `await` | Attends que ce soit fini | "Je patiente" ⏳ |

#### Exemple : `checkOut` (pointer le départ)

```javascript
const checkOut = async (req, res) => {
    const { presenceId, heure_sortie: frontHeure } = req.body;
    
    // Prend l'heure du frontend, sinon celle du serveur
    let heure_sortie;
    if (frontHeure) {
        heure_sortie = frontHeure;           // "17:42"
    } else {
        const maintenant = new Date();
        // ... calcule l'heure
        heure_sortie = heure + ":" + minute;
    }
    
    const presence = await presencesModel.checkOut(presenceId, heure_sortie);
    
    if (!presence) {
        return res.status(404).json({ message: "Déjà parti ou inexistant" });
    }
    
    res.json({ message: "Départ enregistré", data: presence });
};
```

> ⚠️ **Aucune restriction d'heure** : un employé peut partir à n'importe quel moment !

### 4.5. Les MODÈLES — Les requêtes SQL

**C'est le traducteur** entre JavaScript et la base de données.  
Le contrôleur dit "je veux enregistrer un départ" et le modèle écrit la requête SQL.

#### Exemple : `checkOut` dans `presences.model.js`

```javascript
async function checkOut(id, heure_sortie) {
    const result = await pool.query(`
        UPDATE presences SET
            heure_sortie = $2,          -- On met l'heure de sortie
            updated_at = NOW()          -- On note la date de modification
        WHERE id = $1                   -- Pour cette présence précise
          AND heure_sortie IS NULL      -- Seulement s'il n'est pas déjà parti
        RETURNING *                     -- On renvoie la ligne modifiée
    `, [id, heure_sortie]);             -- $1 = id, $2 = heure_sortie
    
    return result.rows[0];              // On retourne la présence modifiée
}
```

**🔍 Les symboles SQL :**

| Symbole | Signification | 💡 Explication |
|---|---|---|
| `$1`, `$2` | Paramètres sécurisés | Évite les injections SQL (piratage) |
| `NOW()` | Date et heure actuelles | PostgreSQL connaît l'heure |
| `IS NULL` | Vérifie si c'est vide | "Est-ce que c'est vide ?" |
| `RETURNING *` | Renvoie la ligne modifiée | "Donne-moi ce que tu viens de changer" |
| `JOIN` | Colle deux tables | Comme un puzzle 🧩 |

#### Exemple : Liste des présences avec le nom de l'employé

```sql
SELECT p.*, 
       e.nom || ' ' || e.prenom AS employe_nom
FROM presences p
JOIN employes e ON e.id = p.employe_id
WHERE p.date_presence = CURRENT_DATE
ORDER BY p.heure_entree DESC
```

Traduction :  
_"Donne-moi toutes les présences d'aujourd'hui avec le nom complet de chaque employé, triées par heure d'arrivée"_

### 4.6. Les MIDDLEWARES — Les gardiens 🛡️

**C'est comme un contrôle de sécurité** avant d'entrer dans une boîte de nuit.

```
Requête ──> 🔍 Vérifie token ──> ✅ OK ──> Contrôleur
                 │
                 └──> ❌ Pas de token ──> 401 Non autorisé
```

#### Exemple : `verifyToken` dans `auth.middleware.js`

```javascript
const verifyToken = (req, res, next) => {
    // 1. Récupère le token dans l'en-tête
    const token = req.headers.authorization?.split(" ")[1];
    
    // 2. Si pas de token → refusé !
    if (!token) return res.status(401).json({ message: "Non autorisé" });
    
    try {
        // 3. Vérifie que le token est valide
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Ajoute les infos à la requête
        req.user = decoded;
        
        // 5. Tout va bien, on passe au contrôleur
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide" });
    }
};
```

**🔍 Les mots clés :**

| Mot | Explication |
|---|---|
| `req.headers` | Les en-têtes HTTP (infos supplémentaires) |
| `Authorization` | L'en-tête qui contient le token |
| `Bearer` | Le type de token ("Voici mon pass 🎫") |
| `next()` | "Suivant !" (passe au middleware ou contrôleur suivant) |
| `process.env.JWT_SECRET` | La clé secrète pour vérifier les tokens (fichier .env) |

---

## 5. 🌐 L'APP WEB (dossier `front/`)

### 5.1. Le principe : Single Page Application (SPA)

```
🌐 Site traditionnel :                    ⚡ SPA (Notre app) :
                                        
Page 1 (HTML) ──clic──> Page 2 (HTML)     Page 1 (HTML) ──clic──> React change
   🔄 RECHARGE complet                        le contenu SANS recharger
```

**Avantage :** L'app est **beaucoup plus rapide** car on ne recharge pas la page à chaque clic !

### 5.2. `index.html` — La page unique

```html
<div id="root"></div>                    <!-- 1. Conteneur vide -->
<script type="module" src="/src/main.jsx"></script>  <!-- 2. Lance React -->
```

**C'est tout !** React va construire tout le site à l'intérieur de `<div id="root">`.

### 5.3. `vite.config.js` — Le proxy

```javascript
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://coryas-api.onrender.com",  // Redirige vers le backend
        changeOrigin: true,
      },
    },
  },
});
```

**🔍 À quoi ça sert ?**  
En développement, le frontend tourne sur `http://localhost:5173`.  
Quand il appelle `/api/presences`, Vite redirige vers `https://coryas-api.onrender.com/api/presences`.  
**Sans ça** → erreur CORS (interdiction de connexion entre deux serveurs différents).

### 5.4. `main.jsx` — Le démarrage de React

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
```

**🔍 Décryptage :**
1. `createRoot(...)` → "Attache React à la div root"
2. `<App />` → "Affiche le composant principal"
3. `StrictMode` → "Vérifie les erreurs pendant le développement"

### 5.5. `App.jsx` — Les routes

```javascript
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>                    ← Fournit les infos de connexion
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>            ← Si pas connecté → redirige
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/employes" element={
            <AdminRoute>                ← Si pas admin → redirige
              <Employes />
            </AdminRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### 5.6. `AuthContext.jsx` — Le contexte d'authentification

**📌 C'est quoi un contexte ?**  
C'est un **réservoir** d'informations accessible PARTOUT dans l'application.  
Sans contexte, on devrait passer les données de parent en enfant → ça deviendrait vite le bazar !

**📦 Ce qu'il contient :**

```javascript
const value = {
    user: {             // { id, email, nom, prenom, role, employe_id }
        id: 1,
        email: "jean@coryas.com",
        nom: "Dupont",
        prenom: "Jean",
        role: "Administrateur",
        employe_id: 1
    },
    token: "eyJhbG...",        // Le JWT token
    loading: false,             // Vérification en cours ?
    login: async (email, password) => { ... },   // Fonction pour se connecter
    logout: () => { ... },                       // Fonction pour se déconnecter
    isAuthenticated: true,      // Connecté ?
};
```

**🏪 Comment on l'utilise :**

```javascript
import { useAuth } from "../contexts/AuthContext";

function Profil() {
    const { user, logout } = useAuth();
    
    return (
        <div>
            <h1>Bonjour {user.prenom}</h1>  {/* Affiche "Jean" */}
            <p>Rôle : {user.role}</p>        {/* Affiche "Administrateur" */}
            <button onClick={logout}>Déconnexion</button>
        </div>
    );
}
```

### 5.7. `api.js` — Le cœur des appels API

```javascript
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    
    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: options.body ? JSON.stringify(options.body) : null,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message);
    }
    
    return data;
};
```

**🔍 Décryptage pas à pas :**

```
1. Récupère le token JWT depuis localStorage
2. Prépare la requête (méthode, en-têtes, corps)
3. Ajoute le token dans Authorization
4. Envoie la requête au backend
5. Attend la réponse
6. Si erreur → lance une exception (catch)
7. Si OK → renvoie les données
```

### 5.8. Les PAGES — Exemple du Login

```javascript
function Login() {
    // 📌 useState = variables qui peuvent changer
    const [email, setEmail] = useState("");       // L'email tapé
    const [password, setPassword] = useState(""); // Le mot de passe
    const [error, setError] = useState("");       // Message d'erreur
    
    const { login } = useAuth();                  // Fonction de connexion

    const handleSubmit = async (e) => {
        e.preventDefault();  // Empêche le rechargement de la page
        
        try {
            await login(email, password);  // Appelle l'API
            navigate("/dashboard");        // Redirige vers le dashboard
        } catch (err) {
            setError(err.message);  // Affiche l'erreur
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Se connecter</button>
            {error && <div className="error">{error}</div>}
        </form>
    );
}
```

**🧩 Les pièces du puzzle React :**

| Concept | 📖 C'est quoi ? | 💡 Analogue |
|---|---|---|
| **`useState`** | Variable qui met à jour l'écran quand elle change | Un tableau blanc qu'on efface et réécrit |
| **`useEffect`** | Code qui s'exécute à un moment précis | Un réveil qui sonne à une heure donnée |
| **`onChange`** | Se déclenche quand l'utilisateur tape | "À chaque lettre tapée..." |
| **`onSubmit`** | Se déclenche quand on valide le formulaire | "Quand on appuie sur Entrée" |
| **`e.preventDefault()`** | Empêche le comportement par défaut | "Ne recharge pas la page !" |
| **`{}` dans le JSX** | Permet d'écrire du JS dans le HTML | "Ici, c'est du JavaScript" |

---

## 6. 📱 L'APP MOBILE (dossier `App_Coryas/`)

### 6.1. La navigation avec Expo Router

Expo Router utilise les **fichiers pour définir les pages** :

```
📁 app/
├── _layout.tsx       ← Layout principal (Stack)
├── index.tsx         ← Splash screen (1ère page)
├── login.tsx         ← Connexion
├── pointer.tsx       ← Pointage
├── 📁 presence-detail/
│   └── [id].tsx      ← Détail d'une présence (ex: /presence-detail/5)
│
└── 📁 (tabs)/        ← Onglets après connexion
    ├── _layout.tsx   ← Barre d'onglets en bas
    ├── index.tsx     ← Accueil (tableau de bord)
    ├── presences.tsx ← Historique
    ├── profil.tsx    ← Profil
    ├── conges.tsx    ← Mes congés
    ├── demande-conge.tsx ← Demander un congé
    └── parametres.tsx    ← Paramètres
```

### 6.2. `app/_layout.tsx` — Le layout racine

```javascript
<Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />      // Splash screen
    <Stack.Screen name="login" />      // Login
    <Stack.Screen name="(tabs)" />     // Onglets
</Stack>
```

**📌 `Stack`** : une pile de pages.  
Quand on navigue, on **empile** les pages comme des assiettes.  
Pour revenir en arrière, on **dépile**. 🍽️

### 6.3. `app/index.tsx` — Le splash screen (écran de démarrage)

**Au démarrage de l'app :**

```
1️⃣ Animation du logo (2,5 secondes, effet ressort)
2️⃣ Vérification du token JWT dans AsyncStorage
3️⃣ Si token existe → va à l'accueil
4️⃣ Si pas de token → va au login
```

**L'animation avec la `Animated` API :**

```javascript
// Valeurs qui changent dans le temps
const logoScale = useRef(new Animated.Value(0)).current;    // Taille (0 → 1)
const logoOpacity = useRef(new Animated.Value(0)).current;  // Opacité (0 → 1)

useEffect(() => {
    // Joue les animations en séquence
    Animated.sequence([
        Animated.delay(200),                     // Attend 200ms
        Animated.parallel([                       // Lance en même temps :
            Animated.spring(logoScale, {          //   - Effet ressort sur la taille
                toValue: 1, friction: 5
            }),
            Animated.timing(logoOpacity, {        //   - Transition douce sur l'opacité
                toValue: 1, duration: 500
            }),
        ]),
    ]).start();
    
    // Après 2,5 secondes, vérifie l'authentification
    const timer = setTimeout(async () => {
        const isAuth = await checkAuth();
        router.replace(isAuth ? "/(tabs)" : "/login");
    }, 2500);
    
    return () => clearTimeout(timer);  // Nettoie le timer à la sortie
}, []);
```

**🔍 Les mots clés :**

| Concept | Explication |
|---|---|
| `useRef` | Valeur qui ne change pas entre les rendus (stable) |
| `Animated.Value` | Nombre qui peut être animé |
| `Animated.spring` | Effet ressort (rebondit à la fin) |
| `Animated.timing` | Transition douce et linéaire |
| `Animated.sequence` | Joue les animations l'une après l'autre |
| `Animated.parallel` | Joue les animations en même temps |
| `router.replace()` | Navigue sans possibilité de retour en arrière |
| `clearTimeout()` | Nettoie le minuteur (évite les fuites mémoire) |

### 6.4. `app/login.tsx` — La connexion

**Les composants React Native :**

```javascript
// Les composants React Native (remplacent les balises HTML)
<View>        → Comme <div>, pour grouper
<Text>        → Pour afficher du texte (OBLIGATOIRE !)
<TextInput>   → Champ de saisie (comme <input>)
<Pressable>   → Bouton tactile (comme <button>)
<Image>       → Pour afficher une image (comme <img>)
<ActivityIndicator> → Spinner de chargement
<ScrollView>  → Zone qui défile (comme overflow: scroll)
<FlatList>    → Liste optimisée pour de grandes données
```

### 6.5. `app/(tabs)/index.tsx` — L'accueil (tableau de bord)

**Fonctionnalités :**
```
👋 Bonjour, Jean
📅 vendredi 10 juillet 2026

┌─────────────────────┐
│ Statut actuel    🟢 │
│                     │
│     PRÉSENT         │
│   depuis 08:12      │
└─────────────────────┘

Temps travaillé
  2h 30min

Aujourd'hui
🟢 Arrivée    08:12
🟢 Départ     --:--

┌─────────────────────┐
│  Pointer le départ  │  ← Bouton fixe en bas
└─────────────────────┘
```

**Le calcul du temps travaillé en temps réel :**

```javascript
const calculeTemps = (heureArrivee) => {
    const [h, m] = heureArrivee.split(":").map(Number);
    const arrivee = new Date();
    arrivee.setHours(h, m, 0, 0);       // Met l'heure d'arrivée
    
    const maintenant = new Date();
    const diffMs = maintenant - arrivee; // Différence en millisecondes
    
    const totalMinutes = Math.floor(diffMs / 60000);
    return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
    };
};

// Mise à jour toutes les 30 secondes
useEffect(() => {
    if (isCheckedIn) {
        const interval = setInterval(() => {
            setWorkedTime(calculeTemps(checkInTime));
        }, 30000);  // 30 secondes
        return () => clearInterval(interval);
    }
}, [isCheckedIn, checkInTime]);
```

### 6.6. `app/pointer.tsx` — Le pointage (check-in/check-out)

**Le bouton principal :**  
Grand cercle doré avec intérieur blanc.  
Animation au clic (rétrécit → revient).

```
┌────────────────┐
│   ⏱           │  ← Cercle doré (bouton)
│                │
│   Appuyez pour │
│   pointer      │
└────────────────┘

    [Retour]
```

**Après avoir pointé (écran de succès, 2 secondes) :**

```
      ✅
┌────────────┐
│     ✓      │  ← Cercle vert
└────────────┘

Pointage enregistré ✅

      08:12

  vendredi 10 juillet 2026

  [Voir mon accueil]
```

---

## 7. 🗄️ LA BASE DE DONNÉES

### 7.1. C'est quoi SQL ?

**SQL** = **S**tructured **Q**uery **L**anguage  
= Langage pour parler aux bases de données

**Les 4 commandes magiques (CRUD) :**

```sql
SELECT * FROM employes;              -- R = Read (Lire) 📖
INSERT INTO employes (nom) VALUES ('Dupont');  -- C = Create (Créer) ✏️
UPDATE employes SET nom='Martin' WHERE id=1;   -- U = Update (Modifier) 🔄
DELETE FROM employes WHERE id=1;               -- D = Delete (Supprimer) 🗑️
```

### 7.2. Les 7 tables du projet

#### 👥 Table `employes` — Les employés

| id | matricule | nom | prenom | statut | departement_id |
|---|---|---|---|---|---|
| 1 | EMP001 | Dupont | Jean | Actif | 1 |
| 2 | EMP002 | Martin | Sophie | Actif | 2 |

#### 🔐 Table `utilisateurs` — Les comptes de connexion

| id | employe_id | email | mot_de_passe | role_id | actif |
|---|---|---|---|---|---|
| 1 | 1 | jean@coryas.com | $2b$10$...hash... | 1 | true |

> 💡 Le mot de passe est **hashé** (transformé en code illisible) par bcrypt

#### ⏱️ Table `presences` — Les pointages

| id | employe_id | date_presence | heure_entree | heure_sortie | statut |
|---|---|---|---|---|---|
| 1 | 1 | 2026-07-10 | 08:12 | 17:30 | Présent |
| 2 | 1 | 2026-07-09 | 08:05 | NULL | Présent |

> 💡 `NULL` dans `heure_sortie` = l'employé n'est pas encore parti

#### 📋 Table `conges` — Les demandes de congés

| id | employe_id | date_debut | date_fin | motif | statut |
|---|---|---|---|---|---|
| 1 | 1 | 2026-07-01 | 2026-07-15 | Congé annuel | Approuvé |

#### 🏷️ Table `roles`

| id | nom |
|---|---|
| 1 | Administrateur |
| 2 | RH |
| 3 | Directeur |
| 4 | Employé |

#### 🏢 Table `departements`

| id | nom |
|---|---|
| 1 | Développement |
| 2 | Comptabilité |
| 3 | Ressources Humaines |

#### ⚙️ Table `parametres` (une seule ligne)

| nom_entreprise | heure_ouverture | heure_fermeture |
|---|---|---|
| Coryas | 08:00 | 17:00 |

### 7.3. Les clés étrangères (Foreign Keys)

**C'est comme des** liens **entre les tables.** 🧩

```
presences.employe_id = 1  ──→  employes.id = 1  ──→  "Jean Dupont"
                                └── Son nom complet
```

**Exemple de requête avec `JOIN` :**

```sql
SELECT p.date_presence, p.heure_entree, 
       e.nom || ' ' || e.prenom AS employe_nom
FROM presences p
JOIN employes e ON e.id = p.employe_id
WHERE p.date_presence = CURRENT_DATE
```

Traduction :  
_"Je veux les présences d'aujourd'hui AVEC le nom de chaque employé"_

### 7.4. Requêtes utiles

#### Stats du jour
```sql
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE statut = 'Present') AS presents,
       COUNT(*) FILTER (WHERE statut = 'Retard') AS retards
FROM presences WHERE date_presence = CURRENT_DATE
```

#### Présence active d'un employé
```sql
SELECT * FROM presences
WHERE employe_id = $1
  AND date_presence = CURRENT_DATE
  AND heure_sortie IS NULL
LIMIT 1
```

---

## 8. 🚀 LE DÉPLOIEMENT

### 8.1. Sur Render (backend)

**📌 Render** est un service qui héberge des applications dans le cloud.

**Pour le backend :**
```
1. Créer un compte sur render.com
2. Connecter son dépôt GitHub
3. Cliquer sur "New Web Service"
4. Render détecte automatiquement Node.js
5. Configurer les variables d'environnement :
   - JWT_SECRET = une_clé_secrète
   - JWT_EXPIRES_IN = 24h
   - SUPABASE_URL = l'URL de Supabase
   - SUPABASE_ANON_KEY = la clé Supabase
6. Cliquer sur "Deploy"
7. URL obtenue : https://coryas-api.onrender.com
```

### 8.2. Variables d'environnement

**C'est quoi ?**  
Des données **secrètes** (mots de passe, clés API) qu'on ne veut pas montrer dans le code.

**.env (fichier local, pas sur GitHub) :**
```env
JWT_SECRET=ma_cle_secrete_tres_longue_123
JWT_EXPIRES_IN=24h
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
```

**Comment on les utilise dans le code :**
```javascript
const secret = process.env.JWT_SECRET;  // Récupère la valeur
```

### 8.3. Déploiement de l'app web

**Pour le frontend web :**
```bash
npm run build    # Crée un dossier dist/ avec le site optimisé
```
Puis déployer le dossier `dist/` sur Render, Vercel, Netlify, etc.

### 8.4. Déploiement de l'app mobile (Build APK)

L'app mobile n'est **pas déployée sur Render**.  
Elle est installée sur le téléphone via Expo.

#### 📦 Build APK Android (fichier .apk)

**Prérequis :** Node.js, npm, un compte Expo

```bash
# 1. Installer EAS CLI (Expo Application Services)
npm install -g eas-cli

# 2. Se connecter à Expo
eas login

# 3. Configurer le build (créer eas.json si pas déjà fait)
eas build:configure

# 4. Builder l'APK (Android)
eas build -p android --profile preview
```

**Alternative sans EAS** (build local avec Android Studio) :
```bash
npx expo run:android
```

**Alternative simple** (fichier APK de développement) :
```bash
npx expo export --platform android
```

#### 📱 Tester en développement (Expo Go)
```bash
cd App_Coryas
npx expo start --clear
```
Scanner le QR code avec **Expo Go** (iOS) ou **Expo** (Android).

#### ☁️ Déploiement sur le Play Store
```bash
eas build -p android --profile production
eas submit -p android
```

---

## 9. 📖 LEXIQUE COMPLET

### 🔤 A

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **API** | Interface pour que des programmes communiquent | Le backend expose une API |
| **Async/Await** | Mot-clé pour les opérations qui prennent du temps | `await api.get("/presences")` |
| **Axios** | Bibliothèque pour faire des requêtes HTTP (mobile) | `axios.get("/api/...")` |
| **AsyncStorage** | Stockage local sur le téléphone | Stocke le token JWT |

### 🔤 B

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Backend** | La partie serveur de l'application | Node.js sur Render |
| **bcrypt** | Bibliothèque pour sécuriser les mots de passe | `bcrypt.hash(password, 10)` |
| **Bearer** | Type de token JWT | `Authorization: Bearer le_token` |

### 🔤 C

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Composant** | Bloc de code qui affiche quelque chose à l'écran | `<Button />`, `<Login />` |
| **Contexte** | Réservoir d'infos accessible partout | `useAuth()` donne l'utilisateur |
| **Contrôleur** | Fonction qui traite une requête API | `checkIn(req, res)` |
| **CRUD** | Create Read Update Delete (les 4 opérations de base) | `INSERT`, `SELECT`, `UPDATE`, `DELETE` |

### 🔤 D

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **DELETE** | Méthode HTTP pour supprimer | `DELETE /api/employes/5` |

### 🔤 E

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Expo** | Boîte à outils React Native | Permet de tester sur son téléphone |
| **Expo Router** | Navigation par fichiers | `app/login.tsx` → page Login |
| **Express** | Bibliothèque Node.js pour créer des serveurs | `app.get("/api/...", ...)` |

### 🔤 F

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **fetch()** | Fonction JavaScript pour faire des requêtes HTTP | `fetch("/api/login", ...)` |
| **Frontend** | La partie visible par l'utilisateur | React (web) ou React Native (mobile) |
| **Foreign Key** | Lien entre deux tables | `presences.employe_id` → `employes.id` |

### 🔤 G

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **GET** | Méthode HTTP pour lire des données | `GET /api/presences` |

### 🔤 H

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Hash** | Transforme un texte en code illisible (sens unique) | Mot de passe → `$2b$10$...` |
| **Hook** | Fonction spéciale React | `useState`, `useEffect`, `useContext` |
| **HTTP** | Protocole de communication web | `http://...`, `https://...` |

### 🔤 J

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **JOIN** | Colle deux tables SQL ensemble | `JOIN employes ON e.id = p.employe_id` |
| **JSX** | HTML écrit dans du JavaScript | `<div>{variable}</div>` |
| **JWT** | Token qui contient les infos de l'utilisateur | `jwt.sign(payload, secret)` |

### 🔤 M

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Middleware** | Filtre qui s'exécute avant le contrôleur | Vérifie le token JWT |
| **Modèle** | Requête SQL pour parler à la base | `presences.model.js` |

### 🔤 N

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Node.js** | Logiciel pour exécuter JavaScript sur un serveur | Fait tourner le backend |
| **`next()`** | Passe au middleware ou contrôleur suivant | `next()` dans verifyToken |

### 🔤 P

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **PostgreSQL** | Base de données relationnelle | Stocke les employés, présences... |
| **POST** | Méthode HTTP pour créer | `POST /api/presences/checkin` |
| **PUT** | Méthode HTTP pour modifier | `PUT /api/conges/5/approve` |
| **Pool** | Groupe de connexions à la base | `pool.query("SELECT...")` |
| **Props** | Données passées à un composant | `<Button color="red" />` |
| **Proxy** | Redirige les appels API (évite le CORS) | Configuré dans `vite.config.js` |

### 🔤 R

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **React** | Bibliothèque pour créer des interfaces utilisateur | Notre app web |
| **React Native** | Version mobile de React | Notre app mobile |
| **`req`** | La requête (ce que le client envoie) | `req.body.email` |
| **`res`** | La réponse (ce que le serveur renvoie) | `res.json({data: ...})` |
| **Route** | URL qui déclenche une action | `GET /api/presences` |

### 🔤 S

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **SPA** | Single Page Application | Une seule page HTML, React fait le reste |
| **SQL** | Langage pour parler aux bases de données | `SELECT * FROM employes` |
| **Status code** | Code qui dit si la requête a réussi | 200 = OK, 400 = Erreur, 401 = Non autorisé |
| **Supabase** | Service d'hébergement PostgreSQL | Notre base de données en ligne |

### 🔤 T

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Table** | Tableau dans la base de données | Table `employes`, `presences` |
| **Token** | Pass numérique qui prouve l'identité | Stocké dans localStorage ou AsyncStorage |
| **TypeScript** | JavaScript avec des types | `const nom: string = "Jean"` |

### 🔤 U

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **`useEffect`** | Hook qui s'exécute à un moment précis | Charger les données au montage |
| **`useRef`** | Hook pour des valeurs stables (animations) | `useRef(new Animated.Value(0))` |
| **`useState`** | Hook pour des variables qui changent | `const [nom, setNom] = useState("")` |

### 🔤 V

| Mot | C'est quoi ? | 💡 Exemple |
|---|---|---|
| **Vite** | Outil de construction pour React | Transforme le JSX en JavaScript |

---

## 🎓 Pour aller plus loin

### Ressources recommandées

| Sujet | Ressource |
|---|---|
| Apprendre React | [react.dev](https://react.dev) |
| Apprendre React Native | [reactnative.dev](https://reactnative.dev) |
| Apprendre Node.js | [nodejs.org](https://nodejs.org) |
| Apprendre SQL | [sql.sh](https://sql.sh) |
| Documentation Expo | [docs.expo.dev](https://docs.expo.dev) |

---

---

## 📝 CHANGELOG — Dernières améliorations

### 🐛 Corrections de bugs

| # | Problème | Correctif |
|---|---|---|
| 1 | **Statut "Retard" incohérent** — Les employés étaient marqués "En retard" même sans paramétrage | Ajout d'une vérification : si `retard_apres` est 0 ou NULL, le statut est toujours "Present" |
| 2 | **Déconnexion ne fonctionnait pas** — `router.replace('/')` sans appeler `logout()` | Ajout de `await logout()` avant la redirection (paramètres + profil) |
| 3 | **Page de connexion non scrollable** — Impossible de voir le formulaire avec le clavier | Ajout de `KeyboardAvoidingView` + `ScrollView` avec `keyboardShouldPersistTaps` |
| 4 | **Présence détail affichait des données fictives** — `--:--` partout, pas de vraie donnée | Maintenant recharge les données depuis l'API via `getPresenceById()` |
| 5 | **Temps travaillé en dur** — `getWorkedTime()` renvoyait toujours "7h 59min" | Calcul réel basé sur `heure_entree` et `heure_sortie` |
| 6 | **Changement de mot de passe simulé** — Alert de succès sans appel API | Appel au vrai endpoint `/api/auth/change-password` + backend complet |

### ✨ Améliorations UI/UX

| # | Amélioration | Détail |
|---|---|---|
| 1 | **Fond jaune supprimé** | Toutes les pages (congés, demande-congé, paramètres) passent du jaune → blanc/gris clair |
| 2 | **Icônes monochromes** | Plus d'emojis dans la barre de navigation — tous remplacés par des Ionicons |
| 3 | **Date picker natif** | Au lieu de saisir les dates à la main, sélecteur natif iOS/Android |
| 4 | **Semainier** | Mini calendrier de la semaine avec points verts (présent) / gris (absent) |
| 5 | **Bonjour/Bonsoir dynamique** | Le message d'accueil change selon l'heure (6h-18h = Bonjour, 18h-6h = Bonsoir) |
| 6 | **Pointage bloqué le week-end** | Impossible de pointer le samedi/dimanche |
| 7 | **Safe area insets** | Tous les headers s'adaptent aux notches et barres système |
| 8 | **Menu congés accessible** | Liens "Mes congés" et "Demander un congé" dans le profil |

### 🔧 Backend

| # | Changement |
|---|---|
| 1 | Nouveau endpoint `POST /api/auth/change-password` (vérifie l'ancien MDP avec bcrypt) |
| 2 | Correction du statut "Retard" — désactivé si `retard_apres` n'est pas configuré |
| 3 | Bouton "Supprimer" retiré pour les RH (remplacé par Approuver/Rejeter uniquement) |

---

> ✨ **Fin de la documentation** — *Présence Coryas v1.1.0*
>

