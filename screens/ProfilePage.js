import { colors } from "../theme";
import { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../store/context/AuthContext";
import { FavoritesContext } from "../store/context/favorites-context";
import { getMyRecipes, getRecipesByIds } from "../data/recipes";
import { getUser } from "../data/users";
import AccountSheet from "../components/AccountSheet";

const CREAM = colors.background;
const CORAL = colors.accent;
const PEACH = colors.accentSoft;
const BROWN = colors.ink;
const MUTED = colors.muted;

export default function ProfilePage() {
  const { user } = useAuth();
  return user ? <LoggedInView user={user} /> : <GuestView />;
}

/* ---------- Shared ---------- */

function PillButton({ label, onPress, variant = "filled" }) {
  const outline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, outline && styles.pillOutline]}
    >
      <Text style={[styles.pillText, outline && styles.pillTextOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- Not logged in ---------- */

function GuestView() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { left: (width - 300) / 2 }]} />

      <View style={[styles.guestContent, { paddingTop: insets.top + 64 }]}>
        <View style={styles.guestIcon}>
          <Ionicons name="restaurant" size={44} color={CORAL} />
        </View>

        <Text style={styles.headline}>Cook with your own cookbook</Text>
        <Text style={styles.subtitle}>
          Log in to save, sync, and revisit every recipe.
        </Text>

        <PillButton
          label="Log In"
          onPress={() => navigation.navigate("Login", { mode: "login" })}
        />
        <PillButton
          label="Create account"
          variant="outline"
          onPress={() => navigation.navigate("Login", { mode: "register" })}
        />

        <Pressable onPress={() => navigation.navigate("Home")}>
          <Text style={styles.link}>Maybe later</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Logged in ---------- */

