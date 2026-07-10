// ============================================================
// DÉTAIL D'UNE PRÉSENCE - Timeline d'une journée de travail
// ============================================================
// Affiche le détail complet d'une présence : timeline des
// événements (entrée, pause, retour, sortie), temps travaillé,
// commentaire et statut.
//
// ⚙️ Particularité (pour l'instant) :
//   - Les données sont STATIQUES (valeurs en dur)
//   - Le paramètre { id } est récupéré depuis l'URL mais pas utilisé
//   - Dans une version future, on fera un appel API avec cet id
//   - La bottom nav en bas est un doublon de la tab bar (à corriger)
//
// 📌 Concepts Expo Router :
// - useLocalSearchParams() récupère les paramètres de l'URL
// - [id].tsx est un fichier dynamique : /presence-detail/5 → { id: "5" }
// - router.back() retourne à l'écran précédent
// ============================================================

import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../src/constants/Colors";

export default function PresenceDetailScreen() {
  const router = useRouter();
  // 📍 Récupération du paramètre dynamique "id" depuis l'URL
  // Exemple : /presence-detail/42 → { id: "42" }
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* ============================================================ */}
      {/* HEADER : Bouton retour + Date                                */}
      {/* ============================================================ */}
      {/* La date affichée est celle du jour (pas celle de la présence) */}
      {/* À améliorer : afficher la date de la présence réelle          */}
      {/* ============================================================ */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ============================================================ */}
        {/* TIMELINE DES ÉVÉNEMENTS DE LA JOURNÉE                        */}
        {/* ============================================================ */}
        {/* Affiche une ligne verticale avec des points colorés :        */}
        {/*   ● Entrée (vert)   08:02                                    */}
        {/*   │                                                          */}
        {/*   ● Pause (jaune)   12:00                                    */}
        {/*   │                                                          */}
        {/*   ● Retour (jaune)  13:05                                    */}
        {/*   │                                                          */}
        {/*   ● Sortie (vert)   17:01                                    */}
        {/* ============================================================ */}
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Entrée</Text>
              <Text style={styles.timelineTime}>08:02</Text>
            </View>
          </View>
          
          {/* Ligne verticale de connexion entre les points */}
          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.warning }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Pause</Text>
              <Text style={styles.timelineTime}>12:00</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.warning }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Retour</Text>
              <Text style={styles.timelineTime}>13:05</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Sortie</Text>
              <Text style={styles.timelineTime}>17:01</Text>
            </View>
          </View>
        </View>

        {/* ============================================================ */}
        {/* TEMPS TRAVAILLÉ                                              */}
        {/* ============================================================ */}
        {/* Affiche "7h 59min / 8h" avec un format statique              */}
        {/* Basé sur la différence entre entrée et sortie (- pause)      */}
        {/* ============================================================ */}
        <View style={styles.workedTimeContainer}>
          <Text style={styles.workedTimeLabel}>Temps travaillé</Text>
          <Text style={styles.workedTimeValue}>7h 59min</Text>
          <Text style={styles.workedTimeGoal}>/ 8h</Text>
        </View>

        {/* ============================================================ */}
        {/* COMMENTAIRE (TextInput multiligne)                           */}
        {/* ============================================================ */}
        {/* L'utilisateur peut ajouter un commentaire sur sa journée.     */}
        {/* Pour l'instant, la saisie n'est pas persistée (pas d'appel   */}
        {/* API pour sauvegarder).                                       */}
        {/* ============================================================ */}
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Commentaire</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={Colors.textLight}
            multiline
          />
        </View>

        {/* ============================================================ */}
        {/* STATUT DE LA PRÉSENCE                                        */}
        {/* ============================================================ */}
        {/* Badge avec un point coloré et le texte du statut              */}
        {/* Couleurs : Présent=vert, Retard=jaune, Départ anticipé=rouge */}
        {/* ============================================================ */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Statut</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.statusText}>Retard</Text>
          </View>
        </View>
      </ScrollView>

      {/* ============================================================ */}
      {/* BARRE DE NAVIGATION BASSE (doublon de la tab bar)            */}
      {/* ⚠️ Cette barre duplique la tab bar déjà présente.            */}
      {/*    À supprimer quand l'écran sera intégré correctement.      */}
      {/* ============================================================ */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <Text>🏠</Text>
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navItemActiveText}>📅</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text>🔔</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text>👤</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    color: Colors.black,
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
    paddingHorizontal: 20,
  },
  timeline: {
    paddingVertical: 20,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  timelineLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timelineTime: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "500",
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: Colors.lightGray,
    marginLeft: 5,
  },
  workedTimeContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.bgLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  workedTimeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  workedTimeValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.black,
  },
  workedTimeGoal: {
    fontSize: 14,
    color: Colors.textLight,
  },
  commentContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  commentLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  statusContainer: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.warning,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.warning,
    marginLeft: 6,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.bgLight,
  },
  navItem: {
    padding: 8,
  },
  navItemActive: {
    backgroundColor: Colors.bgLight,
    borderRadius: 20,
  },
  navItemActiveText: {
    // Add any active text styles
  },
});
