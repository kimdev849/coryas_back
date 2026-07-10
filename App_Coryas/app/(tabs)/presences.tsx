import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getPresences, Presence } from "../../src/services/data";
import { Colors } from "../../src/constants/Colors";

// Type for month filter
type MonthFilter = "current" | "previous";

export default function PresencesTab() {
  const router = useRouter();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>("current");

  // Load data
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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  // Get status color
  const getStatusColor = (statut: string | null) => {
    switch (statut) {
      case "Present":
      case "Présent":
        return Colors.success;
      case "Retard":
      case "En retard":
        return Colors.warning;
      case "Départ anticipé":
        return Colors.danger;
      default:
        return Colors.textLight;
    }
  };

  // Get status label
  const getStatusLabel = (statut: string | null) => {
    if (!statut) return "Absent";
    if (statut === "Present") return "Présent";
    if (statut === "Retard") return "En retard";
    return statut;
  };

  // Calculate worked time (placeholder for now)
  const getWorkedTime = (arrival: string | null, departure: string | null) => {
    if (!arrival || !departure) return "--";
    // For now just return a placeholder
    return "7h 59min";
  };

  // Render each presence item
  const renderPresence = ({ item }: { item: Presence }) => (
    <Pressable style={styles.presenceItem} onPress={() => router.push(`/presence-detail/${item.id}`)}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateText}>{formatDate(item.date_presence)}</Text>
      </View>
      
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{getWorkedTime(item.heure_entree, item.heure_sortie)}</Text>
      </View>

      <View style={styles.statusColumn}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.statut) }]} />
        <Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>
          {getStatusLabel(item.statut)}
        </Text>
      </View>
    </Pressable>
  );

  // Get month label
  const getMonthLabel = () => {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (selectedMonth === "current") {
      return currentMonth;
    } else {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return prevMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
      </View>

      {/* Month Filter */}
      <View style={styles.monthSelector}>
        <Pressable
          style={[styles.monthButton, selectedMonth === "current" && styles.monthButtonActive]}
          onPress={() => setSelectedMonth("current")}
        >
          <Text style={[styles.monthText, selectedMonth === "current" && styles.monthTextActive]}>
            {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
          </Text>
        </Pressable>
        <Pressable style={styles.chevron}>
          <Text>›</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={presences}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPresence}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthButton: {
    paddingVertical: 8,
  },
  monthButtonActive: {
    // Optional: add underline effect
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  monthTextActive: {
    color: Colors.black,
    fontWeight: "700",
  },
  chevron: {
    marginLeft: 8,
  },
  list: {
    paddingHorizontal: 20,
  },
  presenceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  dateColumn: {
    width: 100,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timeColumn: {
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  statusColumn: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
