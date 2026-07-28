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

  // ================================================================
  // GET /api/entreprises/demandes - Demandes d'inscription (SuperAdmin)
  // ================================================================
  getDemandes: async () => {
    const data = await fetchWithAuth("/entreprises/demandes");
    return data;
  },

  // ================================================================
  // PUT /api/entreprises/demande/:id/accepter - Accepter une demande
  // ================================================================
  accepterDemande: async (id, body) => {
    const data = await fetchWithAuth(`/entreprises/demande/${id}/accepter`, {
      method: "PUT",
      body,
    });
    return data;
  },

  // ================================================================
  // DELETE /api/entreprises/demande/:id/refuser - Refuser une demande
  // ================================================================
  refuserDemande: async (id) => {
    const data = await fetchWithAuth(`/entreprises/demande/${id}/refuser`, {
      method: "DELETE",
    });
    return data;
  },
};

export default entreprisesService;
