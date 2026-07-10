// ============================================================
// ONGLET HISTORIQUE - Liste des présences enregistrées
// ============================================================
// Affiche l'historique des pointages de l'utilisateur dans
// une liste (FlatList). Chaque entrée montre :
//   - La date (formatée en français)
//   - Le temps travaillé
//   - Le statut (Présent, En retard, Départ anticipé, etc.)
//
// ⚙️ Fonctionnement :
// 1. Au focus de l'onglet, on charge les données via getPresences()
// 2. Les données sont affichées dans une FlatList optimisée
// 3. Le clic sur un élément navigue vers /presence-detail/[id]
//
// 📌 Concepts React Native :
// - FlatList : liste virtuelle performante (ne rend que les éléments visibles)
// - Filtre mensuel : bouton pour basculer entre mois courant et précédent
// ============================================================

import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getPresences, Presence } from "../../src/services/data";
import { Colors } from "../../src/constants/Colors";

// Type personnalisé pour le filtre de mois
type MonthFilter = "current" | "previous";

export default function PresencesTab() {
  const router = useRouter();
  
  // ============================================================
  // ÉTATS
  // ============================================================
  const [presences, setPresences] = useState<Presence[]>([]); // Liste des présences
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>("current"); // Mois sélectionné

  // ============================================================
  // loadData : charge la liste des présences depuis l'API
  // ============================================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // getPresences() appelle GET /api/presences
      // Retourne un tableau d'objets Presence
      const data = await getPresences();
      setPresences(data);
    } catch (error) {
      console.error("Erreur chargement presences:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recharge à chaque fois que l'utilisateur revient sur cet onglet
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ============================================================
  // formatDate : convertit une date ISO en format lisible français
  // ============================================================
  // Exemple : "2026-07-10T08:02:00.000Z" → "ven. 10 juil."
  // ============================================================
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

  // ============================================================
  // getStatusColor : retourne la couleur selon le statut
  // ============================================================
  const getStatusColor = (statut: string | null) => {
    switch (statut) {
      case "Present":
      case "Présent":
        return Colors.success;     // Vert
      case "Retard":
      case "En retard":
        return Colors.warning;     // Jaune
      case "Départ anticipé":
        return Colors.danger;      // Rouge
      default:
        return Colors.textLight;   // Gris
    }
  };

  // ============================================================
  // getStatusLabel : normalise l'affichage du statut
  // ============================================================
  // Le backend peut renvoyer "Present" (anglais) ou "Présent" (français)
  // Cette fonction uniformise l'affichage
  // ============================================================
  const getStatusLabel = (statut: string | null) => {
    if (!statut) return "Absent";
    if (statut === "Present") return "Présent";
    if (statut === "Retard") return "En retard";
    return statut;
  };

  // ============================================================
  // getWorkedTime : calcule le temps travaillé (placeholder)
  // ============================================================
  // Pour l'instant, retourne une valeur fixe "7h 59min"
  // Dans une version future, on pourra calculer la différence
  // entre heure_entree et heure_sortie
  // ============================================================
  const getWorkedTime = (arrival: string | null, departure: string | null) => {
    if (!arrival || !departure) return "--";
    return "7h 59min";
  };

  // ============================================================
  // renderPresence : rend un élément de la liste
  // ============================================================
  // Chaque élément est un Pressable qui navigue vers le détail.
  // Il affiche 3 colonnes : date | temps travaillé | statut (avec point coloré)
  // ============================================================
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

  // ============================================================
  // getMonthLabel : retourne le libellé du mois sélectionné
  // ============================================================
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

      {/* ============================================================ */}
      {/* FILTRE PAR MOIS (current / previous)                         */}
      {/* ============================================================ */}
      {/* Permet de basculer entre le mois en cours et le mois passé   */}
      {/* Le bouton actif a le texte en gras et noir                   */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* LISTE DES PRÉSENCES (FlatList optimisée)                     */}
      {/* ============================================================ */}
      {/* FlatList est le composant React Native pour les listes       */}
      {/* Avantages par rapport à ScrollView :                         */}
      {/*   - Lazy loading : ne rend que les éléments visibles         */}
      {/*   - Performance : réutilise les vues hors écran              */}
      {/* ============================================================ */}
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
