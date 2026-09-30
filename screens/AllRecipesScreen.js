import { useEffect, useState } from "react";
import {
  View, Text, Image, Pressable, FlatList, ActivityIndicator,
  StyleSheet, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getPopularRecipes, getLatestRecipes, getTrendingRecipes, getAllRecipes,
} from "../data/recipes";

const CORAL = "#E08E79";
const BROWN = "#4A3728";
const MUTED = "#8A7A6E";

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
      renderItem={({ item }) => (
        <Pressable
          style={[styles.card, { width: cardWidth }]}
          onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imageEmpty]}>
              <Ionicons name="restaurant-outline" size={30} color={CORAL} />
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {item.duration} min · {item.authorName || "Recipe Finder"}
            </Text>
          </View>
        </Pressable>
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
  screen: { flex: 1, backgroundColor: "#FFF8F2" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  row: { gap: 12, marginBottom: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden" },
  image: { width: "100%", height: 110 },
  imageEmpty: { backgroundColor: "#F9DDCB", alignItems: "center", justifyContent: "center" },
  info: { padding: 10 },
  title: { fontSize: 14, fontWeight: "600", color: BROWN },
  meta: { fontSize: 12, color: MUTED, marginTop: 2 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: BROWN },
  emptyText: { fontSize: 13, color: MUTED, marginTop: 6 },
});
