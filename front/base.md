#  Modèle de données — Présence Coryas

## 📖 Présentation

Présence Coryas est une application web permettant de gérer les présences des employés d'une entreprise.

Le modèle de données repose sur cinq entités principales :

- Employé
- Rôle
- Service
- Présence
- Configuration

Chaque entité répond à un besoin métier précis.

---

# 1. Utilisateurs ( Employés)

## Description

Représente une personne travaillant dans l'entreprise.

Chaque employé possède un compte lui permettant de se connecter à l'application.

Le Responsable RH est également un employé, mais possède simplement un rôle différent.

## Attributs

| Champ | Type | Description |
|--------|------|-------------|
| id | UUID | Identifiant unique |
| matricule | VARCHAR | Numéro unique de l'employé |
| nom | VARCHAR | Nom |
| prenom | VARCHAR | Prénom |
| email | VARCHAR | Adresse e-mail |
| telephone | VARCHAR | Numéro de téléphone |
| mot_de_passe | VARCHAR | Mot de passe chiffré |
| role_id | UUID | Rôle de l'employé |
| service_id | UUID | Service d'appartenance |
| actif | BOOLEAN | Employé actif ou non |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

## Pourquoi cette table ?

Cette table centralise toutes les informations concernant les employés.

Tous les utilisateurs de l'application sont des employés.

Le Responsable RH est simplement un employé possédant le rôle **RH**.

---

# 2. Rôle

## Description

Détermine les permissions d'un employé.

## Attributs

| Champ | Type | Description |
|--------|------|-------------|
| id | UUID | Identifiant unique |
| nom | VARCHAR | Nom du rôle |
| description | TEXT | Description du rôle |

## Données initiales

| Nom |
|------|
| RH |
| EMPLOYE |

## Pourquoi cette table ?

Elle évite d'écrire directement le rôle dans la table Employé.

Elle facilite l'ajout de nouveaux rôles dans le futur.

Exemple :

- RH
- Employé
- Directeur
- Administrateur

---

# 3. Service

## Description

Représente un département de l'entreprise.

## Attributs

| Champ | Type | Description |
|--------|------|-------------|
| id | UUID | Identifiant unique |
| nom | VARCHAR | Nom du service |
| description | TEXT | Description |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

## Exemples

- Ressources Humaines
- Informatique
- Comptabilité
- Finance
- Marketing
- Direction

## Pourquoi cette table ?

Elle permet de regrouper les employés par département.

Un service peut contenir plusieurs employés.

---

# 4. Présence

## Description

Représente une journée de travail d'un employé.

Une présence est créée lors du pointage d'arrivée.

Elle est ensuite mise à jour lorsque l'employé pointe son départ.

## Attributs

| Champ | Type | Description |
|--------|------|-------------|
| id | UUID | Identifiant unique |
| employe_id | UUID | Employé concerné |
| date | DATE | Date de présence |
| heure_arrivee | TIME | Heure d'arrivée |
| heure_depart | TIME | Heure de départ |
| statut | VARCHAR | Présent, Retard, Absent, À corriger, En cours |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

## Pourquoi cette table ?

Chaque employé possède plusieurs journées de présence.

Une présence correspond toujours à une seule journée.

---

# 5. Configuration

## Description

Contient les paramètres généraux de l'entreprise.

Ces paramètres sont utilisés par le système pour calculer automatiquement les retards et appliquer les règles métier.

## Attributs

| Champ | Type | Description |
|--------|------|-------------|
| id | UUID | Identifiant unique |
| heure_debut | TIME | Heure officielle de début |
| heure_fin | TIME | Heure officielle de fin |
| tolerance_retard | INTEGER | Tolérance avant retard (en minutes) |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

## Pourquoi cette table ?

Elle permet au Responsable RH de modifier les horaires sans modifier le code de l'application.

---

# 🔗 Relations entre les tables

## Rôle → Employé

Un rôle peut être attribué à plusieurs employés.

```text
Rôle (1)
    │
    └──────────────< Employé (N)
```

---

## Service → Employé

Un service peut contenir plusieurs employés.

```text
Service (1)
      │
      └──────────────< Employé (N)
```

---

## Employé → Présence

Un employé possède plusieurs présences.

```text
Employé (1)
      │
      └──────────────< Présence (N)
```

---

# 📊 Schéma global

```text
                    Role
                      │
                (1)   │   (N)
                      │
                      ▼
                  Employe
                  /      \
             (N) /        \ (N)
                ▼          ▼
           Service      Presence

                  Configuration
                        │
                        ▼
         Paramètres globaux du système
```

---

# 📌 Règles métier

- Un employé possède un seul rôle.
- Un rôle peut être attribué à plusieurs employés.
- Un employé appartient à un seul service.
- Un service peut contenir plusieurs employés.
- Un employé peut avoir plusieurs présences.
- Une présence représente une seule journée de travail.
- Une présence est créée lors du pointage d'arrivée.
- Le pointage de départ complète la présence existante.
- Les retards sont calculés automatiquement selon les paramètres définis dans la configuration.
- Une présence peut avoir les statuts : **En cours**, **Présent**, **Retard**, **Absent** ou **À corriger**.
- Le Responsable RH peut corriger une présence en cas d'oubli ou d'erreur.

---

# 🚀 Évolutions possibles

Le modèle est conçu pour être évolutif.

Il sera possible d'ajouter facilement :

- des congés ;
- des jours fériés ;
- plusieurs sites de travail ;
- des notifications automatiques.