import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { categoryTone, colors } from "../theme";

export default function CategoryStrip({ categories, selectedId, onSelect }) {
  return <FlatList
    horizontal
    data={categories}
    keyExtractor={(item) => item.id}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.list}
    renderItem={({ item }) => {
      const active = item.id === selectedId;
      return <Pressable
        onPress={() => onSelect(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Browse ${item.title} recipes`}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [styles.tile, { backgroundColor: categoryTone(item) }, active && styles.active, pressed && styles.pressed]}
      >
        <View style={styles.tileTop}><View style={styles.iconBubble}><Ionicons name={item.icon ?? "restaurant-outline"} size={24} color={colors.ink} /></View><Ionicons name="arrow-up-outline" size={15} color={colors.ink} style={styles.arrow} /></View>
        <Text style={styles.label} numberOfLines={2}>{item.title}</Text>
      </Pressable>;
    }}
  />;
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, gap: 11 },
  tile: { width: 130, minHeight: 115, borderRadius: 20, padding: 12, justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(23,56,47,0.07)" },
  active: { borderColor: colors.accent, borderWidth: 2 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  tileTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  iconBubble: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.68)", alignItems: "center", justifyContent: "center" },
  arrow: { transform: [{ rotate: "45deg" }] },
  label: { color: colors.ink, fontSize: 14, fontWeight: "900", lineHeight: 17 },
});
