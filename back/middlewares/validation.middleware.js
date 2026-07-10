// ================================================================
// validation.middleware.js - Verifie les donnees avant les controleurs
// ================================================================
// Tres important : on verifie que les infos envoyees par le client
// sont correctes AVANT de les utiliser.
// Si les donnees sont invalides -> on renvoie 400 (mauvaise requete)
// Si les donnees sont valides -> on passe au controlleur (next())
// ================================================================

// ================================================================
// validateConge - Verifie les champs d'une demande de conge
// ================================================================
// Verifie que :
// - les dates sont au bon format (YYYY-MM-DD)
// - la date de fin est apres la date de debut
// - la raison n'est pas vide
// ================================================================
const validateConge = (req, res, next) => {
  try {
    const { dateDebut, dateFin, raison } = req.body;

    // Verifie que les trois champs sont presents
    if (!dateDebut || !dateFin || !raison) {
      return res.status(400).json({ message: "Champs obligatoires : dateDebut, dateFin, raison", data: null });
    }

    // Verifie le format des dates : 4 chiffres - 2 chiffres - 2 chiffres
    // Exemple : 2024-01-15
    const regexDate = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexDate.test(dateDebut) || !regexDate.test(dateFin)) {
      return res.status(400).json({ message: "Format date invalide (YYYY-MM-DD)", data: null });
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    // Verifie que les dates sont valides (ex: pas 2024-13-01)
    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({ message: "Les dates fournies sont invalides", data: null });
    }
    // La fin doit etre apres le debut
    if (fin < debut) {
      return res.status(400).json({ message: "La date de fin doit etre apres la date de debut", data: null });
    }
    // La raison ne doit pas etre vide
    if (typeof raison !== "string" || raison.trim().length === 0) {
      return res.status(400).json({ message: "La raison est vide", data: null });
    }

    next(); // Tout est bon
  } catch (error) {
    res.status(400).json({ message: "Erreur validation", error: error.message });
  }
};

// ================================================================
// validateLogin - Verifie l'email et le mot de passe
// ================================================================
// Verifie que :
// - l'email a un format valide (texte@texte.texte)
// - le mot de passe fait au moins 6 caracteres
// ================================================================
const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verifie que les champs sont presents
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires", data: null });
    }

    // Verifie le format de l'email : quelquechose@quelquepart.quelquechose
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      return res.status(400).json({ message: "Email invalide", data: null });
    }
    // Le mot de passe doit faire au moins 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({ message: "Mot de passe minimum 6 caracteres", data: null });
    }

    next();
  } catch (error) {
    res.status(400).json({ message: "Erreur validation", error: error.message });
  }
};

// ================================================================
// validateEmploye - Verifie les champs d'un employe
// ================================================================
// Verifie que :
// - le nom, l'email, le poste et le departement sont presents
// - l'email a un format valide
// - le nom et le poste ne sont pas vides
// ================================================================
const validateEmploye = (req, res, next) => {
  try {
    const { nom, email, poste, departement } = req.body;

    // Verifie que les champs obligatoires sont la
    if (!nom || !email || !poste || !departement) {
      return res.status(400).json({ message: "Champs obligatoires : nom, email, poste, departement", data: null });
    }

    // Verifie le format de l'email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      return res.status(400).json({ message: "Email invalide", data: null });
    }
    // Verifie que le nom et le poste ne sont pas que des espaces
    if (nom.trim().length === 0 || poste.trim().length === 0) {
      return res.status(400).json({ message: "Nom et poste ne doivent pas etre vides", data: null });
    }

    next();
  } catch (error) {
    res.status(400).json({ message: "Erreur validation", error: error.message });
  }
};

module.exports = { validateConge, validateLogin, validateEmploye };

