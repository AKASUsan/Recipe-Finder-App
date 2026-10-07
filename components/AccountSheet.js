import { colors } from "../theme";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Row({ icon, label, onPress, danger }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.accentSoft }}
      style={styles.row}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.accentDeep : colors.muted} />
      <Text style={[styles.rowText, danger && { color: colors.accentDeep }]}>{label}</Text>
    </Pressable>
  );
}

export default function AccountSheet({ visible, name, email, onClose, onEditProfile, onLogout }) {
  const insets = useSafeAreaInsets();
  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        <Row
          icon="create-outline"
          label="Edit profile"
          onPress={() => {
            onClose();
            onEditProfile?.();
          }}
        />
        <Row
          icon="log-out-outline"
          label="Log out"
          danger
          onPress={() => {
            onClose();
            onLogout();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(74,55,40,0.45)" },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10,
  },
  handle: {
    alignSelf: "center", width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.line, marginBottom: 14,
  },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingBottom: 14, marginBottom: 4,
    borderBottomWidth: 0.5, borderBottomColor: colors.line,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "600", color: colors.accent },
  name: { fontSize: 16, fontWeight: "600", color: colors.ink },
  email: { fontSize: 13, color: colors.muted, marginTop: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  rowText: { fontSize: 15, color: colors.ink },
});
