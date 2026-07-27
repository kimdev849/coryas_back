import api from "./api";

const sitesService = {
    getAll: () => api.get("/sites"),
    getById: (id) => api.get(`/sites/${id}`),
    create: (data) => api.post("/sites", data),
    update: (id, data) => api.put(`/sites/${id}`, data),
};

export default sitesService;
