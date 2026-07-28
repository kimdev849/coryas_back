// ============================================================
// CustomModal - Modale de confirmation stylée (remplace Alert.alert)
// ============================================================
// Utilisation :
//   <CustomModal
//     visible={showModal}
//     icon="log-out-outline"
//     title="Déconnexion"
//     message="Êtes-vous sûr de vouloir vous déconnecter ?"
//     confirmLabel="Se déconnecter"
//     confirmStyle="danger"
//     onConfirm={handleConfirm}
//     onCancel={() => setShowModal(false)}
//   />
// ============================================================

import { StyleSheet, Text, View, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

interface CustomModalProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmStyle?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function CustomModal({
  visible,
  icon,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  confirmStyle = "primary",
  onConfirm,
  onCancel,
}: CustomModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          {icon && (
            <View style={[styles.iconCircle, confirmStyle === "danger" && styles.iconCircleDanger]}>
              <Ionicons
                name={icon}
                size={28}
                color={confirmStyle === "danger" ? Colors.danger : Colors.primary}
              />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, confirmStyle === "danger" && styles.confirmButtonDanger]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + "12",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  iconCircleDanger: {
    backgroundColor: Colors.danger + "12",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDanger: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
});