function Tab({ icon, label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Ionicons name={icon} size={18} color={active ? CORAL : MUTED} />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Stat({ value, label, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function RecipeCard({ recipe, width, onPress }) {
  const uri = recipe.imageUrl || recipe.image;
  const source = typeof uri === "string" ? { uri } : uri;

  return (
    <Pressable onPress={onPress} style={[styles.card, { width }]}>
      {source ? (
        <Image source={source} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImageEmpty]}>
          <Ionicons name="restaurant-outline" size={30} color={CORAL} />
        </View>
      )}
      <Text style={styles.cardTitle} numberOfLines={1}>
        {recipe.title}
      </Text>
    </Pressable>
  );
}

function LoggedInView({ user }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { logout } = useAuth();
  const favoritesCtx = useContext(FavoritesContext);

  const [tab, setTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Reload every time this tab comes into focus, so new recipes and
  // favorites show up right away.
  useFocusEffect(
    useCallback(() => {
      getMyRecipes()
        .then(setMyRecipes)
        .catch(() => {});
      getRecipesByIds(favoritesCtx.ids)
        .then(setFavorites)
        .catch(() => {});
      getUser(user.uid)
        .then(setProfile)
        .catch(() => {});
    }, [favoritesCtx.ids, user.uid]),
  );

  const name = user.displayName || user.email?.split("@")[0] || "Chef";
  const initial = name.charAt(0).toUpperCase();

  const cardWidth = (width - 44 - 12) / 2;
  const data = tab === "favorites" ? favorites : myRecipes;

  const header = (
    <View>
      <Svg
        width={width}
        height={insets.top + 200}
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
        style={styles.wave}
      >
        <Path
          d="M0 0 H300 V46 C262 30 232 78 184 92 C132 108 104 62 58 92 C32 108 14 122 0 132 Z"
          fill={colors.sage}
        />
        <Path
          d="M0 0 H300 V22 C266 12 236 52 196 64 C150 78 118 36 74 60 C40 78 18 88 0 96 Z"
          fill={colors.forest}
        />
      </Svg>

      <View style={[styles.topBar, { marginTop: insets.top }]}>
        <Text style={styles.topTitle}>Profile</Text>
        <Pressable
          onPress={() => setSheetOpen(true)}
          hitSlop={12}
          style={styles.settings}
          accessibilityLabel="Account settings"
        >
          <Ionicons name="settings-outline" size={22} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.avatarRing}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.stats}>
        <Stat value={myRecipes.length} label="Recipes" />
        <Stat
          value={profile?.followersCount ?? 0}
          label="Followers"
          onPress={() =>
            navigation.navigate("FollowList", {
              uid: user.uid,
              tab: "followers",
              name,
            })
          }
        />
        <Stat
          value={profile?.followingCount ?? 0}
          label="Following"
          onPress={() =>
            navigation.navigate("FollowList", {
              uid: user.uid,
              tab: "following",
              name,
            })
          }
        />
      </View>

      <View style={styles.tabs}>
        <Tab
          icon={tab === "favorites" ? "heart" : "heart-outline"}
          label="Favorites"
          active={tab === "favorites"}
          onPress={() => setTab("favorites")}
        />
        <Tab
          icon="restaurant-outline"
          label="My recipes"
          active={tab === "recipes"}
          onPress={() => setTab("recipes")}
        />
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.screen}
        data={data}
        key={tab}
        numColumns={2}
        keyExtractor={(item) => String(item.id ?? item.title)}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            width={cardWidth}
            onPress={() =>
              navigation.navigate("RecipeDetail", { recipe: item })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {tab === "favorites" ? "No favorites yet" : "No recipes yet"}
            </Text>
            <Text style={styles.emptyText}>
              {tab === "favorites"
                ? "Tap the heart on a recipe to save it here."
                : "Tap + to add your first recipe."}
            </Text>
          </View>
        }
      />

      <AccountSheet
        visible={sheetOpen}
        name={name}
        email={user.email}
        onClose={() => setSheetOpen(false)}
        onLogout={logout}
      />
    </>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CREAM },

  /* Guest */
  blob: {
    position: "absolute",
    top: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.surfaceAlt,
  },
  guestContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 26,
  },
  guestIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 56,
  },
  headline: {
    fontSize: 24,
    fontWeight: "700",
    color: BROWN,
    textAlign: "center",
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  pill: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    backgroundColor: colors.forest,
    marginBottom: 10,
  },
  pillOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: CORAL,
  },
  pillText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  pillTextOutline: { color: CORAL },
  link: { color: MUTED, fontSize: 14, marginTop: 8 },

  /* Logged in */
  wave: { position: "absolute", top: 0, left: 0 },
  topBar: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { color: colors.white, fontSize: 18, fontWeight: "600" },
  settings: { position: "absolute", right: 18 },
  avatarRing: {
    alignSelf: "center",
    marginTop: 22,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: CREAM,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 34, fontWeight: "600", color: CORAL },
  name: {
    fontSize: 23,
    fontWeight: "800",
    color: BROWN,
    textAlign: "center",
    marginTop: 10,
  },
  email: {
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginTop: 14,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 19, fontWeight: "800", color: BROWN },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 1 },
  editPill: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: PEACH,
  },
  editText: { color: colors.accentDeep, fontSize: 13, fontWeight: "600" },

  tabs: {
    flexDirection: "row",
    marginHorizontal: 22,
    marginTop: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: PEACH,
  },
  tabActive: { borderBottomColor: CORAL },
  tabText: { fontSize: 13, color: MUTED },
  tabTextActive: { color: BROWN, fontWeight: "600" },

  listContent: { paddingBottom: 120 }, // room for the floating tab bar
  row: { paddingHorizontal: 22, gap: 12, marginBottom: 12 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardImage: { width: "100%", height: 88, borderRadius: 10 },
  cardImageEmpty: {
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: BROWN,
    marginTop: 6,
  },

  empty: { alignItems: "center", paddingHorizontal: 32, paddingTop: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: BROWN },
  emptyText: {
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
});
