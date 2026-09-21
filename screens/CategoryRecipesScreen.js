import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, ActivityIndicator, useWindowDimensions, StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRecipesByCategory } from "../data/recipes";
import RecipeCard from "../components/RecipeCard";

export default function CategoryRecipesScreen({ route, navigation }) {
  const { category } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 10) / 2;

  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getRecipesByCategory(category.id)
      .then(setRecipes)
      .catch((e) => console.warn("Failed to load recipes:", e))
      .finally(() => setLoading(false));
  }, [category.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E08E79" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
    >
      {recipes.length === 0 ? (
        <Text style={styles.empty}>ยังไม่มีสูตรในประเภทนี้</Text>
      ) : (
        <View style={styles.grid}>
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              category={category}
              width={cardWidth}
              subtitle={`${r.duration ?? "-"} min`}
              onPress={() => navigation.navigate("RecipeDetail", { recipe: r, category })}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF8F2" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF8F2" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  empty: { textAlign: "center", color: "#8A7A6E", marginTop: 40 },
});