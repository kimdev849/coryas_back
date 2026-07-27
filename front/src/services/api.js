// ================================================================
// 🌐 CONFIGURATION API - Point d'entrée centralisé pour les appels API
// ================================================================
// Ce fichier fournit :
// 1. L'URL de base de l'API (avec détection automatique de l'environnement)
// 2. Une fonction pour récupérer les headers avec le token JWT
// 3. Une fonction utilitaire fetchWithAuth pour tous les appels
// 4. La fonction isTokenExpired() pour valider un token localement
// 5. Détection de boucle de redirection infinie
// ================================================================

// ================================================================
// Détecte une boucle de redirection infinie.
// Utilise sessionStorage (persiste entre les rechargements d'une
// même session) pour compter les redirections.
// Si plus de 3 redirections consécutives sont détectées,
// on arrête la boucle en nettoyant TOUT le stockage.
// ================================================================
// ================================================================
// Incrémente le compteur de redirection (pour le debug)
// ================================================================
const incrementRedirectCount = () => {
  const key = "_redirect_count";
  const count = parseInt(sessionStorage.getItem(key) || "0", 10);
  sessionStorage.setItem(key, String(count + 1));
};

// ================================================================
// Réinitialise les compteurs de redirection et de rechargement
// (appelé quand l'utilisateur se connecte volontairement)
// ================================================================
const resetRedirectCount = () => {
  sessionStorage.removeItem("_redirect_count");
  sessionStorage.removeItem("_app_load_count");
};

// ================================================================
// Détermine l'URL de base de l'API
// Ordre de priorité :
//   1. Variable d'environnement VITE_API_URL (build-time)
//   2. Valeur par défaut pour la production
//   3. /api (développement avec proxy Vite)
// ================================================================
const API_URL = import.meta.env.VITE_API_URL || "/api";

// ================================================================
// Vérifie si un token JWT est expiré (sans appel API)
// Retourne true si le token est invalide ou expiré
// ================================================================
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // Un JWT a 3 parties séparées par des points : header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    
    // La partie payload est en base64url (variante URL-safe du base64)
    // On normalise en base64 standard avant de décoder
    const base64url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64url));
    
    // 'exp' est le timestamp d'expiration en secondes
    // On compare avec Date.now() qui est en millisecondes
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true; // Token expiré
    }
    
    return false; // Token valide
  } catch {
    return true; // En cas d'erreur de parsing, on considère le token invalide
  }
};

// ================================================================
// Récupère le token JWT depuis le localStorage
// ================================================================
const getToken = () => {
  return localStorage.getItem("token");
};

// ================================================================
// Valide le token stocké et le nettoie si nécessaire
// Retourne le token s'il est valide, null sinon
// ================================================================
const getValidToken = () => {
  const token = getToken();
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
  return token;
};

// ================================================================
// Construit les headers avec le token d'authentification
// ================================================================
const getHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getValidToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

// ================================================================
// Fonction utilitaire pour tous les appels API
// ================================================================
const fetchWithAuth = async (endpoint, options = {}) => {
  const { method = "GET", body = null, includeAuth = true } = options;

  const config = {
    method,
    headers: getHeaders(includeAuth),
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // ⚠️ Gère le cas où le serveur renvoie du HTML au lieu du JSON
    // (ex: en production si l'URL de l'API n'est pas bien configurée)
    const contentType = response.headers.get("content-type") || "";
    
    if (!contentType.includes("application/json")) {
      // Si la réponse n'est pas du JSON, on ne peut pas l'interpréter
      const text = await response.text().catch(() => "");
      console.error(`❌ API non-JSON [${method} ${endpoint}]:`, text.substring(0, 200));
      
      // Si c'est une 404, message clair avec l'URL concernée
      if (response.status === 404) {
        throw new Error(
          `API inaccessible (404) : ${API_URL}${endpoint}. Vérifiez que l'URL backend est correcte.`
        );
      }
      
      throw new Error(
        `Réponse inattendue (${contentType}) depuis ${API_URL}${endpoint}. Vérifiez la configuration réseau.`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      // Si token expiré, déconnecter l'utilisateur
      if (response.status === 401 && includeAuth) {
        // 🔍 LOG DE DÉBOGAGE (visible uniquement en développement)
        if (import.meta.env.DEV) {
          console.warn(`🔍 401 reçu : ${method} ${API_URL}${endpoint} | Auth:`, !!config.headers?.Authorization, "Token:", !!localStorage.getItem("token"));
        }
        
        // Nettoie le localStorage et les compteurs
        incrementRedirectCount();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // 🚫 PLUS DE window.location.href !!!
        // Au lieu de faire un rechargement complet de la page (qui causait
        // une boucle infinie), on dispatch un événement personnalisé.
        // AuthContext écoute cet événement et met à jour son état React
        // (setToken(null), setUser(null)).
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        
        // On jette une erreur pour que l'appelant sache que la requête a échoué
        throw new Error(data.message || "Session expirée. Veuillez vous reconnecter.");
      }
      throw new Error(data.message || `Erreur ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ API Error [${method} ${endpoint}]:`, error.message || error);
    throw error;
  }
};

// ================================================================
// Client API axios-like (wrapper autour de fetchWithAuth)
// Permet d'utiliser api.get(), api.post(), api.put(), api.delete()
// comme avec Axios, mais basé sur fetchWithAuth.
// ================================================================
const api = {
    get: async (url, config = {}) => {
        let fullUrl = url;
        if (config.params) {
            const query = new URLSearchParams();
            for (const [key, val] of Object.entries(config.params)) {
                if (val !== undefined && val !== null) query.set(key, val);
            }
            const qs = query.toString();
            if (qs) fullUrl += "?" + qs;
        }
        // Retourne directement le résultat de fetchWithAuth (pas de double wrapping)
        return await fetchWithAuth(fullUrl, { method: "GET" });
    },
    post: async (url, body = null) => {
        return await fetchWithAuth(url, { method: "POST", body });
    },
    put: async (url, body = null) => {
        return await fetchWithAuth(url, { method: "PUT", body });
    },
    delete: async (url) => {
        return await fetchWithAuth(url, { method: "DELETE" });
    },
};

// ================================================================
// Attache les méthodes api.get/post/put/delete à fetchWithAuth
// Comme ça, les deux imports fonctionnent :
//   import fetchWithAuth from "./api" → fonction avec .get(), .post()
//   import api from "./api"           → idem (même objet)
// ================================================================
fetchWithAuth.get = api.get;
fetchWithAuth.post = api.post;
fetchWithAuth.put = api.put;
fetchWithAuth.delete = api.delete;

export { API_URL, getToken, getValidToken, getHeaders, fetchWithAuth, isTokenExpired, resetRedirectCount };
export default fetchWithAuth;
