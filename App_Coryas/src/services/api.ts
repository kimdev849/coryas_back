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
    return Promise.reject(error);
  }
);

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
