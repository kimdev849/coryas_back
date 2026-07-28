// ============================================================
// LOGIN VIEW - Formulaire de connexion PRÉSENCIA
// ============================================================

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";

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
      if (!error.response) {
        Alert.alert("Erreur réseau", "Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.");
      } else {
        const message = error.response?.data?.message || "Email ou mot de passe incorrect.";
        Alert.alert("Erreur de connexion", message);
      }
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
        {/* HEADER Logo */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.appName}>PRÉSENCIA</Text>
          <Text style={styles.appTagline}>Gestion des présences</Text>
        </View>

        {/* FORMULAIRE */}
        <View style={styles.content}>
          <Text style={styles.title}>Connexion</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
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
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, padding: 24 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  header: { marginTop: 60, marginBottom: 60, alignItems: "center" },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: { fontSize: 36, fontWeight: "800", color: Colors.white },
  appName: {
    fontSize: 28, fontWeight: "800", color: Colors.black,
    letterSpacing: 3,
  },
  appTagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  content: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.black, marginBottom: 32 },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: "600", color: Colors.textSecondary,
    marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8,
  },
  input: {
    width: "100%", backgroundColor: Colors.bgLight,
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 12, fontSize: 16, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.lightGray,
  },
  button: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 16, borderRadius: 12,
    alignItems: "center", marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
});
