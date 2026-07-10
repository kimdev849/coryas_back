import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { logout } from "../../src/services/auth";
import { Colors } from "../../src/constants/Colors";

// Mock profile options
const profileOptions = [
  { label: "Mode de pointage", value: "Manuel", icon: "⏱️" },
  { label: "Notifications", value: "Activées", icon: "🔔" },
  { label: "Langue", value: "Français", icon: "🌍" },
  { label: "Besoin d'aide ?", value: "", icon: "❓" },
  { label: "À propos", value: "Version 1.0.0", icon: "ℹ️" },
];

export default function ProfilTab() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const userStr = await AsyncStorage.getItem("@user_data");
          if (userStr) {
            setUser(JSON.parse(userStr));
          }
        } catch (error) {
          console.error("Erreur chargement profil", error);
        }
      };
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se déconnecter");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.prenom?.charAt(0) || "U"}{user?.nom?.charAt(0) || ""}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user ? `${user.prenom} ${user.nom}` : "Utilisateur"}
          </Text>
          <Text style={styles.userRole}>
            {user?.poste || "Développeur Fullstack"}
          </Text>
          <Text style={styles.userMatricule}>
            {user?.matricule || "COR-2024-1025"}
          </Text>
        </View>
      </View>

      {/* Options List */}
      <View style={styles.optionsList}>
        {profileOptions.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionLabel}>{option.label}</Text>
            {option.value ? (
              <Text style={styles.optionValue}>{option.value}</Text>
            ) : null}
            <Text style={styles.optionChevron}>›</Text>
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
  },
  userInfo: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
  },
  userDetails: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userMatricule: {
    fontSize: 12,
    color: Colors.textLight,
  },
  optionsList: {
    paddingTop: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  optionValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  optionChevron: {
    fontSize: 20,
    color: Colors.textLight,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.danger,
  },
});
