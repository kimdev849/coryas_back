// ================================================================
// 📄 FICHIER : services/congesService.js
// SERVICE pour les APPELS API relatifs aux CONGÉS
// Utilise le système d'authentification centralisé
// ================================================================

import fetchWithAuth from "./api";

const congesService = {
  // ================================================================
  // GET /api/conges - Récupérer TOUTES les demandes de congés
  // ================================================================
  getAllConges: async () => {
    const data = await fetchWithAuth("/conges");
    return data;
  },

  // ================================================================
  // POST /api/conges - Créer une NOUVELLE demande de congé
  // ================================================================
  creerDemande: async (congeData) => {
    const data = await fetchWithAuth("/conges", {
      method: "POST",
      body: congeData,
    });
    return data;
  },

  // ================================================================
  // GET /api/conges/:id - Récupérer les détails d'UNE demande
  // ================================================================
  getCongeById: async (id) => {
    const data = await fetchWithAuth(`/conges/${id}`);
    return data;
  },

  // ================================================================
  // PUT /api/conges/:id/approve - APPROUVER une demande
  // ================================================================
  appouverConge: async (id, commentaire = "") => {
    const data = await fetchWithAuth(`/conges/${id}/approve`, {
      method: "PUT",
      body: { commentaire },
    });
    return data;
  },

  // ================================================================
  // PUT /api/conges/:id/reject - REJETER une demande
  // ================================================================
  rejeterConge: async (id, commentaire = "") => {
    const data = await fetchWithAuth(`/conges/${id}/reject`, {
      method: "PUT",
      body: { commentaire },
    });
    return data;
  },

  // ================================================================
  // DELETE /api/conges/:id - SUPPRIMER une demande
  // ================================================================
  supprimerDemande: async (id) => {
    const data = await fetchWithAuth(`/conges/${id}`, {
      method: "DELETE",
    });
    return data;
  },
};

export default congesService;
