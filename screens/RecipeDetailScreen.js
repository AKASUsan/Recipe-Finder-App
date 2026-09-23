import { useContext } from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconButton from "../components/IconButton";
import RecipeMetaRow from "../components/RecipeMetaRow";
import RecipeTagsRow from "../components/RecipeTagsRow";
import { FavoritesContext } from "../store/context/favorites-context";

export default function RecipeDetailScreen({ route }) {
  const { recipe, category } = route.params;
  const insets = useSafeAreaInsets();
  const favoritesCtx = useContext(FavoritesContext);

  const isFavorite = favoritesCtx.ids.includes(recipe.id);

  function toggleFavorite() {
    if (isFavorite) {
      favoritesCtx.removeFavorite(recipe.id);
    } else {
      favoritesCtx.addFavorite(recipe.id);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View style={[styles.hero, { backgroundColor: category?.color ?? "#EBDDD0" }]}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <Ionicons name={category?.icon ?? "restaurant-outline"} size={48} color="#4A3728" />
        )}
      </View>

      <View style={styles.pad}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { flex: 1 }]}>{recipe.title}</Text>
          <IconButton
            icon={isFavorite ? "bookmark" : "bookmark-outline"}
            color={isFavorite ? "#E08E79" : "#4A3728"}
            onPress={toggleFavorite}
          />
        </View>

        <RecipeMetaRow recipe={recipe} />
        <RecipeTagsRow recipe={recipe} />

        <Text style={styles.heading}>Ingredients</Text>
        {(recipe.ingredients ?? []).map((item, i) => (
          <View key={i} style={styles.ingredient}>
            <View style={styles.bullet} />
            <Text style={styles.body}>{item}</Text>
          </View>
        ))}

        <Text style={styles.heading}>Steps</Text>
        {(recipe.steps ?? []).map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={[styles.body, { flex: 1 }]}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF8F2" },
  hero: { height: 240, alignItems: "center", justifyContent: "center" },
  heroImage: { width: "100%", height: "100%" },
  pad: { padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "500", color: "#4A3728" },
  heading: { fontSize: 18, fontWeight: "500", color: "#4A3728", marginTop: 24, marginBottom: 8 },
  ingredient: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E08E79" },
  body: { fontSize: 14, color: "#4A3728", lineHeight: 21 },
  step: { flexDirection: "row", gap: 12, paddingVertical: 6 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#E08E79",
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  stepNumText: { fontSize: 12, color: "#FFFFFF", fontWeight: "500" },
});