-- ================================================================
-- 🗄️ MIGRATION SQL COMPLÈTE — À EXÉCUTER DANS SUPABASE SQL EDITOR
-- ================================================================
-- Ce script fait TOUT en une seule fois :
--   1. Nettoie les statuts NULL
--   2. Supprime les doublons (même employé, même date)
--   3. Ajoute la contrainte UNIQUE (employe_id, date_presence)
--   4. Crée la table notifications
-- ================================================================

-- ================================================================
-- ÉTAPE 1 : Corriger les statuts NULL (anciennes présences)
-- ================================================================
UPDATE presences
SET statut = 'Present'
WHERE statut IS NULL AND heure_entree IS NOT NULL;

-- ================================================================
-- ÉTAPE 2 : Supprimer les doublons (même employé, même date)
-- ================================================================
-- Garde la présence complète (avec heure de sortie) ou la plus récente
-- ================================================================
WITH duplicates AS (
  SELECT id, employe_id, date_presence,
         ROW_NUMBER() OVER (
           PARTITION BY employe_id, date_presence
           ORDER BY
             CASE WHEN heure_sortie IS NOT NULL THEN 0 ELSE 1 END,
             created_at DESC NULLS LAST,
             id DESC
         ) AS rn
  FROM presences
)
DELETE FROM presences
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- ================================================================
-- ÉTAPE 3 : Ajouter la contrainte UNIQUE (empêche le double pointage)
-- ================================================================
ALTER TABLE presences DROP CONSTRAINT IF EXISTS unique_employe_date;
ALTER TABLE presences ADD CONSTRAINT unique_employe_date UNIQUE (employe_id, date_presence);

-- ================================================================
-- ÉTAPE 4 : Créer la table des notifications
-- ================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info',
    lien VARCHAR(255),
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour accélérer la récupération des notifications
CREATE INDEX IF NOT EXISTS idx_notifications_employe ON notifications(employe_id, created_at DESC);

-- Index pour compter les notifications non lues
CREATE INDEX IF NOT EXISTS idx_notifications_non_lues ON notifications(employe_id, lu) WHERE lu = FALSE;

-- ================================================================
-- ✅ VÉRIFICATION FINALE
-- ================================================================
SELECT '✅ Statuts NULL corrigés' AS info, COUNT(*) AS reste FROM presences WHERE statut IS NULL
UNION ALL
SELECT '✅ Doublons restants', COALESCE((SELECT COUNT(*) FROM (
  SELECT COUNT(*) FROM presences GROUP BY employe_id, date_presence HAVING COUNT(*) > 1
) sub), 0)
UNION ALL
SELECT '✅ Contrainte UNIQUE active', 0
FROM information_schema.table_constraints
WHERE constraint_name = 'unique_employe_date' AND table_name = 'presences'
UNION ALL
SELECT '✅ Table notifications créée', COUNT(*) FROM notifications;
