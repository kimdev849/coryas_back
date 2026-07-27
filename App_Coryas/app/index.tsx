// ============================================================
// ÉCRAN SPLASH - Page d'accueil au lancement de l'app
// ============================================================
// Utilise le composant SplashView réutilisable.
//
// Quand l'utilisateur est connecté : on redirige vers les tabs.
// C'est ici que la redirection se produit après une connexion
// réussie (LoginView ne navigue pas, c'est le Stack qui se
// remonte et index.tsx qui redirige).
// ============================================================

import { useRouter } from "expo-router";
import { useEffect } from "react";
import { SplashView } from "../src/components/SplashView";
import { useAuth } from "../src/contexts/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Rediriger vers les tabs si déjà connecté
  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  return <SplashView />;
}
