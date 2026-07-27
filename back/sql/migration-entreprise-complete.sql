-- ================================================================
-- 🏢 MIGRATION ENTREPRISE COMPLÈTE
-- ================================================================
-- Rend l'application adaptable à TOUTES les entreprises avec :
--  1. Types de congés configurables avec soldes
--  2. Gestion des contrats (CDI, CDD, Stage, Freelance)
--  3. Multi-sites / Agences
--  4. Équipes dans les départements
--  5. Heures supplémentaires
--  6. Journal d'audit (traçabilité)
-- ================================================================

-- ================================================================
-- 1. TYPES DE CONGÉS CONFIGURABLES
-- ================================================================
CREATE TABLE IF NOT EXISTS type_conge (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    paye BOOLEAN DEFAULT TRUE,
    jours_max INTEGER,            -- NULL = illimité (ex: maladie longue durée)
    couleur VARCHAR(20) DEFAULT '#3b82f6',  -- Pour l'affichage calendrier
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Soldes de congés par employé et par année
CREATE TABLE IF NOT EXISTS solde_conge (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    type_conge_id INTEGER NOT NULL REFERENCES type_conge(id) ON DELETE CASCADE,
    total_jours NUMERIC(5,1) NOT NULL DEFAULT 0,
    jours_pris NUMERIC(5,1) NOT NULL DEFAULT 0,
    annee INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employe_id, type_conge_id, annee)
);

-- Ajout du lien type_conge dans les demandes de congés
ALTER TABLE conges ADD COLUMN IF NOT EXISTS type_conge_id INTEGER REFERENCES type_conge(id);
ALTER TABLE conges ADD COLUMN IF NOT EXISTS commentaire TEXT;

