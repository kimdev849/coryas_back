// ============================================================
// ONGLET NOTIFICATIONS - Centre de notifications en temps réel
// ============================================================
// Affiche les notifications de l'employé connecté :
//   - Congé approuvé/rejeté
//   - Pointage enregistré
//   - Rappels et alertes
// ============================================================

import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Colors } from "../../src/constants/Colors";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "../../src/services/data";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  warning: "warning",
  conges: "umbrella",
  pointage: "time",
  absence: "alert-circle",
  info: "information-circle",
};

const getIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  return ICONS[type] || "notifications-outline";
};

const getIconColor = (type: string): string => {
  switch (type) {
    case "success": return Colors.success;
    case "warning": return Colors.warning;
    case "conges": return Colors.primary;
    case "pointage": return Colors.black;
    case "absence": return Colors.danger;
    default: return Colors.textSecondary;
  }
};

const getTimeAgo = (dateStr: string): string => {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  } catch {
    return "";
  }
};

export default function NotificationsTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [traitement, setTraitement] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNotifications();
      setNotifications(result.data);
      setNonLues(result.nonLues);
    } catch {
      setNotifications([]);
      setNonLues(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleNotificationPress = async (notif: Notification) => {
    if (!notif.lu) {
      setTraitement(notif.id);
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, lu: true } : n))
      );
      setNonLues((prev) => Math.max(0, prev - 1));
      setTraitement(null);
    }
    if (notif.lien) {
      router.push(notif.lien as any);
    }
  };

  const handleToutLire = async () => {
    setTraitement("all");
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setNonLues(0);
    setTraitement(null);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable
      style={[styles.notifItem, !item.lu && styles.notifNonLue]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + "15" }]}>
        <Ionicons name={getIcon(item.type)} size={22} color={getIconColor(item.type)} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitre, !item.lu && styles.titreNonLu]}>{item.titre}</Text>
          {!item.lu && <View style={styles.dotNonLu} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{getTimeAgo(item.created_at)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {nonLues > 0 && (
            <Text style={styles.headerSub}>{nonLues} non lue{nonLues > 1 ? "s" : ""}</Text>
          )}
        </View>
        {nonLues > 0 && (
          <Pressable
            style={styles.toutLireBtn}
            onPress={handleToutLire}
            disabled={traitement === "all"}
          >
            <Text style={styles.toutLireText}>
              {traitement === "all" ? "..." : "Tout lire"}
            </Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.black} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.lightGray} />
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptySubtitle}>
            Vous recevrez une notification quand votre congé sera traité ou après un pointage.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toutLireBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.bgLight,
  },
  toutLireText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  notifNonLue: {
    backgroundColor: Colors.bgLight + "80",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  notifTitre: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  titreNonLu: {
    fontWeight: "700",
    color: Colors.black,
  },
  dotNonLu: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  notifMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
