-- ================================================================
-- 🗄️ MIGRATION SQL — Heure limite de pointage (arrivée tardive)
-- ================================================================
-- Ajoute la possibilité de bloquer le pointage après une heure
-- définie par l'entreprise (ex: plus de pointage après 09:30).
-- Le blocage ne s'active QUE si limite_pointage = TRUE.
-- ================================================================
-- Exécuter dans l'éditeur SQL Supabase :
--   Dashboard Supabase → SQL Editor → Coller → Run
-- (ou : node scripts/run-migration-limite.js)
-- ================================================================

ALTER TABLE parametres ADD COLUMN IF NOT EXISTS limite_pointage BOOLEAN DEFAULT FALSE;
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS heure_limite_pointage TIME WITHOUT TIME ZONE DEFAULT '09:00';

-- ================================================================
-- ✅ FIN — Colonnes ajoutées.
-- ================================================================
