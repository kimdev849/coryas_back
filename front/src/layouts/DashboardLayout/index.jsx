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

import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./style.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="layout">
      {/* Barre de navigation horizontale en haut */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="layout-body">
        {/* Overlay mobile pour fermer la sidebar */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} />
        )}

        {/* Menu lateral gauche */}
        <div className={`sidebar-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
          <Sidebar onClose={closeSidebar} />
        </div>

        {/* Contenu principal qui change selon la page */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
