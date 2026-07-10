// ================================================================
// 📊 SERVICE DASHBOARD - Statistiques en temps réel
// ================================================================

import fetchWithAuth from "./api";

const dashboardService = {
  // ================================================================
  // GET /api/dashboard/stats - Toutes les statistiques
  // ================================================================
  getStats: async () => {
    const data = await fetchWithAuth("/dashboard/stats");
    return data;
  },
};

export default dashboardService;
