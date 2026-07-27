// ============================================================
// AuthContext - État global d'authentification
// ============================================================
// Fourni l'état d'auth (chargement/connecté/déconnecté) et les
// fonctions login/logout à toute l'application.
//
// Le RootLayout (app/_layout.tsx) utilise cet état pour décider
// quoi rendre : LoginView si déconnecté, SplashView si chargement,
// Stack (app complète) si connecté.
// ============================================================

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { checkAuth, login as authLogin, logout as authLogout } from "../services/auth";
import { on } from "../services/eventEmitter";

interface AuthContextType {
  isAuthenticated: boolean | "loading";
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | "loading">("loading");

  useEffect(() => {
    checkAuth().then(setIsAuthenticated);

    // ✅ Écoute l'événement auth:unauthorized émis par api.ts
    // quand un appel API retourne 401. Sans cela, isAuthenticated
    // reste true même si le token a été effacé.
    const unsubscribe = on("auth:unauthorized", () => {
      setIsAuthenticated(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authLogin(email, password);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
