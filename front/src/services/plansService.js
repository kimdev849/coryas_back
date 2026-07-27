// ================================================================
// 💰 SERVICE PLANS - Gestion des plans d'abonnement
// ================================================================

import fetchWithAuth from "./api";

const plansService = {
  // ================================================================
  // GET /api/plans - Liste des plans disponibles
  // ================================================================
  getAll: async () => {
    const data = await fetchWithAuth("/plans", { includeAuth: false });
    return data;
  },

  // ================================================================
  // POST /api/plans - Créer un plan (SuperAdmin)
  // ================================================================
  create: async (planData) => {
    const data = await fetchWithAuth("/plans", {
      method: "POST",
      body: planData,
    });
    return data;
  },

  // ================================================================
  // PUT /api/plans/:id - Mettre à jour un plan (SuperAdmin)
  // ================================================================
  update: async (id, planData) => {
    const data = await fetchWithAuth(`/plans/${id}`, {
      method: "PUT",
      body: planData,
    });
    return data;
  },
};

export default plansService;
