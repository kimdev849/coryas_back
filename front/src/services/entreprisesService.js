// ================================================================
// 🏢 SERVICE ENTREPRISES - Gestion des entreprises (SuperAdmin)
// ================================================================

import fetchWithAuth from "./api";

const entreprisesService = {
  // ================================================================
  // GET /api/entreprises - Liste de toutes les entreprises
  // ================================================================
  getAll: async () => {
    const data = await fetchWithAuth("/entreprises");
    return data;
  },

  // ================================================================
  // GET /api/entreprises/stats - Statistiques globales SuperAdmin
  // ================================================================
  getStats: async () => {
    const data = await fetchWithAuth("/entreprises/stats");
    return data;
  },

  // ================================================================
  // POST /api/entreprises - Créer une nouvelle entreprise
  // ================================================================
  create: async (entrepriseData) => {
    const data = await fetchWithAuth("/entreprises", {
      method: "POST",
      body: entrepriseData,
    });
    return data;
  },

  // ================================================================
  // GET /api/entreprises/:id - Détails d'une entreprise
  // ================================================================
  getById: async (id) => {
    const data = await fetchWithAuth(`/entreprises/${id}`);
    return data;
  },

  // ================================================================
  // PUT /api/entreprises/:id - Mettre à jour une entreprise
  // ================================================================
  update: async (id, data) => {
    const res = await fetchWithAuth(`/entreprises/${id}`, {
      method: "PUT",
      body: data,
    });
    return res;
  },

  // ================================================================
  // POST /api/entreprises/inscription - Demande d'inscription publique
  // ================================================================
  creerDemande: async (formData) => {
    const data = await fetchWithAuth("/entreprises/inscription", {
      method: "POST",
      body: formData,
      includeAuth: false,
    });
    return data;
  },
};

export default entreprisesService;
