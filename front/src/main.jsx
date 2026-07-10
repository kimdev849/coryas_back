// ================================================================
// 📄 FICHIER : src/main.jsx
// ----------------------------------------
// 💡 QU'EST-CE QUE main.jsx ?
// C'est le POINT D'ENTRÉE de notre application React.
// C'est LE PREMIER fichier JavaScript chargé par le navigateur
// (via la balise <script> dans index.html).
//
// 🌳 ARBRE DE DÉPENDANCES :
//   index.html  ←  main.jsx  ←  App.jsx  ←  toutes les pages
//
// 📚 CONCEPT CLÉ : Le cycle de vie React
//   1. Le navigateur charge index.html
//   2. Le navigateur voit <script src="/src/main.jsx">
//   3. Le navigateur télécharge et exécute ce fichier
//   4. Ce fichier initialise React et monte l'application
//   5. React prend le contrôle de la page !
// ================================================================

// ----------------------------------------------------------------
// 📦 IMPORT depuis 'react'
// "react" est le package CŒUR de React (dans node_modules/).
// On importe StrictMode qui est un composant utilitaire.
//
// CONCEPT : Les imports
// import { chose } from "package" veut dire :
// "va chercher la fonction 'chose' dans le dossier
//  node_modules/package/ et rends-la disponible ici"
//
// CONCEPT STRICT MODE :
// StrictMode est un composant qui ACTIVE les vérifications
// en développement. Il :
//   - Détecte les bugs potentiels (ex : effets de bord)
//   - Exécute les composants 2 fois pour repérer les soucis
//   - N'a AUCUN effet en production (build final)
// ----------------------------------------------------------------
import { StrictMode } from "react";

// ----------------------------------------------------------------
// 📦 IMPORT : createRoot depuis 'react-dom/client'
// "react-dom" est le package qui permet à React de
// communiquer avec le navigateur (le DOM).
//
// createRoot() crée un "point d'attache" entre React et le HTML.
// C'est elle qui connecte le monde React (virtuel) au
// monde du navigateur (le DOM réel).
//
// AVANT React 18, on utilisait ReactDOM.render().
// Depuis React 18, on utilise createRoot() — plus moderne,
// plus performant (il supporte les fonctionnalités récentes).
// ----------------------------------------------------------------
import { createRoot } from "react-dom/client";

// ----------------------------------------------------------------
// 📦 IMPORT : Le CSS global
// On importe un fichier CSS directement dans du JavaScript !
// C'est Vite qui rend ça possible.
//
// 💡 Quand Vite voit "import './style.css'", il :
//   1. Lit le fichier CSS
//   2. L'injecte dans la page (dans le <head>)
//   3. Le rend disponible pour toute l'application
//
// Ce fichier global.css contient les styles de BASE
// qui s'appliquent à TOUTE l'application (reset, polices...)
// ----------------------------------------------------------------
import "./styles/global.css";

// ----------------------------------------------------------------
// 📦 IMPORT : Le composant App
// On importe le composant principal de notre application.
// "App" est le composant RACINE, celui qui contient TOUTE
// l'application (toutes les pages, les routes, etc.).
//
// Note : on écrit "./App.jsx" mais on peut écrire "./App"
// (React/Vite devinent l'extension .jsx tout seul).
// ----------------------------------------------------------------
import App from "./App";

// ================================================================
// 🚀 INITIALISATION DE REACT
// ================================================================

// ----------------------------------------------------------------
// ÉTAPE 1 : Créer la racine React
// ----------------------------------------------------------------
// document.getElementById("root") — c'est la <div id="root">
// dans index.html. C'est le "trou" où React va s'installer.
//
// createRoot(...) — crée une "racine React" attachée à cette div.
// C'est comme planter le drapeau React sur cette div.
// La variable "root" est un objet qui permet de contrôler React.
// ----------------------------------------------------------------
const root = createRoot(document.getElementById("root"));

// ----------------------------------------------------------------
// ÉTAPE 2 : Afficher l'application
// ----------------------------------------------------------------
// root.render(...) — dit à React : "Va y'a, affiche ça !"
// C'est le moment où React prend le contrôle de la page.
//
// On passe notre App (le composant racine) à render(),
// ENROBÉ dans StrictMode (pour les vérifications de bugs).
//
// 📚 CONCEPT JSX : <App />
// En React, les composants s'écrivent comme des balises HTML :
//   <App />  =  le composant App (auto-fermante car sans enfants)
//   <StrictMode>...</StrictMode>  =  avec des enfants à l'intérieur
//
// 📚 POURQUOI createRoot() et pas render() direct ?
// Avant React 18, on faisait :
//   ReactDOM.render(<App />, document.getElementById("root"))
// Maintenant on fait en 2 étapes (createRoot puis render) pour
// activer les nouvelles fonctionnalités de React 18+ (concurrent mode).
// ----------------------------------------------------------------
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
