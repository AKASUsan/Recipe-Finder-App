import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { META_FIELDS } from "../models/recipeMeta";

export default function RecipeMetaRow({ recipe }) {
  const items = META_FIELDS.filter((field) => field.show(recipe));

  if (items.length === 0) return null;

  return (
    <View style={styles.row}>
      {items.map((field) => (
        <View key={field.key} style={styles.chip}>
          <Ionicons name={field.icon} size={14} color="#E08E79" />
          <Text style={styles.chipText}>{field.label(recipe)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { fontSize: 12, color: "#4A3728" },
});