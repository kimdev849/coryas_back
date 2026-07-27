import api from "./api";

const equipesService = {
    getAll: () => api.get("/equipes"),
    getById: (id) => api.get(`/equipes/${id}`),
    create: (data) => api.post("/equipes", data),
    update: (id, data) => api.put(`/equipes/${id}`, data),
};

export default equipesService;
