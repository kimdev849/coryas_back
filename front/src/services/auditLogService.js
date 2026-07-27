import api from "./api";

const auditLogService = {
    getAll: (params) => api.get("/audit", { params }),
    getStats: () => api.get("/audit/stats"),
    getByEmploye: (employe_id) => api.get(`/audit/employe/${employe_id}`),
};

export default auditLogService;
