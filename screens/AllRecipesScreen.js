import { colors } from "../theme";
import { useEffect, useState } from "react";
import {
  View, Text, FlatList, ActivityIndicator,
  StyleSheet, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RecipeCard from "../components/RecipeCard";
import {
  getPopularRecipes, getLatestRecipes, getTrendingRecipes, getAllRecipes,
} from "../data/recipes";

const CORAL = colors.accent;
const BROWN = colors.ink;
const MUTED = colors.muted;

// route.params: { title, type }  type = "popular" | "latest" | "trending" | "all"
const FETCHERS = {
  popular: () => getPopularRecipes(50),
  latest: () => getLatestRecipes(50),
  trending: () => getTrendingRecipes(50),
  all: () => getAllRecipes(),
};

export default function AllRecipesScreen({ route, navigation }) {
  const { type = "all" } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (FETCHERS[type] ?? FETCHERS.all)()
      .then(setRecipes)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [type]);

  const cardWidth = (width - 32 - 12) / 2;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={CORAL} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={recipes}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={styles.row}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<View style={styles.collectionHeader}><Text style={styles.collectionEyebrow}>THE RECIPE COLLECTION</Text><Text style={styles.collectionTitle}>{route.params?.title ?? "All recipes"}</Text><Text style={styles.collectionCount}>{recipes.length} recipes to explore</Text></View>}
      renderItem={({ item }) => (
        <RecipeCard recipe={item} width={cardWidth} subtitle={`${item.duration ?? "—"} min  ·  ${item.authorName || "Recipe Finder"}`} onPress={() => navigation.navigate("RecipeDetail", { recipe: item })} />
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            {failed ? "Couldn't load recipes" : "No recipes yet"}
          </Text>
          <Text style={styles.emptyText}>
            {failed ? "Check your connection and try again." : "Check back soon."}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  collectionHeader: { paddingBottom: 21 },
  collectionEyebrow: { fontSize: 10, fontWeight: "900", color: colors.accent, letterSpacing: 1.3 },
  collectionTitle: { fontSize: 27, fontWeight: "900", color: colors.ink, marginTop: 5 },
  collectionCount: { fontSize: 12, color: colors.muted, marginTop: 5 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  row: { gap: 12, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: BROWN },
  emptyText: { fontSize: 13, color: MUTED, marginTop: 6 },
});
