///mew
import { View, Text, StyleSheet } from "react-native";

export default function FavoritesPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Favorites</Text>
      <Text style={styles.description}>
        Your saved recipes will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  description: {
    color: "#8A7A6E",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});