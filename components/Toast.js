import { colors } from "../theme";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: "checkmark", bg: colors.accent },
  error: { icon: "alert", bg: colors.accentDeep },
  info: { icon: "information", bg: colors.muted },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const y = useRef(new Animated.Value(-140)).current;
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(y, { toValue: -140, duration: 220, useNativeDriver: true }).start(() =>
      setToast(null)
    );
  }, [y]);

  const show = useCallback(
    (variant, title, opts = {}) => {
      clearTimeout(timer.current);
      setToast({ variant, title, message: opts.message, action: opts.action });
      y.setValue(-140);
      Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      timer.current = setTimeout(hide, opts.duration ?? 3200);
    },
    [y, hide]
  );

  const api = useMemo(
    () => ({
      success: (t, o) => show("success", t, o),
      error: (t, o) => show("error", t, o),
      info: (t, o) => show("info", t, o),
    }),
    [show]
  );

  const v = toast ? VARIANTS[toast.variant] : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.wrap, { top: insets.top + 8, transform: [{ translateY: y }] }]}
        >
          <Pressable onPress={hide} style={styles.toast}>
            <View style={[styles.iconWrap, { backgroundColor: v.bg }]}>
              <Ionicons name={v.icon} size={16} color={colors.white} />
            </View>
            <View style={styles.texts}>
              <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
              {!!toast.message && (
                <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
              )}
            </View>
            {toast.action && (
              <Pressable
                hitSlop={10}
                onPress={() => {
                  hide();
                  toast.action.onPress?.();
                }}
              >
                <Text style={styles.action}>{toast.action.label}</Text>
              </Pressable>
            )}
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, zIndex: 999, elevation: 12 },
  toast: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.ink, borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  iconWrap: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  texts: { flex: 1 },
  title: { color: colors.white, fontSize: 14, fontWeight: "600" },
  message: { color: colors.line, fontSize: 12, marginTop: 2, lineHeight: 16 },
  action: { color: colors.sage, fontSize: 14, fontWeight: "600" },
});
