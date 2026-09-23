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
    <Pressable onPress={onPress} style={[styles.card, { width }]}>
      <View
        style={[styles.top, { backgroundColor: category?.color ?? "#EBDDD0" }]}
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
            color="#4A3728"
          />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
    overflow: "hidden",
  },
  top: {
    height: 100, 
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  body: { paddingHorizontal: 10, paddingVertical: 8 },
  title: { fontSize: 13, fontWeight: "500", color: "#4A3728" },
  sub: { fontSize: 11, color: "#8A7A6E", marginTop: 2 },
});
