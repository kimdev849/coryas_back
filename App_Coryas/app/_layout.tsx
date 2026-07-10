// ============================================================
// LAYOUT RACINE (Racine = le dossier principal "app/")
// ============================================================
// Ce fichier est le point d'entrée de toute la navigation.
// Il définit l'ordre dans lequel les pages s'affichent.
// Exemple : d'abord l'accueil → ensuite la connexion → puis les onglets
// ============================================================

// 📦 On importe "Stack" depuis expo-router
// "Stack" crée une pile de pages : quand on navigue, on empile une page
// sur l'autre, comme une pile d'assiettes. On peut "revenir en arrière".
import { Stack } from "expo-router";

// 📦 On importe StatusBar pour gérer la barre du haut du téléphone
// (l'heure, la batterie, etc.) - "light" la rend blanche sur fond orange
import { StatusBar } from "expo-status-bar";

/**
 * RootLayout - Le composant principal qui enveloppe toute l'appli
 * 
 * "export default" = ce composant est celui par défaut de ce fichier,
 *                donc les autres fichiers peuvent l'importer facilement
 * 
 * "function" = une fonction qui retourne du JSX (du code qui ressemble
 *              à du HTML mais pour les apps mobiles)
 */
export default function RootLayout() {
  return (
    <>
      {/* 
        StatusBar : la barre tout en haut du téléphone 
        style="light" = texte en blanc (adapté au fond orange)
      */}
      <StatusBar style="light" />

      {/*
        Stack : le navigateur principal de l'appli
        C'est lui qui gère le passage d'une page à l'autre.

        screenOptions = options appliquées à TOUTES les pages
        headerShown: false = on cache le titre "Retour" automatique
        (car on veut gérer nous-mêmes la navigation)
      */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/*
          Chaque Stack.Screen = une page de l'application
          name = le nom du fichier (sans l'extension .tsx)
          
          Ordre des pages : 
          1. "index" = app/index.tsx (la page d'accueil/landing)
          2. "login" = app/login.tsx (la page de connexion)
          3. "(tabs)" = app/(tabs)/_layout.tsx (les onglets)
        */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
