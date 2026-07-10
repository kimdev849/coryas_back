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
  const router = useRouter();

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
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Email ou mot de passe incorrect.";
      Alert.alert("Erreur de connexion", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo / Header */}
      <View style={styles.header}>
        <Text style={styles.logoPrimary}>PRESENCE</Text>
        <Text style={styles.logoSecondary}>CORYAS</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

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
