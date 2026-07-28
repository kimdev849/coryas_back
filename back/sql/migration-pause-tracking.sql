-- ================================================================
-- 🗄️ MIGRATION SQL — Pause tracking (colonnes dans presences)
-- ================================================================
-- Ajoute les colonnes nécessaires pour tracker les pauses
-- des employés (début/fin de pause + statut)
-- ================================================================

ALTER TABLE presences ADD COLUMN IF NOT EXISTS pause_entree TIME WITHOUT TIME ZONE;
ALTER TABLE presences ADD COLUMN IF NOT EXISTS pause_sortie TIME WITHOUT TIME ZONE;
ALTER TABLE presences ADD COLUMN IF NOT EXISTS pause_statut VARCHAR(20);

-- ================================================================
-- ✅ FIN — Pause tracking ajouté
-- ================================================================
