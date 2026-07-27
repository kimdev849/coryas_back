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
export const getPresences = async (params?: { date_debut?: string; date_fin?: string }): Promise<Presence[]> => {
  try {
    const employeId = await getEmployeId();
    const response = await api.get("/presences", {
      params: { employe_id: employeId, ...params },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Erreur getPresences:", error);
    throw error;
  }
};

/**
 * getTodayPresences : récupère les présences d'aujourd'hui
 * Utilisée pour savoir si l'employé a déjà pointé aujourd'hui (même après départ)
 */
export const getTodayPresences = async (): Promise<Presence[]> => {
  const today = new Date().toISOString().split('T')[0];
  return getPresences({ date_debut: today, date_fin: today });
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
 * Envoie l'heure du téléphone + position GPS pour éviter la triche.
 */
export const checkIn = async (): Promise<Presence> => {
  try {
    const employeId = await getEmployeId();
    const now = new Date();
    const heure = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    
    // Tentative de récupération de la position GPS
    let latitude = null;
    let longitude = null;
    try {
      const { getCurrentPositionAsync } = await import("expo-location");
      const { requestForegroundPermissionsAsync } = await import("expo-location");
      const { status } = await requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await getCurrentPositionAsync({ accuracy: 6 });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }
    } catch {
      // GPS non disponible ou permission refusée
    }
    
    const response = await api.post("/presences/checkin", {
      employe_id: employeId,
      heure_entree: `${heure}:${minutes}`,
      latitude,
      longitude,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * checkOut : pointe le départ
 * Envoie l'heure du téléphone pour éviter les décalages de fuseau horaire serveur.
 */
export const checkOut = async (presenceId: string | number): Promise<Presence> => {
  try {
    const now = new Date();
    const heure = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const response = await api.post("/presences/checkout", {
      presenceId,
      heure_sortie: `${heure}:${minutes}`,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// NOTIFICATIONS
// ============================================================

export interface Notification {
  id: string;
  employe_id: number;
  titre: string;
  message: string;
  type: "info" | "success" | "warning" | "conges" | "pointage" | "absence";
  lien?: string;
  lu: boolean;
  created_at: string;
}

/**
 * getNotifications : récupère les notifications de l'employé connecté
 */
export const getNotifications = async (): Promise<{ data: Notification[]; nonLues: number }> => {
  try {
    const response = await api.get("/notifications");
    return { data: response.data?.data || [], nonLues: response.data?.nonLues || 0 };
  } catch (error) {
    console.error("Erreur getNotifications:", error);
    return { data: [], nonLues: 0 };
  }
};

/**
 * getUnreadNotificationsCount : nombre de notifications non lues
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const response = await api.get("/notifications/non-lues");
    return response.data?.data || 0;
  } catch {
    return 0;
  }
};

/**
 * markNotificationAsRead : marquer une notification comme lue
 */
export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    await api.put(`/notifications/${id}/lire`);
  } catch (error) {
    console.error("Erreur markNotificationAsRead:", error);
  }
};

/**
 * markAllNotificationsAsRead : tout marquer comme lu
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.put("/notifications/tout-lire");
  } catch (error) {
    console.error("Erreur markAllNotificationsAsRead:", error);
  }
};

// ============================================================
// PARAMÈTRES (Configuration de l'entreprise)
// ============================================================

export interface Parametres {
  nom_entreprise: string;
  heure_ouverture: string;
  heure_fermeture: string;
  retard_apres: number;
  depart_anticipe: number;
  duree_pause: number;
  email_entreprise: string;
  telephone: string;
  adresse: string;
}

/**
 * getParametres : récupère les paramètres de l'entreprise
 * (horaires, seuil de retard, etc.) depuis l'API.
 * Utilisé par l'app mobile pour afficher les heures attendues.
 * 
 * ⚠️ IMPORTANT : on vérifie d'abord si un token existe.
 * Si l'utilisateur n'est pas connecté (pas de token), on ne fait PAS
 * d'appel API. Sinon, le 401 déclencherait la déconnexion.
 */
export const getParametres = async (): Promise<Parametres | null> => {
  try {
    const token = await getToken();
    if (!token) {
      return null; // Pas connecté → valeurs par défaut
    }
    const response = await api.get("/parametres");
    return response.data?.data || null;
  } catch (error) {
    console.error("Erreur getParametres:", error);
    return null;
  }
};

/**
 * getConges : récupère la liste des congés de l'employé connecté
 */
export const getConges = async (): Promise<Conge[]> => {
  try {
    const employeId = await getEmployeId();
    if (!employeId) return [];
    const response = await api.get("/conges", {
      params: { employe_id: employeId },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Erreur getConges:", error);
    return [];
  }
};

// ============================================================
// Fonction utilitaire : convertit JJ/MM/AAAA → YYYY-MM-DD
// ============================================================
const convertirDateEnISO = (dateStr: string): string => {
  if (!dateStr) return dateStr;
  // Si la date est déjà en format YYYY-MM-DD, on la retourne telle quelle
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Si la date est en format DD/MM/AAAA, on la convertit
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  // Sinon on retourne la chaîne originale
  return dateStr;
};

/**
 * postDemandeConge : envoie une demande de congé
 * Accepte les dates en DD/MM/AAAA ou YYYY-MM-DD
 */
export const postDemandeConge = async (
  dateDebut: string,
  dateFin: string,
  motif: string,
  commentaire?: string,
): Promise<Conge> => {
  try {
    const employeId = await getEmployeId();
    const response = await api.post("/conges", {
      employe_id: employeId,
      date_debut: convertirDateEnISO(dateDebut),
      date_fin: convertirDateEnISO(dateFin),
      motif,
      commentaire,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * getPresenceById : récupère une présence par son ID
 */
export const getPresenceById = async (id: string): Promise<Presence> => {
  try {
    const response = await api.get(`/presences/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error("Erreur getPresenceById:", error);
    throw error;
  }
};

/**
 * getProfil : récupère les informations de l'employé
 */
export const getProfil = async (): Promise<Employe | null> => {
  try {
    const userStr = await AsyncStorage.getItem("@user_data");
    if (userStr) {
      const user = JSON.parse(userStr);
      const response = await api.get(`/employes/${user.employe_id}`);
      return response.data.data;
    }
    console.warn("getProfil: utilisateur non connecté");
    return null;
  } catch (error) {
    console.error("Erreur getProfil:", error);
    return null;
  }
};

/**
 * postChangerMdp : change le mot de passe
 */
export const postChangerMdp = async (
  ancienMdp: string,
  nouveauMdp: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await api.post("/auth/change-password", {
      ancien_mot_de_passe: ancienMdp,
      nouveau_mot_de_passe: nouveauMdp,
    });
    return { success: true, message: "Mot de passe changé avec succès" };
  } catch (error: any) {
    const message = error?.response?.data?.message || "Impossible de changer le mot de passe. Veuillez réessayer.";
    console.error("Erreur postChangerMdp:", error);
    return { success: false, message };
  }
};
