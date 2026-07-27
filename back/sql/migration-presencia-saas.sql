-- ================================================================
-- 🚀 PRÉSENCIA SAAS — Migration complète multi-entreprise
-- ================================================================
-- Ajoute le support multi-entreprise avec :
--   1. Table entreprises (chaque client)
--   2. Table plans (offres d'abonnement)
--   3. Table abonnements (liens entreprises ↔ plans)
--   4. Colonne entreprise_id sur toutes les tables existantes
--   5. Anti-triche : GPS + photo au pointage
--   6. Super admin Présencia
-- ================================================================

-- ================================================================
-- 1. TABLE : plans (offres d'abonnement)
-- ================================================================
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    prix_par_employe NUMERIC(10,2) DEFAULT 0,
    max_employes INTEGER, -- NULL = illimité
    fonctionnalites JSONB DEFAULT '[]',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 2. TABLE : entreprises (clients Présencia)
-- ================================================================
CREATE TABLE IF NOT EXISTS entreprises (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(30),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Congo',
    secteur VARCHAR(100),
    logo_url TEXT,
    plan_id INTEGER REFERENCES plans(id),
    nb_employes_max INTEGER DEFAULT 10,
    actif BOOLEAN DEFAULT FALSE, -- FALSE = en attente d'activation
    date_activation TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 3. TABLE : abonnements
-- ================================================================
CREATE TABLE IF NOT EXISTS abonnements (
    id SERIAL PRIMARY KEY,
    entreprise_id INTEGER NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    date_debut DATE NOT NULL DEFAULT CURRENT_DATE,
    date_fin DATE,
    statut VARCHAR(30) DEFAULT 'Actif', -- Actif, Expire, Suspendu
    renouvellement_auto BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 4. TABLE : demandes_inscription (pour le formulaire public)
-- ================================================================
CREATE TABLE IF NOT EXISTS demandes_inscription (
    id SERIAL PRIMARY KEY,
    nom_entreprise VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(30),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Congo',
    message TEXT,
    plan_souhaite VARCHAR(50) DEFAULT 'Pro',
    statut VARCHAR(30) DEFAULT 'En attente', -- En attente, Contacte, Accepte, Refuse
    traite_par INTEGER REFERENCES utilisateurs(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 5. AJOUT : Super Admin dans les rôles
-- ================================================================
INSERT INTO roles (id, nom) VALUES (5, 'SuperAdmin')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 6. AJOUT : colonne entreprise_id dans toutes les tables
-- ================================================================

-- employes
ALTER TABLE employes ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);
ALTER TABLE employes ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- utilisateurs
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);

-- departements
ALTER TABLE departements ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);
ALTER TABLE departements ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- sites
ALTER TABLE sites ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS rayon_gps INTEGER DEFAULT 100; -- mètres pour le géofencing

-- equipes
ALTER TABLE equipes ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);

-- presences
ALTER TABLE presences ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);
ALTER TABLE presences ADD COLUMN IF NOT EXISTS photo_arrivee TEXT; -- URL de la photo selfie
ALTER TABLE presences ADD COLUMN IF NOT EXISTS photo_depart TEXT;
ALTER TABLE presences ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7); -- GPS au pointage
ALTER TABLE presences ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
ALTER TABLE presences ADD COLUMN IF NOT EXISTS methode VARCHAR(30) DEFAULT 'mobile'; -- mobile, tablette, web

-- conges
ALTER TABLE conges ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);

-- parametres
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);

-- notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);

-- heures_sup
ALTER TABLE heures_sup ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);

-- audit_log
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS entreprise_id INTEGER REFERENCES entreprises(id);

-- ================================================================
-- 7. INDEX POUR PERFORMANCES MULTI-ENTREPRISE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_employes_entreprise ON employes(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_presences_entreprise ON presences(entreprise_id, date_presence);
CREATE INDEX IF NOT EXISTS idx_conges_entreprise ON conges(entreprise_id, statut);
CREATE INDEX IF NOT EXISTS idx_sites_entreprise ON sites(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_equipes_entreprise ON equipes(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_notifications_entreprise ON notifications(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_heures_sup_entreprise ON heures_sup(entreprise_id);

-- ================================================================
-- 8. CRÉATION DU SUPER ADMIN PRÉSENCIA
-- ================================================================
INSERT INTO employes (matricule, nom, prenom, statut)
SELECT 'SUPER001', 'Super', 'Présencia', 'Actif'
WHERE NOT EXISTS (SELECT 1 FROM employes WHERE matricule = 'SUPER001');

INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif)
SELECT 
    (SELECT id FROM employes WHERE matricule = 'SUPER001'),
    5, -- SuperAdmin
    'super@presencia.cg',
    '$2b$10$Nky8LrZN6sn4JFFLe4/rAO1Ax/ndVHQ1vUxLLo2Cu1WNP/vNXEm8W', -- admin123
    true
WHERE NOT EXISTS (SELECT 1 FROM utilisateurs WHERE email = 'super@presencia.cg');

-- ================================================================
-- 9. PLANS PAR DÉFAUT
-- ================================================================
INSERT INTO plans (nom, code, description, prix_par_employe, max_employes, fonctionnalites) VALUES
    ('Gratuit', 'FREE', 'Pour découvrir Présencia', 0, 3, '["Pointage simple", "Congés basiques", "1 site"]'),
    ('Pro', 'PRO', 'Pour les PME', 2000, 50, '["Pointage GPS + photo", "Congés avec workflow", "Export Excel", "Multi-sites", "Statistiques"]'),
    ('Entreprise', 'ENTERPRISE', 'Pour les grandes entreprises', 5000, NULL, '["Tout le plan Pro", "Borne QR code", "Support prioritaire", "API dédiée", "SLA garanti"]')
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- ✅ VÉRIFICATION
-- ================================================================
SELECT '✅ Super admin' AS info, email, (SELECT nom FROM roles WHERE id = role_id) AS role FROM utilisateurs WHERE email = 'super@presencia.cg'
UNION ALL
SELECT '✅ Plans créés', code, nom FROM plans
UNION ALL
SELECT '✅ Colonnes entreprise ajoutées', COUNT(*)::text, 'tables modifiées'
FROM information_schema.columns WHERE column_name = 'entreprise_id';
