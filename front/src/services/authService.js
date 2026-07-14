// ================================================================
// 🔐 SERVICE AUTH - Gère l'authentification
// ================================================================

import fetchWithAuth from "./api";

const authService = {
  // ================================================================
  // POST /api/auth/login - Connecter un utilisateur
  // ================================================================
  login: async (email, password) => {
    const data = await fetchWithAuth("/auth/login", {
      method: "POST",
      body: { email, password },
      includeAuth: false,
    });
    return data;
  },

  // ================================================================
  // POST /api/auth/register - Créer un compte
  // ================================================================
  register: async (userData) => {
    const data = await fetchWithAuth("/auth/register", {
      method: "POST",
      body: userData,
      includeAuth: false,
    });
    return data;
  },

  // ================================================================
  // POST /api/auth/logout - Déconnecter
  // ================================================================
  logout: async () => {
    const data = await fetchWithAuth("/auth/logout", {
      method: "POST",
    });
    return data;
  },

  // ================================================================
  // POST /api/auth/change-password - Changer le mot de passe
  // ================================================================
  changePassword: async (ancien_mot_de_passe, nouveau_mot_de_passe) => {
    const data = await fetchWithAuth("/auth/change-password", {
      method: "POST",
      body: { ancien_mot_de_passe, nouveau_mot_de_passe },
    });
    return data;
  },
};

export default authService;
