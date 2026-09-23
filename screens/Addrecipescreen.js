import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../store/context/AuthContext";

export default function AddRecipeScreen({ navigation }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Log in to add recipes</Text>
        <Text style={styles.subtitle}>
          Your recipes are saved to your account.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add recipe</Text>
      <Text style={styles.subtitle}>The recipe form goes here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#FFF1E6",
  },
  title: { fontSize: 22, fontWeight: "600", color: "#4A3728" },
  subtitle: {
    fontSize: 14,
    color: "#8A7A6E",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    backgroundColor: "#E08E79",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});