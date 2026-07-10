import { Tabs } from "expo-router";
import { Colors } from "../../src/constants/Colors";

// Tab layout matching the design
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Remove headers from all tab screens
        headerShown: false,
        
        // Tab bar colors
        tabBarActiveTintColor: Colors.black,
        tabBarInactiveTintColor: Colors.textLight,
        
        // Tab bar style
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.bgLight,
          borderTopWidth: 1,
          paddingBottom: 16,
          paddingTop: 12,
          height: 76,
        },
        
        // Tab bar label
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <TabIcon label="🏠" color={color} />
          ),
        }}
      />

      {/* Calendar/History Tab */}
      <Tabs.Screen
        name="presences"
        options={{
          title: "Calendrier",
          tabBarIcon: ({ color }) => (
            <TabIcon label="📅" color={color} />
          ),
        }}
      />

      {/* Notifications Tab (use absences.tsx as placeholder) */}
      <Tabs.Screen
        name="absences"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => (
            <TabIcon label="🔔" color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <TabIcon label="👤" color={color} />
          ),
        }}
      />

      {/* Hidden Screens */}
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

// Simple tab icon component
function TabIcon({ label, color }: { label: string; color: string }) {
  return <>{label}</>;
}
