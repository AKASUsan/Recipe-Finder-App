import { View, Text, StyleSheet } from "react-native";
import { TAG_FIELDS } from "../models/recipeTags";

export default function RecipeTagsRow({ recipe }) {
  const tags = TAG_FIELDS.filter((field) => Boolean(recipe[field.key]));

  if (tags.length === 0) return null;

  return (
    <View style={styles.row}>
      {tags.map((field) => (
        <View key={field.key} style={styles.tag}>
          <Text style={styles.tagText}>{field.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tag: {
    backgroundColor: "#FFF1E6",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: "#E08E79", fontWeight: "500" },
});