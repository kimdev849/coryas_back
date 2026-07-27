-- ================================================================
-- 🗄️ MIGRATION SQL — Colonne commentaire dans conges
-- ================================================================
-- Ajoute une colonne "commentaire" pour que l'employé puisse
-- laisser un message lors de sa demande de congé (ex: motif
-- détaillé, précisions, etc.).
-- ================================================================
-- Exécuter dans l'éditeur SQL de Supabase :
--   1. Aller dans Dashboard Supabase → SQL Editor
--   2. Coller ce script
--   3. Cliquer sur "Run"
-- ================================================================

-- ================================================================
-- Ajouter la colonne commentaire (si elle n'existe pas déjà)
-- ================================================================
ALTER TABLE conges ADD COLUMN IF NOT EXISTS commentaire TEXT;

-- ================================================================
-- ✅ VÉRIFICATION
-- ================================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'conges'
ORDER BY ordinal_position;
