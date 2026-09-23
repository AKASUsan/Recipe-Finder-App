import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../store/context/AuthContext";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.icon}>
        <Ionicons name="person-add-outline" size={38} color="#E08E79" />
      </View>

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Save your favorite recipes</Text>

      <View style={styles.field}>
        <Ionicons name="mail-outline" size={18} color="#8A7A6E" style={styles.fieldIcon} />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#8A7A6E"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Ionicons name="lock-closed-outline" size={18} color="#8A7A6E" style={styles.fieldIcon} />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#8A7A6E"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#8A7A6E"
          />
        </Pressable>
      </View>

      <View style={styles.field}>
        <Ionicons name="lock-closed-outline" size={18} color="#8A7A6E" style={styles.fieldIcon} />
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor="#8A7A6E"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating account..." : "Sign Up"}
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerLink}>Log In</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF1E6",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  icon: {
    alignSelf: "center",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#F3D5C3",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4A3728",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#8A7A6E",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 28,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3D5C3",
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  fieldIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#4A3728" },
  button: {
    backgroundColor: "#E08E79",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: { color: "#8A7A6E", fontSize: 13 },
  footerLink: { color: "#E08E79", fontSize: 13, fontWeight: "700" },
});