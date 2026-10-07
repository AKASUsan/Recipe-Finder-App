import { categoryTone, colors } from "../theme";
import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RecipeCard({
  recipe,
  category,
  width,
  subtitle,
  onPress,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = recipe.imageUrl && !imageFailed;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${recipe.title}`} style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}>
      <View
        style={[styles.top, { backgroundColor: categoryTone(category) }]}
      >
        {showImage ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)} 
          />
        ) : (
          <Ionicons
            name={category?.icon ?? "restaurant-outline"}
            size={26}
            color={colors.ink}
          />
        )}
        <View style={styles.timeBadge}><Ionicons name="time-outline" size={12} color={colors.ink} /><Text style={styles.timeText}>{recipe.duration ?? "—"} min</Text></View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        {!!subtitle && <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text>}
        <View style={styles.footer}><Text style={styles.footerText}>VIEW RECIPE</Text><Ionicons name="arrow-forward" size={14} color={colors.accent} /></View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    minHeight: 207,
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.88 },
  top: {
    height: 116,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  timeBadge: { position: "absolute", right: 8, bottom: 8, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 11, paddingHorizontal: 7, paddingVertical: 4 },
  timeText: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  image: { width: "100%", height: "100%" },
  body: { paddingHorizontal: 12, paddingVertical: 10, flex: 1 },
  title: { fontSize: 14, fontWeight: "800", color: colors.ink, lineHeight: 18 },
  sub: { fontSize: 11, color: colors.muted, marginTop: 4 },
  footer: { marginTop: "auto", paddingTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerText: { fontSize: 9, color: colors.accent, fontWeight: "800", letterSpacing: 1 },
});
