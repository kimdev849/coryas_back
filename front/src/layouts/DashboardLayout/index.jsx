// ================================================================
// 📄 FICHIER : src/layouts/DashboardLayout/index.jsx
// ----------------------------------------
// C'est le LAYOUT principal. Il definit la structure visible
// sur toutes les pages connectees.
//
//   +--------------------------------+
//   |          Navbar                |
//   +----------+---------------------+
//   |          | <Outlet />          |
//   | Sidebar  | (page active)       |
//   |          |                     |
//   +----------+---------------------+
//
// CONCEPT : Layout
// Un layout enveloppe d'autres composants et fournit
// la structure commune (Navbar + Sidebar) a toutes les pages.
//
// CONCEPT : Outlet (de react-router-dom)
// <Outlet /> est un marque-place qui affiche la page ENFANT
// active a l'interieur du layout. Quand l'URL change,
// <Outlet /> affiche la page correspondante SANS recharger
// la Navbar et la Sidebar !
// ================================================================

import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./style.css";

function DashboardLayout() {
  return (
    <div className="layout">
      {/* Barre de navigation horizontale en haut */}
      <Navbar />

      <div className="layout-body">
        {/* Menu lateral gauche */}
        <Sidebar />

        {/* Contenu principal qui change selon la page */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
