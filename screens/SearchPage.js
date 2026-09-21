import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { getCategories } from "../data/categories";
import { getAllRecipes, incrementSearchCount } from "../data/recipes";
import CategoryStrip from "../components/CategoryStrip";
import RecipeCard from "../components/RecipeCard";

// Every word the user typed must appear in the title, an ingredient,
// or the recipe's category names.
function matchesQuery(recipe, categoryById, tokens) {
  if (tokens.length === 0) return true;
  const haystack = [
    recipe.title,
    ...(recipe.ingredients ?? []),
    ...(recipe.categoryIds ?? []).map((id) => categoryById[id]?.title),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

export default function SearchPage() {
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 10) / 2;

  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [text, setText] = useState("");
  const [selectedId, setSelectedId] = useState(null);

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
  }, []);

  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const tokens = useMemo(
    () => text.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [text],
  );

  const results = useMemo(
    () =>
      recipes.filter(
        (r) =>
          (!selectedId || r.categoryIds?.includes(selectedId)) &&
          matchesQuery(r, categoryById, tokens),
      ),
    [recipes, categoryById, tokens, selectedId],
  );

  const isFiltering = tokens.length > 0 || selectedId !== null;

  // Tapping the selected category again clears the filter.
  function toggleCategory(id) {
    setSelectedId((cur) => (cur === id ? null : id));
  }

  function handlePress(recipe) {
    // Feeds the "Trending now" section on the home screen.
    incrementSearchCount(recipe.id).catch((e) =>
      console.warn("Failed to update search count:", e),
    );
    // TODO: open the recipe detail screen
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

  return (
    <View style={styles.screen}>
      <View style={styles.pad}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#8A7A6E" />
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Search recipes or ingredients"
            placeholderTextColor="#B5A79B"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
          />
          {text.length > 0 && (
            <Pressable
              onPress={() => setText("")}
              hitSlop={10}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color="#B5A79B" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <CategoryStrip
          categories={categories}
          selectedId={selectedId}
          onSelect={toggleCategory}
        />
      </View>

      <Text style={[styles.count, styles.pad]}>
        {isFiltering
          ? `${results.length} ${results.length === 1 ? "recipe" : "recipes"} found`
          : "All recipes"}
      </Text>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: tabBarHeight + 32,
          gap: 10,
        }}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            category={categoryById[item.categoryIds?.[0]]}
            width={cardWidth}
            subtitle={`${item.duration ?? "-"} min · ${item.rating?.toFixed?.(1) ?? "-"}`}
            onPress={() => handlePress(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={32} color="#E08E79" />
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptyBody}>
              Try a different word, or remove the category filter.
            </Text>
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
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
  },
  input: { flex: 1, fontSize: 14, color: "#4A3728", paddingVertical: 0 },
  count: { fontSize: 12, color: "#8A7A6E", marginTop: 18 },
  row: { gap: 10 },
  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: "500", color: "#4A3728", marginTop: 6 },
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
