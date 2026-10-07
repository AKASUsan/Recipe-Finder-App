import { colors } from "../theme";
import { useEffect, useState } from "react";
import {
  View, Text, Image, Pressable, FlatList, ActivityIndicator,
  StyleSheet, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FollowButton from "../components/FollowButton";
import { auth } from "../data/firebase";
import { getUser, getRecipesByAuthor } from "../data/users";

const CORAL = colors.accent;
const BROWN = colors.ink;
const MUTED = colors.muted;

function Stat({ value, label, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

export default function UserProfileScreen({ route, navigation }) {
  const { uid, name: nameParam } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 12) / 2;

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
    Promise.all([getUser(uid), getRecipesByAuthor(uid)])
      .then(([p, r]) => {
        setProfile(p);
        setRecipes(r);
        setFollowers(p?.followersCount ?? 0);
      })
      .catch((e) => console.warn("profile load:", e))
      .finally(() => setLoading(false));
  }, [uid]);

  const name = profile?.displayName || nameParam || recipes[0]?.authorName || "User";
  const isMe = auth.currentUser?.uid === uid;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={CORAL} />
      </View>
    );
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>

      <View style={styles.stats}>
        <Stat value={recipes.length} label="Recipes" />
        <Stat
          value={followers}
          label="Followers"
          onPress={() => navigation.push("FollowList", { uid, tab: "followers", name })}
        />
        <Stat
          value={profile?.followingCount ?? 0}
          label="Following"
          onPress={() => navigation.push("FollowList", { uid, tab: "following", name })}
        />
      </View>

      {!isMe && (
        <FollowButton
          uid={uid}
          large
          onChange={(now) => setFollowers((n) => Math.max(0, n + (now ? 1 : -1)))}
        />
      )}

      <Text style={styles.section}>{isMe ? "Your recipes" : `Recipes by ${name}`}</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      data={recipes}
      numColumns={2}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      columnWrapperStyle={styles.row}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable
          style={[styles.card, { width: cardWidth }]}
          onPress={() => navigation.push("RecipeDetail", { recipe: item })}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.cardImageEmpty]}>
              <Ionicons name="restaurant-outline" size={28} color={CORAL} />
            </View>
          )}
          <View style={{ padding: 10 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.duration} min</Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No recipes shared yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  header: { alignItems: "center", paddingTop: 24, paddingHorizontal: 16, gap: 10 },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentSoft,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 34, fontWeight: "600", color: CORAL },
  name: { fontSize: 20, fontWeight: "700", color: BROWN },
  stats: { flexDirection: "row", gap: 32, marginVertical: 6 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "600", color: BROWN },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 1 },
  section: {
    alignSelf: "flex-start", fontSize: 16, fontWeight: "600", color: BROWN,
    marginTop: 18, marginBottom: 4,
  },
  row: { gap: 12, paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: colors.white, borderRadius: 16, overflow: "hidden" },
  cardImage: { width: "100%", height: 100 },
  cardImageEmpty: { backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: BROWN },
  cardMeta: { fontSize: 12, color: MUTED, marginTop: 2 },
  empty: { textAlign: "center", color: MUTED, fontSize: 13, paddingTop: 24 },
});
