-- ============================================================
-- 🔧 SCRIPT SUPABASE : Réinitialisation des mots de passe
-- ============================================================
-- Problème : les anciens mots de passe sont des hashs bcrypt
-- alors que le login compare maintenant en clair.
--
-- Exécution : Copie/colle ce script dans l'éditeur SQL
-- de Supabase (SQL Editor) et exécute-le.
-- ============================================================

-- ============================================================
-- 1. Met TOUS les hashs bcrypt en clair
--    Le mot de passe est basé sur l'email :
--    admin@coryas.com → Admin@123
--    jean.dupont@email.com → Jean.Dupont@123
-- ============================================================
UPDATE utilisateurs
SET mot_de_passe = INITCAP(SPLIT_PART(email, '@', 1)) || '@123',
    actif = true
WHERE mot_de_passe LIKE '$2b$%'
   OR mot_de_passe LIKE '$2a$%';

-- ============================================================
-- 2. Force les mots de passe admin et RH spécifiques
-- ============================================================
UPDATE utilisateurs
SET mot_de_passe = 'Admin@123', actif = true
WHERE email = 'admin@coryas.com';

UPDATE utilisateurs
SET mot_de_passe = 'Rh@123', actif = true
WHERE email = 'rh@coryas.com';

-- ============================================================
-- 3. Crée le compte admin s'il n'existe pas encore
-- ============================================================
INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif)
SELECT e.id, r.id, 'admin@coryas.com', 'Admin@123', true
FROM employes e, roles r
WHERE r.nom = 'Administrateur'
  AND NOT EXISTS (SELECT 1 FROM utilisateurs WHERE email = 'admin@coryas.com')
LIMIT 1;

-- ============================================================
-- 4. Crée le compte RH s'il n'existe pas encore
-- ============================================================
INSERT INTO utilisateurs (employe_id, role_id, email, mot_de_passe, actif)
SELECT e.id, r.id, 'rh@coryas.com', 'Rh@123', true
FROM employes e, roles r
WHERE r.nom = 'RH'
  AND NOT EXISTS (SELECT 1 FROM utilisateurs WHERE email = 'rh@coryas.com')
LIMIT 1;

-- ============================================================
-- 5. Vérification : liste tous les utilisateurs
-- ============================================================
SELECT u.email, u.mot_de_passe, u.actif, r.nom AS role,
       e.nom || ' ' || e.prenom AS employe
FROM utilisateurs u
JOIN roles r ON r.id = u.role_id
JOIN employes e ON e.id = u.employe_id
ORDER BY u.id;
