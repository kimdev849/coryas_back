# 📊 Gestion des Présences — Application RH Complète

> **Solution de gestion des ressources humaines** — Pointage, Congés, Employés, Statistiques
> 🌐 Web + 📱 Mobile + 🖥️ API

---

## 📋 Table des matières

1. [🎯 Aperçu Général](#-aperçu-général)
2. [🚀 Démarrage Rapide](#-démarrage-rapide)
3. [🌐 Application Web — Toutes les Fonctionnalités](#-application-web--toutes-les-fonctionnalités)
4. [📱 Application Mobile — Toutes les Fonctionnalités](#-application-mobile--toutes-les-fonctionnalités)
5. [🖥️ API Backend — Tous les Endpoints](#️-api-backend--tous-les-endpoints)
6. [🗄️ Base de Données — Toutes les Tables](#️-base-de-données--toutes-les-tables)
7. [👥 Rôles et Permissions](#-rôles-et-permissions)
8. [🔐 Sécurité](#-sécurité)
9. [🛠️ Technologies Utilisées](#️-technologies-utilisées)

---

## 🎯 Aperçu Général

**Gestion des Présences** est une application RH complète conçue pour **toutes les entreprises**, quelle que soit leur taille ou leur secteur. Elle remplace les fiches papier, les tableaux Excel et les processus manuels par une solution numérique moderne.

### 💎 Points forts

| Caractéristique | Description |
|---|---|
| **Multi-entreprise** | Paramétrage complet pour s'adapter à n'importe quelle société |
| **Multi-sites** | Gérez plusieurs agences, bureaux ou filiales |
| **Multi-équipes** | Organisez les employés par équipes et départements |
| **Web + Mobile** | Accessible depuis un navigateur ET une application mobile |
| **Temps réel** | Les données sont synchronisées en temps réel |
| **Cloud** | Hébergé sur Render + Supabase, accessible partout |

### 👥 Les 4 rôles

| Rôle | Accès | Description |
|---|---|---|
| 👑 **Administrateur** | Total | Peut TOUT faire (gérer, configurer, supprimer) |
| 📋 **RH** | Élevé | Gère les employés, congés, présences (sauf configuration système) |
| 👔 **Directeur** | Supervision | Voir les stats, approuver des congés |
| 🧑‍💼 **Employé** | Personnel | Pointer, voir ses données, demander des congés |

---

## 🚀 Démarrage Rapide

```bash
# 1. Cloner
git clone https://github.com/kimdev849/coryas_back.git

# 2. Installer le backend
cd back && npm install

# 3. Configurer .env dans back/
# DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET...

# 4. Lancer le backend
npm run dev    # → http://localhost:3000

# 5. Installer et lancer le frontend
cd ../front && npm install && npm run dev  # → http://localhost:5173
```

### Identifiants de test

| Rôle | Email | Mot de passe |
|---|---|---|
| 👑 Admin | admin@coryas.com | admin123 |
| 📋 RH | sophie@coryas.com | admin123 |
| 🧑‍💼 Employé | jean@coryas.com | admin123 |

---

## 🌐 Application Web — Toutes les Fonctionnalités

L'application web (React + Vite) contient **13 pages** réparties selon les rôles.

### 🔐 Page de Connexion (`/`)

| Fonctionnalité | Détail |
|---|---|
| Authentification sécurisée | Email + mot de passe + token JWT |
| Gestion des erreurs | Messages clairs (réseau, identifiants, etc.) |
| Interface premium | Background animé, glassmorphism, responsive |

### 📊 Dashboard (`/dashboard`)

> **Accessible à :** Tous les utilisateurs connectés

| Fonctionnalité | Admin/RH | Employé |
|---|---|---|
| Statistiques du jour | ✅ Total employés, présents, absents, retards, taux présence | ✅ Son statut (présent/absent), heure d'arrivée |
| Congés en attente | ✅ Nombre de demandes à traiter | ❌ |
| Taux de présence | ✅ Pourcentage global du jour | ❌ |
| Actions rapides | ✅ Liens vers les pages d'administration | ✅ Pointer / Demander un congé |
| Bouton actualiser | ✅ Recharger les données en direct | ❌ |

### 👥 Gestion des Employés (`/employes`)

> **Accessible à :** Admin, RH, Directeur

| Fonctionnalité | Détail |
|---|---|
| **Liste des employés** | Tableau avec toutes les informations |
| **Ajouter un employé** | Formulaire complet avec création automatique du compte utilisateur |
| **Modifier un employé** | Tous les champs éditables |
| **Désactiver un employé** | Désactive le compte sans perdre les données |
| **Voir les stats** | Statistiques détaillées de l'employé (présences, congés, etc.) |
| **Génération automatique** | Matricule auto-incrémenté (EMP001, EMP002...) |

**Champs d'un employé :**
- Matricule, Nom, Prénom, Sexe, Téléphone
- Date de naissance, Date d'embauche
- 📄 **Type de contrat** (CDI, CDD, Stage, Freelance)
- 📄 **Date fin de contrat**
- 📄 **Période d'essai** (jours + date fin)
- 📄 **Poste occupé, Salaire**
- 🏢 **Département, Site, Équipe**
- 👤 **Responsable hiérarchique**
- 📧 Email du compte, Rôle, Statut (Actif/Inactif)

### 📋 Détail Employé (`/employes/:id`)

> **Accessible à :** Admin, RH, Directeur

| Statistique | Période |
|---|---|
| Jours travaillés | Mois + Année |
| Retards | Mois + Année |
| Oublis de pointage | Mois |
| Taux de présence | Mois |
| Jours ouvrés | Mois |
| Congés pris / en attente / refusés | Année |
| 10 dernières présences | Chronologique |

### ⏱️ Pointage (`/mon-pointage`)

> **Accessible à :** Tous les employés

| Fonctionnalité | Détail |
|---|---|
| **Statut en direct** | Présent / Absent / Départ enregistré |
| **Bouton circulaire** | Grand cercle doré pour pointer arrivée/départ |
| **Validation** | Temps minimum 3h, pas de départ avant fermeture |
| **Notifications** | Confirmation à chaque action |
| **Timeline du jour** | Arrivée et départ affichés |

### 📅 Présences (`/presences`)

> **Accessible à :** Admin, RH, Directeur

| Fonctionnalité | Détail |
|---|---|
| **Filtres puissants** | Par employé, dates, statut |
| **Filtre période** | Aujourd'hui, Cette semaine, Ce mois |
| **Rattrapage** | Corriger un oubli de pointage (admin) |
| **Tableau complet** | Date, employé, arrivée, départ, statut, durée |
| **Validation en attente** | Section dédiée pour les présences à valider |
| **Badges statut** | Présent (vert), Retard (jaune), En cours (bleu) |

### 🏖️ Congés (`/conges`)

> **Accessible à :** Tous les utilisateurs

| Fonctionnalité | Employé | Admin/RH |
|---|---|---|
| **Nouveau congé** | ✅ Pour lui-même | ✅ Pour n'importe quel employé |
| **Types de congés** | ✅ Liste déroulante avec les types configurés | ✅ |
| **Filtres** | ❌ | ✅ Par statut (En attente, Approuvé, Rejeté) |
| **Approuver/Rejeter** | ❌ | ✅ Avec commentaire |
| **Commentaire RH** | ✅ Visible si rejeté/approuvé | ✅ |
| **Notifications** | ✅ Reçoit une notification | ❌ |

### 🔢 Types de Congés (`/types-conges`)

> **Accessible à :** Admin, RH

| Fonctionnalité | Détail |
|---|---|
| **Configurer les types** | Créer, modifier, activer/désactiver |
| **Types par défaut** | Annuel, Maladie, Maternité, Paternité, Mariage, etc. |
| **Jours max** | Limite annuelle (ex: 30 jours pour annuel) |
| **Payé ou non** | Détermine si le congé est rémunéré |
| **Couleur** | Pour l'affichage calendrier |
| **Soldes par employé** | Total / Pris / Restants |
| **Alerte** | Quand un employé a consommé >80% de ses jours |

### ⏰ Heures Supplémentaires (`/heures-sup`)

> **Accessible à :** Tous les utilisateurs
> **Workflow :** 👤 Employé soumet → 👑 Admin/RH approuve ou refuse

| Fonctionnalité | Employé | Admin/RH |
|---|---|---|
| **Soumettre une demande** | ✅ Pour lui-même | ✅ Pour n'importe quel employé |
| **Date + Nb heures** | ✅ | ✅ |
| **Motif** | ✅ Obligatoire | ✅ |
| **Taux de majoration** | ✅ Configurable (ex: x1.5) | ✅ |
| **Approuver/Rejeter** | ❌ | ✅ Avec commentaire |
| **Notifications** | ✅ Reçoit une notification | ❌ |

### 🏢 Sites (`/sites`)

> **Accessible à :** Admin uniquement

| Fonctionnalité | Détail |
|---|---|
| **Multi-agences** | Créer plusieurs sites/bureaux |
| **Informations** | Nom, code, adresse, ville, pays, téléphone, email |
| **Horaires personnalisés** | Heure ouverture/fermeture par site |
| **Statistiques** | Nombre d'employés et d'équipes par site |

### 👥 Équipes (`/equipes`)

> **Accessible à :** Admin uniquement

| Fonctionnalité | Détail |
|---|---|
| **Créer des équipes** | Nom, code |
| **Lier au département** | Chaque équipe peut être dans un département |
| **Lier au site** | Chaque équipe peut être sur un site |
| **Responsable** | Désigner un responsable d'équipe |
| **Statistiques** | Nombre d'employés par équipe |

### 📄 Types de Contrats (`/contrats`)

> **Accessible à :** Admin, RH

| Fonctionnalité | Détail |
|---|---|
| **Configurer les contrats** | CDI, CDD, Stage, Freelance, Alternance, Intérim |
| **Période d'essai** | Durée par défaut en jours |
| **Actif/Inactif** | Activer ou désactiver un type |

### 📝 Journal d'Audit (`/audit`)

> **Accessible à :** Admin, RH, Directeur

| Fonctionnalité | Détail |
|---|---|
| **Traçabilité complète** | Toutes les actions (CREATE, UPDATE, DELETE) |
| **Filtres** | Par table, par action |
| **Statistiques** | Total actions, aujourd'hui, tables suivies, utilisateurs actifs |
| **Détails** | Anciennes et nouvelles valeurs |
| **Qui a fait quoi** | Nom de l'utilisateur, date, IP |

### 📊 Statistiques de Ponctualité (`/stats`)

> **Accessible à :** Admin, RH, Directeur

| Fonctionnalité | Détail |
|---|---|
| **Périodes** | Semaine, Mois, Année |
| **Top 10 ponctuels** | Employés qui arrivent le plus à l'heure |
| **Top 10 retards** | Employés les plus en retard |
| **Stats globales** | Taux de ponctualité global |
| **Stats par jour** | Évolution jour par jour |
| **Barres de progression** | Visualisation des performances |

### ⚙️ Configuration (`/configuration`)

> **Accessible à :** Admin, RH

| Fonctionnalité | Détail |
|---|---|
| **Informations entreprise** | Nom, email, téléphone, adresse |
| **Horaires de travail** | Ouverture, fermeture |
| **Seuil de retard** | Minutes après ouverture considéré comme retard |
| **Départ anticipé** | Minutes avant fermeture autorisées |
| **Durée de pause** | Temps de pause en minutes |
| **Thème** | Choix de la couleur principale de l'interface |
| **Sauvegarde** | Enregistrement en base de données |

### 👤 Profil (`/profil`)

> **Accessible à :** Tous les utilisateurs

| Fonctionnalité | Détail |
|---|---|
| **Carte d'identité** | Avatar, nom, email, rôle |
| **Changer mot de passe** | Ancien + Nouveau mot de passe |
| **Déconnexion** | Bouton de déconnexion |

### 📤 Export CSV

> **Accessible à :** Admin, RH, Directeur

Les pages Présences, Congés, Employés et Heures sup permettent de **télécharger les données en CSV** (ouvrable dans Excel).

---

## 📱 Application Mobile — Toutes les Fonctionnalités

L'application mobile (React Native + Expo) contient **9 écrans** pour les employés en déplacement.

### 🎬 Splash Screen (Écran d'accueil)

| Fonctionnalité | Détail |
|---|---|
| **Animation logo** | Apparition avec effet ressort (spring) |
| **Spinner** | Animation de chargement |
| **Vérification auto** | Token JWT → redirection automatique |
| **Temporisation** | 2,5 secondes d'animation |

### 🔐 Connexion (`Login`)

| Fonctionnalité | Détail |
|---|---|
| **Formulaire** | Email + mot de passe |
| **Validation** | Champs obligatoires |
| **Gestion d'erreurs** | Réseau, identifiants incorrects |
| **Redirection** | Vers l'accueil ou reste sur login |
| **ScrollView** | Adaptation au clavier mobile |

### 🏠 Accueil (`Accueil`)

| Fonctionnalité | Détail |
|---|---|
| **Message personnalisé** | Bonjour/Bonsoir selon l'heure |
| **Date du jour** | Format français complet |
| **Statut en direct** | Présent (vert) / Absent (gris) |
| **Heure d'arrivée** | Affichée si présent |
| **Temps travaillé** | Calculé en temps réel (hh:min) |
| **Timeline** | Arrivée + Départ avec points colorés |
| **Bouton de pointage** | Accès rapide à la page pointer |
| **Notifications non lues** | Badge avec le compte |

### ⏱️ Pointage (`Pointer`)

| Fonctionnalité | Détail |
|---|---|
| **Grand bouton** | Cercle doré avec texte |
| **Animation** | Scale au clic |
| **Validation** | Temps minimum 3h, pas avant fermeture |
| **Historique** | Derniers pointages affichés |
| **Statut en direct** | Arrivé / En attente de départ |
| **Message de confirmation** | ✅ Pointage enregistré |

### 📅 Calendrier des Présences (`Présences`)

| Fonctionnalité | Détail |
|---|---|
| **Vue mensuelle** | Calendrier complet du mois |
| **Code couleur** | Vert (présent), Jaune (retard), Rouge (absent) |
| **Statistiques du mois** | Présents, Retards, Absents |
| **Navigation** | Mois précédent/suivant |
| **Gestion fuseau** | Corrigé pour le fuseau Afrique |

### 🏖️ Congés (`Congés`)

| Fonctionnalité | Détail |
|---|---|
| **Mes demandes** | Liste de mes congés |
| **Filtres** | En attente / Approuvés / Passés |
| **Créer une demande** | Formulaire complet |
| **Dates** | Date picker natif |
| **Motif** | Menu déroulant avec types de congés |
| **Commentaire** | Optionnel |
| **Compteur de jours** | Calcul automatique |

### 📋 Absences / Notifications (`Absences`)

| Fonctionnalité | Détail |
|---|---|
| **Notifications** | Liste des notifications |
| **Types** | Info, Succès, Avertissement |
| **Lecture** | Marquer comme lu |
| **Indicateur** | Badge non lues sur l'onglet |

### 👤 Profil (`Profil`)

| Fonctionnalité | Détail |
|---|---|
| **Carte d'identité** | Photo, nom, email, matricule |
| **Informations** | Département, rôle, date d'embauche |
| **Menu** | Liens vers les congés, pointage |
| **Déconnexion** | Bouton avec confirmation |
| **Thème** | Couleur dynamique |

### ⚙️ Paramètres (`Paramètres`)

| Fonctionnalité | Détail |
|---|---|
| **Changer mot de passe** | Ancien + Nouveau |
| **Déconnexion** | Avec confirmation |
| **Actions rapides** | Liens vers les fonctionnalités |

---

## 🖥️ API Backend — Tous les Endpoints

L'API RESTful compte **35+ endpoints** répartis en 11 groupes.

### 🔐 Authentification (`/api/auth`)

| Méthode | URL | Action | Rôle requis |
|---|---|---|---|
| `POST` | `/api/auth/login` | Connexion | Public |
| `POST` | `/api/auth/register` | Créer un compte | Admin/RH |
| `POST` | `/api/auth/logout` | Déconnexion | Authentifié |
| `POST` | `/api/auth/change-password` | Changer MDP | Authentifié |

### ⏱️ Présences (`/api/presences`)

| Méthode | URL | Action | Rôle requis |
|---|---|---|---|
| `GET` | `/api/presences` | Lister (filtré) | Authentifié |
| `GET` | `/api/presences/active` | Présence en cours | Authentifié |
| `GET` | `/api/presences/stats/aujourdhui` | Stats du jour | Admin/RH/Directeur |
| `GET` | `/api/presences/:id` | Détail | Authentifié |
| `POST` | `/api/presences/checkin` | Pointer arrivée | Authentifié |
| `POST` | `/api/presences/checkout` | Pointer départ | Authentifié |
| `PUT` | `/api/presences/:id/rattrapage` | Corriger départ | Admin/RH |

### 🏖️ Congés (`/api/conges`)

| Méthode | URL | Action | Rôle requis |
|---|---|---|---|
| `GET` | `/api/conges` | Lister | Authentifié |
| `POST` | `/api/conges` | Créer | Authentifié |
| `GET` | `/api/conges/:id` | Détail | Authentifié |
| `PUT` | `/api/conges/:id/approve` | Approuver | Admin/RH/Directeur |
| `PUT` | `/api/conges/:id/reject` | Rejeter | Admin/RH/Directeur |
| `DELETE` | `/api/conges/:id` | Supprimer | Admin/RH/Directeur |

### 👥 Employés (`/api/employes`)

| Méthode | URL | Action | Rôle requis |
|---|---|---|---|
| `GET` | `/api/employes` | Lister | Admin/RH/Directeur |
| `POST` | `/api/employes` | Créer | Admin/RH/Directeur |
| `GET` | `/api/employes/:id` | Détail | Admin/RH/Directeur |
| `PUT` | `/api/employes/:id` | Modifier | Admin/RH/Directeur |
| `PUT` | `/api/employes/:id/deactivate` | Désactiver | Admin/RH/Directeur |
| `GET` | `/api/employes/:id/stats` | Statistiques | Admin/RH/Directeur |

### 🏢 Départements (`/api/departements`)

| Méthode | URL | Action |
|---|---|---|
| `GET` | `/api/departements` | Lister |

### 📊 Dashboard (`/api/dashboard`)

| Méthode | URL | Action |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Statistiques générales |

### ⚙️ Paramètres (`/api/parametres`)

| Méthode | URL | Action | Rôle requis |
|---|---|---|---|
| `GET` | `/api/parametres` | Voir | Authentifié |
| `PUT` | `/api/parametres` | Modifier | Admin/RH/Directeur |

### 🔔 Notifications (`/api/notifications`)

| Méthode | URL | Action |
|---|---|---|
| `GET` | `/api/notifications` | Mes notifications |
| `GET` | `/api/notifications/non-lues` | Compter non lues |
| `PUT` | `/api/notifications/:id/lire` | Marquer lue |
| `PUT` | `/api/notifications/tout-lire` | Tout marquer lu |

### 📈 Statistiques (`/api/stats`)

| Méthode | URL | Action |
|---|---|---|
| `GET` | `/api/stats/punctualite` | Stats de ponctualité |

### 🆕 Types de Congés (`/api/conges-types`)

| Méthode | URL | Action | Rôle requis |
|---|---|---|---|
| `GET` | `/api/conges-types/types` | Lister les types | Authentifié |
| `POST` | `/api/conges-types/types` | Créer un type | Admin/RH |
| `PUT` | `/api/conges-types/types/:id` | Modifier | Admin/RH |
| `GET` | `/api/conges-types/soldes` | Tous les soldes | Admin/RH/Directeur |
| `GET` | `/api/conges-types/soldes/:employe_id` | Soldes d'un employé | Authentifié |
| `POST` | `/api/conges-types/soldes` | Créer un solde | Admin/RH |
| `PUT` | `/api/conges-types/soldes/:id` | Modifier un solde | Admin/RH |

### 🆕 Autres endpoints

| Groupe | Méthode | URL | Action |
|---|---|---|---|
| Contrats | `GET/POST/PUT` | `/api/contrats-types` | CRUD types de contrat |
| Sites | `GET/POST/PUT` | `/api/sites` | CRUD sites/agences |
| Équipes | `GET/POST/PUT` | `/api/equipes` | CRUD équipes |
| Heures sup | `GET/POST/PUT/DELETE` | `/api/heures-sup` | CRUD + approuver/rejeter |
| Audit | `GET` | `/api/audit` | Journal d'audit |
| Export | `GET` | `/api/export/presences` | CSV présences |
| Export | `GET` | `/api/export/conges` | CSV congés |
| Export | `GET` | `/api/export/employes` | CSV employés |
| Export | `GET` | `/api/export/heures-sup` | CSV heures sup |

---

## 🗄️ Base de Données — Toutes les Tables

La base PostgreSQL contient **15 tables** :

| Table | Description | Relations |
|---|---|---|
| `employes` | Employés (informations personnelles + contrat) | → departements, sites, equipes, type_contrat |
| `utilisateurs` | Comptes de connexion | → employes, roles |
| `roles` | Rôles (Admin, RH, Employé, Directeur) | → utilisateurs |
| `departements` | Départements | → employes, equipes |
| `presences` | Pointages (arrivée/départ) | → employes |
| `conges` | Demandes de congés | → employes, type_conge |
| `type_conge` | Types de congés configurables | → conges, solde_conge |
| `solde_conge` | Soldes de congés par employé/année | → employes, type_conge |
| `type_contrat` | Types de contrats | → employes |
| `sites` | Sites/agences | → employes, equipes |
| `equipes` | Équipes | → employes, departements, sites |
| `heures_sup` | Heures supplémentaires | → employes |
| `notifications` | Notifications | → employes |
| `parametres` | Configuration entreprise | — |
| `audit_log` | Journal d'audit | → employes |

---

## 👥 Rôles et Permissions — Détail complet

| Action | 👑 Admin | 📋 RH | 👔 Directeur | 🧑‍💼 Employé |
|---|---|---|---|---|
| Se connecter | ✅ | ✅ | ✅ | ✅ |
| Voir Dashboard | ✅ | ✅ | ✅ | ✅ |
| Voir son profil | ✅ | ✅ | ✅ | ✅ |
| Changer son mot de passe | ✅ | ✅ | ✅ | ✅ |
| Pointer arrivée/départ | ❌ (RH aussi pointe) | ✅ | ❌ | ✅ |
| Voir ses présences | ✅ | ✅ | ✅ | ✅ |
| Demander un congé | ✅ | ✅ | ✅ | ✅ |
| Voir tous les employés | ✅ | ✅ | ✅ | ❌ |
| Ajouter/Modifier employé | ✅ | ✅ | ❌ | ❌ |
| Désactiver employé | ✅ | ✅ | ❌ | ❌ |
| Voir détails + stats employé | ✅ | ✅ | ✅ | ❌ |
| Voir toutes les présences | ✅ | ✅ | ✅ | ❌ |
| Rattrapage pointage | ✅ | ✅ | ❌ | ❌ |
| Approuver/Rejeter congés | ✅ | ✅ | ✅ | ❌ |
| Configurer types de congés | ✅ | ✅ | ❌ | ❌ |
| Gérer contrats | ✅ | ✅ | ❌ | ❌ |
| Gérer sites | ✅ | ❌ | ❌ | ❌ |
| Gérer équipes | ✅ | ❌ | ❌ | ❌ |
| Approuver/Rejeter heures sup | ✅ | ✅ | ❌ | ❌ |
| Voir journal d'audit | ✅ | ✅ | ✅ | ❌ |
| Exporter CSV | ✅ | ✅ | ✅ | ❌ |
| Modifier configuration | ✅ | ✅ | ❌ | ❌ |
| Supprimer définitivement | ✅ | ❌ | ❌ | ❌ |

---

## 🔐 Sécurité

- **Mots de passe hashés** avec bcrypt (10 rounds)
- **Authentification JWT** avec expiration 24h
- **Protection CSRF** via tokens Bearer
- **Validation des entrées** côté serveur
- **Requêtes paramétrées SQL** (prévention injections)
- **Journal d'audit** de toutes les modifications
- **Rôles et permissions** stricts
- **Désactivation** des comptes (pas de suppression brutale)

---

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** — Serveur JavaScript
- **Express** — Framework HTTP
- **PostgreSQL** — Base de données
- **Supabase** — Hébergement BDD
- **JWT** — Authentification
- **bcrypt** — Hash des mots de passe

### Frontend Web
- **React 19** — Interface utilisateur
- **Vite 8** — Build tool
- **React Router** — Navigation
- **Axios** — Requêtes HTTP
- **CSS natif** — Design system maison

### Application Mobile
- **React Native** — App mobile native
- **Expo** — Boîte à outils
- **Expo Router** — Navigation par fichiers
- **AsyncStorage** — Stockage local

### Déploiement
- **Render** — Hébergement backend + frontend
- **GitHub** — Versionnement

---

> 📅 **Dernière mise à jour :** Juillet 2026
> 
> 👨‍💻 **Développé par :** Kimdev849
