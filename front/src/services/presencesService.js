// ================================================================
// presencesService.js - Service pour les présences
// ================================================================

import fetchWithAuth from "./api";

const presencesService = {
  // GET /api/presences?employe_id=&date_debut=&date_fin=
  getAll: async (params = {}) => {
    let url = "/presences";
    const query = new URLSearchParams();
    if (params.employe_id) query.set("employe_id", params.employe_id);
    if (params.date_debut) query.set("date_debut", params.date_debut);
    if (params.date_fin) query.set("date_fin", params.date_fin);
    const qs = query.toString();
    if (qs) url += "?" + qs;
    const data = await fetchWithAuth(url);
    return data;
  },

  // GET /api/presences/stats/aujourdhui
  getTodayStats: async () => {
    const data = await fetchWithAuth("/presences/stats/aujourdhui");
    return data;
  },

  // POST /api/presences/checkin
  checkIn: async (employe_id) => {
    const data = await fetchWithAuth("/presences/checkin", {
      method: "POST",
      body: { employe_id },
    });
    return data;
  },

  // POST /api/presences/checkout
  checkOut: async (presenceId) => {
    const data = await fetchWithAuth("/presences/checkout", {
      method: "POST",
      body: { presenceId },
    });
    return data;
  },

  // GET /api/presences/active?employe_id=
  getActivePresence: async (employe_id) => {
    const data = await fetchWithAuth(`/presences/active?employe_id=${employe_id}`);
    return data;
  },

  // GET /api/presences/:id
  getById: async (id) => {
    const data = await fetchWithAuth(`/presences/${id}`);
    return data;
  },

  // PUT /api/presences/:id/rattrapage
  rattrapage: async (id, { heure_sortie, remarque }) => {
    const data = await fetchWithAuth(`/presences/${id}/rattrapage`, {
      method: "PUT",
      body: { heure_sortie, remarque },
    });
    return data;
  },
};

export default presencesService;
