// ================================================================
// statsService.js - Service pour les statistiques
// ================================================================

import fetchWithAuth from "./api";

const statsService = {
  // GET /api/stats/punctualite?periode=mot
  getPunctualite: async (periode = "mois") => {
    const data = await fetchWithAuth(`/stats/punctualite?periode=${periode}`);
    return data;
  },
};

export default statsService;
