-- ================================================================
-- 🗄️ MIGRATION SQL — Table des notifications
-- ================================================================
-- Exécuter dans l'éditeur SQL de Supabase.
-- ================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info',
    -- Types: 'info', 'success', 'warning', 'conges', 'pointage', 'absence'
    lien VARCHAR(255),
    -- Lien optionnel vers lequel la notification redirige
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour accélérer la récupération des notifications d'un employé
CREATE INDEX IF NOT EXISTS idx_notifications_employe ON notifications(employe_id, created_at DESC);

-- Index pour compter les notifications non lues
CREATE INDEX IF NOT EXISTS idx_notifications_non_lues ON notifications(employe_id, lu) WHERE lu = FALSE;
