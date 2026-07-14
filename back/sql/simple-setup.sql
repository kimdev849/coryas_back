-- ================================================================
-- 🎯 SQL SIMPLE - À COPIER-COLLER DANS SUPABASE SQL EDITOR
-- ================================================================
-- Pas de trucs compliqués. Exécutez ceci et tout est prêt.
-- ================================================================

-- ================================================================
-- 1. CRÉER LES RÔLES (si pas déjà fait)
-- ================================================================
INSERT INTO roles (id, nom) VALUES 
  (1, 'Administrateur'),
  (2, 'RH'),
  (3, 'Employé')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 2. CRÉER LES DÉPARTEMENTS (si pas déjà fait)
-- ================================================================
INSERT INTO departements (id, nom) VALUES 
  (1, 'Direction'),
  (2, 'Ressources Humaines'),
  (3, 'Informatique')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 3. CRÉER L'ADMIN (mot de passe : admin123)
-- ================================================================
INSERT INTO employes (matricule, nom, prenom, date_embauche, departement_id)
SELECT 'ADMIN001', 'Admin', 'Super', CURRENT_DATE, 1
WHERE NOT EXISTS (SELECT 1 FROM employes WHERE matricule = 'ADMIN001');

INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif)
SELECT 
  (SELECT id FROM employes WHERE matricule = 'ADMIN001'),
  1,
  'admin@coryas.com',
  '$2b$10$Nky8LrZN6sn4JFFLe4/rAO1Ax/ndVHQ1vUxLLo2Cu1WNP/vNXEm8W',
  true
WHERE NOT EXISTS (SELECT 1 FROM utilisateurs WHERE email = 'admin@coryas.com');

-- ================================================================
-- 4. METTRE À JOUR RH (mot de passe : admin123)
-- ================================================================
UPDATE utilisateurs 
SET mot_de_passe = '$2b$10$Nky8LrZN6sn4JFFLe4/rAO1Ax/ndVHQ1vUxLLo2Cu1WNP/vNXEm8W',
    role_id = 1
WHERE email = 'rh@coryas.com';

-- ================================================================
-- 5. PARAMÈTRES PAR DÉFAUT DE L'ENTREPRISE
-- ================================================================
INSERT INTO parametres (id, nom_entreprise, heure_ouverture, heure_fermeture, retard_apres)
VALUES (1, 'Coryas', '09:00', '19:00', 15)
ON CONFLICT (id) DO UPDATE SET
  heure_ouverture = COALESCE('09:00', parametres.heure_ouverture),
  heure_fermeture = COALESCE('19:00', parametres.heure_fermeture),
  retard_apres = COALESCE(15, parametres.retard_apres);

-- ================================================================
-- 6. VÉRIFIER
-- ================================================================
SELECT '✅ Admin:' AS info, email, actif FROM utilisateurs WHERE email = 'admin@coryas.com'
UNION ALL
SELECT '✅ RH:', email, actif FROM utilisateurs WHERE email = 'rh@coryas.com'
UNION ALL
SELECT '⏰ Horaire:', heure_ouverture || ' - ' || heure_fermeture, retard_apres::text FROM parametres WHERE id = 1;

-- ================================================================
-- 🔑 CONNEXION :
--    Email : admin@coryas.com
--    Mot de passe : admin123
-- ================================================================
