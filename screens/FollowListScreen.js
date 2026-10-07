import { colors } from "../theme";
import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserRow from "../components/UserRow";
import { getFollowers, getFollowing } from "../data/users";

const CORAL = colors.accent;
const MUTED = colors.muted;

export default function FollowListScreen({ route, navigation }) {
  const { uid, tab: initialTab = "followers" } = route.params;
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(initialTab);
  const [lists, setLists] = useState({ followers: null, following: null });

  useEffect(() => {
    if (lists[tab]) return;
    const load = tab === "followers" ? getFollowers : getFollowing;
    load(uid)
      .then((data) => setLists((l) => ({ ...l, [tab]: data })))
      .catch(() => setLists((l) => ({ ...l, [tab]: [] })));
  }, [tab, uid]);

  const data = lists[tab];

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {[["followers", "Followers"], ["following", "Following"]].map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {data === null ? (
        <ActivityIndicator color={CORAL} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() =>
                navigation.push("UserProfile", { uid: item.id, name: item.displayName })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {tab === "followers" ? "No followers yet." : "Not following anyone yet."}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: "row", marginHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: colors.line },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: CORAL },
  tabText: { fontSize: 14, color: MUTED },
  tabTextActive: { color: CORAL, fontWeight: "600" },
  empty: { textAlign: "center", color: MUTED, fontSize: 13, paddingTop: 40 },
});
