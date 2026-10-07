import { categoryTone, colors } from "../theme";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCategories } from "../data/categories";
import { getAllRecipes, incrementSearchCount } from "../data/recipes";
import { searchUsers } from "../data/users";
import UserRow from "../components/UserRow";

const RECENT_KEY = "recentSearches";
const MAX_RECENT = 6;

// Every word the user typed must appear in the recipe title.
function matchesQuery(recipe, tokens) {
  if (tokens.length === 0) return true;
  const title = (recipe.title ?? "").toLowerCase();
  return tokens.every((t) => title.includes(t));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Colors the parts of `text` that match any typed word.
function Highlight({ text, tokens, style }) {
  if (!tokens.length) {
    return (
      <Text style={style} numberOfLines={1}>
        {text}
      </Text>
    );
  }
  const re = new RegExp(`(${tokens.map(escapeRegex).join("|")})`, "gi");
  const parts = String(text).split(re);
  return (
    <Text style={style} numberOfLines={1}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={styles.hl}>
            {p}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { transform: [{ scale: 0.96 }] }]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// Falls back to a plain tile when the image is missing or fails to load.
function Thumb({ uri }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.thumb, styles.thumbEmpty]}>
        <Ionicons name="restaurant-outline" size={20} color={colors.accent} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={styles.thumb}
      onError={() => setFailed(true)}
    />
  );
}

