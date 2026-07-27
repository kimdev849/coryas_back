// ============================================================
// DÉTAIL D'UNE PRÉSENCE - Timeline d'une journée de travail
// ============================================================
// Affiche le détail complet d'une présence : heure d'arrivée,
// heure de départ, temps travaillé et statut.
// Les données sont chargées depuis l'API via l'ID passé en paramètre.
// ============================================================

import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getPresenceById } from "../../src/services/data";
import { Colors } from "../../src/constants/Colors";

export default function PresenceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [presence, setPresence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const presenceId = typeof id === "string" ? id : String(id?.[0] || id);
        const data = await getPresenceById(presenceId);
        setPresence(data);
      } catch (err: any) {
        setError(err?.message || "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  /**
   * getWorkedTime : calcule le temps travaillé entre heure_entree et heure_sortie
   */
  const getWorkedTime = (arrival: string | null, departure: string | null) => {
    if (!arrival) return "--";
    if (!departure) {
      // Si pas encore parti, calcul en temps réel
      const [h, m] = arrival.split(":").map(Number);
      const arrivee = new Date();
      arrivee.setHours(h, m, 0, 0);
      const diffMs = new Date().getTime() - arrivee.getTime();
      if (diffMs <= 0) return "0h 00min";
      const totalMin = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      return `${hours}h ${String(mins).padStart(2, "0")}min`;
    }
    const [ah, am] = arrival.split(":").map(Number);
    const [dh, dm] = departure.split(":").map(Number);
    const totalMin = (dh * 60 + dm) - (ah * 60 + am);
    if (totalMin <= 0) return "0h 00min";
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours}h ${String(mins).padStart(2, "0")}min`;
  };

  const getStatusColor = (statut: string | null) => {
    switch (statut) {
      case "Present":
      case "Présent":
        return Colors.success;
      case "Retard":
      case "En retard":
        return Colors.warning;
      default:
        return Colors.textLight;
    }
  };

  const getStatusLabel = (statut: string | null) => {
    if (!statut) return "Absent";
    if (statut === "Present") return "Présent";
    if (statut === "Retard") return "En retard";
    return statut;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.black} />
      </View>
    );
  }

  if (error || !presence) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>{error || "Présence introuvable"}</Text>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const dateFormatee = presence.date_presence
    ? new Date(presence.date_presence + "T12:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date inconnue";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </Pressable>
        <Text style={styles.title}>Détail</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <Text style={styles.dateTitle}>{dateFormatee}</Text>

        {/* Carte récapitulative */}
        <View style={styles.recapCard}>
          <View style={styles.recapRow}>
            <Ionicons name="log-in" size={22} color={Colors.success} />
            <Text style={styles.recapLabel}>Arrivée</Text>
            <Text style={styles.recapTime}>{presence.heure_entree || "--:--"}</Text>
          </View>
          <View style={styles.recapDivider} />
          <View style={styles.recapRow}>
            <Ionicons name="log-out" size={22} color={presence.heure_sortie ? Colors.danger : Colors.textLight} />
            <Text style={styles.recapLabel}>Départ</Text>
            <Text style={[styles.recapTime, { color: presence.heure_sortie ? Colors.black : Colors.textLight }]}>
              {presence.heure_sortie || "En cours"}
            </Text>
          </View>
        </View>

        {/* Temps travaillé */}
        <View style={styles.workedContainer}>
          <Ionicons name="time-outline" size={24} color={Colors.black} />
          <Text style={styles.workedLabel}>Temps travaillé</Text>
          <Text style={styles.workedValue}>
            {getWorkedTime(presence.heure_entree, presence.heure_sortie)}
          </Text>
        </View>

        {/* Statut */}
        <View style={styles.statusContainer}>
          <Ionicons name="information-circle-outline" size={22} color={getStatusColor(presence.statut)} />
          <Text style={styles.statusLabel}>Statut</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(presence.statut) + "15" }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(presence.statut) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(presence.statut) }]}>
              {getStatusLabel(presence.statut)}
            </Text>
          </View>
        </View>

        {/* Remarque si présente */}
        {presence.remarque && (
          <View style={styles.remarqueContainer}>
            <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.remarqueText}>{presence.remarque}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: Colors.black,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  recapCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  recapLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  recapTime: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  recapDivider: {
    height: 1,
    backgroundColor: Colors.bgLight,
  },
  workedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  workedLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  workedValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  remarqueContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  remarqueText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
