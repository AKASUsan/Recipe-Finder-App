import { useContext, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAllRecipes } from "../data/recipes";
import RecipeCard from "../components/RecipeCard";
import { FavoritesContext } from "../store/context/favorites-context";
import { useAuth } from "../store/context/AuthContext";

export default function FavoritesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
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
      <View style={styles.container}>
        <Text style={styles.title}>My Favorites</Text>
        <Text style={styles.description}>
          Please log in to see your favorites.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A3728" />
      </View>
    );
  }

  if (favoriteMeals.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Favorites</Text>
        <Text style={styles.description}>
          Your saved recipes will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My Favorites</Text>
      <FlatList
        data={favoriteMeals}
        keyExtractor={(item) => item.id}
        renderItem={renderMealItem}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ gap: GAP, paddingHorizontal: H_PADDING, paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8F2",
    paddingTop: 16,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFF8F2",
  },
  title: {
    color: "#4A3728",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  description: {
    color: "#8A7A6E",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});