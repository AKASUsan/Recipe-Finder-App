import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export default function RecipeDetailScreen({ route }) {
  const { recipe, category } = route.params;
  const insets = useSafeAreaInsets();

  const meta = [
    recipe.duration != null && { icon: "time-outline", text: `${recipe.duration} min` },
    recipe.complexity && { icon: "speedometer-outline", text: cap(recipe.complexity) },
    recipe.affordability && { icon: "cash-outline", text: cap(recipe.affordability) },
  ].filter(Boolean);

  const tags = [
    recipe.isVegan && "Vegan",
    recipe.isVegetarian && "Vegetarian",
    recipe.isGlutenFree && "Gluten-free",
    recipe.isLactoseFree && "Lactose-free",
  ].filter(Boolean);

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
        <Text style={styles.title}>{recipe.title}</Text>

        <View style={styles.row}>
          {meta.map((m) => (
            <View key={m.text} style={styles.chip}>
              <Ionicons name={m.icon} size={14} color="#E08E79" />
              <Text style={styles.chipText}>{m.text}</Text>
            </View>
          ))}
        </View>

        {tags.length > 0 && (
          <View style={styles.row}>
            {tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

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
  title: { fontSize: 24, fontWeight: "500", color: "#4A3728" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFFFFF", borderWidth: 0.5, borderColor: "#E6E0DA",
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5,
  },
  chipText: { fontSize: 12, color: "#4A3728" },
  tag: { backgroundColor: "#FFF1E6", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 12, color: "#E08E79", fontWeight: "500" },
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