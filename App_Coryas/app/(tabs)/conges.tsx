// ============================================================
// ONGLET MES CONGÉS - Consultation des demandes de congés
// ============================================================

import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { getConges, Conge } from "../../src/services/data";
import { Colors } from "../../src/constants/Colors";

const transformeStatut = (statut: string): string => {
  if (!statut) return "En attente";
  if (statut === "Approuve") return "Approuvé";
  if (statut === "Rejete") return "Refusé";
  return statut;
};

const getCouleurStatut = (statut: string): string => {
  switch (statut) {
    case "Approuve":    return "#4CAF50";
    case "En attente": return "#FF9800";
    case "Rejete":   return "#F44336";
    default:         return "#999";
  }
};

const getIconeType = (motif: string): keyof typeof Ionicons.glyphMap => {
  if (motif.toLowerCase().includes("annuel")) return "umbrella";
  if (motif.toLowerCase().includes("maladie")) return "medkit";
  if (motif.toLowerCase().includes("personnel")) return "person";
  return "calendar";
};

export default function CongesTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [conges, setConges] = useState<Conge[]>([]);
  const [chargement, setChargement] = useState(true);

  const loadData = async () => {
    setChargement(true);
    try {
      const data = await getConges();
      setConges(data);
    } catch (error) {
      console.error("Erreur chargement congés:", error);
      setConges([]);
    } finally {
      setChargement(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const congesValides = conges.filter((c) => c.statut === "Approuve");
  const congesEnAttente = conges.filter((c) => c.statut === "En attente");
  const autresConges = conges.filter((c) => c.statut !== "Approuve" && c.statut !== "En attente");

  const renderConge = (conge: Conge) => (
    <View key={conge.id} style={styles.congeCard}>
      <View style={[styles.iconContainer, { backgroundColor: getCouleurStatut(conge.statut) + "15" }]}>
        <Ionicons name={getIconeType(conge.motif)} size={22} color={getCouleurStatut(conge.statut)} />
      </View>
      <View style={styles.congeInfos}>
        <Text style={styles.congeType}>{conge.motif}</Text>
        <Text style={styles.congePeriode}>{conge.date_debut} - {conge.date_fin}</Text>
        {conge.commentaire_rh && (conge.statut === "Rejete" || conge.statut === "Approuve") && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.commentaireRh}>{conge.commentaire_rh}</Text>
          </View>
        )}
      </View>
      <View style={[styles.statutBadge, { backgroundColor: getCouleurStatut(conge.statut) + "20" }]}>
        <Text style={[styles.statutText, { color: getCouleurStatut(conge.statut) }]}>
          {transformeStatut(conge.statut)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Mes congés</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {chargement ? (
          <View style={styles.chargementContainer}>
            <ActivityIndicator size="large" color={Colors.black} />
            <Text style={styles.chargementText}>Chargement...</Text>
          </View>
        ) : (
          <>
            {congesValides.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Approuvés</Text>
                {congesValides.map(renderConge)}
              </View>
            )}
            {congesEnAttente.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>En attente</Text>
                {congesEnAttente.map(renderConge)}
              </View>
            )}
            {autresConges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historique</Text>
                {autresConges.map(renderConge)}
              </View>
            )}
            {conges.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>Aucune demande de congé</Text>
              </View>
            )}
            <Pressable style={styles.demandeButton} onPress={() => router.push("/(tabs)/demande-conge")}>
              <Ionicons name="add" size={22} color="#fff" />
              <Text style={styles.demandeButtonText}>Nouvelle demande</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  congeCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.bgLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  congeInfos: {
    flex: 1,
  },
  congeType: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  congePeriode: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  commentaireRh: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  statutBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statutText: {
    fontSize: 11,
    fontWeight: "600",
  },
  chargementContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  chargementText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 10,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 12,
  },
  demandeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  demandeButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
