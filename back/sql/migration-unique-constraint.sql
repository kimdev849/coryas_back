-- ================================================================
-- 🗄️ MIGRATION SQL — Contrainte UNIQUE + Nettoyage des doublons
-- ================================================================
-- Exécuter DANS L'ORDRE dans l'éditeur SQL de Supabase.
-- ================================================================

-- ================================================================
-- ÉTAPE 1 : Corriger les statuts NULL (anciennes présences)
-- ================================================================
-- Avant, le statut n'était pas toujours défini. On donne "Present"
-- à celles qui ont une heure d'arrivée mais pas de statut.
-- ================================================================
UPDATE presences
SET statut = 'Present'
WHERE statut IS NULL AND heure_entree IS NOT NULL;

-- ================================================================
-- ÉTAPE 2 : Supprimer les doublons (même employé, même date)
-- ================================================================
-- Pour chaque employé/jour qui a des doublons, on garde :
--   1. Celle qui a une heure de sortie (présence complète)
--   2. Sinon celle avec le statut le plus récent
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
-- ÉTAPE 3 : Ajouter la contrainte UNIQUE (sécurisée : IF NOT EXISTS)
-- ================================================================
-- On supprime d'abord si elle existe déjà (pour éviter l'erreur 42P07)
ALTER TABLE presences DROP CONSTRAINT IF EXISTS unique_employe_date;
ALTER TABLE presences ADD CONSTRAINT unique_employe_date UNIQUE (employe_id, date_presence);

-- ================================================================
-- ✅ VÉRIFICATION
-- ================================================================
SELECT 'Statuts NULL:' AS info, COUNT(*) AS reste
FROM presences WHERE statut IS NULL
UNION ALL
SELECT 'Doublons restants:',
  COALESCE((SELECT COUNT(*) FROM (
    SELECT COUNT(*) FROM presences
    GROUP BY employe_id, date_presence HAVING COUNT(*) > 1
  ) sub), 0)
UNION ALL
SELECT 'Contrainte UNIQUE:', 0
  FROM information_schema.table_constraints
  WHERE constraint_name = 'unique_employe_date'
    AND table_name = 'presences';

-- ================================================================
-- 🔍 Si la dernière ligne ne retourne rien, exécutez :
--   SELECT * FROM information_schema.table_constraints
--   WHERE table_name = 'presences'
-- ================================================================
