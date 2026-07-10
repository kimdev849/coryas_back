import { StyleSheet, Text, View, FlatList } from "react-native";
import { Colors } from "../../src/constants/Colors";

// Mock notifications
const mockNotifications = [
  {
    id: "1",
    icon: "✅",
    title: "Votre départ a été enregistré",
    time: "Aujourd'hui à 17:01",
  },
  {
    id: "2",
    icon: "⏰",
    title: "Rappel d'équipe",
    time: "Demain à 9:00",
  },
  {
    id: "3",
    icon: "📝",
    title: "Votre demande de congé a été approuvée",
    time: "Hier à 16:45",
  },
  {
    id: "4",
    icon: "🔔",
    title: "Nouveau pointage détecté",
    time: "08/07/2026 à 08:02",
  },
];

export default function NotificationsTab() {
  const renderNotification = ({ item }: { item: typeof mockNotifications[0] }) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* List */}
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
  },
  list: {
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
