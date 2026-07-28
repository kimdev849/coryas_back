-- ================================================================
-- 🗄️ MIGRATION SQL — Paramètres entreprise (colonnes complètes)
-- ================================================================
-- Ajoute TOUTES les colonnes manquantes de la table parametres
-- pour que la page Configuration soit 100% fonctionnelle.
-- ================================================================
-- Exécuter dans l'éditeur SQL Supabase :
--   Dashboard Supabase → SQL Editor → Coller → Run
-- ================================================================

-- ================================================================
-- 1. COLONNES DE BRANDING & INFORMATION
-- ================================================================
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS slogan VARCHAR(500);
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS site_web VARCHAR(255);
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ================================================================
-- 2. JOURS OUVRABLES (stocké en JSONB pour flexibilité)
-- ================================================================
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS jours_ouvrables JSONB DEFAULT '["lundi", "mardi", "mercredi", "jeudi", "vendredi"]';

-- ================================================================
-- 3. RÈGLES DE POINTAGE
-- ================================================================
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS tolerance_retard INTEGER DEFAULT 5;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS auto_checkout BOOLEAN DEFAULT FALSE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS heure_auto_checkout TIME WITHOUT TIME ZONE DEFAULT '19:00';
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS geo_restriction BOOLEAN DEFAULT FALSE;

-- ================================================================
-- 4. POLITIQUE DE CONGÉS
-- ================================================================
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS conges_annuel_default INTEGER DEFAULT 30;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS conges_maladie_annee INTEGER DEFAULT 90;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS jours_max_consecutifs INTEGER DEFAULT 15;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS delai_demande_jours INTEGER DEFAULT 2;

-- ================================================================
-- 5. NOTIFICATIONS
-- ================================================================
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS notif_pointage BOOLEAN DEFAULT TRUE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS notif_retard BOOLEAN DEFAULT TRUE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS notif_absence BOOLEAN DEFAULT TRUE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS notif_conge_demande BOOLEAN DEFAULT TRUE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS notif_conge_valide BOOLEAN DEFAULT TRUE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS notif_rapport_hebdo BOOLEAN DEFAULT FALSE;

-- ================================================================
-- 6. SÉCURITÉ
-- ================================================================
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS ip_restriction BOOLEAN DEFAULT FALSE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS ip_autorisees TEXT;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS double_auth BOOLEAN DEFAULT FALSE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS session_timeout INTEGER DEFAULT 60;

-- ================================================================
-- 7. VÉRIFICATION
-- ================================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'parametres'
ORDER BY ordinal_position;

-- ================================================================
-- ✅ FIN — Toutes les colonnes ont été ajoutées.
-- ================================================================