function RecipeRow({ recipe, tokens, onPress }) {
  // Adjust these two fields to match your recipe model.
  const uri = recipe.imageUrl ?? recipe.image;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${recipe.title}`} style={({ pressed }) => [styles.recipeRow, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}>
      <Thumb uri={uri} />
      <View style={styles.recipeInfo}>
        <Highlight
          text={recipe.title}
          tokens={tokens}
          style={styles.recipeTitle}
        />
        <Text style={styles.recipeMeta} numberOfLines={1}>
          {`${recipe.duration ?? "-"} min · ${recipe.authorName ?? "Recipe Finder"}`}
        </Text>
      </View>
      <View style={styles.rowArrow}><Ionicons name="arrow-forward" size={16} color={colors.ink} /></View>
    </Pressable>
  );
}

export default function SearchPage() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [text, setText] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [recent, setRecent] = useState([]);
  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [r, c] = await Promise.all([getAllRecipes(), getCategories()]);
        setRecipes(r);
        setCategories(c);
      } catch (e) {
        console.warn("Failed to load data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
    AsyncStorage.getItem(RECENT_KEY)
      .then((v) => v && setRecent(JSON.parse(v)))
      .catch(() => {});
  }, []);

  // "@" at the start switches to people search.
  const peopleMode = text.startsWith("@");
  const peopleQuery = peopleMode ? text.slice(1).trim() : "";

  useEffect(() => {
    if (!peopleMode || !peopleQuery) {
      setPeople([]);
      return;
    }
    setPeopleLoading(true);
    const t = setTimeout(() => {
      searchUsers(peopleQuery)
        .then(setPeople)
        .catch(() => setPeople([]))
        .finally(() => setPeopleLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [peopleMode, peopleQuery]);

  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const tokens = useMemo(
    () =>
      peopleMode ? [] : text.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [text, peopleMode],
  );

  const results = useMemo(
    () =>
      recipes.filter(
        (r) =>
          (!selectedId || r.categoryIds?.includes(selectedId)) &&
          matchesQuery(r, tokens),
      ),
    [recipes, tokens, selectedId],
  );

  const isFiltering = tokens.length > 0 || selectedId !== null;
  // Idle screen: nothing typed and no category picked.
  const showIdle = text.length === 0 && selectedId === null;

  function saveRecent(term) {
    const t = term.trim();
    if (!t || t.startsWith("@")) return;
    const next = [
      t,
      ...recent.filter((x) => x.toLowerCase() !== t.toLowerCase()),
    ].slice(0, MAX_RECENT);
    setRecent(next);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
  }

  function clearRecent() {
    setRecent([]);
    AsyncStorage.removeItem(RECENT_KEY).catch(() => {});
  }

  function pickCategory(id) {
    setSelectedId((cur) => (cur === id ? null : id));
  }

  function startPeopleSearch() {
    setText("@");
    inputRef.current?.focus();
  }

  function openRecipe(recipe) {
    saveRecent(text);
    // Feeds the "Trending now" section on the home screen.
    incrementSearchCount(recipe.id).catch((e) =>
      console.warn("Failed to update search count:", e),
    );
    navigation.navigate("RecipeDetail", {
      recipe,
      category: categoryById[recipe.categoryIds?.[0]],
    });
  }

  function clearAll() {
    setText("");
    setSelectedId(null);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const searchBox = (
    <View style={styles.pad}>
      <Text style={styles.eyebrow}>THE RECIPE INDEX  /  001</Text>
      <Text style={styles.pageTitle}>Find your flavor.</Text>
      <Text style={styles.pageSubtitle}>Cravings, ideas, and everything in between.</Text>
      <View
        style={[styles.searchBox, text.length > 0 && styles.searchBoxActive]}
      >
        <Ionicons
          name="search"
          size={18}
          color={text ? colors.accent : colors.muted}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => saveRecent(text)}
          placeholder="What are you craving?"
          placeholderTextColor={colors.subtle}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {text.length > 0 ? (
          <Pressable
            onPress={() => setText("")}
            hitSlop={10}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={colors.subtle} />
          </Pressable>
        ) : (
          <Pressable
            onPress={startPeopleSearch}
            hitSlop={8}
            style={styles.atBtn}
            accessibilityLabel="Search people"
          >
            <Ionicons name="at" size={15} color={colors.accent} />
          </Pressable>
        )}
      </View>
    </View>
  );

  /* ---------- People mode ---------- */
  if (peopleMode) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        {searchBox}
        <Text style={[styles.note, styles.pad]}>
          Searching people. Remove the @ to search recipes.
        </Text>
        <FlatList
          data={people}
          keyExtractor={(u) => u.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: tabBarHeight + 32,
          }}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              highlight={peopleQuery}
              onPress={() =>
                navigation.navigate("UserProfile", {
                  uid: item.id,
                  name: item.displayName,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={32} color={colors.accent} />
              <Text style={styles.emptyTitle}>
                {!peopleQuery
                  ? "Find a cook"
                  : peopleLoading
                    ? "Searching…"
                    : "No one found"}
              </Text>
              <Text style={styles.emptyBody}>
                {!peopleQuery
                  ? "Type a name after the @ to see their recipes."
                  : "Names are matched from the first letters, so try the start of the name."}
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  /* ---------- Recipe mode: idle ---------- */
  if (showIdle) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        {searchBox}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.pad,
            { paddingBottom: tabBarHeight + 32 },
          ]}
        >
          <Pressable style={({ pressed }) => [styles.discoveryPanel, pressed && { opacity: 0.86 }]} onPress={() => navigation.navigate("AllRecipes", { title: "All recipes", type: "all" })} accessibilityRole="button" accessibilityLabel="Browse all recipes">
            <View style={styles.discoveryCircle} />
            <Text style={styles.discoveryEyebrow}>DON'T KNOW WHERE TO START?</Text>
            <Text style={styles.discoveryTitle}>The whole menu{"\n"}is yours.</Text>
            <View style={styles.discoveryAction}><Text style={styles.discoveryActionText}>Browse all recipes</Text><Ionicons name="arrow-forward" size={17} color={colors.ink} /></View>
          </Pressable>
          {recent.length > 0 && (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.label}>Recent</Text>
                <Pressable onPress={clearRecent} hitSlop={8}>
                  <Text style={styles.clearLink}>Clear</Text>
                </Pressable>
              </View>
              {recent.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setText(r)}
                  style={styles.recentRow}
                >
                  <Ionicons name="time-outline" size={17} color={colors.subtle} />
                  <Text style={styles.recentText} numberOfLines={1}>
                    {r}
                  </Text>
                  <Ionicons name="arrow-up-outline" size={16} color={colors.subtle} />
                </Pressable>
              ))}
            </>
          )}

          {categories.length > 0 && (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.label}>Explore by craving</Text>
              </View>
              <View style={styles.chipRow}>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => pickCategory(c.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Search ${c.title} recipes`}
                    style={({ pressed }) => [styles.categoryTile, { backgroundColor: categoryTone(c) }, pressed && { opacity: 0.78 }]}
                  ><Ionicons name={c.icon ?? "restaurant-outline"} size={23} color={colors.ink} /><Text style={styles.categoryTileText} numberOfLines={2}>{c.title}</Text><Ionicons name="arrow-forward" size={15} color={colors.ink} /></Pressable>
                ))}
              </View>
            </>
          )}
          <View style={styles.tip}><Ionicons name="sparkles-outline" size={20} color={colors.accent} /><View style={{ flex: 1 }}><Text style={styles.tipTitle}>Meet the cooks</Text><Text style={styles.tipText}>Type @ before a name to discover people and their recipes.</Text></View></View>
        </ScrollView>
      </View>
    );
  }

  /* ---------- Recipe mode: results ---------- */
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      {searchBox}

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.filterRow}
        >
          <Chip
            label="All"
            active={selectedId === null}
            onPress={() => setSelectedId(null)}
          />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.title}
              active={selectedId === c.id}
              onPress={() => pickCategory(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <Text style={[styles.count, styles.pad]}>
        {`${results.length} ${results.length === 1 ? "recipe" : "recipes"} found`}
      </Text>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: tabBarHeight + 32,
        }}
        renderItem={({ item }) => (
          <RecipeRow
            recipe={item}
            tokens={tokens}
            onPress={() => openRecipe(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={32} color={colors.accent} />
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptyBody}>
              Try a different word or another category.
            </Text>
            {tokens.length > 0 && (
              <Pressable
                onPress={() => setText(`@${text.trim()}`)}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>
                  Looking for a person? Try @{text.trim()}
                </Text>
              </Pressable>
            )}
            {isFiltering && (
              <Pressable onPress={clearAll} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear search</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  pad: { paddingHorizontal: 20 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginTop: 6 },
  pageTitle: { fontSize: 32, color: colors.ink, fontWeight: "900", letterSpacing: -1, marginTop: 5 },
  pageSubtitle: { fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 19 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 54,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchBoxActive: { borderWidth: 1, borderColor: colors.accent },
  input: { flex: 1, fontSize: 14, color: colors.ink, paddingVertical: 0, fontWeight: "600" },
  atBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  note: { fontSize: 12, color: colors.muted, marginTop: 12, marginBottom: 6 },

  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 8,
  },
  label: { fontSize: 16, color: colors.ink, fontWeight: "800" },
  clearLink: { fontSize: 12, color: colors.accent, fontWeight: "500" },

  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  recentText: { flex: 1, fontSize: 14, color: colors.ink },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryTile: { width: "48%", borderRadius: 19, minHeight: 106, padding: 14, justifyContent: "space-between", flexDirection: "row", alignItems: "flex-end" },
  categoryTileText: { color: colors.ink, fontWeight: "900", fontSize: 14, flex: 1, marginLeft: 8 },
  discoveryPanel: { backgroundColor: colors.forest, borderRadius: 25, padding: 22, marginTop: 24, minHeight: 204, overflow: "hidden" },
  discoveryCircle: { position: "absolute", width: 180, height: 180, borderRadius: 90, right: -46, top: -63, backgroundColor: "#245849" },
  discoveryEyebrow: { color: colors.sage, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  discoveryTitle: { color: colors.white, fontSize: 27, lineHeight: 30, fontWeight: "900", letterSpacing: -0.6, marginTop: 19 },
  discoveryAction: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 9, backgroundColor: colors.sage, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 9, marginTop: 17 },
  discoveryActionText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { fontSize: 12, color: colors.ink, fontWeight: "600" },
  chipTextActive: { color: colors.white, fontWeight: "500" },

  filterWrap: { marginTop: 12 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  count: { fontSize: 12, color: colors.muted, marginTop: 14, marginBottom: 4 },

  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 13,
    backgroundColor: colors.surfaceAlt,
  },
  thumbEmpty: { alignItems: "center", justifyContent: "center" },
  recipeInfo: { flex: 1, gap: 3 },
  recipeTitle: { fontSize: 15, fontWeight: "800", color: colors.ink },
  recipeMeta: { fontSize: 12, color: colors.muted },
  rowArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  hl: { color: colors.accent },

  empty: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.ink,
    marginTop: 6,
  },
  emptyBody: { fontSize: 12, color: colors.muted, textAlign: "center" },
  clearBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  clearBtnText: { fontSize: 12, fontWeight: "500", color: colors.accent },
  tip: { flexDirection: "row", gap: 12, backgroundColor: colors.accentSoft, borderRadius: 18, padding: 16, marginTop: 28, alignItems: "center" },
  tipTitle: { fontSize: 13, fontWeight: "800", color: colors.ink },
  tipText: { fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 3 },
});
