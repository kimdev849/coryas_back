// ============================================================
// ÉCRAN DE POINTAGE - Check-in / Check-out
// ============================================================
// Cet écran permet à l'utilisateur de pointer son arrivée
// (check-in) et son départ (check-out).
//
// ⚙️ Fonctionnement :
// 1. Au chargement, on vérifie si une présence active existe
// 2. Si oui → on affiche "Vous êtes au travail" + heure d'arrivée
// 3. Si non → on affiche "Prêt à pointer ?"
// 4. Au clic sur le bouton :
//    - Si check-in → appel à checkIn() qui crée une présence
//    - Si check-out → appel à checkOut(id) qui ferme la présence
// 5. Animation de succès pendant 2 secondes
//
// 📌 Concepts React :
// - useFocusEffect : rechargement à chaque fois que l'écran est focus
// - useCallback : évite de recréer la fonction à chaque rendu
// - Animated : animation du bouton au clic (scale)
// ============================================================

import { StyleSheet, Text, View, Pressable, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { getActivePresence, checkIn, checkOut } from "../src/services/data";
import { useFocusEffect } from "expo-router";
import { Colors } from "../src/constants/Colors";

export default function PointerScreen() {
  const router = useRouter();
  
  // ============================================================
  // ÉTATS DU COMPOSANT
  // ============================================================
  const [isCheckedIn, setIsCheckedIn] = useState(false);           // L'utilisateur a-t-il pointé son arrivée ?
  const [checkInTime, setCheckInTime] = useState<string | null>(null); // Heure d'arrivée affichée
  const [activePresenceId, setActivePresenceId] = useState<string | number | null>(null); // ID de la présence active
  const [loading, setLoading] = useState(true);                   // Chargement initial
  const [loadingAction, setLoadingAction] = useState(false);       // Chargement pendant l'action (check-in/out)
  const [success, setSuccess] = useState(false);                   // Animation de succès visible ?
  const [successTime, setSuccessTime] = useState<string | null>(null); // Heure affichée dans l'écran de succès
  
  // Valeur animée pour l'effet de pression sur le bouton (scale 1 → 0.95 → 1)
  const scaleAnim = useState(new Animated.Value(1))[0];

  // ============================================================
  // loadData : récupère la présence active depuis l'API
  // ============================================================
  // useCallback : mémoïse la fonction (ne change que si [] change)
  // Cela évite des re-rendus inutiles
  // ============================================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // getActivePresence() appelle GET /api/presences/active
      // Retourne la présence en cours ou null
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

  // ============================================================
  // useFocusEffect : rechargement à chaque focus de l'écran
  // ============================================================
  // Contrairement à useEffect qui ne s'exécute qu'au montage,
  // useFocusEffect se déclenche à chaque fois que l'utilisateur
  // revient sur cet écran (par exemple après un check-in réussi).
  // ============================================================
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ============================================================
  // handlePointer : gère le clic sur le bouton de pointage
  // ============================================================
  const handlePointer = async () => {
    setLoadingAction(true);
    try {
      if (isCheckedIn && activePresenceId) {
        // CHECK-OUT : l'utilisateur est déjà présent → on enregistre le départ
        await checkOut(activePresenceId);
        setSuccess(true);
        setSuccessTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => {
          setSuccess(false);  // Cache l'écran de succès
          loadData();          // Recharge les données
        }, 2000);
      } else {
        // CHECK-IN : l'utilisateur n'est pas présent → on enregistre l'arrivée
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

  // ============================================================
  // animatePress : effet visuel au clic (le bouton rétrécit)
  // ============================================================
  // Animated.sequence : exécute les animations l'une après l'autre
  //   1. Rétrécir à 95% (100ms)
  //   2. Revenir à 100% (100ms)
  // Cela donne un effet de "clic" naturel
  // ============================================================
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  // Navigation : retour à l'écran précédent
  const goBack = () => {
    router.back();
  };

  // ============================================================
  // ÉCRAN DE SUCCÈS (affiché 2 secondes après un pointage)
  // ============================================================
  // Si success est true, on affiche cet écran à la place du
  // formulaire principal. Il montre :
  //   - Un cercle vert avec un ✓
  //   - Le message "Pointage enregistré"
  //   - L'heure du pointage
  //   - La date du jour
  //   - Un bouton pour retourner à l'accueil
  // ============================================================
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
      {/* Header avec le titre */}
      <View style={styles.header}>
        <Text style={styles.title}>Pointer</Text>
      </View>

      {/* ============================================================ */}
      {/* BOUTON PRINCIPAL DE POINTAGE                                  */}
      {/* ============================================================ */}
      {/* Un grand cercle doré avec un cercle blanc à l'intérieur       */}
      {/* L'effet scale est animé au clic (rétrécit puis revient)      */}
      {/* ============================================================ */}
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
        
        {/* Texte de statut : change selon check-in ou non */}
        <Text style={styles.statusText}>
          {isCheckedIn ? "Vous êtes au travail" : "Prêt à pointer ?"}
        </Text>
        <Text style={styles.subText}>
          {isCheckedIn ? `Arrivé à ${checkInTime}` : "Appuyez pour pointer"}
        </Text>
      </View>

      {/* Bouton retour */}
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
