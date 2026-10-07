import { colors } from "../theme";
import { View, Text, Pressable, StyleSheet } from "react-native";
import FollowButton from "./FollowButton";

export default function UserRow({ user, onPress, highlight }) {
  const name = user.displayName || "User";
  const n = user.followersCount ?? 0;

  // Bold-colour the part of the name that matches the search.
  let label = <Text style={styles.name}>{name}</Text>;
  if (highlight && name.toLowerCase().startsWith(highlight.toLowerCase())) {
    const k = highlight.length;
    label = (
      <Text style={styles.name}>
        <Text style={styles.hl}>{name.slice(0, k)}</Text>
        {name.slice(k)}
      </Text>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {label}
        <Text style={styles.sub}>{n} {n === 1 ? "follower" : "followers"}</Text>
      </View>
      <FollowButton uid={user.id} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 17, fontWeight: "600", color: colors.accent },
  name: { fontSize: 15, fontWeight: "600", color: colors.ink },
  hl: { color: colors.accent },
  sub: { fontSize: 12, color: colors.muted, marginTop: 1 },
});
