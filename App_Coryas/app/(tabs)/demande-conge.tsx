// ============================================================
// PAGE DEMANDE DE CONGÉ - Formulaire de demande
// ============================================================
// Permet à l'employé de soumettre une demande de congé :
//   - Choisir une période (début et fin)
//   - Sélectionner un type de congé
//   - Ajouter un commentaire
//   - Envoyer la demande au service RH
// ============================================================

import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// 📦 Service API
import { postDemandeConge } from "../../src/services/data";

// ============================================================
// TYPES DE CONGÉS disponibles
// ============================================================
const TYPES_CONGE = [
  "Congé annuel",
  "Congé maladie",
  "Congé personnel",
  "Congé maternité",
  "Congé paternité",
  "Congé sans solde",
  "Formation",
];

/**
 * DemandeCongePage : formulaire de demande de congé
 */
export default function DemandeCongePage() {
  const router = useRouter();

  // 📝 État du formulaire
  const [typeConge, setTypeConge] = useState("");        // Type sélectionné
  const [dateDebut, setDateDebut] = useState("");           // Date de début
  const [dateFin, setDateFin] = useState("");               // Date de fin
  const [commentaire, setCommentaire] = useState("");       // Commentaire optionnel
  const [etape, setEtape] = useState<"type" | "dates" | "recap">("type");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  /**
   * handleEnvoyer : envoie la demande à l'API
   */
  const handleEnvoyer = async () => {
    setEnvoiEnCours(true);
    try {
      await postDemandeConge(dateDebut, dateFin, typeConge);
      Alert.alert(
        "Demande envoyée ! ✅",
        "Votre demande de congé a bien été transmise au service RH. Vous recevrez une notification dès qu'elle sera traitée.",
        [
          {
            text: "OK",
            onPress: () => router.back(), // Retour à la liste des congés
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer la demande. Veuillez réessayer.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  /**
   * isFormulaireValide : vérifie que tous les champs sont remplis
   */
  const isFormulaireValide = (): boolean => {
    return typeConge !== "" && dateDebut.trim() !== "" && dateFin.trim() !== "";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ============================================ */}
      {/* 📊 BARRE DE PROGRESSION (étapes) */}
      {/* ============================================ */}
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, etape === "type" && styles.progressStepActif]}>
          <Text style={[styles.progressNumber, etape === "type" && styles.progressNumberActif]}>1</Text>
          <Text style={[styles.progressLabel, etape === "type" && styles.progressLabelActif]}>Type</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={[styles.progressStep, etape === "dates" && styles.progressStepActif]}>
          <Text style={[styles.progressNumber, etape === "dates" && styles.progressNumberActif]}>2</Text>
          <Text style={[styles.progressLabel, etape === "dates" && styles.progressLabelActif]}>Dates</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={[styles.progressStep, etape === "recap" && styles.progressStepActif]}>
          <Text style={[styles.progressNumber, etape === "recap" && styles.progressNumberActif]}>3</Text>
          <Text style={[styles.progressLabel, etape === "recap" && styles.progressLabelActif]}>Récap</Text>
        </View>
      </View>

      {/* ============================================ */}
      {/* ÉTAPE 1 : Choix du type de congé */}
      {/* ============================================ */}
      {etape === "type" && (
        <View>
          <Text style={styles.question}>Quel type de congé ?</Text>
          <View style={styles.typesContainer}>
            {TYPES_CONGE.map((type) => (
              <Pressable
                key={type}
                style={[styles.typeBtn, typeConge === type && styles.typeBtnActif]}
                onPress={() => {
                  setTypeConge(type);
                  setEtape("dates"); // ✅ Passe à l'étape suivante
                }}
              >
                <Text style={[styles.typeText, typeConge === type && styles.typeTextActif]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* ============================================ */}
      {/* ÉTAPE 2 : Dates et commentaire */}
      {/* ============================================ */}
      {etape === "dates" && (
        <View>
          <Text style={styles.question}>Période souhaitée</Text>

          {/* Date de début */}
          <Text style={styles.label}>Date de début</Text>
          <TextInput
            style={styles.input}
            placeholder="JJ/MM/AAAA"
            placeholderTextColor="#999"
            value={dateDebut}
            onChangeText={setDateDebut}
          />

          {/* Date de fin */}
          <Text style={styles.label}>Date de fin</Text>
          <TextInput
            style={styles.input}
            placeholder="JJ/MM/AAAA"
            placeholderTextColor="#999"
            value={dateFin}
            onChangeText={setDateFin}
          />

          {/* Commentaire optionnel */}
          <Text style={styles.label}>Commentaire (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Motif, précisions..."
            placeholderTextColor="#999"
            value={commentaire}
            onChangeText={setCommentaire}
            multiline // Champ de texte multi-lignes
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Boutons de navigation */}
          <View style={styles.btnRow}>
            <Pressable
              style={styles.btnPrecedent}
              onPress={() => setEtape("type")}
            >
              <Text style={styles.btnPrecedentText}>Retour</Text>
            </Pressable>
            <Pressable
              style={[styles.btnSuivant, !dateDebut || !dateFin ? styles.btnDisabled : null]}
              onPress={() => dateDebut && dateFin && setEtape("recap")}
              disabled={!dateDebut || !dateFin}
            >
              <Text style={styles.btnSuivantText}>Suivant</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ============================================ */}
      {/* ÉTAPE 3 : Récapitulatif et envoi */}
      {/* ============================================ */}
      {etape === "recap" && (
        <View>
          <Text style={styles.question}>Récapitulatif 📋</Text>

          {/* Carte récapitulative */}
          <View style={styles.recapCard}>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Type</Text>
              <Text style={styles.recapValue}>{typeConge}</Text>
            </View>
            <View style={styles.recapSeparator} />
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Du</Text>
              <Text style={styles.recapValue}>{dateDebut}</Text>
            </View>
            <View style={styles.recapSeparator} />
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Au</Text>
              <Text style={styles.recapValue}>{dateFin}</Text>
            </View>
            {commentaire !== "" && (
              <>
                <View style={styles.recapSeparator} />
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>Commentaire</Text>
                  <Text style={styles.recapValue}>{commentaire}</Text>
                </View>
              </>
            )}
          </View>

          {/* Boutons */}
          <View style={styles.btnRow}>
            <Pressable
              style={styles.btnPrecedent}
              onPress={() => setEtape("dates")}
            >
              <Text style={styles.btnPrecedentText}>Modifier</Text>
            </Pressable>
            <Pressable
              style={[styles.btnEnvoyer, envoiEnCours && styles.btnDisabled]}
              onPress={handleEnvoyer}
              disabled={envoiEnCours}
            >
              {envoiEnCours ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.btnEnvoyerText}>Envoyer la demande</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
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

  // ========== BARRE DE PROGRESSION ==========
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  progressStep: {
    alignItems: "center",
  },
  progressStepActif: {},
  progressNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    textAlign: "center",
    lineHeight: 32,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "bold",
    fontSize: 14,
    overflow: "hidden",
  },
  progressNumberActif: {
    backgroundColor: "#fff",
    color: "#D4890A",
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  progressLabelActif: {
    color: "#fff",
    fontWeight: "600",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },

  // ========== QUESTION ==========
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },

  // ========== CHOIX DU TYPE ==========
  typesContainer: {
    gap: 10,
  },
  typeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeBtnActif: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  typeText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  typeTextActif: {
    color: "#D4890A",
    fontWeight: "bold",
  },

  // ========== FORMULAIRE ==========
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  // ========== BOUTONS DE NAVIGATION ==========
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
  },
  btnPrecedent: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
  },
  btnPrecedentText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  btnSuivant: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#000",
    alignItems: "center",
  },
  btnSuivantText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // ========== BOUTON ENVOYER ==========
  btnEnvoyer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  btnEnvoyerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ========== RÉCAPITULATIF ==========
  recapCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  recapLabel: {
    fontSize: 14,
    color: "#999",
  },
  recapValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    flex: 1,
    marginLeft: 20,
  },
  recapSeparator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
});
