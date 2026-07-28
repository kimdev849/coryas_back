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
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/constants/Colors";

// 📦 Service API
import { postDemandeConge } from "../../src/services/data";

// 📅 Date picker natif (optionnel — si le package n'est pas installé, on garde le TextInput)
let DateTimePicker: any = null;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch {}

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

  // ============================================================
  // Fonctions de validation des dates (déclarées AVANT les états)
  // ============================================================

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }
    const frMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (frMatch) {
      return new Date(Number(frMatch[3]), Number(frMatch[2]) - 1, Number(frMatch[1]));
    }
    return null;
  };

  // 📝 État du formulaire
  const [typeConge, setTypeConge] = useState("");
  const aujourdhui = (() => {
    const d = new Date();
    const j = String(d.getDate()).padStart(2, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const a = d.getFullYear();
    return `${j}/${m}/${a}`;
  })();

  const [dateDebut, setDateDebut] = useState(aujourdhui);
  const [dateFin, setDateFin] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [etape, setEtape] = useState<"type" | "dates" | "recap">("type");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurDates, setErreurDates] = useState("");

  // États pour le date picker natif
  const [showDateDebut, setShowDateDebut] = useState(false);
  const [showDateFin, setShowDateFin] = useState(false);
  const dateDebutObj = parseDate(dateDebut) || new Date();
  const dateFinObj = parseDate(dateFin) || new Date();

  // Utilise le date picker natif si disponible, sinon TextInput
  const hasNativePicker = DateTimePicker !== null && (Platform.OS === "ios" || Platform.OS === "android");

  const handleDateDebutChange = (_event: any, selectedDate?: Date) => {
    setShowDateDebut(false);
    if (selectedDate) {
      const j = String(selectedDate.getDate()).padStart(2, "0");
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const a = selectedDate.getFullYear();
      setDateDebut(`${j}/${m}/${a}`);
      setErreurDates("");
    }
  };

  const handleDateFinChange = (_event: any, selectedDate?: Date) => {
    setShowDateFin(false);
    if (selectedDate) {
      const j = String(selectedDate.getDate()).padStart(2, "0");
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const a = selectedDate.getFullYear();
      setDateFin(`${j}/${m}/${a}`);
      setErreurDates("");
    }
  };

  /**
   * Vérifie si une chaîne est une date valide (DD/MM/AAAA ou YYYY-MM-DD)
   */
  const estDateValide = (dateStr: string): boolean => {
    const date = parseDate(dateStr);
    if (!date) return false;
    // Vérifie que la date est cohérente (pas 32/13/2026)
    const [jour, mois, annee] = dateStr.includes("-")
      ? dateStr.split("-").map(Number).reverse() // YYYY-MM-DD → [DD, MM, YYYY]
      : dateStr.split("/").map(Number);           // DD/MM/AAAA → [DD, MM, YYYY]
    return date.getDate() === jour &&
           date.getMonth() + 1 === mois &&
           date.getFullYear() === annee;
  };

  /**
   * Valide les dates du formulaire et retourne un message d'erreur ou ""
   */
  const validerDates = (): string => {
    if (!dateDebut.trim() || !dateFin.trim()) {
      return "Veuillez remplir les deux dates";
    }

    // Format attendu : DD/MM/AAAA (ou YYYY-MM-DD)
    const formatOK = /^\d{2}\/\d{2}\/\d{4}$/.test(dateDebut) || /^\d{4}-\d{2}-\d{2}$/.test(dateDebut);
    if (!formatOK) {
      return "Format de date invalide. Utilisez JJ/MM/AAAA";
    }

    const debutValide = estDateValide(dateDebut);
    const finValide = estDateValide(dateFin);

    if (!debutValide || !finValide) {
      return "La date saisie n'existe pas (ex: 32/13/2026)";
    }

    const debut = parseDate(dateDebut);
    const fin = parseDate(dateFin);

    // Vérifie que la date de début n'est pas avant aujourd'hui
    const aujourdhuiDate = new Date();
    aujourdhuiDate.setHours(0, 0, 0, 0);

    if (debut && debut < aujourdhuiDate) {
      return "La date de début ne peut pas être avant aujourd'hui";
    }

    if (fin && fin < aujourdhuiDate) {
      return "La date de fin ne peut pas être avant aujourd'hui";
    }

    if (debut && fin && fin < debut) {
      return "La date de fin doit être après la date de début";
    }

    return ""; // Pas d'erreur
  };

  /**
   * handleEnvoyer : envoie la demande à l'API
   */
  const handleEnvoyer = async () => {
    const erreur = validerDates();
    if (erreur) {
      setErreurDates(erreur);
      return;
    }
    setErreurDates("");
    setEnvoiEnCours(true);
    try {
      await postDemandeConge(dateDebut, dateFin, typeConge, commentaire || undefined);
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
    } catch (error: any) {
      const msg = error?.friendlyMessage || error?.response?.data?.message || "Impossible d'envoyer la demande. Veuillez réessayer.";
      Alert.alert("Erreur", msg);
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

  /**
   * peutPasserEtapeSuivante : vérifie si les dates sont valides avant de passer au récap
   */
  const peutPasserEtapeSuivante = (): boolean => {
    const erreur = validerDates();
    setErreurDates(erreur);
    return erreur === "";
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

          {/* Message d'erreur des dates */}
          {erreurDates !== "" && (
            <View style={styles.erreurContainer}>
              <Ionicons name="alert-circle" size={16} color="#fff" />
              <Text style={styles.erreurTexte}>{erreurDates}</Text>
            </View>
          )}

          {/* Date de début */}
          <Text style={styles.label}>Date de début</Text>
          {hasNativePicker ? (
            <>
              <Pressable
                style={[styles.datePickerBtn, erreurDates ? styles.inputErreur : null]}
                onPress={() => setShowDateDebut(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.datePickerText}>{dateDebut}</Text>
              </Pressable>
              {showDateDebut && (
                <DateTimePicker
                  value={dateDebutObj}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  minimumDate={new Date()}
                  onChange={handleDateDebutChange}
                />
              )}
            </>
          ) : (
            <TextInput
              style={[styles.input, erreurDates ? styles.inputErreur : null]}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor="#999"
              value={dateDebut}
              onChangeText={(txt) => { setDateDebut(txt); setErreurDates(""); }}
            />
          )}

          {/* Date de fin */}
          <Text style={styles.label}>Date de fin</Text>
          {hasNativePicker ? (
            <>
              <Pressable
                style={[styles.datePickerBtn, erreurDates ? styles.inputErreur : null]}
                onPress={() => setShowDateFin(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.datePickerText}>
                  {dateFin || "Sélectionner une date"}
                </Text>
              </Pressable>
              {showDateFin && (
                <DateTimePicker
                  value={dateFinObj}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  minimumDate={new Date()}
                  onChange={handleDateFinChange}
                />
              )}
            </>
          ) : (
            <TextInput
              style={[styles.input, erreurDates ? styles.inputErreur : null]}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor="#999"
              value={dateFin}
              onChangeText={(txt) => { setDateFin(txt); setErreurDates(""); }}
            />
          )}

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
              style={[styles.btnSuivant, !isFormulaireValide() ? styles.btnDisabled : null]}
              onPress={() => peutPasserEtapeSuivante() && setEtape("recap")}
              disabled={!isFormulaireValide()}
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

          {/* Message d'erreur aussi présent au récap */}
          {erreurDates !== "" && (
            <View style={styles.erreurContainer}>
              <Ionicons name="alert-circle" size={16} color="#fff" />
              <Text style={styles.erreurTexte}>{erreurDates}</Text>
            </View>
          )}

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
                  <Text style={styles.btnEnvoyerText}>Envoyer</Text>
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
    backgroundColor: Colors.white,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },

  // ========== BARRE DE PROGRESSION ==========
  progressStepActif: {},
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
  progressNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgLight,
    textAlign: "center",
    lineHeight: 32,
    color: Colors.textLight,
    fontWeight: "bold",
    fontSize: 14,
    overflow: "hidden",
  },
  progressNumberActif: {
    backgroundColor: Colors.black,
    color: Colors.white,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  progressLabelActif: {
    color: Colors.black,
    fontWeight: "600",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 8,
  },

  // ========== QUESTION ==========
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 20,
  },

  // ========== CHOIX DU TYPE ==========
  typesContainer: {
    gap: 10,
  },
  typeBtn: {
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  typeBtnActif: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  typeText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  typeTextActif: {
    color: Colors.white,
    fontWeight: "bold",
  },

  // ========== FORMULAIRE ==========
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  datePickerText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  inputErreur: {
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  erreurContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.danger + "15",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginTop: 5,
  },
  erreurTexte: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
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
    borderWidth: 1.5,
    borderColor: Colors.textLight,
    alignItems: "center",
  },
  btnPrecedentText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  btnSuivant: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.black,
    alignItems: "center",
  },
  btnSuivantText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  btnDisabled: {
    opacity: 0.4,
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
    backgroundColor: Colors.black,
  },
  btnEnvoyerText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  // ========== RÉCAPITULATIF ==========
  recapCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.bgLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  recapLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  recapValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
    flex: 1,
    marginLeft: 20,
  },
  recapSeparator: {
    height: 1,
    backgroundColor: Colors.bgLight,
  },
});
