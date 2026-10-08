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
  if (!password) return "Please choose a password.";
  if (password.length < 6) return "Your password needs at least 6 characters.";
  return null;
}

function validateConfirm(password, confirm) {
  if (!confirm) return "Please type your password again to confirm.";
  if (password !== confirm) return "The two passwords don't match.";
  return null;
}

// แปลง error code ของ Firebase เป็นภาษาที่คนทั่วไปอ่านเข้าใจ
function friendlyError(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "That email doesn't look right. Please check it and try again.";
    case "auth/email-already-in-use":
      return "This email already has an account. Try logging in instead.";
    case "auth/weak-password":
      return "That password is too easy to guess. Please use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many tries. Please wait a few minutes, then try again.";
    case "auth/network-request-failed":
      return "Can't connect to the internet. Please check your connection.";
    case "auth/operation-not-allowed":
      return "Sign up isn't available right now. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const clearError = (key) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const handleRegister = async () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirm(password, confirmPassword),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password || nextErrors.confirm) return;

    setLoading(true);
    try {
      await register(email.trim(), password);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Couldn't create account", friendlyError(e));
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
        <Ionicons name="person-add-outline" size={38} color={colors.accent} />
      </View>

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Save your favorite recipes</Text>

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
            clearError("email");
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
          placeholder="Password (at least 6 characters)"
          placeholderTextColor={colors.muted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError("password");
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

      <View style={[styles.field, errors.confirm && styles.fieldError]}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={colors.muted}
          style={styles.fieldIcon}
        />
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor={colors.muted}
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            clearError("confirm");
          }}
          style={styles.input}
        />
      </View>
      {!!errors.confirm && (
        <Text style={styles.errorText}>{errors.confirm}</Text>
      )}

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
    marginBottom: 20,
  },
  title: {
    fontSize: 29,
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
