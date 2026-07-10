// ============================================================
// PALETTE DE COULEURS DE L'APPLICATION
// ============================================================
// Ce fichier centralise toutes les couleurs utilisées dans l'app.
// Avantages :
//   1. Cohérence visuelle (une seule source de vérité)
//   2. Facilité de modification (changer une couleur ici la change partout)
//   3. as const : rend l'objet immuable (TypeScript)
//
// 📌 Utilisation :
//   import { Colors } from "../constants/Colors";
//   backgroundColor: Colors.primary
// ============================================================

export const Colors = {
  // ============================================================
  // COULEURS PRINCIPALES
  // ============================================================
  primary: "#FFD700", // Or/jaune - couleur principale de l'app
  black: "#000000",   // Noir pur
  white: "#FFFFFF",   // Blanc pur

  // ============================================================
  // GRIS (pour les fonds, bordures, textes secondaires)
  // ============================================================
  darkGray: "#333333",
  gray: "#808080",
  lightGray: "#E5E5E5",
  bgLight: "#F5F5F5", // Fond clair (inputs, cartes)
  bgDark: "#1A1A1A",  // Fond foncé (non utilisé pour l'instant)

  // ============================================================
  // COULEURS DE STATUT
  // ============================================================
  success: "#22C55E", // Vert - présent, check-in réussi
  warning: "#FBBF24", // Jaune - retard, pause
  danger: "#EF4444",  // Rouge - départ anticipé, erreur, déconnexion

  // ============================================================
  // COULEURS DE TEXTE
  // ============================================================
  textPrimary: "#000000",   // Texte principal (noir)
  textSecondary: "#666666", // Texte secondaire (gris foncé)
  textLight: "#999999",     // Texte léger (placeholders, infos mineures)
} as const;
