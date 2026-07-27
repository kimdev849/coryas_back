const plansModel = require("../models/plans.model");

const getAll = async (req, res) => {
    try { const data = await plansModel.getAll(); res.json({ message: "Plans", data }); }
    catch (error) { res.status(500).json({ message: "Erreur serveur", error: error.message }); }
};

const getById = async (req, res) => {
    try {
        const data = await plansModel.getById(req.params.id);
        if (!data) return res.status(404).json({ message: "Plan introuvable" });
        res.json({ message: "Plan trouvé", data });
    } catch (error) { res.status(500).json({ message: "Erreur serveur", error: error.message }); }
};

const create = async (req, res) => {
    try { const data = await plansModel.create(req.body); res.status(201).json({ message: "Plan créé", data }); }
    catch (error) { res.status(500).json({ message: "Erreur serveur", error: error.message }); }
};

const update = async (req, res) => {
    try {
        const data = await plansModel.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: "Plan introuvable" });
        res.json({ message: "Plan modifié", data });
    } catch (error) { res.status(500).json({ message: "Erreur serveur", error: error.message }); }
};

module.exports = { getAll, getById, create, update };
