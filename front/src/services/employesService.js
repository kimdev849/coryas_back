// ================================================================
// 👥 SERVICE EMPLOYÉS - Gère les employés (CRUD complet)
// ================================================================

import fetchWithAuth from "./api";

const employesService = {
  // ================================================================
  // GET /api/employes - Liste tous les employés
  // ================================================================
  getAll: async () => {
    const data = await fetchWithAuth("/employes");
    return data;
  },

  // ================================================================
  // GET /api/employes/:id - Détail d'un employé
  // ================================================================
  getById: async (id) => {
    const data = await fetchWithAuth(`/employes/${id}`);
    return data;
  },

  // ================================================================
  // POST /api/employes - Créer un employé
  // ================================================================
  create: async (employeData) => {
    const data = await fetchWithAuth("/employes", {
      method: "POST",
      body: employeData,
    });
    return data;
  },

  // ================================================================
  // PUT /api/employes/:id - Modifier un employé
  // ================================================================
  update: async (id, employeData) => {
    const data = await fetchWithAuth(`/employes/${id}`, {
      method: "PUT",
      body: employeData,
    });
    return data;
  },

  // ================================================================
  // PUT /api/employes/:id/deactivate - Désactiver un employé
  // ================================================================
  // L'employé garde toutes ses données (présences, congés) mais
  // ne peut plus se connecter. Son statut passe à "Inactif".
  // ================================================================
  deactivate: async (id) => {
    const data = await fetchWithAuth(`/employes/${id}/deactivate`, {
      method: "PUT",
    });
    return data;
  },

  // ================================================================
  // GET /api/employes/:id/stats - Statistiques d'un employé
  // ================================================================
  getStats: async (id) => {
    const data = await fetchWithAuth(`/employes/${id}/stats`);
    return data;
  },
};

export default employesService;
