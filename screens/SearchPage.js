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
      style={[styles.chip, active && styles.chipActive]}
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
        <Ionicons name="restaurant-outline" size={20} color="#E08E79" />
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
    <Pressable onPress={onPress} style={styles.recipeRow}>
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
      <Ionicons name="chevron-forward" size={16} color="#B5A79B" />
    </Pressable>
  );
}

export default function SearchPage() {
  const navigation = useNavigation();
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
        <ActivityIndicator size="large" color="#E08E79" />
      </View>
    );
  }

  const searchBox = (
    <View style={styles.pad}>
      <View
        style={[styles.searchBox, text.length > 0 && styles.searchBoxActive]}
      >
        <Ionicons
          name="search"
          size={18}
          color={text ? "#E08E79" : "#8A7A6E"}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => saveRecent(text)}
          placeholder="Search recipes"
          placeholderTextColor="#B5A79B"
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
            <Ionicons name="close-circle" size={18} color="#B5A79B" />
          </Pressable>
        ) : (
          <Pressable
            onPress={startPeopleSearch}
            hitSlop={8}
            style={styles.atBtn}
            accessibilityLabel="Search people"
          >
            <Ionicons name="at" size={15} color="#E08E79" />
          </Pressable>
        )}
      </View>
    </View>
  );

  /* ---------- People mode ---------- */
  if (peopleMode) {
    return (
      <View style={styles.screen}>
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
              <Ionicons name="people-outline" size={32} color="#E08E79" />
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
      <View style={styles.screen}>
        {searchBox}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.pad,
            { paddingBottom: tabBarHeight + 32 },
          ]}
        >
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
                  <Ionicons name="time-outline" size={17} color="#B5A79B" />
                  <Text style={styles.recentText} numberOfLines={1}>
                    {r}
                  </Text>
                  <Ionicons name="arrow-up-outline" size={16} color="#B5A79B" />
                </Pressable>
              ))}
            </>
          )}

          {categories.length > 0 && (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.label}>Categories</Text>
              </View>
              <View style={styles.chipRow}>
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.title}
                    onPress={() => pickCategory(c.id)}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  /* ---------- Recipe mode: results ---------- */
  return (
    <View style={styles.screen}>
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
            <Ionicons name="restaurant-outline" size={32} color="#E08E79" />
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
  screen: { flex: 1, backgroundColor: "#FFF8F2", paddingTop: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8F2",
  },
  pad: { paddingHorizontal: 16 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
  },
  searchBoxActive: { borderWidth: 1, borderColor: "#E08E79" },
  input: { flex: 1, fontSize: 14, color: "#4A3728", paddingVertical: 0 },
  atBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF1E6",
    alignItems: "center",
    justifyContent: "center",
  },
  note: { fontSize: 12, color: "#8A7A6E", marginTop: 12, marginBottom: 6 },

  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 8,
  },
  label: { fontSize: 12, color: "#8A7A6E", fontWeight: "500" },
  clearLink: { fontSize: 12, color: "#E08E79", fontWeight: "500" },

  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE4DB",
  },
  recentText: { flex: 1, fontSize: 14, color: "#4A3728" },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: "#E08E79", borderColor: "#E08E79" },
  chipText: { fontSize: 12, color: "#4A3728" },
  chipTextActive: { color: "#FFFFFF", fontWeight: "500" },

  filterWrap: { marginTop: 12 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  count: { fontSize: 12, color: "#8A7A6E", marginTop: 14, marginBottom: 4 },

  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE4DB",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F3E9E0",
  },
  thumbEmpty: { alignItems: "center", justifyContent: "center" },
  recipeInfo: { flex: 1, gap: 3 },
  recipeTitle: { fontSize: 14, fontWeight: "500", color: "#4A3728" },
  recipeMeta: { fontSize: 12, color: "#8A7A6E" },
  hl: { color: "#E08E79" },

  empty: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A3728",
    marginTop: 6,
  },
  emptyBody: { fontSize: 12, color: "#8A7A6E", textAlign: "center" },
  clearBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#FFF1E6",
  },
  clearBtnText: { fontSize: 12, fontWeight: "500", color: "#E08E79" },
});
