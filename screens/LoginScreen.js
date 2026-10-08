import { colors } from "../theme";
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

const DANGER = "#C0392B";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(email) {
  const value = email.trim();
  if (!value) return "Please enter your email.";
  if (!value.includes("@")) {
    return "Your email is missing the @ sign. Example: name@example.com";
  }
  if (!EMAIL_REGEX.test(value)) {
    return "Your email looks incomplete. Example: name@example.com";
  }
  return null;
}

function validatePassword(password) {
  if (!password) return "Please enter your password.";
  return null;
}

// แปลง error code ของ Firebase เป็นภาษาที่คนทั่วไปอ่านเข้าใจ
function friendlyError(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "That email doesn't look right. Please check it and try again.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password. Please check and try again.";
    case "auth/user-disabled":
      return "This account has been turned off. Please contact support.";
    case "auth/too-many-requests":
      return "Too many tries. Please wait a few minutes, then try again.";
    case "auth/network-request-failed":
      return "Can't connect to the internet. Please check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Couldn't log in", friendlyError(e));
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
        <Ionicons name="restaurant" size={40} color={colors.accent} />
      </View>

      <Text style={styles.eyebrow}>YOUR KITCHEN AWAITS</Text>
      <Text style={styles.title}>Welcome back.</Text>
      <Text style={styles.subtitle}>
        Pick up where your last great meal left off.
      </Text>

      <View style={[styles.field, errors.email && styles.fieldError]}>
        <Ionicons
          name="mail-outline"
          size={18}
          color={colors.muted}
          style={styles.fieldIcon}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((e) => ({ ...e, email: null }));
          }}
          style={styles.input}
        />
      </View>
      {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <View style={[styles.field, errors.password && styles.fieldError]}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={colors.muted}
          style={styles.fieldIcon}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
          }}
          style={styles.input}
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={18}
            color={colors.muted}
          />
        </Pressable>
      </View>
      {!!errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Log In"}
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  icon: {
    alignSelf: "center",
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  eyebrow: {
    textAlign: "center",
    fontSize: 10,
    color: colors.accent,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 28,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  fieldError: { borderColor: DANGER, marginBottom: 4 },
  errorText: { color: DANGER, fontSize: 12, marginBottom: 10, marginLeft: 4 },
  fieldIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: colors.ink },
  button: {
    backgroundColor: colors.forest,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: { color: colors.muted, fontSize: 13 },
  footerLink: { color: colors.accent, fontSize: 13, fontWeight: "700" },
});
