// ============================================================
// LAYOUT DES ONGLETS - Navigation par tabs (bottom tabs)
// ============================================================
// Ce fichier configure la barre de navigation en bas de l'écran
// avec Expo Router (Tabs). Il définit 4 onglets principaux
// et 3 écrans cachés accessibles par navigation programmatique.
//
// 📌 Expo Router Tabs :
//   Chaque fichier dans le dossier (tabs)/ devient un onglet.
//   - index.tsx → Accueil
//   - presences.tsx → Calendrier historique
//   - absences.tsx → Notifications
//   - profil.tsx → Profil
//
// ⚙️ Écrans cachés (href: null) :
//   - conges.tsx, demande-conge.tsx, parametres.tsx
//   Ils existent mais n'apparaissent PAS dans la barre d'onglets.
//   On y accède via router.push("/nom-du-fichier").
// ============================================================

import { Tabs } from "expo-router";
import { Colors } from "../../src/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      // ============================================================
      // screenOptions : applique les mêmes options à TOUS les onglets
      // ============================================================
      screenOptions={{
        // Cache l'en-tête natif pour chaque écran d'onglet
        // On utilise nos propres en-têtes dans chaque page
        headerShown: false,
        
        // Couleurs des icônes et textes dans la tab bar
        tabBarActiveTintColor: Colors.black,   // Onglet actif = noir
        tabBarInactiveTintColor: Colors.textLight, // Onglet inactif = gris
        
        // Style de la barre d'onglets (fond blanc, bordure fine)
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.bgLight,
          borderTopWidth: 1,
          paddingBottom: 16,
          paddingTop: 12,
          height: 76,
        },
        
        // Style du texte sous l'icône
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      {/* ============================================================ */}
      {/* ONGLET ACCUEIL                                               */}
      {/* ============================================================ */}
      {/* name="index" correspond au fichier index.tsx                 */}
      {/* title : texte affiché sous l'icône                           */}
      {/* tabBarIcon : fonction qui reçoit la couleur et retourne l'icône */}
      {/* ============================================================ */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <TabIcon label="🏠" color={color} />
          ),
        }}
      />

      {/* ============================================================ */}
      {/* ONGLET CALENDRIER (Historique des présences)                 */}
      {/* ============================================================ */}
      <Tabs.Screen
        name="presences"
        options={{
          title: "Calendrier",
          tabBarIcon: ({ color }) => (
            <TabIcon label="📅" color={color} />
          ),
        }}
      />

      {/* ============================================================ */}
      {/* ONGLET NOTIFICATIONS (utilise absences.tsx comme placeholder) */}
      {/* ============================================================ */}
      <Tabs.Screen
        name="absences"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => (
            <TabIcon label="🔔" color={color} />
          ),
        }}
      />

      {/* ============================================================ */}
      {/* ONGLET PROFIL                                                */}
      {/* ============================================================ */}
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <TabIcon label="👤" color={color} />
          ),
        }}
      />

      {/* ============================================================ */}
      {/* ÉCRANS CACHÉS (href: null = invisibles dans la tab bar)      */}
      {/* ============================================================ */}
      {/* Ces écrans sont accessibles uniquement par code :             */}
      {/*   router.push("/conges")                                     */}
      {/*   router.push("/demande-conge")                               */}
      {/*   router.push("/parametres")                                  */}
      {/* ============================================================ */}
      <Tabs.Screen
        name="conges"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="demande-conge"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="parametres"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

// ============================================================
// COMPOSANT ICÔNE D'ONGLET
// ============================================================
// Petit composant qui affiche un emoji comme icône.
// La prop "color" est fournie par Expo Router mais on utilise
// des emojis qui ne changent pas de couleur (simplicité).
// ============================================================
function TabIcon({ label, color }: { label: string; color: string }) {
  return <>{label}</>;
}
