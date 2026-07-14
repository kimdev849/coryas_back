// ============================================================
// SERVICE AUTH - Gestion de l'authentification
// ============================================================
// Ce service gère la connexion, la déconnexion et l'état
// de l'utilisateur connecté.
//
// Fonctions disponibles :
//   login(email, password)    → Se connecter et récupérer le token
//   logout()                  → Se déconnecter (efface le token)
//   getStoredToken()          → Vérifier si déjà connecté
// ============================================================

import api, { setToken, removeToken } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * User : les données de l'utilisateur connecté
 */
interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  employe_id: number;
}

/**
 * LoginResponse : ce que renvoie l'API quand on se connecte
 */
interface LoginResponse {
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

/**
 * login : connecte l'utilisateur avec email + mot de passe
 * 
 * @param email - L'email de l'employé
 * @param password - Le mot de passe
 * @returns Les données de l'employé connecté
 * @throws Error si la connexion échoue
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  // 1️⃣ On envoie la requête POST à /api/auth/login
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  // 2️⃣ On récupère les données de la réponse
  const data = response.data;

  // 3️⃣ On extrait le token et le user
  const token = data?.data?.token;
  const user = data?.data?.user;

  if (token && user) {
    // ✅ On stocke le token et le user dans AsyncStorage
    await setToken(token);
    await AsyncStorage.setItem("@user_data", JSON.stringify(user));
    return data;
  }

  // 4️⃣ Si pas de token (ex: API a retourné une 200 avec data: null)
  throw new Error(data?.message || "Email ou mot de passe incorrect");
};

/**
 * logout : déconnecte l'utilisateur
 * 
 * Supprime le token JWT et les données utilisateur stockés
 */
export const logout = async (): Promise<void> => {
  await removeToken();
  await AsyncStorage.removeItem("@user_data");
};

/**
 * checkAuth : vérifie si l'utilisateur est déjà connecté
 * 
 * Utilise la MÊME clé que le service api.ts (TOKEN_KEY = "@auth_token")
 * pour que le splash screen puisse détecter correctement
 * si l'utilisateur est connecté.
 * 
 * @returns true si un token est stocké, false sinon
 */
export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("@auth_token");
    return !!token;
  } catch {
    return false;
  }
};
