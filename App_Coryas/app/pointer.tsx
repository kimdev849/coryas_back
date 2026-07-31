// ============================================================
// ÉCRAN DE POINTAGE - Check-in / Check-out / Pause
// ============================================================
// L'employé peut :
// 1. Pointer l'arrivée (check-in) avec GPS obligatoire
// 2. Partir en pause / revenir de pause
// 3. Pointer le départ (check-out) — bloqué si en pause
// ============================================================

import { StyleSheet, Text, View, Pressable, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  getActivePresence, getTodayPresences, getParametres,
  checkIn, checkOut, startPause, endPause
} from "../src/services/data";
import { useFocusEffect } from "expo-router";
import { Colors } from "../src/constants/Colors";

export default function PointerScreen() {
  const router = useRouter();

  // ============================================================
  // ÉTATS
  // ============================================================
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [activePresenceId, setActivePresenceId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successTime, setSuccessTime] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<"checkin" | "checkout" | "pause_start" | "pause_end">("checkin");
  const [alreadyPointedToday, setAlreadyPointedToday] = useState(false);

  // États pause
  const [pauseStatut, setPauseStatut] = useState<"aucune" | "en_pause" | "terminee">("aucune");
  const [pauseStartTime, setPauseStartTime] = useState<string | null>(null);
  const [pauseElapsed, setPauseElapsed] = useState("00:00");

  // Paramètres entreprise
  const [heureOuverture, setHeureOuverture] = useState<string | null>(null);
  const [heureFermeture, setHeureFermeture] = useState<string | null>(null);
  const [dureePause, setDureePause] = useState<number>(60);

  // Animation
  const scaleAnim = useState(new Animated.Value(1))[0];
  const pauseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================================
  // Calcul du temps de pause écoulé
  // ============================================================
  const calculePause = (debut: string | null): string => {
    if (!debut) return "00:00";
    const [h, m] = debut.split(":").map(Number);
    const debutDate = new Date();
    debutDate.setHours(h, m, 0, 0);
    const diff = Math.floor((Date.now() - debutDate.getTime()) / 60000);
    if (diff <= 0) return "00:00";
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${String(mins).padStart(2, "0")}`;
  };

  // ============================================================
  // Chargement
  // ============================================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Chargement des présences
      const [activePresence, todayPresences] = await Promise.all([
        getActivePresence(),
        getTodayPresences(),
      ]);

      // Chargement des paramètres (SÉPARÉ pour ne pas être bloqué par les présences)
      try {
        const parametres = await getParametres();
        if (parametres) {
          setHeureOuverture(parametres.heure_ouverture || null);
          setHeureFermeture(parametres.heure_fermeture || null);
          setDureePause(parametres.duree_pause || 60);
        }
      } catch (e) {
        console.warn("Erreur chargement horaires pointer:", e);
      }

      if (activePresence) {
        setIsCheckedIn(true);
        setCheckInTime(activePresence.heure_entree);
        setActivePresenceId(activePresence.id);
        setAlreadyPointedToday(false);

        // Déterminer le statut pause
        const pStatut = activePresence.pause_statut;
        if (pStatut === "En pause") {
          setPauseStatut("en_pause");
          setPauseStartTime(activePresence.pause_entree || null);
          // Timer pause en temps réel
          if (activePresence.pause_entree) {
            setPauseElapsed(calculePause(activePresence.pause_entree));
            pauseIntervalRef.current = setInterval(() => {
              setPauseElapsed(calculePause(activePresence.pause_entree));
            }, 10000);
          }
        } else if (pStatut === "Terminée" || pStatut === "Terminee") {
          setPauseStatut("terminee");
          setPauseStartTime(null);
        } else {
          setPauseStatut("aucune");
          setPauseStartTime(null);
        }
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setActivePresenceId(null);
        setPauseStatut("aucune");
        setPauseStartTime(null);
        setAlreadyPointedToday(todayPresences.length > 0);
      }
    } catch (error) {
      console.error("Erreur chargement pointer:", error);
      setIsCheckedIn(false);
      setAlreadyPointedToday(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Nettoyage du timer pause
  const cleanupPauseTimer = () => {
    if (pauseIntervalRef.current) {
      clearInterval(pauseIntervalRef.current);
      pauseIntervalRef.current = null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => cleanupPauseTimer();
    }, [loadData])
  );

  // ============================================================
  // Gestion des actions
  // ============================================================
  const estWeekend = (): boolean => {
    const jour = new Date().getDay();
    return jour === 0 || jour === 6;
  };

  const handleCheckIn = async () => {
    setLoadingAction(true);
    try {
      const presence = await checkIn();
      setSuccess(true);
      setSuccessType("checkin");
      setSuccessTime(presence.heure_entree);
      setTimeout(() => { setSuccess(false); loadData(); }, 2000);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => router.replace("/login") }]
        );
        return;
      }
      Alert.alert("Erreur", error?.friendlyMessage || error?.response?.data?.message || "Impossible d'enregistrer le pointage");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCheckOut = async () => {
    if (pauseStatut === "en_pause") {
      Alert.alert(
        "Pause en cours",
        "Vous devez d'abord terminer votre pause avant de pointer votre départ."
      );
      return;
    }
    setLoadingAction(true);
    try {
      await checkOut(activePresenceId!);
      cleanupPauseTimer();
      setSuccess(true);
      setSuccessType("checkout");
      setSuccessTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => { setSuccess(false); loadData(); }, 2000);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => router.replace("/login") }]
        );
        return;
      }
      Alert.alert("Erreur", error?.friendlyMessage || error?.response?.data?.message || "Impossible d'enregistrer le départ");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStartPause = async () => {
    setLoadingAction(true);
    try {
      const presence = await startPause(activePresenceId!);
      setPauseStatut("en_pause");
      setPauseStartTime(presence.pause_entree);
      setPauseElapsed("00:00");
      if (presence.pause_entree) {
        setPauseElapsed(calculePause(presence.pause_entree));
        pauseIntervalRef.current = setInterval(() => {
          setPauseElapsed(calculePause(presence.pause_entree));
        }, 10000);
      }
      setSuccess(true);
      setSuccessType("pause_start");
      setSuccessTime(presence.pause_entree);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => router.replace("/login") }]
        );
        return;
      }
      Alert.alert("Erreur", error?.friendlyMessage || error?.response?.data?.message || "Impossible de démarrer la pause");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEndPause = async () => {
    setLoadingAction(true);
    try {
      const presence = await endPause(activePresenceId!);
      cleanupPauseTimer();
      setPauseStatut("terminee");
      setPauseStartTime(null);
      setSuccess(true);
      setSuccessType("pause_end");
      setSuccessTime(presence.pause_sortie);
      setTimeout(() => { setSuccess(false); loadData(); }, 2000);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter.",
          [{ text: "OK", onPress: () => router.replace("/login") }]
        );
        return;
      }
      Alert.alert("Erreur", error?.friendlyMessage || error?.response?.data?.message || "Impossible de terminer la pause");
    } finally {
      setLoadingAction(false);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const goBack = () => router.back();

  // ============================================================
  // ÉCRAN DE SUCCÈS
  // ============================================================
  if (success) {
    const messages: Record<string, { title: string; icon: string; iconName: string }> = {
      checkin: { title: "Arrivée enregistrée", icon: "checkmark-circle", iconName: "timer-outline" },
      checkout: { title: "Départ enregistré", icon: "checkmark-circle", iconName: "exit-outline" },
      pause_start: { title: "Pause débutée", icon: "cafe", iconName: "cafe-outline" },
      pause_end: { title: "Pause terminée", icon: "refresh", iconName: "refresh-outline" },
    };
    const msg = messages[successType] || messages.checkin;

    return (
      <View style={styles.container}>
        <View style={styles.successCircle}>
          <Ionicons name={msg.icon as any} size={48} color={Colors.white} />
        </View>
        <Text style={styles.successTitle}>{msg.title}</Text>
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

  // ============================================================
  // AFFICHAGE PRINCIPAL
  // ============================================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pointer</Text>
      </View>

      {/* Horaires configurés */}
      {(heureOuverture || heureFermeture) && (
        <View style={styles.companySchedule}>
          {heureOuverture && (
            <View style={styles.scheduleChip}>
              <Ionicons name="enter-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.scheduleChipText}>Début {heureOuverture}</Text>
            </View>
          )}
          {dureePause > 0 && (
            <View style={styles.scheduleChip}>
              <Ionicons name="cafe-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.scheduleChipText}>Pause {dureePause}min</Text>
            </View>
          )}
          {heureFermeture && (
            <View style={styles.scheduleChip}>
              <Ionicons name="exit-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.scheduleChipText}>Fin {heureFermeture}</Text>
            </View>
          )}
        </View>
      )}

      {/* Cercle de pointage + statut */}
      <View style={styles.content}>
        <Animated.View style={[styles.pointerCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Pressable
            style={({ pressed }) => [styles.pointerButton, pressed && styles.pointerButtonPressed]}
            onPress={() => {
              animatePress();
              if (isCheckedIn) {
                handleCheckOut();
              } else {
                handleCheckIn();
              }
            }}
            disabled={loading || loadingAction || (alreadyPointedToday && !isCheckedIn) || pauseStatut === "en_pause"}
          >
            <Ionicons name="timer-outline" size={64} color={Colors.black} />
          </Pressable>
        </Animated.View>

        <Text style={styles.statusText}>
          {pauseStatut === "en_pause" ? "En pause ☕" :
           isCheckedIn ? "Vous êtes au travail" :
           alreadyPointedToday ? "Pointage déjà effectué" : "Prêt à pointer ?"}
        </Text>
        <Text style={[styles.subText, (pauseStatut === "en_pause") && { color: Colors.warning }]}>
          {pauseStatut === "en_pause" ? `Pause depuis ${pauseElapsed}` :
           isCheckedIn ? `Arrivé à ${checkInTime}` :
           alreadyPointedToday ? "Retour à l'accueil" : "Appuyez pour pointer"}
        </Text>

        {/* Timer pause visible */}
        {pauseStatut === "en_pause" && (
          <View style={styles.pauseTimerContainer}>
            <Ionicons name="time-outline" size={20} color={Colors.warning} />
            <Text style={styles.pauseTimerText}>{pauseElapsed}</Text>
          </View>
        )}
      </View>

      {/* Boutons d'action (pause) */}
      {isCheckedIn && pauseStatut !== "terminee" && (
        <View style={styles.actionRow}>
          {pauseStatut === "aucune" ? (
            <Pressable
              style={[styles.pauseButton, loadingAction && styles.btnDisabled]}
              onPress={handleStartPause}
              disabled={loadingAction}
            >
              <Ionicons name="cafe-outline" size={20} color={Colors.white} />
              <Text style={styles.pauseButtonText}>Je vais en pause</Text>
            </Pressable>
          ) : pauseStatut === "en_pause" ? (
            <Pressable
              style={[styles.pauseButton, styles.pauseButtonEnd, loadingAction && styles.btnDisabled]}
              onPress={handleEndPause}
              disabled={loadingAction}
            >
              <Ionicons name="refresh-outline" size={20} color={Colors.white} />
              <Text style={styles.pauseButtonText}>Je reprends le travail</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Bouton retour */}
      {pauseStatut !== "en_pause" && (
        <View style={styles.footer}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>
              {alreadyPointedToday && !isCheckedIn ? "Voir mon accueil" : "Retour"}
            </Text>
          </Pressable>
        </View>
      )}
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
  header: { width: "100%", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "600", color: Colors.black },

  // Schedule chips
  companySchedule: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", gap: 8,
    paddingHorizontal: 20, marginBottom: 16,
  },
  scheduleChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.bgLight,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.lightGray,
  },
  scheduleChipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500" },

  // Pointer circle
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  pointerCircle: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    marginBottom: 32,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 24, elevation: 16,
  },
  pointerButton: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
  },
  pointerButtonPressed: { opacity: 0.9 },
  statusText: { fontSize: 18, fontWeight: "600", color: Colors.black, marginBottom: 8 },
  subText: { fontSize: 14, color: Colors.textSecondary },

  // Pause timer
  pauseTimerContainer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 16, backgroundColor: Colors.warning + "15",
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12,
  },
  pauseTimerText: {
    fontSize: 22, fontWeight: "700", color: Colors.warning,
  },

  // Action buttons (pause)
  actionRow: {
    width: "100%", paddingHorizontal: 40, marginBottom: 12,
  },
  pauseButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.warning,
    paddingVertical: 14, borderRadius: 12,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  pauseButtonEnd: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  pauseButtonText: { fontSize: 16, fontWeight: "700", color: Colors.white },
  btnDisabled: { opacity: 0.5 },

  // Footer
  footer: { width: "100%", paddingHorizontal: 40 },
  backButton: { width: "100%", paddingVertical: 16, alignItems: "center" },
  backButtonText: { fontSize: 16, fontWeight: "600", color: Colors.black },

  // Success screen
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.success,
    alignItems: "center", justifyContent: "center",
    marginBottom: 32,
  },
  successIcon: { fontSize: 44 },
  successTitle: { fontSize: 24, fontWeight: "700", color: Colors.black, marginBottom: 8 },
  successTime: { fontSize: 40, fontWeight: "700", color: Colors.black, marginBottom: 8 },
  successDate: { fontSize: 14, color: Colors.textSecondary, marginBottom: 48 },
  successButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  successButtonText: { fontSize: 16, fontWeight: "700", color: Colors.white },
});
