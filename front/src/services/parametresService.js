// ================================================================
// parametresService.js - Service pour les paramètres
// ================================================================

import fetchWithAuth from "./api";

const parametresService = {
  // GET /api/parametres - Récupérer les paramètres
  get: async () => {
    const data = await fetchWithAuth("/parametres");
    return data;
  },

  // PUT /api/parametres - Sauvegarder les paramètres
  save: async (parametres) => {
    const data = await fetchWithAuth("/parametres", {
      method: "PUT",
      body: parametres,
    });
    return data;
  },
};

export default parametresService;
