import api from "./api";

const typeContratService = {
    getAll: () => api.get("/contrats-types"),
    getById: (id) => api.get(`/contrats-types/${id}`),
    create: (data) => api.post("/contrats-types", data),
    update: (id, data) => api.put(`/contrats-types/${id}`, data),
};

export default typeContratService;
