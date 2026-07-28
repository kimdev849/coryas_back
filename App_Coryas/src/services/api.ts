// ============================================================
// SERVICE API - Communication avec le backend
// ============================================================
// Ce fichier configure Axios pour communiquer avec l'API
// backend qui tourne sur https://coryas-api.onrender.com
//
// 📌 Utilisation :
//   import api from "../services/api";
//   const response = await api.get("/presences");
//   const response = await api.post("/auth/login", { email, password });
// ============================================================

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emit } from "./eventEmitter";

// 🔑 Clé utilisée pour stocker le token JWT dans AsyncStorage
const TOKEN_KEY = "@auth_token";

/**
 * Instance Axios préconfigurée pour l'API
 * 
 * - baseURL : l'adresse du backend déployé (https://coryas-api.onrender.com/api)
 * - Un intercepteur ajoute automatiquement le token JWT
 *   à chaque requête si l'utilisateur est connecté
 */
const api = axios.create({
  baseURL: "https://coryas-api.onrender.com/api",
  timeout: 10000, // 10 secondes max par requête
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// INTERCEPTEUR : Ajoute le token JWT à chaque requête
// ============================================================
// Avant chaque requête, on vérifie si un token est stocké.
// S'il existe, on l'ajoute dans l'en-tête Authorization.
// ============================================================
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Erreur lors de la récupération du token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// INTERCEPTEUR : Gère les erreurs de réponse
// ============================================================
// Si la réponse est une 401 (non autorisé), on vide le token
// ET les données utilisateur. L'utilisateur sera redirigé
// vers la page de connexion au prochain clic.
//
// Pour toutes les erreurs, on normalise le message pour que
// les écrans reçoivent toujours un message user-friendly.
// ============================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → on déconnecte complètement
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem("@user_data");
      // ✅ Notifie AuthContext pour mettre à jour l'état React
      // Sans cela, isAuthenticated reste true même si le token est effacé,
      // et l'utilisateur bloque sur l'écran sans pouvoir se reconnecter.
      emit("auth:unauthorized");
    }

    // ============================================================
    // NORMALISATION DES MESSAGES D'ERREUR
    // ============================================================
    // On transforme TOUTES les erreurs axios en un format standard
    // avec un message user-friendly, pour que les écrans n'aient
    // JAMAIS à afficher "Network Error" ou "AxiosError" bruts.
    // ============================================================
    let friendlyMessage = "Une erreur est survenue. Veuillez réessayer.";

    if (error.response) {
      // ✅ Le serveur a répondu (4xx, 5xx)
      // On prend le message du serveur s'il existe
      friendlyMessage = error.response.data?.message 
        || error.response.data?.error 
        || getHttpErrorMessage(error.response.status);
    } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      // ❌ Pas de réponse (hors ligne, DNS, etc.)
      friendlyMessage = "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
    } else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      // ⏱️ Timeout
      friendlyMessage = "Le serveur ne répond pas. Réessayez dans quelques instants.";
    }

    // On attache le message normalisé à l'erreur pour que les écrans l'utilisent
    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

/**
 * getHttpErrorMessage : retourne un message user-friendly selon le code HTTP
 */
function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400: return "Données invalides. Vérifiez les informations saisies.";
    case 403: return "Accès refusé. Vous n'avez pas les droits nécessaires.";
    case 404: return "Ressource introuvable.";
    case 409: return "Conflit : cette donnée existe déjà.";
    case 422: return "Données invalides. Vérifiez les champs du formulaire.";
    case 429: return "Trop de requêtes. Veuillez patienter quelques secondes.";
    case 500: return "Erreur serveur. Veuillez réessayer plus tard.";
    case 502: return "Service temporairement indisponible. Réessayez dans un instant.";
    case 503: return "Service en maintenance. Réessayez plus tard.";
    default: return "Une erreur est survenue. Veuillez réessayer.";
  }
}

/**
 * getToken : récupère le token JWT stocké
 * Utile pour vérifier si l'utilisateur est connecté
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * setToken : stocke le token JWT
 */
export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

/**
 * removeToken : supprime le token JWT (déconnexion)
 */
export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export default api;
