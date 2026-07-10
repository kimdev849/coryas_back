// ================================================================
// departementsService.js - Service pour les departements
// ================================================================

import fetchWithAuth from "./api";

const departementsService = {
  getAll: async () => {
    const data = await fetchWithAuth("/departements");
    return data;
  },
};

export default departementsService;
