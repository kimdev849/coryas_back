import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../src/constants/Colors";

export default function PresenceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Header */}
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
        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Entrée</Text>
              <Text style={styles.timelineTime}>08:02</Text>
            </View>
          </View>
          
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

        {/* Worked Time */}
        <View style={styles.workedTimeContainer}>
          <Text style={styles.workedTimeLabel}>Temps travaillé</Text>
          <Text style={styles.workedTimeValue}>7h 59min</Text>
          <Text style={styles.workedTimeGoal}>/ 8h</Text>
        </View>

        {/* Comment */}
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Commentaire</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={Colors.textLight}
            multiline
          />
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Statut</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.statusText}>Retard</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
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
