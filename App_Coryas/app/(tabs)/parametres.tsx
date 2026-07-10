// ============================================================
// PAGE PARAMÈTRES
// ============================================================
// Permet à l'employé de :
//   - Modifier son mot de passe
//   - Activer / désactiver les notifications
//   - Choisir le thème (clair / sombre)
//   - Se déconnecter
// ============================================================

import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/**
 * ParametresPage : page des paramètres de l'application
 */
export default function ParametresPage() {
  const router = useRouter();

  // 📝 États des paramètres
  const [notificationsActives, setNotificationsActives] = useState(true);
  const [themeSombre, setThemeSombre] = useState(false);
  const [showMdpForm, setShowMdpForm] = useState(false);
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmerMdp, setConfirmerMdp] = useState("");

  /**
   * handleChangerMdp : change le mot de passe
   */
  const handleChangerMdp = () => {
    if (!ancienMdp || !nouveauMdp || !confirmerMdp) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    if (nouveauMdp !== confirmerMdp) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (nouveauMdp.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    // ✅ Simulation de changement réussi
    Alert.alert("Succès ✅", "Votre mot de passe a été modifié avec succès.");
    setShowMdpForm(false);
    setAncienMdp("");
    setNouveauMdp("");
    setConfirmerMdp("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ============================================ */}
      {/* 📝 EN-TÊTE */}
      {/* ============================================ */}
      <View style={styles.header}>
        <Ionicons name="settings" size={40} color="#fff" />
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>Personnalisez votre expérience</Text>
      </View>

      {/* ============================================ */}
      {/* 🔑 SECTION : MOT DE PASSE */}
      {/* ============================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Sécurité</Text>

        {/* Bouton pour afficher le formulaire */}
        <Pressable
          style={styles.optionBtn}
          onPress={() => setShowMdpForm(!showMdpForm)}
        >
          <Ionicons name="lock-closed" size={22} color="#D4890A" />
          <Text style={styles.optionText}>Modifier le mot de passe</Text>
          <Ionicons
            name={showMdpForm ? "chevron-up" : "chevron-forward"}
            size={20}
            color="#999"
          />
        </Pressable>

        {/* Formulaire de changement de mot de passe */}
        {showMdpForm && (
          <View style={styles.mdpForm}>
            <TextInput
              style={styles.input}
              placeholder="Ancien mot de passe"
              placeholderTextColor="#999"
              secureTextEntry
              value={ancienMdp}
              onChangeText={setAncienMdp}
            />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#999"
              secureTextEntry
              value={nouveauMdp}
              onChangeText={setNouveauMdp}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le nouveau mot de passe"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmerMdp}
              onChangeText={setConfirmerMdp}
            />
            <Pressable style={styles.validerBtn} onPress={handleChangerMdp}>
              <Text style={styles.validerBtnText}>Changer le mot de passe</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ============================================ */}
      {/* 🔔 SECTION : NOTIFICATIONS */}
      {/* ============================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>

        {/* Option : Activer/désactiver les notifications */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="notifications" size={22} color="#D4890A" />
            <Text style={styles.optionText}>Notifications push</Text>
          </View>
          {/*
            Switch = interrupteur (toggle) ON/OFF
            value = état actuel
            onValueChange = fonction appelée quand on change
            trackColor = couleurs de l'interrupteur
          */}
          <Switch
            value={notificationsActives}
            onValueChange={setNotificationsActives}
            trackColor={{ false: "#ddd", true: "#D4890A" }}
            thumbColor={notificationsActives ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* ============================================ */}
      {/* 🎨 SECTION : THÈME */}
      {/* ============================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Apparence</Text>

        {/* Option : Thème clair/sombre */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name={themeSombre ? "moon" : "sunny"} size={22} color="#D4890A" />
            <Text style={styles.optionText}>Thème sombre</Text>
          </View>
          <Switch
            value={themeSombre}
            onValueChange={setThemeSombre}
            trackColor={{ false: "#ddd", true: "#D4890A" }}
            thumbColor={themeSombre ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* ============================================ */}
      {/* ℹ️ SECTION : INFORMATIONS */}
      {/* ============================================ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Informations</Text>

        <View style={styles.optionRow}>
          <Ionicons name="information-circle" size={22} color="#D4890A" />
          <Text style={styles.optionText}>Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>

      {/* ============================================ */}
      {/* 🚪 DÉCONNEXION */}
      {/* ============================================ */}
      <Pressable
        style={styles.logoutButton}
        onPress={() => router.replace("/")}
      >
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D4890A",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // ========== EN-TÊTE ==========
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  // ========== SECTIONS ==========
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },

  // ========== OPTION (cliquable) ==========
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  versionText: {
    fontSize: 14,
    color: "#999",
  },

  // ========== FORMULAIRE MOT DE PASSE ==========
  mdpForm: {
    marginTop: 15,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
  },
  validerBtn: {
    backgroundColor: "#D4890A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  validerBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },

  // ========== DÉCONNEXION ==========
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
