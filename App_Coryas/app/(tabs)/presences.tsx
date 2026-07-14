// ============================================================
// ONGLET PRÉSENCES - Calendrier & historique épuré
// ============================================================
// Design clean avec mini-calendrier mensuel, carte de stats
// rapides et liste des présences au design moderne.
// ============================================================

import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPresences, Presence } from "../../src/services/data";
import { Colors } from "../../src/constants/Colors";

export default function PresencesTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [presences, setPresences] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPresences();
      setPresences(data);
    } catch (error) {
      console.error("Erreur chargement presences:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // ── Calcule les stats du mois ──
  const stats = () => {
    const now = new Date();
    const mois = now.getMonth();
    const annee = now.getFullYear();
    const duMois = presences.filter((p) => {
      if (!p.date_presence) return false;
      const d = new Date(p.date_presence);
      return d.getMonth() === mois && d.getFullYear() === annee;
    });
    const presents = duMois.filter(
      (p) => p.statut === "Present" || p.statut === "Présent" || p.statut === "Retard" || p.statut === "En retard"
    ).length;
    const retards = duMois.filter(
      (p) => p.statut === "Retard" || p.statut === "En retard"
    ).length;
    const total = duMois.length;
    return { total, presents, retards, taux: total > 0 ? Math.round((presents / total) * 100) : 0 };
  };

  const s = stats();

  // ── Mini calendrier du mois ──
  const calendrier = () => {
    const now = new Date();
    const annee = now.getFullYear();
    const mois = now.getMonth();
    const premierJour = new Date(annee, mois, 1).getDay(); // 0=Dim
    const nbJours = new Date(annee, mois + 1, 0).getDate();
    const jours = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

    const cases: ({ jour: number; type: "passe" | "present" | "futur" | "absent" | "weekend" | "retard" | "aujourdhui" })[] = [];
    const aujourdhui = now.getDate();

    for (let i = 0; i < premierJour; i++) {
      cases.push({ jour: 0, type: "passe" });
    }
    for (let j = 1; j <= nbJours; j++) {
      const dateObj = new Date(annee, mois, j);
      const jourSem = dateObj.getDay();
      const dateStr = dateObj.toISOString().split("T")[0];
      const presence = presences.find((p) => p.date_presence && p.date_presence.startsWith(dateStr));
      const estFutur = dateObj > now;
      const estWeekend = jourSem === 0 || jourSem === 6;

      let type: "passe" | "present" | "futur" | "absent" | "weekend" | "retard" | "aujourdhui";
      if (j === aujourdhui && !estFutur) {
        if (presence && (presence.statut === "Retard" || presence.statut === "En retard")) type = "retard";
        else if (presence) type = "present";
        else type = estWeekend ? "weekend" : "absent";
      } else if (estFutur) {
        type = "futur";
      } else if (estWeekend) {
        type = "weekend";
      } else if (presence && (presence.statut === "Retard" || presence.statut === "En retard")) {
        type = "retard";
      } else if (presence) {
        type = "present";
      } else {
        type = "absent";
      }
      cases.push({ jour: j, type });
    }
    return cases;
  };

  const cal = calendrier();

  // ── Couleurs des statuts ──
  const getStatusColor = (statut: string | null) => {
    switch (statut) {
      case "Present":
      case "Présent": return Colors.success;
      case "Retard":
      case "En retard": return Colors.warning;
      default: return Colors.textLight;
    }
  };

  const getStatusLabel = (statut: string | null) => {
    if (!statut) return "Absent";
    if (statut === "Present") return "Présent";
    if (statut === "Retard") return "En retard";
    return statut;
  };

  const getWorkedTime = (arrival: string | null, departure: string | null) => {
    if (!arrival) return "--";
    if (!departure) return "En cours";
    const [ah, am] = arrival.split(":").map(Number);
    const [dh, dm] = departure.split(":").map(Number);
    const totalMin = (dh * 60 + dm) - (ah * 60 + am);
    if (totalMin <= 0) return "0h 00";
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours}h ${String(mins).padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
    } catch { return dateStr; }
  };

  const renderPresence = ({ item }: { item: Presence }) => (
    <Pressable
      style={({ pressed }) => [styles.presCard, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/presence-detail/${item.id}`)}
    >
      <View style={styles.presCardLeft}>
        <View style={[styles.presCardDot, { backgroundColor: getStatusColor(item.statut) }]} />
      </View>
      <View style={styles.presCardCenter}>
        <Text style={styles.presCardDate}>{formatDate(item.date_presence)}</Text>
        <Text style={styles.presCardTime}>{getWorkedTime(item.heure_entree, item.heure_sortie)}</Text>
      </View>
      <View style={styles.presCardRight}>
        <View style={[styles.presCardBadge, { backgroundColor: getStatusColor(item.statut) + "18" }]}>
          <Text style={[styles.presCardStatus, { color: getStatusColor(item.statut) }]}>
            {getStatusLabel(item.statut)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
      </View>
    </Pressable>
  );

  const getCouleurCase = (type: string) => {
    switch (type) {
      case "present": return Colors.success;
      case "retard": return Colors.warning;
      case "absent": return Colors.bgLight;
      case "weekend": return Colors.lightGray;
      case "aujourdhui": return Colors.primary;
      case "futur": return "transparent";
      default: return "transparent";
    }
  };

  const getTexteCase = (type: string) => {
    return type === "futur" || type === "passe" ? Colors.textLight : type === "absent" ? Colors.textLight : Colors.white;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.title}>Présences</Text>
          <Text style={styles.subtitle}>{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.black} />
        </View>
      ) : (
        <FlatList
          data={presences}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPresence}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Mini calendrier */}
              <View style={styles.calWrap}>
                {/* En-tête jours */}
                <View style={styles.calHeader}>
                  {["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"].map((j, i) => (
                    <Text key={i} style={styles.calHeaderText}>{j}</Text>
                  ))}
                </View>
                {/* Grille */}
                <View style={styles.calGrid}>
                  {cal.map((c, i) => (
                    <View key={i} style={styles.calCase}>
                      {c.jour > 0 && (
                        <View
                          style={[
                            styles.calCaseInner,
                            c.type === "futur" && styles.calCaseFuture,
                            c.type === "passe" && styles.calCaseFuture,
                            { backgroundColor: getCouleurCase(c.type) },
                          ]}
                        >
                          <Text style={[styles.calDayText, { color: getTexteCase(c.type) }]}>
                            {c.jour}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{s.total}</Text>
                  <Text style={styles.statLabel}>Présences</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: Colors.warning }]}>{s.retards}</Text>
                  <Text style={styles.statLabel}>Retards</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: Colors.success }]}>{s.taux}%</Text>
                  <Text style={styles.statLabel}>Présence</Text>
                </View>
              </View>

              {/* Titre liste */}
              <Text style={styles.listTitle}>Historique</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={48} color={Colors.lightGray} />
              <Text style={styles.emptyText}>Aucune présence</Text>
              <Text style={styles.emptySub}>Les pointages apparaîtront ici</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.white },
  title: { fontSize: 26, fontWeight: "800", color: Colors.black },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  // ── Calendrier ──
  calWrap: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.lightGray,
  },
  calHeader: {
    flexDirection: "row", justifyContent: "space-around",
    marginBottom: 8,
  },
  calHeaderText: {
    fontSize: 12, fontWeight: "600", color: Colors.textSecondary,
    width: 32, textAlign: "center",
  },
  calGrid: {
    flexDirection: "row", flexWrap: "wrap",
  },
  calCase: {
    width: "14.28%", aspectRatio: 1,
    alignItems: "center", justifyContent: "center",
    padding: 2,
  },
  calCaseInner: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  calCaseFuture: { backgroundColor: "transparent" },
  calDayText: { fontSize: 13, fontWeight: "600" },

  // ── Stats ──
  statsRow: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 20, gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14,
    padding: 16, alignItems: "center", borderWidth: 1, borderColor: Colors.lightGray,
  },
  statNumber: { fontSize: 22, fontWeight: "800", color: Colors.black },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  // ── Liste ──
  list: { paddingBottom: 40 },
  listTitle: {
    fontSize: 16, fontWeight: "700", color: Colors.black,
    marginHorizontal: 20, marginBottom: 12,
  },

  // ── Cartes présence ──
  presCard: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: Colors.lightGray,
  },
  presCardLeft: { marginRight: 12 },
  presCardDot: { width: 10, height: 10, borderRadius: 5 },
  presCardCenter: { flex: 1 },
  presCardDate: { fontSize: 14, fontWeight: "600", color: Colors.black },
  presCardTime: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  presCardRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  presCardBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  presCardStatus: { fontSize: 12, fontWeight: "700" },

  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600", color: Colors.textSecondary },
  emptySub: { fontSize: 13, color: Colors.textLight },
});
