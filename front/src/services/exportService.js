import api from "./api";

const exportService = {
    exportPresences: async (params = {}) => {
        const res = await api.get("/export/presences", {
            params, responseType: "blob",
        });
        downloadBlob(res.data, "presences.csv");
    },
    exportConges: async (params = {}) => {
        const res = await api.get("/export/conges", {
            params, responseType: "blob",
        });
        downloadBlob(res.data, "conges.csv");
    },
    exportEmployes: async () => {
        const res = await api.get("/export/employes", {
            responseType: "blob",
        });
        downloadBlob(res.data, "employes.csv");
    },
};

function downloadBlob(data, filename) {
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

export default exportService;
