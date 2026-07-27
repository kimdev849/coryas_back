import api from "./api";

const heuresSupService = {
    getAll: (params) => api.get("/heures-sup", { params }),
    getById: (id) => api.get(`/heures-sup/${id}`),
    create: (data) => api.post("/heures-sup", data),
    approve: (id, commentaire) => api.put(`/heures-sup/${id}/approve`, { commentaire }),
    reject: (id, commentaire) => api.put(`/heures-sup/${id}/reject`, { commentaire }),
    getStats: (params) => api.get("/heures-sup/stats", { params }),
    remove: (id) => api.delete(`/heures-sup/${id}`),
};

export default heuresSupService;
