// ================================================================
// 🔐 CONTEXTE AUTH - Gère l'état global de l'authentification
// ================================================================
// Ce contexte permet à TOUS les composants de l'application
// d'accéder aux informations de l'utilisateur connecté et au
// token JWT, sans avoir à les passer manuellement via les props.
//
// CONCEPT : React Context
// Un Context est un moyen de partager des données (état global)
// entre tous les composants sans les passer par chaque niveau
// de l'arbre de composants (évite le "props drilling").
//
// Structure :
// AuthProvider (enveloppe l'app) → fournit { user, token, login, logout }
//   ↓
// useAuth() → hook personnalisé pour accéder au contexte
//   ↓
// Tous les composants peuvent utiliser useAuth()
// ================================================================

import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

// ================================================================
// Création du contexte
// createContext() crée un conteneur vide qui pourra être rempli
// plus tard par AuthProvider
// ================================================================
const AuthContext = createContext(null);

// ================================================================
// PROVIDER - Composant qui enveloppe l'application
// Il stocke l'état (user, token) et fournit les fonctions
// (login, logout) à tous les enfants
// ================================================================
export function AuthProvider({ children }) {
  // ----- États -----
  // user : objet contenant { id, email, nom, prenom, role, employe_id }
  const [user, setUser] = useState(null);
  // token : le JWT token stocké dans localStorage
  const [token, setToken] = useState(null);
  // loading : true pendant la vérification du token au démarrage
  const [loading, setLoading] = useState(true);

  // ================================================================
  // useEffect : Vérifier le token au démarrage de l'application
  // Si un token existe dans localStorage, on restaure la session
  // ================================================================
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Erreur lors de la restauration de la session:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ================================================================
  // login : Connecter l'utilisateur
  // Appelle l'API /auth/login, puis stocke le token et l'user
  // ================================================================
  const login = async (email, password) => {
    const result = await authService.login(email, password);

    if (result.data && result.data.token) {
      const { token: newToken, user: userData } = result.data;

      // Stocker dans localStorage (persiste après fermeture du navigateur)
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Mettre à jour l'état React
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    }

    throw new Error(result.message || "Erreur de connexion");
  };

  // ================================================================
  // logout : Déconnecter l'utilisateur
  // Efface le token et l'user du localStorage et de l'état React
  // ================================================================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // ================================================================
  // updateUser : Mettre à jour les données utilisateur dans le contexte
  // ================================================================
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ================================================================
  // Valeurs fournies par le contexte
  // Tous les composants enfants peuvent y accéder avec useAuth()
  // ================================================================
  const value = {
    user,           // { id, email, nom, prenom, role, employe_id }
    token,          // JWT string
    loading,        // booléen (true tant qu'on vérifie le token)
    login,          // async (email, password) => { success, user }
    logout,         // () => void
    updateUser,     // (userData) => void
    isAuthenticated: !!token, // booléen : vrai si un token existe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ================================================================
// HOOK PERSONNALISÉ : useAuth()
// Permet à n'importe quel composant d'accéder au contexte auth
//
// Utilisation :
//   import { useAuth } from "../contexts/AuthContext";
//   const { user, login, logout } = useAuth();
// ================================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

export default AuthContext;
