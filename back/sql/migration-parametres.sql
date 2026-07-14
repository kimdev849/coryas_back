-- ================================================================
-- 🗄️ MIGRATION SQL — Table parametres (colonnes manquantes)
-- ================================================================
-- Exécuter DANS L'ORDRE dans l'éditeur SQL de Supabase.
-- Problème : Le code attend des colonnes (email_entreprise, telephone,
-- retard_apres, depart_anticipe, duree_pause, adresse) qui n'existent
-- pas dans la table initiale. Ce script les ajoute.
-- ================================================================

-- ================================================================
-- 1. AJOUTER LES COLONNES MANQUANTES (IF NOT EXISTS = sécurisé)
-- ================================================================

-- Seuil de retard en minutes (ex: 15 = retard si arrivé 15min après ouverture)
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS retard_apres INTEGER DEFAULT 0;

-- Départ anticipé en minutes (ex: 15 = départ anticipé si parti 15min avant fermeture)
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS depart_anticipe INTEGER DEFAULT 0;

-- Durée de la pause en minutes
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS duree_pause INTEGER DEFAULT 0;

-- Adresse de l'entreprise
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS adresse TEXT;

-- Thème de l'application (coryas, bleu, vert, violet, sombre)
ALTER TABLE parametres ADD COLUMN IF NOT EXISTS theme VARCHAR(30) DEFAULT 'coryas';

-- ================================================================
-- 2. RENOMMER LES COLONNES (bloc sécurisé : ne plante pas si déjà fait)
-- ================================================================
-- On vérifie d'abord si l'ancien nom existe avant de renommer,
-- pour que le script soit exécutable plusieurs fois sans erreur.
-- ================================================================
DO $$
BEGIN
  -- email_contact → email_entreprise
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parametres' AND column_name = 'email_contact'
  ) THEN
    ALTER TABLE parametres RENAME COLUMN email_contact TO email_entreprise;
  END IF;

  -- telephone_contact → telephone
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parametres' AND column_name = 'telephone_contact'
  ) THEN
    ALTER TABLE parametres RENAME COLUMN telephone_contact TO telephone;
  END IF;
END $$;

-- ================================================================
-- 3. VÉRIFICATION
-- ================================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'parametres'
ORDER BY ordinal_position;

-- ================================================================
-- ✅ La table parametres a maintenant toutes les colonnes attendues
-- par l'application (frontend React + backend Express).
-- ================================================================
