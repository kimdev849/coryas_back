// ============================================================
// PAGE D'ACCUEIL - Tableau de bord de l'utilisateur
// ============================================================
// C'est la première page que voit l'utilisateur après connexion.
// Elle affiche :
//   - Un message de bienvenue avec le prénom
//   - Le statut actuel (présent/absent)
//   - Le temps travaillé (placeholder)
//   - L'emploi du temps de la journée
//   - Un bouton flottant pour pointer
//
// ⚙️ Fonctionnement :
// 1. useFocusEffect recharge les données à chaque affichage
// 2. AsyncStorage récupère les infos de l'utilisateur connecté
// 3. getActivePresence() vérifie si un pointage est en cours
// 4. Le bouton flottant navigue vers /pointer
// ============================================================

import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getActivePresence, getTodayPresences, getUnreadNotificationsCount, getParametres } from "../../src/services/data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { Colors } from "../../src/constants/Colors";

export default function HomeScreen() {
  const router = useRouter();
  
  // ============================================================
  // ÉTATS DU COMPOSANT
  // ============================================================
  const [userName, setUserName] = useState("");       // Prénom de l'utilisateur
  const [isCheckedIn, setIsCheckedIn] = useState(false); // Check-in actif ?
  const [checkInTime, setCheckInTime] = useState("--:--"); // Heure d'arrivée
  const [activePresenceId, setActivePresenceId] = useState<string | number | null>(null); // ID présence active
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);
  // Paramètres de l'entreprise (heures configurées)
  const [heureOuverture, setHeureOuverture] = useState<string | null>(null);
  const [heureFermeture, setHeureFermeture] = useState<string | null>(null);
  const [nomEntreprise, setNomEntreprise] = useState("");
  
  // Temps travaillé calculé en continu
  const [workedTime, setWorkedTime] = useState({ hours: 0, minutes: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // Fonctions utilitaires
  // ============================================================
  
  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return "Bonjour";
    if (h >= 12 && h < 18) return "Bonjour";
    return "Bonsoir";
  };

  const getTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('fr-FR', options);
  };

  const estWeekend = (): boolean => {
    const jour = new Date().getDay(); // 0=Dim, 6=Sam
    return jour === 0 || jour === 6;
  };

  /**
   * calculeTemps : calcule le temps écoulé depuis l'heure d'arrivée
   * Reçoit une heure au format "HH:MM" et retourne { hours, minutes }
   */
  const calculeTemps = (heureArrivee: string) => {
    if (!heureArrivee || heureArrivee === "--:--") {
      return { hours: 0, minutes: 0 };
    }
    const [h, m] = heureArrivee.split(":").map(Number);
    const arrivee = new Date();
    arrivee.setHours(h, m, 0, 0); // Met l'heure d'arrivée sur aujourd'hui
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - arrivee.getTime();
    if (diffMs <= 0) return { hours: 0, minutes: 0 };
    const totalMinutes = Math.floor(diffMs / 60000);
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
    };
  };

  // ============================================================
  // Chargement des données
  // ============================================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("@user_data");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(`${user.prenom}`);
      }

      const [activePresence, unread, todayPresences, parametres] = await Promise.all([
        getActivePresence(),
        getUnreadNotificationsCount(),
        getTodayPresences(),
        getParametres(),
      ]);

      // Charger les paramètres (heures configurées par le RH)
      if (parametres) {
        setNomEntreprise(parametres.nom_entreprise || "");
        setHeureOuverture(parametres.heure_ouverture || null);
        setHeureFermeture(parametres.heure_fermeture || null);
      }

      setUnreadCount(unread);

      if (activePresence) {
        setIsCheckedIn(true);
        setCheckInTime(activePresence.heure_entree || "--:--");
        setActivePresenceId(activePresence.id);
        setTodayCompleted(false);
      } else {
        setIsCheckedIn(false);
        setCheckInTime("--:--");
        setActivePresenceId(null);
        setTodayCompleted(todayPresences.length > 0);
      }
    } catch (error) {
      console.error("Erreur chargement home:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // Mise à jour en continu du temps travaillé (chaque minute)
  // ============================================================
  useEffect(() => {
    if (isCheckedIn && checkInTime !== "--:--") {
      // Calcul immédiat
      setWorkedTime(calculeTemps(checkInTime));
      // Puis mise à jour toutes les 30 secondes
      intervalRef.current = setInterval(() => {
        setWorkedTime(calculeTemps(checkInTime));
      }, 30000);
    } else {
      setWorkedTime({ hours: 0, minutes: 0 });
    }
    // Nettoyage à la sortie
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isCheckedIn, checkInTime]);

  // ============================================================
  // useFocusEffect : recharge au focus de l'onglet
  // ============================================================
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Navigation vers l'écran de pointage
  const goToPointer = () => {
    router.push("/pointer");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ============================================================ */}
        {/* HEADER : Message de bienvenue + nom entreprise + notification */}
        {/* ============================================================ */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {userName || "Utilisateur"}</Text>
            <Text style={styles.date}>{getTodayDate()}</Text>
            {nomEntreprise ? (
              <Text style={styles.companyName}>{nomEntreprise}</Text>
            ) : null}
          </View>
          <Pressable style={styles.notificationIcon} onPress={() => router.push("/(tabs)/absences")}>
            <Ionicons name="notifications-outline" size={24} color={Colors.black} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* ============================================================ */}
        {/* CARTE DE STATUT + TEMPS TRAVAILLÉ                             */}
        {/* ============================================================ */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusDot, { backgroundColor: isCheckedIn ? Colors.success : todayCompleted ? Colors.textLight : estWeekend() ? Colors.textLight : Colors.danger }]} />
                <Text style={styles.statusLabel}>
                  {isCheckedIn ? "Présent" : todayCompleted ? "Terminé" : estWeekend() ? "Repos" : "Absent"}
                </Text>
              </View>
              {isCheckedIn ? (
                <Text style={styles.statusTime}>Arrivé à {checkInTime}</Text>
              ) : todayCompleted ? (
                <Text style={styles.statusTime}>Pointage effectué</Text>
              ) : null}
            </View>
            {/* Temps travaillé */}
            {isCheckedIn && (
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={18} color={Colors.white} />
                <Text style={styles.timeValue}>
                  {workedTime.hours}h{String(workedTime.minutes).padStart(2, "0")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ============================================================ */}
        {/* RÉSUMÉ DE LA JOURNÉE                                         */}
        {/* ============================================================ */}
        {/* Montre les heures configurées (ouverture/fermeture) à côté    */}
        {/* des heures réelles pointées par l'employé.                    */}
        {/* ============================================================ */}
        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleTitle}>Aujourd'hui</Text>
          
          {/* Heure d'ouverture configurée */}
          {heureOuverture && (
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleDot, { backgroundColor: Colors.textLight }]} />
              <Text style={styles.scheduleLabel}>Ouverture</Text>
              <Text style={styles.scheduleTimeConfig}>{heureOuverture}</Text>
            </View>
          )}
          
          {/* Arrivée réelle */}
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.scheduleLabel}>Arrivée</Text>
            <Text style={styles.scheduleTime}>{isCheckedIn ? checkInTime : "--:--"}</Text>
          </View>
          
          {/* Heure de fermeture configurée */}
          {heureFermeture && (
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleDot, { backgroundColor: Colors.textLight }]} />
              <Text style={styles.scheduleLabel}>Fermeture</Text>
              <Text style={styles.scheduleTimeConfig}>{heureFermeture}</Text>
            </View>
          )}
          
          {/* Départ réel */}
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: isCheckedIn ? Colors.success : Colors.textLight }]} />
            <Text style={styles.scheduleLabel}>Départ</Text>
            <Text style={styles.scheduleTime}>--:--</Text>
          </View>
        </View>
      </ScrollView>

      {/* ============================================================ */}
      {/* BOUTON FLOTTANT DE POINTAGE (toujours visible en bas)         */}
      {/* ============================================================ */}
      {/* position: absolute pour rester fixé en bas de l'écran         */}
      {/* Le texte change selon le statut check-in :                    */}
      {/*   - Check-in fait → "Pointer le départ"                      */}
      {/*   - Pas de check-in → "Pointer l'arrivée"                    */}
      {/* ============================================================ */}
      <View style={styles.pointerButtonContainer}>
        <Pressable 
          style={styles.pointerButton} 
          onPress={goToPointer}
          disabled={loadingAction || todayCompleted}
        >
          <Text style={styles.pointerButtonText}>
            {isCheckedIn ? "Pointer le départ" : todayCompleted ? "Déjà pointé" : "Pointer l'arrivée"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 40,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  companyName: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.white,
  },
  statusCard: {
    backgroundColor: Colors.black,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTime: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 18,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  scheduleSection: {
    marginBottom: 120, // Leave space for the floating button
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 16,
  },
  scheduleLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  scheduleTimeConfig: {
    fontSize: 13,
    fontWeight: "400",
    color: Colors.textLight,
  },
  pointerButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    backgroundColor: Colors.white,
  },
  pointerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  pointerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: 0.5,
  },
});
