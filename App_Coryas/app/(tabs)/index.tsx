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
import { useState, useCallback } from "react";
import { getActivePresence } from "../../src/services/data";
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

  // ============================================================
  // getTodayDate : retourne la date du jour formatée en français
  // ============================================================
  // Exemple : "vendredi 10 juillet 2026"
  // toLocaleDateString('fr-FR') utilise les conventions françaises
  // ============================================================
  const getTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('fr-FR', options);
  };

  // ============================================================
  // loadData : charge les données au focus de l'écran
  // ============================================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Récupération des données utilisateur depuis AsyncStorage
      //    AsyncStorage est un stockage local persistant (comme localStorage)
      //    Les données sont sauvegardées après le login réussi
      const userStr = await AsyncStorage.getItem("@user_data");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(`${user.prenom}`);
      }

      // 2. Vérification de la présence active
      //    getActivePresence() appelle GET /api/presences/active
      //    Retourne la présence en cours si l'utilisateur a pointé ce matin
      const activePresence = await getActivePresence();
      if (activePresence) {
        setIsCheckedIn(true);
        setCheckInTime(activePresence.heure_entree || "--:--");
        setActivePresenceId(activePresence.id);
      } else {
        setIsCheckedIn(false);
        setCheckInTime("--:--");
        setActivePresenceId(null);
      }
    } catch (error) {
      console.error("Erreur chargement home:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // useFocusEffect : se déclenche à chaque fois que l'onglet
  // "Accueil" devient visible (recharge les données)
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
        {/* HEADER : Message de bienvenue + icône notification           */}
        {/* ============================================================ */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, {userName || "Utilisateur"}</Text>
            <Text style={styles.date}>{getTodayDate()}</Text>
          </View>
          <Pressable style={styles.notificationIcon}>
            <Text>🔔</Text>
          </Pressable>
        </View>

        {/* ============================================================ */}
        {/* CARTE DE STATUT (présent/absent)                             */}
        {/* ============================================================ */}
        {/* Fond noir avec :                                             */}
        {/*   - Un point de couleur (vert = présent, gris = absent)      */}
        {/*   - Le statut en texte                                       */}
        {/*   - L'heure d'arrivée si présent                             */}
        {/* ============================================================ */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Statut actuel</Text>
            <View style={[styles.statusDot, { backgroundColor: isCheckedIn ? Colors.success : Colors.gray }]} />
          </View>
          <Text style={styles.statusValue}>{isCheckedIn ? "Présent" : "Absent"}</Text>
          {isCheckedIn && (
            <Text style={styles.statusSub}>depuis {checkInTime}</Text>
          )}
        </View>

        {/* ============================================================ */}
        {/* SECTION TEMPS TRAVAILLÉ (placeholder pour l'instant)          */}
        {/* ============================================================ */}
        {/* Affiche "0h 00min / 8h" avec une barre de progression.      */}
        {/* Pour l'instant les valeurs sont statiques.                   */}
        {/* ============================================================ */}
        <View style={styles.timeSection}>
          <Text style={styles.timeLabel}>Temps travaillé</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeValue}>0h 00min</Text>
            <Text style={styles.timeGoal}>/ 8h</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "0%" }]} />
          </View>
        </View>

        {/* ============================================================ */}
        {/* EMPLOI DU TEMPS DU JOUR                                      */}
        {/* ============================================================ */}
        {/* Timeline horizontale avec Entrée, Pause, Retour, Sortie      */}
        {/* Les heures de pause (12:00-13:00) sont fixes pour l'instant  */}
        {/* ============================================================ */}
        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleTitle}>Aujourd'hui</Text>
          
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.scheduleLabel}>Entrée</Text>
            <Text style={styles.scheduleTime}>{isCheckedIn ? checkInTime : "--:--"}</Text>
          </View>
          
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.scheduleLabel}>Pause</Text>
            <Text style={styles.scheduleTime}>12:00</Text>
          </View>
          
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.scheduleLabel}>Retour</Text>
            <Text style={styles.scheduleTime}>13:00</Text>
          </View>
          
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.scheduleLabel}>Sortie</Text>
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
          disabled={loadingAction}
        >
          <Text style={styles.pointerButtonText}>
            {isCheckedIn ? "Pointer le départ" : "Pointer l'arrivée"}
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
  notificationIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCard: {
    backgroundColor: Colors.black,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 14,
    color: Colors.textLight,
  },
  timeSection: {
    marginBottom: 28,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.black,
    marginRight: 8,
  },
  timeGoal: {
    fontSize: 14,
    color: Colors.textLight,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.bgLight,
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
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
