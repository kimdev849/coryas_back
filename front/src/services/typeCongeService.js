import api from "./api";

const typeCongeService = {
    // Types de congés
    getAllTypes: () => api.get("/conges-types/types"),
    getTypeById: (id) => api.get(`/conges-types/types/${id}`),
    createType: (data) => api.post("/conges-types/types", data),
    updateType: (id, data) => api.put(`/conges-types/types/${id}`, data),

    // Soldes
    getSoldeByEmploye: (employe_id, annee) =>
        api.get(`/conges-types/soldes/${employe_id}${annee ? `?annee=${annee}` : ""}`),
    getAllSoldes: (annee) =>
        api.get(`/conges-types/soldes${annee ? `?annee=${annee}` : ""}`),
    updateSolde: (id, data) => api.put(`/conges-types/soldes/${id}`, data),
    creerSolde: (data) => api.post("/conges-types/soldes", data),
};

export default typeCongeService;
