// ============================================================
// ONGLET MES CONGÉS - Consultation et demande de congés
// ============================================================
// Permet à l'employé de :
//   - Voir les congés validés
//   - Voir les demandes en attente
//   - Consulter l'historique
//   - Faire une nouvelle demande (bouton en bas)
// ============================================================

import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";

// 📦 Service API
import { getConges, Conge } from "../../src/services/data";

/**
 * transformeStatut : transforme le statut backend en statut pour l'affichage
 */
const transformeStatut = (statut: string): string => {
  if (!statut) return "En attente";
  if (statut === "Approuve") return "Approuvé";
  if (statut === "Rejete") return "Refusé";
  return statut;
};

/**
 * getCouleurStatut : couleur selon le statut
 */
const getCouleurStatut = (statut: string): string => {
  switch (statut) {
    case "Approuve":    return "#4CAF50";
    case "En attente": return "#FF9800";
    case "Rejete":   return "#F44336";
    default:         return "#999";
  }
};

/**
 * getIconeType : icône selon le motif de congé
 */
const getIconeType = (motif: string): keyof typeof Ionicons.glyphMap => {
  if (motif.toLowerCase().includes("annuel")) return "umbrella";
  if (motif.toLowerCase().includes("maladie")) return "medkit";
  if (motif.toLowerCase().includes("personnel")) return "person";
  return "calendar";
};

/**
 * CongesTab : page des congés (API ou mock)
 */
export default function CongesTab() {
  const router = useRouter();
  
  const [conges, setConges] = useState<Conge[]>([]);
  const [chargement, setChargement] = useState(true);

  // 🔥 Chargement des données depuis l'API
  const loadData = async () => {
    setChargement(true);
    const data = await getConges();
    setConges(data);
    setChargement(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // On sépare les congés par statut pour mieux les organiser
  const congesValides = conges.filter((c) => c.statut === "Approuve");
  const congesEnAttente = conges.filter((c) => c.statut === "En attente");
  const autresConges = conges.filter((c) => c.statut !== "Approuve" && c.statut !== "En attente");

  /**
   * renderConge : affiche UN congé
   */
  const renderConge = (conge: Conge) => (
    <View key={conge.id} style={styles.congeCard}>
      {/* Icône du type de congé */}
      <View style={[styles.iconContainer, { backgroundColor: getCouleurStatut(conge.statut) + "15" }]}>
        <Ionicons name={getIconeType(conge.motif)} size={24} color={getCouleurStatut(conge.statut)} />
      </View>

      {/* Infos */}
      <View style={styles.congeInfos}>
        <Text style={styles.congeType}>{conge.motif}</Text>
        <Text style={styles.congePeriode}>{conge.date_debut} - {conge.date_fin}</Text>
      </View>

      {/* Badge statut */}
      <View style={[styles.statutBadge, { backgroundColor: getCouleurStatut(conge.statut) + "20" }]}>
        <Text style={[styles.statutText, { color: getCouleurStatut(conge.statut) }]}>
          {transformeStatut(conge.statut)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ============================================ */}
      {/* 📝 EN-TÊTE */}
      {/* ============================================ */}
      <View style={styles.header}>
        <Ionicons name="calendar" size={40} color="#fff" />
        <Text style={styles.title}>Mes congés</Text>
        <Text style={styles.subtitle}>Gérez vos demandes de congés</Text>
      </View>

      {/* ============================================ */}
      {/* 📊 RÉSUMÉ : Soldes de congés */}
      {/* ============================================ */}
      <View style={styles.soldeContainer}>
        <View style={styles.soldeCard}>
          <Text style={styles.soldeNumber}>22</Text>
          <Text style={styles.soldeLabel}>Jours acquis</Text>
        </View>
        <View style={styles.soldeCard}>
          <Text style={styles.soldeNumber}>15</Text>
          <Text style={styles.soldeLabel}>Pris</Text>
        </View>
        <View style={styles.soldeCard}>
          <Text style={[styles.soldeNumber, { color: "#4CAF50" }]}>7</Text>
          <Text style={styles.soldeLabel}>Restants</Text>
        </View>
      </View>

      {/* ============================================ */}
      {/* ⏳ CHARGEMENT */}
      {/* ============================================ */}
      {chargement ? (
        <View style={styles.chargementContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.chargementText}>Chargement...</Text>
        </View>
      ) : (
      <>
      {/* ============================================ */}
      {/* ✅ CONGÉS VALIDÉS */}
      {/* ============================================ */}
      {congesValides.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Approuvés</Text>
          {congesValides.map(renderConge)}
        </View>
      )}

      {/* ============================================ */}
      {/* ⏳ CONGÉS EN ATTENTE */}
      {/* ============================================ */}
      {congesEnAttente.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏳ En attente</Text>
          {congesEnAttente.map(renderConge)}
        </View>
      )}

      {/* ============================================ */}
      {/* 📜 HISTORIQUE */}
      {/* ============================================ */}
      {autresConges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 Historique</Text>
          {autresConges.map(renderConge)}
        </View>
      )}

      {/* ============================================ */}
      {/* ➕ BOUTON : Nouvelle demande de congé */}
      {/* ============================================ */}
      <Pressable
        style={styles.demandeButton}
        onPress={() => router.push("/(tabs)/demande-conge")}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.demandeButtonText}>Nouvelle demande de congé</Text>
      </Pressable>
      </>
      )}
    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D4890A",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  // ========== SOLDE DE CONGÉS ==========
  soldeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  soldeCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 16,
    flex: 1,
    alignItems: "center",
  },
  soldeNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  soldeLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  // ========== SECTIONS ==========
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },

  // ========== CARTE CONGÉ ==========
  congeCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    color: "#333",
  },
  congePeriode: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  statutBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statutText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // ========== CHARGEMENT ==========
  chargementContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  chargementText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    marginTop: 10,
  },

  // ========== BOUTON DEMANDE ==========
  demandeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  demandeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
