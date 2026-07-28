// ============================================================
// LAYOUT DES ONGLETS - Navigation par tabs (bottom tabs)
// ============================================================

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/Colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.lightGray,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingTop: 10,
          height: 60 + Math.max(insets.bottom, 20),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="presences"
        options={{
          title: "Calendrier",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="conges"
        options={{
          title: "Congés",
          tabBarIcon: ({ color }) => (
            <Ionicons name="umbrella-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="absences" options={{ href: null, title: "Notifications" }} />
      <Tabs.Screen name="demande-conge" options={{ href: null }} />
      <Tabs.Screen name="parametres" options={{ href: null }} />
    </Tabs>
  );
}
