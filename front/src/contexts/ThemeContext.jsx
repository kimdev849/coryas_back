// ================================================================
// ThemeContext - Application du thème choisi dans la configuration
// ================================================================
// Ce contexte charge le thème depuis l'API et applique les
// couleurs correspondantes via les variables CSS (--color-primary,
// --color-primary-dark, --color-primary-light, etc.)
// ================================================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import parametresService from "../services/parametresService";

// Définition des thèmes disponibles
const THEMES = {
  coryas: {
    name: "Coryas",
    colors: {
      "--color-primary": "#F5A623",
      "--color-primary-dark": "#D4890A",
      "--color-primary-light": "#FFF3D6",
      "--color-primary-bg": "#FFFAF0",
      "--color-black": "#1A1A2E",
    },
  },
  bleu: {
    name: "Bleu",
    colors: {
      "--color-primary": "#3B82F6",
      "--color-primary-dark": "#2563EB",
      "--color-primary-light": "#DBEAFE",
      "--color-primary-bg": "#EFF6FF",
      "--color-black": "#1E293B",
    },
  },
  vert: {
    name: "Vert",
    colors: {
      "--color-primary": "#22C55E",
      "--color-primary-dark": "#16A34A",
      "--color-primary-light": "#DCFCE7",
      "--color-primary-bg": "#F0FDF4",
      "--color-black": "#1A2E1A",
    },
  },
  violet: {
    name: "Violet",
    colors: {
      "--color-primary": "#8B5CF6",
      "--color-primary-dark": "#7C3AED",
      "--color-primary-light": "#EDE9FE",
      "--color-primary-bg": "#F5F3FF",
      "--color-black": "#1E1B2E",
    },
  },
  rouge: {
    name: "Rouge",
    colors: {
      "--color-primary": "#EF4444",
      "--color-primary-dark": "#DC2626",
      "--color-primary-light": "#FEE2E2",
      "--color-primary-bg": "#FEF2F2",
      "--color-black": "#2E1A1A",
    },
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState("coryas");
  const [loading, setLoading] = useState(true);

  // Applique les couleurs du thème sur le :root
  const applyTheme = useCallback((themeKey) => {
    const theme = THEMES[themeKey] || THEMES.coryas;
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });

    setCurrentTheme(themeKey);
  }, []);

  // Charge le thème depuis l'API au démarrage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const result = await parametresService.get();
        if (result?.data?.theme) {
          applyTheme(result.data.theme);
        } else {
          applyTheme("coryas");
        }
      } catch {
        // En cas d'erreur (pas connecté, etc.), utiliser le thème par défaut
        applyTheme("coryas");
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, [applyTheme]);

  // Change le thème et sauvegarde dans la base
  // Le backend utilise COALESCE, donc envoyer { theme } seul suffit
  // à mettre à jour uniquement le thème sans toucher aux autres champs.
  const changeTheme = async (themeKey) => {
    if (!THEMES[themeKey]) return;
    applyTheme(themeKey);
    try {
      await parametresService.save({ theme: themeKey });
    } catch (err) {
      console.error("Erreur sauvegarde thème:", err);
    }
  };

  const value = {
    currentTheme,
    loading,
    themes: THEMES,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  }
  return context;
}

export default ThemeContext;
