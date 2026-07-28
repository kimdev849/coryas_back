// ============================================================
// LOGIN VIEW - Connexion PRÉSENCIA — Design Premium
// ============================================================

import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

export function LoginView() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre email.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      await auth.login(email.trim(), password);
    } catch (error: any) {
      const message = error?.friendlyMessage || error?.response?.data?.message || "Email ou mot de passe incorrect.";
      Alert.alert("Erreur de connexion", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ============================================ */}
        {/* BANDEAU DÉCORATIF SUPÉRIEUR */}
        {/* ============================================ */}
        <View style={styles.topDecoration}>
          <View style={styles.topBlob} />
        </View>

        {/* ============================================ */}
        {/* LOGO + NOM DE L'APP */}
        {/* ============================================ */}
        <View style={styles.logoSection}>
          <View style={styles.logoOuterRing}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>P</Text>
            </View>
          </View>
          <Text style={styles.appName}>PRÉSENCIA</Text>
          <Text style={styles.appTagline}>Gestion des présences</Text>
        </View>

        {/* ============================================ */}
        {/* FORMULAIRE DE CONNEXION */}
        {/* ============================================ */}
        <View style={styles.formSection}>
          {/* En-tête du formulaire */}
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Bienvenue</Text>
            <Text style={styles.formSubtitle}>Connectez-vous à votre espace</Text>
          </View>

          {/* Champ Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="vous@entreprise.com"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
              <View style={styles.inputIconRight}>
                <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
              </View>
            </View>
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <View style={styles.inputIconRight}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
              </View>
            </View>
          </View>

          {/* Bouton de connexion */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              loading && styles.buttonDisabled,
              pressed && !loading && { transform: [{ scale: 0.97 }] },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Se connecter</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* ============================================ */}
        {/* FOOTER */}
        {/* ============================================ */}
        <View style={styles.footer}>
          <View style={styles.footerDots}>
            <View style={[styles.footerDot, { backgroundColor: Colors.primary }]} />
            <View style={[styles.footerDot, { backgroundColor: Colors.lightGray }]} />
            <View style={[styles.footerDot, { backgroundColor: Colors.lightGray }]} />
          </View>
          <Text style={styles.footerText}>PRÉSENCIA v1.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: 700,
  },

  // ==========================================
  // DÉCORATION
  // ==========================================
  topDecoration: {
    height: 200,
    width: "100%",
    overflow: "hidden",
  },
  topBlob: {
    position: "absolute",
    top: -80,
    right: -40,
    width: width * 1.3,
    height: 260,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 120,
    transform: [{ scaleX: 1.1 }],
    opacity: 0.08,
  },

  // ==========================================
  // LOGO
  // ==========================================
  logoSection: {
    alignItems: "center",
    marginTop: -100,
    marginBottom: 32,
  },
  logoOuterRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.black,
    letterSpacing: 4,
  },
  appTagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  // ==========================================
  // FORMULAIRE
  // ==========================================
  formSection: {
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputIconRight: {
    paddingRight: 16,
  },

  // Bouton
  button: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonArrow: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "600",
    opacity: 0.8,
  },

  // ==========================================
  // FOOTER
  // ==========================================
  footer: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 24,
  },
  footerDots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textLight,
    letterSpacing: 2,
  },
});
