// ============================================================
// ONGLET PROFIL - Informations utilisateur et déconnexion
// ============================================================
// Affiche le profil de l'utilisateur connecté avec :
//   - Avatar (initiales du prénom et nom)
//   - Nom complet, poste, matricule
//   - Options de l'application (mockées)
//   - Bouton de déconnexion
//
// ⚙️ Fonctionnement :
// 1. Au focus de l'onglet, on charge les données depuis AsyncStorage
// 2. Les données ont été sauvegardées lors de la connexion (login)
// 3. Le bouton "Déconnexion" appelle logout() qui :
//    - Supprime le token JWT et les données utilisateur
//    - Redirige vers l'écran splash (/)
// ============================================================

import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { logout } from "../../src/services/auth";
import { Colors } from "../../src/constants/Colors";



export default function ProfilTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null); // Données utilisateur (any car structure variable)

  // ============================================================
  // Chargement des données utilisateur depuis AsyncStorage
  // ============================================================
  // useFocusEffect : exécute le code à chaque fois que l'utilisateur
  // se rend sur l'onglet "Profil"
  //
  // AsyncStorage.getItem("@user_data") récupère l'objet JSON
  // qui a été stocké lors du login réussi
  // ============================================================
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

  // ============================================================
  // handleLogout : déconnexion de l'utilisateur
  // ============================================================
  // 1. Demande confirmation à l'utilisateur
  // 2. logout() supprime le token JWT + données utilisateur
  // 3. Redirige DIRECTEMENT vers /login (sans passer par le splash)
  // ============================================================
  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (error) {
              Alert.alert("Erreur", "Impossible de se déconnecter");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Profil</Text>
      </View>

      {/* ============================================================ */}
      {/* INFORMATIONS UTILISATEUR                                     */}
      {/* ============================================================ */}
      {/* Avatar : cercle noir avec les initiales (première lettre     */}
      {/* du prénom + première lettre du nom)                          */}
      {/* Infos : nom complet, poste, matricule                        */}
      {/* ============================================================ */}
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
          {user?.role && (
            <Text style={styles.userRole}>
              {user.role}
            </Text>
          )}
          {user?.poste && (
            <Text style={styles.userMatricule}>
              {user.poste}
            </Text>
          )}
        </View>
      </View>

      {/* ============================================================ */}
      {/* INFORMATIONS SUPPLÉMENTAIRES                                 */}
      {/* ============================================================ */}
      {/* Mes congés */}
      <Pressable style={styles.menuItem} onPress={() => router.push("/(tabs)/conges")}>
        <Ionicons name="calendar-outline" size={22} color={Colors.black} />
        <Text style={styles.menuItemLabel}>Mes congés</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </Pressable>

      <Pressable style={styles.menuItem} onPress={() => router.push("/(tabs)/demande-conge")}>
        <Ionicons name="add-circle-outline" size={22} color={Colors.black} />
        <Text style={styles.menuItemLabel}>Demander un congé</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </Pressable>

      <Pressable style={styles.menuItem} onPress={() => router.push("/(tabs)/parametres")}>
        <Ionicons name="settings-outline" size={22} color={Colors.black} />
        <Text style={styles.menuItemLabel}>Paramètres</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </Pressable>

      {/* Section Administration - visible uniquement pour les admins/RH/Directeur */}
      {(user?.role === "Administrateur" || user?.role === "RH" || user?.role === "Directeur") && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionHeaderText}>Administration</Text>
          </View>

          <Pressable style={styles.menuItem} onPress={() => router.push("/(tabs)/presences")}>
            <Ionicons name="list-outline" size={22} color={Colors.black} />
            <Text style={styles.menuItemLabel}>Toutes les présences</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </Pressable>
        </>
      )}

      <View style={styles.sectionSpacer} />

      {/* Version */}
      <View style={styles.optionRow}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.optionLabel}>Version</Text>
        <Text style={styles.optionValue}>1.0.0</Text>
      </View>

      {/* Déconnexion */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
    backgroundColor: Colors.white,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionSpacer: {
    height: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 10,
  },
  optionValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.danger,
    marginLeft: 8,
  },
});
