// ================================================================
// 📄 FICHIER : vite.config.js
// ----------------------------------------
// 💡 QU'EST-CE QUE VITE ?
// Vite (prononcé "vite" comme en français) est un "bundler"
// et un serveur de développement. C'est l'OUTIL qui :
//   1. Prend notre code React (.jsx) et le transforme en
//      JavaScript normal que le navigateur peut comprendre
//   2. Crée un serveur de développement super rapide (HMR)
//   3. Optimise le code pour la production (minification)
//
// 📚 CONCEPT CLÉ : Build tools
// Les navigateurs ne comprennent PAS nativement :
//   - Le JSX (le HTML dans le JS)
//   - Les imports ES6 modernes (import X from "y")
//   - Le CSS importé dans du JS
// Donc on a besoin d'un outil comme Vite pour TRADUIRE
// notre code en quelque chose que le navigateur comprend !
//
// 🏗️ CONCEPT CLÉ : Configuration
// Ce fichier dit à Vite comment se comporter :
// quels plugins utiliser, comment builder, etc.
// C'est le "plan de construction" de l'app.
// ================================================================

// ----------------------------------------------------------------
// 📦 IMPORT : defineConfig
// C'est une fonction fournie par Vite qui permet de définir
// la configuration avec de l'autocomplétion (plus facile).
//
// 🔧 Syntaxe : import { chose } from "package"
// On importe la fonction "defineConfig" depuis le package "vite"
// Les accolades {} signifient qu'on importe un export nommé
// (pas l'export par défaut).
// ----------------------------------------------------------------
import { defineConfig } from "vite";

// ----------------------------------------------------------------
// 📦 IMPORT : react plugin
// Le plugin officiel qui permet à Vite de comprendre React et JSX.
// SANS CE PLUGIN, Vite ne saurait pas quoi faire des fichiers .jsx
// et React ne fonctionnerait pas !
// ----------------------------------------------------------------
import react from "@vitejs/plugin-react";

// ----------------------------------------------------------------
// 🚀 EXPORT PAR DÉFAUT : defineConfig({...})
// export default signifie que ce fichier EXPORTE cette
// configuration pour que Vite puisse la lire.
//
// 🔄 PROXY : Toutes les requêtes vers /api sont redirigées
// vers le backend déployé sur Render.
// En dev, ça évite les erreurs CORS et le front peut
// appeler /api/... comme s'il était sur le même serveur.
// ----------------------------------------------------------------
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // ⚠️ En DEV : pointe vers le backend local (port 3000)
        //    Assurez-vous que le backend tourne : cd back && npm start
        // 🚀 En PROD : déployez le backend séparément et définissez
        //    VITE_API_URL dans votre environnement de build
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    // ⚡ Évite les rechargements intempestifs sur Windows
    watch: {
      usePolling: true,      // Utilise le polling au lieu des events filesystem
      interval: 1000,        // Vérifie les changements toutes les 1s (pas en boucle)
      ignored: [             // Ignore les fichiers temporaires
        "**/*.tmp",
        "**/*~",
        "**/*.swp",
        "**/.git/**",
        "**/node_modules/**",
        "**/dist/**",
      ],
    },
  },
});
