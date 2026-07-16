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
import { isTokenExpired, resetRedirectCount } from "../services/api";

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
  // 🚨 NETTOYAGE D'URGENCE : Détecte et casse les boucles de redirection
  // ================================================================
  // Si le compteur de redirection (dans sessionStorage) est anormalement
  // élevé, on efface TOUTES les données stockées pour forcer un arrêt
  // de la boucle.
  // ================================================================
  const emergencyCleanup = () => {
    const redirectCount = parseInt(sessionStorage.getItem("_redirect_count") || "0", 10);
    const loadCount = parseInt(sessionStorage.getItem("_app_load_count") || "0", 10);
    
    // Si on a déjà chargé 10+ fois, on force le nettoyage
    if (redirectCount >= 3 || loadCount >= 8) {
      console.warn("🚨 Nettoyage d'urgence : boucle de rechargement détectée !");
      // ⚠️ NE PAS clear() le sessionStorage ! Cela effacerait les compteurs
      // et la boucle pourrait redémarrer. On supprime seulement les données d'auth.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return true;
    }
    
    sessionStorage.setItem("_app_load_count", String(loadCount + 1));
    return false;
  };

  // ================================================================
  // useEffect : Vérifier le token au démarrage de l'application
  // 1. NETTOYAGE D'URGENCE en premier (casse les boucles)
  // 2. Puis restaure la session si token valide
  // ================================================================
  useEffect(() => {
    try {
      // 🚨 ÉTAPE 1 : Nettoyage d'urgence (casse les boucles)
      const cleaned = emergencyCleanup();
      if (cleaned) {
        // Si on a nettoyé, on ne restaure RIEN et on reste sur la page de login
        console.warn("✅ Session nettoyée, page de connexion affichée");
        setLoading(false);
        return;
      }

      // ÉTAPE 2 : Restauration normale de la session
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        // 🔒 Vérifie si le token JWT est expiré AVANT de restaurer la session
        // Cela évite les boucles de redirection : si le token est expiré,
        // on ne redirige PAS vers /dashboard (car isAuthenticated = false)
        if (isTokenExpired(storedToken)) {
          console.warn("⏰ Token expiré, nettoyage de la session");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
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
  // 🚨 Écoute l'événement "auth:unauthorized" dispatché par api.js
  // quand un appel API retourne 401. Sans cette écoute, le contexte
  // React garderait l'ancien token en mémoire même après sa suppression
  // du localStorage, et l'utilisateur resterait isAuthenticated = true.
  // Ce qui forçait un window.location.href = "/" (rechargement complet)
  // et créait une boucle infinie.
  // ================================================================
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("🔒 Session expirée, déconnexion...");
      setToken(null);
      setUser(null);
    };
    
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
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

      // ✅ Réinitialise le compteur anti-boucle
      resetRedirectCount();

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