-- ================================================================
-- 2. GESTION DES CONTRATS
-- ================================================================
CREATE TABLE IF NOT EXISTS type_contrat (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    duree_essai_jours INTEGER DEFAULT 0,  -- Période d'essai par défaut
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ajout des colonnes contrat dans la table employes
ALTER TABLE employes ADD COLUMN IF NOT EXISTS type_contrat_id INTEGER REFERENCES type_contrat(id);
ALTER TABLE employes ADD COLUMN IF NOT EXISTS date_fin_contrat DATE;
ALTER TABLE employes ADD COLUMN IF NOT EXISTS periode_essai_jours INTEGER;
ALTER TABLE employes ADD COLUMN IF NOT EXISTS date_fin_essai DATE;
ALTER TABLE employes ADD COLUMN IF NOT EXISTS poste VARCHAR(200);
ALTER TABLE employes ADD COLUMN IF NOT EXISTS salaire NUMERIC(10,2);
ALTER TABLE employes ADD COLUMN IF NOT EXISTS numero_securite_sociale VARCHAR(50);
ALTER TABLE employes ADD COLUMN IF NOT EXISTS adresse_domicile TEXT;
ALTER TABLE employes ADD COLUMN IF NOT EXISTS ville VARCHAR(100);

-- ================================================================
-- 3. MULTI-SITES / AGENCES
-- ================================================================
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    adresse TEXT,
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Congo',
    telephone VARCHAR(30),
    email VARCHAR(255),
    horaire_ouverture TIME WITHOUT TIME ZONE,
    horaire_fermeture TIME WITHOUT TIME ZONE,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE employes ADD COLUMN IF NOT EXISTS site_id INTEGER REFERENCES sites(id);

-- ================================================================
-- 4. ÉQUIPES
-- ================================================================
CREATE TABLE IF NOT EXISTS equipes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    departement_id INTEGER REFERENCES departements(id) ON DELETE SET NULL,
    site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL,
    responsable_id INTEGER REFERENCES employes(id) ON DELETE SET NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE employes ADD COLUMN IF NOT EXISTS equipe_id INTEGER REFERENCES equipes(id);
ALTER TABLE employes ADD COLUMN IF NOT EXISTS responsable_id INTEGER REFERENCES employes(id);

-- ================================================================
-- 5. HEURES SUPPLÉMENTAIRES
-- ================================================================
CREATE TABLE IF NOT EXISTS heures_sup (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    date_heure_sup DATE NOT NULL DEFAULT CURRENT_DATE,
    nb_heures NUMERIC(4,1) NOT NULL,
    taux_majoration NUMERIC(3,1) DEFAULT 1.5,
    motif TEXT,
    statut VARCHAR(30) DEFAULT 'En attente',  -- En attente, Approuve, Rejete
    valide_par INTEGER REFERENCES employes(id) ON DELETE SET NULL,
    commentaire_validation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 6. JOURNAL D'AUDIT (traçabilité)
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER REFERENCES employes(id) ON DELETE SET NULL,
    employe_nom VARCHAR(200),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    anciennes_valeurs JSONB,
    nouvelles_valeurs JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour accélérer les recherches dans l'audit
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_employe ON audit_log(employe_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at DESC);

-- ================================================================
-- 7. INDEX POUR PERFORMANCES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_solde_conge_employe ON solde_conge(employe_id, annee);
CREATE INDEX IF NOT EXISTS idx_heures_sup_employe ON heures_sup(employe_id, date_heure_sup DESC);
CREATE INDEX IF NOT EXISTS idx_equipes_departement ON equipes(departement_id);
CREATE INDEX IF NOT EXISTS idx_equipes_site ON equipes(site_id);

-- ================================================================
-- 📦 DONNÉES DE BASE (SEED)
-- ================================================================

-- Types de congés par défaut
INSERT INTO type_conge (nom, code, description, paye, jours_max, couleur) VALUES
    ('Congé annuel', 'ANNUEL', 'Congés payés annuels', TRUE, 30, '#3b82f6'),
    ('Congé maladie', 'MALADIE', 'Arrêt maladie avec certificat', TRUE, NULL, '#ef4444'),
    ('Congé maternité', 'MATERNITE', 'Congé maternité', TRUE, 98, '#ec4899'),
    ('Congé paternité', 'PATERNITE', 'Congé paternité', TRUE, 15, '#8b5cf6'),
    ('Mariage', 'MARIAGE', 'Congé pour mariage', TRUE, 5, '#f59e0b'),
    ('Naissance', 'NAISSANCE', 'Congé pour naissance', TRUE, 3, '#22c55e'),
    ('Décès', 'DECES', 'Congé pour décès ', TRUE, 3, '#6b7280'),
    ('Congé sans solde', 'SANS_SOLDE', 'Congé non rémunéré', FALSE, NULL, '#f97316'),
    ('Formation', 'FORMATION', 'Formation professionnelle', TRUE, NULL, '#06b6d4')
ON CONFLICT (code) DO NOTHING;

-- Types de contrats par défaut
INSERT INTO type_contrat (nom, code, duree_essai_jours) VALUES
    ('CDI', 'CDI', 90),
    ('CDD', 'CDD', 30),
    ('Stage', 'STAGE', 15),
    ('Freelance', 'FREELANCE', 0),
    ('Alternance', 'ALTERNANCE', 30),
    ('Intérim', 'INTERIM', 15)
ON CONFLICT (code) DO NOTHING;

-- Attribution des soldes de congés aux employés existants (annuel)
INSERT INTO solde_conge (employe_id, type_conge_id, total_jours, jours_pris, annee)
SELECT e.id, tc.id, 30, 0, EXTRACT(YEAR FROM CURRENT_DATE)
FROM employes e
CROSS JOIN type_conge tc
WHERE tc.code = 'ANNUEL'
AND NOT EXISTS (
    SELECT 1 FROM solde_conge sc
    WHERE sc.employe_id = e.id
    AND sc.type_conge_id = tc.id
    AND sc.annee = EXTRACT(YEAR FROM CURRENT_DATE)
);

-- ================================================================
-- ✅ VÉRIFICATION
-- ================================================================
SELECT '✅ Types de congés' AS info, COUNT(*) AS total FROM type_conge
UNION ALL
SELECT '✅ Types de contrat', COUNT(*) FROM type_contrat
UNION ALL
SELECT '✅ Soldes de congés', COUNT(*) FROM solde_conge
UNION ALL
SELECT '✅ Tables créées', COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('type_conge', 'solde_conge', 'type_contrat', 'sites', 'equipes', 'heures_sup', 'audit_log');
