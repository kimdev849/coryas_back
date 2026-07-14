-- ================================================================
-- 🗄️ INIT SQL — Base de données Présence Coryas
-- ================================================================
-- À exécuter DANS L'ORDRE dans l'éditeur SQL de Supabase.
-- (Dashboard Supabase → SQL Editor → Coller → Run)
-- ================================================================

-- ================================================================
-- 1. TABLE : departements
-- ================================================================
CREATE TABLE IF NOT EXISTS departements (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 2. TABLE : roles
-- ================================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 3. TABLE : employes
-- ================================================================
CREATE TABLE IF NOT EXISTS employes (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    sexe VARCHAR(10),
    telephone VARCHAR(30),
    date_naissance DATE,
    date_embauche DATE DEFAULT CURRENT_DATE,
    departement_id INTEGER REFERENCES departements(id) ON DELETE SET NULL,
    statut VARCHAR(20) DEFAULT 'Actif',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 4. TABLE : utilisateurs
-- ================================================================
CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER UNIQUE NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    derniere_connexion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 5. TABLE : presences
-- ================================================================
-- Note : La contrainte UNIQUE (employe_id, date_presence) empêche
--        le double pointage dans la même journée.
-- ================================================================
CREATE TABLE IF NOT EXISTS presences (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    date_presence DATE NOT NULL DEFAULT CURRENT_DATE,
    heure_entree TIME WITHOUT TIME ZONE,
    heure_sortie TIME WITHOUT TIME ZONE,
    statut VARCHAR(30),
    remarque TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_employe_date UNIQUE (employe_id, date_presence)
);

-- ================================================================
-- 6. TABLE : conges
-- ================================================================
CREATE TABLE IF NOT EXISTS conges (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    motif VARCHAR(200) NOT NULL,
    statut VARCHAR(30) DEFAULT 'En attente',
    commentaire_rh TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 7. TABLE : parametres (une seule ligne)
-- ================================================================
CREATE TABLE IF NOT EXISTS parametres (
    id SERIAL PRIMARY KEY,
    nom_entreprise VARCHAR(200) DEFAULT 'Coryas',
    heure_ouverture TIME WITHOUT TIME ZONE DEFAULT '08:00',
    heure_fermeture TIME WITHOUT TIME ZONE DEFAULT '17:00',
    retard_apres INTEGER DEFAULT 0,
    depart_anticipe INTEGER DEFAULT 0,
    duree_pause INTEGER DEFAULT 0,
    email_entreprise VARCHAR(255),
    telephone VARCHAR(30),
    adresse TEXT,
    theme VARCHAR(30) DEFAULT 'coryas',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 📦 DONNÉES DE BASE (SEED)
-- ================================================================

-- Départements
INSERT INTO departements (nom) VALUES
    ('Développement'),
    ('Comptabilité'),
    ('Ressources Humaines'),
    ('Direction'),
    ('Marketing')
ON CONFLICT DO NOTHING;

-- Rôles
INSERT INTO roles (id, nom) VALUES
    (1, 'Administrateur'),
    (2, 'RH'),
    (3, 'Employé'),
    (4, 'Directeur')
ON CONFLICT DO NOTHING;

-- Employés
INSERT INTO employes (matricule, nom, prenom, sexe, telephone, departement_id, statut) VALUES
    ('EMP001', 'Admin', 'Super', 'M', '+225 01 02 03 04', 1, 'Actif'),
    ('EMP002', 'Dupont', 'Jean', 'M', '+225 05 06 07 08', 2, 'Actif'),
    ('EMP003', 'Martin', 'Sophie', 'F', '+225 09 10 11 12', 3, 'Actif')
ON CONFLICT DO NOTHING;

-- Utilisateurs (mot de passe hashé avec bcrypt)
-- Mot de passe pour tous : admin123
-- Hash généré avec bcrypt (commande : node -e "require('bcrypt').hash('admin123', 10).then(console.log)")
INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif) VALUES
    (1, 1, 'admin@coryas.com',  '$2b$10$Nky8LrZN6sn4JFFLe4/rAO1Ax/ndVHQ1vUxLLo2Cu1WNP/vNXEm8W', true),
    (2, 3, 'jean@coryas.com',   '$2b$10$Nky8LrZN6sn4JFFLe4/rAO1Ax/ndVHQ1vUxLLo2Cu1WNP/vNXEm8W', true),
    (3, 2, 'sophie@coryas.com', '$2b$10$Nky8LrZN6sn4JFFLe4/rAO1Ax/ndVHQ1vUxLLo2Cu1WNP/vNXEm8W', true)
ON CONFLICT DO NOTHING;

-- Paramètres de l'entreprise
INSERT INTO parametres (nom_entreprise, heure_ouverture, heure_fermeture, email_contact, telephone_contact)
VALUES ('Coryas', '09:00', '17:00', 'contact@coryas.com', '+225 00 00 00 00')
ON CONFLICT DO NOTHING;

-- ================================================================
-- ✅ FIN — Toutes les tables et données sont créées !
-- ================================================================
