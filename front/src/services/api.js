// ================================================================
// 🌐 CONFIGURATION API - Point d'entrée centralisé pour les appels API
// ================================================================
// Ce fichier fournit :
// 1. L'URL de base de l'API
// 2. Une fonction pour récupérer les headers avec le token JWT
// 3. Une fonction utilitaire fetchWithAuth pour tous les appels
// ================================================================

const API_URL = import.meta.env.VITE_API_URL || "/api";

// ================================================================
// Récupère le token JWT depuis le localStorage
// ================================================================
const getToken = () => {
  return localStorage.getItem("token");
};

// ================================================================
// Construit les headers avec le token d'authentification
// ================================================================
const getHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getToken();
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
    const data = await response.json();

    if (!response.ok) {
      // Si token expiré, déconnecter l'utilisateur
      if (response.status === 401 && includeAuth) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
      throw new Error(data.message || `Erreur ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

export { API_URL, getToken, getHeaders, fetchWithAuth };
export default fetchWithAuth;
