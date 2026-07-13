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
// ================================================================
// Fonction utilitaire : convertit DD/MM/AAAA → YYYY-MM-DD si besoin
// ================================================================
const normaliserDate = (dateStr) => {
  if (!dateStr) return dateStr;
  // Format DD/MM/AAAA → YYYY-MM-DD
  const regexDDMMYYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(regexDDMMYYYY);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return dateStr;
};

// ================================================================
// Fonction utilitaire : vérifie qu'une date YYYY-MM-DD est valide
// (Reçoit toujours du YYYY-MM-DD car normaliserDate est appelé avant)
// ================================================================
const estDateValide = (dateStr) => {
  const regexDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexDate.test(dateStr)) return false;

  // Vérifie que la date existe vraiment (pas 2024-13-01 ou 2024-02-30)
  const [annee, mois, jour] = dateStr.split("-").map(Number);
  const date = new Date(annee, mois - 1, jour);
  return date.getFullYear() === annee &&
         date.getMonth() === mois - 1 &&
         date.getDate() === jour;
};

// ================================================================
// validateConge - Verifie les champs d'une demande de conge
// ================================================================
// Verifie que :
// - les dates sont au bon format (YYYY-MM-DD ou DD/MM/AAAA)
// - la date de fin est apres la date de debut
// - la raison n'est pas vide
// ================================================================
const validateConge = (req, res, next) => {
  try {
    // Accepte camelCase OU snake_case
    const dateDebut = req.body.dateDebut || req.body.date_debut;
    const dateFin = req.body.dateFin || req.body.date_fin;
    const raison = req.body.raison || req.body.motif;

    // Verifie que les trois champs sont presents
    if (!dateDebut || !dateFin || !raison) {
      return res.status(400).json({
        message: "Champs obligatoires : dateDebut/date_debut, dateFin/date_fin, raison/motif",
        data: null
      });
    }

    // Normalise les dates (DD/MM/AAAA → YYYY-MM-DD)
    const dateDebutNorm = normaliserDate(dateDebut);
    const dateFinNorm = normaliserDate(dateFin);

    // Verifie le format : 4 chiffres - 2 chiffres - 2 chiffres
    const regexDate = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexDate.test(dateDebutNorm) || !regexDate.test(dateFinNorm)) {
      return res.status(400).json({
        message: "Format date invalide. Utilisez YYYY-MM-DD ou DD/MM/AAAA",
        data: null
      });
    }

    // Verifie que les dates sont valides (ex: pas 2024-13-01 ni 2024-02-30)
    if (!estDateValide(dateDebutNorm) || !estDateValide(dateFinNorm)) {
      return res.status(400).json({
        message: "Les dates fournies sont invalides (mois ou jour inexistant)",
        data: null
      });
    }

    // La fin doit etre apres ou egale au debut
    if (dateFinNorm < dateDebutNorm) {
      return res.status(400).json({
        message: "La date de fin doit etre apres la date de debut",
        data: null
      });
    }

    // Remplace les dates originales par les dates normalisees dans le body
    // pour que le controleur reçoive toujours du YYYY-MM-DD
    req.body.date_debut = dateDebutNorm;
    req.body.date_fin = dateFinNorm;
    if (req.body.dateDebut) req.body.dateDebut = dateDebutNorm;
    if (req.body.dateFin) req.body.dateFin = dateFinNorm;

    // La raison ne doit pas etre vide
    if (typeof raison !== "string" || raison.trim().length === 0) {
      return res.status(400).json({ message: "La raison/motif est vide", data: null });
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
// validateEmploye - Verifie les champs d'un employé
// ================================================================
// Verifie que :
// - nom, prénom, email, département sont présents
// - le nom et prénom ne contiennent pas de chiffres
// - l'email a un format valide
// - le téléphone, si présent, contient uniquement chiffres, +, espaces
// - le mot de passe fait au moins 6 caractères
// ================================================================
// NOTE : le backend reçoit `nom`, `prenom`, `email` (camelCase)
// et aussi `departement_id` (snake_case) du formulaire Employés
// ================================================================
const validateEmploye = (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, password, departement_id } = req.body;

    // --- Champs obligatoires ---
    if (!nom || !prenom || !departement_id) {
      return res.status(400).json({
        message: "Champs obligatoires : nom, prenom, departement",
        data: null
      });
    }

    // --- Vérifie que le nom ne contient pas de chiffres ---
    const regexLettres = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/;
    if (!regexLettres.test(nom)) {
      return res.status(400).json({
        message: "Le nom ne doit contenir que des lettres, espaces et tirets",
        data: null
      });
    }
    if (!regexLettres.test(prenom)) {
      return res.status(400).json({
        message: "Le prénom ne doit contenir que des lettres, espaces et tirets",
        data: null
      });
    }

    // --- Vérifie le format du téléphone (si fourni) ---
    if (telephone && telephone.trim() !== "") {
      const regexTel = /^[\d\s\+\-\.\(\)]+$/;
      if (!regexTel.test(telephone)) {
        return res.status(400).json({
          message: "Le téléphone ne doit contenir que des chiffres, espaces, +, -, .",
          data: null
        });
      }
    }

    // --- Vérifie l'email (si fourni pour création) ---
    if (email) {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email)) {
        return res.status(400).json({
          message: "Format d'email invalide (ex: nom@domaine.com)",
          data: null
        });
      }
    }

    // --- Vérifie le mot de passe (si fourni pour création) ---
    if (password && password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
        data: null
      });
    }

    next();
  } catch (error) {
    res.status(400).json({ message: "Erreur validation", error: error.message });
  }
};

module.exports = { validateConge, validateLogin, validateEmploye };

