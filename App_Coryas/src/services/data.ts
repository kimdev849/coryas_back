// ============================================================
// SERVICE DATA - Récupération des données depuis l'API
// ============================================================
// Ce fichier contient toutes les fonctions pour récupérer
// les données depuis le backend.
//
// Chaque fonction :
//   1. Essaie de récupérer les données depuis l'API
//   2. Si ça échoue (hors ligne, pas de token), retourne
//      les données de démonstration (mock)
// ============================================================

import api, { getToken } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// TYPES (structures des données)
// ============================================================

export interface Presence {
  id: string;
  date_presence: string;
  heure_entree: string | null;
  heure_sortie: string | null;
  statut: "Présent" | "En retard" | "Départ anticipé" | "Present" | "Retard" | null;
  employe_id: number;
}

export interface Absence {
  id: string;
  date: string;
  motif: string;
  statut: "Justifié" | "Non justifié" | "En attente";
}

export interface Conge {
  id: string;
  date_debut: string;
  date_fin: string;
  motif: string;
  statut: "En attente" | "Approuvé" | "Rejeté" | "Approuve" | "Rejete";
  commentaire_rh?: string;
  employe_id: number;
}

export interface Employe {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  departement?: string;
  date_naissance?: string;
  date_embauche?: string;
  statut?: string;
}

// ============================================================
// DONNÉES DE DÉMONSTRATION (mock)
// ============================================================

const MOCK_PRESENCES: Presence[] = [
  { id: "1", date_presence: "2026-07-08", heure_entree: "08:12", heure_sortie: "17:30", statut: "Présent", employe_id: 1 },
  { id: "2", date_presence: "2026-07-07", heure_entree: "08:05", heure_sortie: "17:45", statut: "Présent", employe_id: 1 },
  { id: "3", date_presence: "2026-07-06", heure_entree: "08:30", heure_sortie: "17:15", statut: "En retard", employe_id: 1 },
];

const MOCK_ABSENCES: Absence[] = [
  { id: "1", date: "15 juin 2026", motif: "Maladie", statut: "Justifié" },
];

const MOCK_CONGES: Conge[] = [
  { id: "1", date_debut: "2026-07-01", date_fin: "2026-07-15", motif: "Congé annuel", statut: "Approuvé", employe_id: 1 },
];

const MOCK_EMPLOYE: Employe = {
  id: 1,
  matricule: "EMP001",
  nom: "Dupont",
  prenom: "Jean",
  email: "jean.dupont@coryas.com",
  telephone: "+33 6 12 34 56 78",
  departement: "Développement",
  date_embauche: "2024-01-01",
  statut: "Actif",
};

// ============================================================
// FONCTIONS API
// ============================================================

/**
 * getEmployeId : récupère l'ID de l'employé connecté
 */
const getEmployeId = async (): Promise<number | null> => {
  try {
    const userStr = await AsyncStorage.getItem("@user_data");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.employe_id;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * getPresences : récupère la liste des présences de l'employé connecté
 */
export const getPresences = async (): Promise<Presence[]> => {
  try {
    const employeId = await getEmployeId();
    const response = await api.get("/presences", {
      params: { employe_id: employeId },
    });
    const data = response.data?.data || [];
    return data;
  } catch {
    return MOCK_PRESENCES;
  }
};

/**
 * getActivePresence : récupère la présence active (si l'employé a pointé l'arrivée mais pas le départ)
 */
export const getActivePresence = async (): Promise<Presence | null> => {
  try {
    const employeId = await getEmployeId();
    const response = await api.get("/presences/active", {
      params: { employe_id: employeId },
    });
    return response.data?.data || null;
  } catch {
    return null;
  }
};

/**
 * checkIn : pointe l'arrivée
 */
export const checkIn = async (): Promise<Presence> => {
  try {
    const employeId = await getEmployeId();
    const response = await api.post("/presences/checkin", {
      employe_id: employeId,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * checkOut : pointe le départ
 */
export const checkOut = async (presenceId: string | number): Promise<Presence> => {
  try {
    const response = await api.post("/presences/checkout", {
      presenceId,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * getAbsences : récupère la liste des absences
 */
export const getAbsences = async (): Promise<Absence[]> => {
  try {
    const response = await api.get("/employes/me/absences");
    return response.data?.data || response.data || MOCK_ABSENCES;
  } catch {
    return MOCK_ABSENCES;
  }
};

/**
 * getConges : récupère la liste des congés de l'employé connecté
 */
export const getConges = async (): Promise<Conge[]> => {
  try {
    const employeId = await getEmployeId();
    const response = await api.get("/conges", {
      params: { employe_id: employeId },
    });
    return response.data?.data || MOCK_CONGES;
  } catch {
    return MOCK_CONGES;
  }
};

/**
 * postDemandeConge : envoie une demande de congé
 */
export const postDemandeConge = async (
  dateDebut: string,
  dateFin: string,
  motif: string,
): Promise<Conge> => {
  try {
    const employeId = await getEmployeId();
    const response = await api.post("/conges", {
      employe_id: employeId,
      date_debut: dateDebut,
      date_fin: dateFin,
      motif,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * getProfil : récupère les informations de l'employé
 */
export const getProfil = async (): Promise<Employe> => {
  try {
    const userStr = await AsyncStorage.getItem("@user_data");
    if (userStr) {
      const user = JSON.parse(userStr);
      const response = await api.get(`/employes/${user.employe_id}`);
      return response.data.data;
    }
    return MOCK_EMPLOYE;
  } catch {
    return MOCK_EMPLOYE;
  }
};

/**
 * postChangerMdp : change le mot de passe
 */
export const postChangerMdp = async (
  ancienMdp: string,
  nouveauMdp: string
): Promise<void> => {
  try {
    await api.post("/auth/change-password", {
      ancien_mot_de_passe: ancienMdp,
      nouveau_mot_de_passe: nouveauMdp,
    });
  } catch {
    // Si l'API n'est pas dispo, on simule
  }
};
