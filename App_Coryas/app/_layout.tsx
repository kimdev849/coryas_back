// ============================================================
// LAYOUT RACINE (Racine = le dossier principal "app/")
// ============================================================
// Ce fichier est le point d'entrée de toute la navigation.
//
// 💡 APPROCHE : RENDU CONDITIONNEL, PAS DE NAVIGATION
// ============================================================
// Au lieu d'essayer de naviguer (ce qui échoue depuis les tabs
// dans Expo Router), on rend conditionnellement le bon écran :
//
// - isAuthenticated === "loading" → Splash (animation)
// - isAuthenticated === false     → LoginView (formulaire)
// - isAuthenticated === true      → Stack (app complète)
//
// Avantage : AUCUNE navigation nécessaire. React change juste
// ce qui est rendu. Simple, fiable, ça marche.
// ============================================================

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { LoginView } from "../src/components/LoginView";
import { SplashView } from "../src/components/SplashView";

function RootLayoutContent() {
  const { isAuthenticated } = useAuth();

  // 🎯 RENDU CONDITIONNEL : pas de navigation, juste React
  if (isAuthenticated === false) {
    return (
      <>
        <StatusBar style="light" />
        <LoginView />
      </>
    );
  }

  if (isAuthenticated === "loading") {
    return (
      <>
        <StatusBar style="light" />
        <SplashView />
      </>
    );
  }

  // ✅ Connecté : l'app complète avec navigation
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
