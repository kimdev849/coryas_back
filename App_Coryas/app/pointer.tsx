import { StyleSheet, Text, View, Pressable, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { getActivePresence, checkIn, checkOut } from "../src/services/data";
import { useFocusEffect } from "expo-router";
import { Colors } from "../src/constants/Colors";

export default function PointerScreen() {
  const router = useRouter();
  
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [activePresenceId, setActivePresenceId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successTime, setSuccessTime] = useState<string | null>(null);
  
  const scaleAnim = useState(new Animated.Value(1))[0];

  // Load active presence
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activePresence = await getActivePresence();
      if (activePresence) {
        setIsCheckedIn(true);
        setCheckInTime(activePresence.heure_entree);
        setActivePresenceId(activePresence.id);
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setActivePresenceId(null);
      }
    } catch (error) {
      console.error("Erreur chargement pointer:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Handle pointer
  const handlePointer = async () => {
    setLoadingAction(true);
    try {
      if (isCheckedIn && activePresenceId) {
        await checkOut(activePresenceId);
        setSuccess(true);
        setSuccessTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => {
          setSuccess(false);
          loadData();
        }, 2000);
      } else {
        const presence = await checkIn();
        setSuccess(true);
        setSuccessTime(presence.heure_entree);
        setTimeout(() => {
          setSuccess(false);
          loadData();
        }, 2000);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le pointage");
      console.error(error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Animation for pointer button
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  // Go back
  const goBack = () => {
    router.back();
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successCircle}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Pointage enregistré</Text>
        <Text style={styles.successTime}>{successTime}</Text>
        <Text style={styles.successDate}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <Pressable style={styles.successButton} onPress={goBack}>
          <Text style={styles.successButtonText}>Voir mon accueil</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pointer</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.pointerCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Pressable
            style={({ pressed }) => [styles.pointerButton, pressed && styles.pointerButtonPressed]}
            onPress={() => {
              animatePress();
              handlePointer();
            }}
            disabled={loading || loadingAction}
          >
            <Text style={styles.pointerIcon}>⏱</Text>
          </Pressable>
        </Animated.View>
        
        <Text style={styles.statusText}>
          {isCheckedIn ? "Vous êtes au travail" : "Prêt à pointer ?"}
        </Text>
        <Text style={styles.subText}>
          {isCheckedIn ? `Arrivé à ${checkInTime}` : "Appuyez pour pointer"}
        </Text>
      </View>

      {/* Back Button */}
      <View style={styles.footer}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  header: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pointerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  pointerButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pointerButtonPressed: {
    opacity: 0.9,
  },
  pointerIcon: {
    fontSize: 64,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    width: "100%",
    paddingHorizontal: 40,
  },
  backButton: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  // Success screen
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  successCheck: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
  },
  successTime: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
  },
  successDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 48,
  },
  successButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
});
