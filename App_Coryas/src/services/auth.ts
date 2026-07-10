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
  }

  // 4️⃣ On retourne les données de la réponse
  return data;
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
 * @returns true si un token est stocké, false sinon
 */
export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("@token");
    return !!token;
  } catch {
    return false;
  }
};
