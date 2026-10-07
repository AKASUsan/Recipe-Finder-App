import { colors } from "../theme";
import { useContext, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, useWindowDimensions, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllRecipes } from "../data/recipes";
import RecipeCard from "../components/RecipeCard";
import { FavoritesContext } from "../store/context/favorites-context";
import { useAuth } from "../store/context/AuthContext";

export default function FavoritesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const favoriteMealsCtx = useContext(FavoritesContext);
  const { width: screenWidth } = useWindowDimensions();

  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const recipes = await getAllRecipes();
        setAllRecipes(recipes);
      } catch (err) {
        console.error("Failed to load recipes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, []);

  const favoriteMeals = allRecipes.filter((meal) =>
    favoriteMealsCtx.ids.includes(meal.id)
  );

  const GAP = 12;
  const H_PADDING = 16;
  const cardWidth = (screenWidth - H_PADDING * 2 - GAP) / 2;

  function renderMealItem(itemData) {
    const item = itemData.item;
    return (
      <RecipeCard
        recipe={item}
        category={item.category}
        width={cardWidth}
        subtitle={item.duration ? `${item.duration} min` : undefined}
        onPress={() =>
          navigation.navigate("RecipeDetail", { recipe: item, category: item.category })
        }
      />
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyIcon}><Ionicons name="bookmark-outline" size={31} color={colors.accent} /></View>
        <Text style={styles.title}>Your little cookbook.</Text>
        <Text style={styles.description}>
          Log in to keep all your favorite recipes in one place.
        </Text>
        <Pressable style={styles.action} onPress={() => navigation.navigate("Login", { mode: "login" })}><Text style={styles.actionText}>Log in</Text><Ionicons name="arrow-forward" size={16} color={colors.white} /></Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  if (favoriteMeals.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyIcon}><Ionicons name="heart-outline" size={31} color={colors.accent} /></View>
        <Text style={styles.title}>No favorites yet.</Text>
        <Text style={styles.description}>
          Save a recipe you love and it will live right here.
        </Text>
        <Pressable style={styles.action} onPress={() => navigation.navigate("Search")}><Text style={styles.actionText}>Explore recipes</Text><Ionicons name="arrow-forward" size={16} color={colors.white} /></Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.eyebrow}>YOUR SAVED COLLECTION</Text>
      <Text style={styles.title}>Made to revisit.</Text>
      <FlatList
        data={favoriteMeals}
        keyExtractor={(item) => item.id}
        renderItem={renderMealItem}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP, paddingHorizontal: H_PADDING, paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginLeft: 20, marginBottom: 4 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  action: { backgroundColor: colors.forest, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 22 },
  actionText: { color: colors.white, fontWeight: "800", fontSize: 13 },
  description: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
    textAlign: "center",
  },
});
