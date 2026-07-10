// ============================================================
// PAGE DE CONNEXION - Login utilisateur
// ============================================================
// Cette page permet à l'utilisateur de se connecter avec
// son email et son mot de passe.
//
// ⚙️ Fonctionnement :
// 1. L'utilisateur saisit son email et son mot de passe
// 2. Au clic sur "Se connecter", on appelle login()
// 3. login() envoie une requête POST au backend
// 4. Si OK → le token JWT est stocké → redirection vers l'accueil
// 5. Si erreur → on affiche une alerte avec le message d'erreur
//
// 📌 Concepts React :
// - useState : gère l'état des champs (email, password, loading)
// - Pressable : bouton tactile avec retour visuel
// - ActivityIndicator : spinner de chargement
// ============================================================

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { login } from "../src/services/auth";
import { Colors } from "../src/constants/Colors";

export default function LoginPage() {
  // 📍 Router Expo - permet de naviguer vers l'accueil après connexion
  const router = useRouter();

  // ============================================================
  // useState : variables d'état (re-rendu automatique si modifiées)
  // ============================================================
  const [email, setEmail] = useState("");         // Texte saisi dans le champ email
  const [password, setPassword] = useState("");   // Texte saisi dans le champ mot de passe
  const [loading, setLoading] = useState(false);  // État de chargement (évite les doubles clics)

  // ============================================================
  // handleLogin : fonction appelée au clic sur le bouton
  // ============================================================
  const handleLogin = async () => {
    // Validation : vérifie que les champs ne sont pas vides
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre email.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true); // Affiche le spinner de chargement

    try {
      // Appel à l'API : login() vient du service auth
      // Elle envoie { email, password } à POST /api/auth/login
      // Si OK, elle stocke le token JWT dans AsyncStorage
      await login(email.trim(), password);
      router.replace("/(tabs)"); // Redirection vers l'accueil
    } catch (error: any) {
      // Si erreur, on récupère le message du backend ou un message par défaut
      const message =
        error.response?.data?.message ||
        "Email ou mot de passe incorrect.";
      Alert.alert("Erreur de connexion", message);
    } finally {
      setLoading(false); // Cache le spinner (que ce soit un succès ou une erreur)
    }
  };

  return (
    <View style={styles.container}>
      {/* ============================================================ */}
      {/* HEADER : Logo de l'application                                */}
      {/* ============================================================ */}
      <View style={styles.header}>
        <Text style={styles.logoPrimary}>PRESENCE</Text>
        <Text style={styles.logoSecondary}>CORYAS</Text>
      </View>

      {/* ============================================================ */}
      {/* FORMULAIRE DE CONNEXION                                       */}
      {/* ============================================================ */}
      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

        {/* Champ Email */}
        {/* TextInput : champ de saisie géré par React Native */}
        {/*   - keyboardType="email-address" : affiche le clavier avec @ */}
        {/*   - autoCapitalize="none" : pas de majuscule automatique */}
        {/*   - value/onChangeText : pattern React contrôlé (two-way binding) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            placeholderTextColor={Colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Champ Mot de passe */}
        {/* secureTextEntry : masque les caractères saisis (••••) */}
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

        {/* Bouton de connexion */}
        {/* Pressable : bouton tactile (remplace TouchableOpacity) */}
        {/*   - disabled={loading} : empêche les doubles clics */}
        {/*   - Condition : si loading → spinner, sinon → texte */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 80,
    alignItems: "center",
  },
  logoPrimary: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.black,
    letterSpacing: 6,
  },
  logoSecondary: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 4,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  button: {
    width: "100%",
    backgroundColor: Colors.black,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
