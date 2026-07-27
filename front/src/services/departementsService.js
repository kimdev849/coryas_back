// ================================================================
// departementsService.js - Service pour les departements (multi-entreprise)
// ================================================================

import fetchWithAuth from "./api";

const departementsService = {
  getAll: async () => {
    const data = await fetchWithAuth("/departements");
    return data;
  },
  getById: async (id) => {
    const data = await fetchWithAuth(`/departements/${id}`);
    return data;
  },
  create: async (body) => {
    const data = await fetchWithAuth("/departements", {
      method: "POST",
      body,
    });
    return data;
  },
  update: async (id, body) => {
    const data = await fetchWithAuth(`/departements/${id}`, {
      method: "PUT",
      body,
    });
    return data;
  },
  remove: async (id) => {
    const data = await fetchWithAuth(`/departements/${id}`, {
      method: "DELETE",
    });
    return data;
  },
};

export default departementsService;
