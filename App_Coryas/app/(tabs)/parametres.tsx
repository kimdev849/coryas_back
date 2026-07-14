// ============================================================
// PAGE PARAMÈTRES
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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/constants/Colors";
import { logout } from "../../src/services/auth";
import { postChangerMdp } from "../../src/services/data";

export default function ParametresPage() {
  const router = useRouter();
  const [showMdpForm, setShowMdpForm] = useState(false);
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmerMdp, setConfirmerMdp] = useState("");
  const [changementEnCours, setChangementEnCours] = useState(false);

  const handleChangerMdp = async () => {
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
    setChangementEnCours(true);
    try {
      const result = await postChangerMdp(ancienMdp, nouveauMdp);
      if (result.success) {
        Alert.alert("Succès", result.message);
        setShowMdpForm(false);
        setAncienMdp("");
        setNouveauMdp("");
        setConfirmerMdp("");
      } else {
        Alert.alert("Erreur", result.message);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Impossible de changer le mot de passe";
      Alert.alert("Erreur", msg);
    } finally {
      setChangementEnCours(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.cardTitle}>Sécurité</Text>
        </View>

        <Pressable
          style={styles.optionBtn}
          onPress={() => setShowMdpForm(!showMdpForm)}
        >
          <Text style={styles.optionText}>Modifier le mot de passe</Text>
          <Ionicons
            name={showMdpForm ? "chevron-up" : "chevron-forward"}
            size={20}
            color={Colors.textLight}
          />
        </Pressable>

        {showMdpForm && (
          <View style={styles.mdpForm}>
            <TextInput
              style={styles.input}
              placeholder="Ancien mot de passe"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
              value={ancienMdp}
              onChangeText={setAncienMdp}
            />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
              value={nouveauMdp}
              onChangeText={setNouveauMdp}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmer"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
              value={confirmerMdp}
              onChangeText={setConfirmerMdp}
            />
            <Pressable style={[styles.btn, changementEnCours && styles.btnDisabled]} onPress={handleChangerMdp} disabled={changementEnCours}>
              {changementEnCours ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnText}>Changer le mot de passe</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.cardTitle}>Informations</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
      </View>

      <Pressable style={styles.logoutBtn} onPress={() => {
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
                } catch {
                  Alert.alert("Erreur", "Impossible de se déconnecter");
                }
              },
            },
          ]
        );
      }}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 36,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  mdpForm: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.bgLight,
  },
  input: {
    backgroundColor: Colors.bgLight,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  btn: {
    backgroundColor: Colors.black,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: "600",
  },
});
