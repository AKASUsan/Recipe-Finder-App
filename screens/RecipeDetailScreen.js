import { categoryTone, colors } from "../theme";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CommentsSection from "../components/CommentsSection";
import { FavoritesContext } from "../store/context/favorites-context";
import { incrementViewCount } from "../data/recipes";
import { subscribeComments } from "../data/comments";
import { useAuth } from "../store/context/AuthContext";

const CORAL = colors.accent;
const BROWN = colors.ink;
const MUTED = colors.muted;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

function timeAgo(ms) {
  if (!ms) return null;
  const days = Math.floor((Date.now() - ms) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function Pill({ icon, text }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={14} color={CORAL} />
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

function TabItem({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function IngredientRow({ item, checked, onToggle }) {
  const reducedMotion = useReducedMotion();
  const fill = useSharedValue(checked ? 1 : 0);
  const pop = useSharedValue(1);

  useEffect(() => {
    fill.set(
      withTiming(checked ? 1 : 0, {
        duration: reducedMotion ? 0 : 150,
        easing: EASE_OUT,
      }),
    );
    if (checked && !reducedMotion) {
      pop.set(0.92);
      pop.set(withTiming(1, { duration: 150, easing: EASE_OUT }));
    }
  }, [checked, reducedMotion, fill, pop]);

  const boxMotion = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      fill.get(),
      [0, 1],
      [colors.white, CORAL],
    ),
    transform: [{ scale: pop.get() }],
  }));
  const tickMotion = useAnimatedStyle(() => ({
    opacity: fill.get(),
    transform: [{ scale: 0.92 + fill.get() * 0.08 }],
  }));

  function handlePress() {
    Haptics.selectionAsync().catch(() => {});
    onToggle();
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityLabel={item}
      accessibilityState={{ checked }}
      style={({ pressed }) => [
        styles.ingredient,
        pressed && styles.ingredientPressed,
      ]}
    >
      <Animated.View style={[styles.box, boxMotion]}>
        <Animated.View style={tickMotion}>
          <Ionicons name="checkmark" size={15} color={colors.white} />
        </Animated.View>
      </Animated.View>
      <Text style={[styles.body, checked && styles.done]}>{item}</Text>
    </Pressable>
  );
}

function PrepProgress({ ready, total }) {
  const reducedMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(total ? ready / total : 0);

  useEffect(() => {
    progress.set(
      withTiming(total ? ready / total : 0, {
        duration: reducedMotion ? 0 : 220,
        easing: EASE_OUT,
      }),
    );
  }, [ready, total, reducedMotion, progress]);

  const fillMotion = useAnimatedStyle(() => ({
    width: trackWidth * progress.get(),
  }));

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressHead}>
        <Text style={styles.progressTitle}>Your prep list</Text>
        <Text style={styles.progressCount}>
          {ready}/{total} ready
        </Text>
      </View>
      <View
        style={styles.progressTrack}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.progressFill, fillMotion]} />
      </View>
      {ready === total ? (
        <View style={styles.completeNote}>
          <Ionicons name="sparkles" size={14} color={CORAL} />
          <Text style={styles.completeText}>All set — let's cook!</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Tap an ingredient as you gather it.</Text>
      )}
    </View>
  );
}

export default function RecipeDetailScreen({ route }) {
  const { recipe, category } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const favoritesCtx = useContext(FavoritesContext);
  const { user } = useAuth(); // TODO: ถ้า AuthContext ใช้ชื่ออื่น (เช่น currentUser) ให้แก้ตรงนี้
  const reducedMotion = useReducedMotion();

  const [tab, setTab] = useState("ingredients");
  const [checked, setChecked] = useState({});
  const [commentCount, setCommentCount] = useState(0);

  const heartScale = useSharedValue(1);
  const heartMotion = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.get() }],
  }));

  const isFavorite = favoritesCtx.ids.includes(recipe.id);

  useEffect(() => {
    // นับ view แค่ 1 ครั้งต่อ 1 user ต่อ 1 สูตร (ไม่นับเจ้าของสูตรดูเอง)
    if (!user || user.uid === recipe.authorId) return;
    incrementViewCount(recipe.id, user.uid).catch(() => {});
  }, [recipe.id, recipe.authorId, user?.uid]);

  useEffect(() => {
    const unsub = subscribeComments(
      recipe.id,
      (list) => setCommentCount(list.length),
      () => {},
    );
    return unsub;
  }, [recipe.id]);

  function toggleFavorite() {
    Haptics.selectionAsync().catch(() => {});

    if (!user) {
      navigation.navigate("Login"); // TODO: ชื่อ screen ต้องตรงกับที่ลงทะเบียนใน navigator
      return;
    }

    if (isFavorite) favoritesCtx.removeFavorite(recipe.id);
    else favoritesCtx.addFavorite(recipe.id);
  }

  const authorName = recipe.authorName || "Recipe Finder";
  const posted = timeAgo(recipe.createdAt);
  const ingredients = recipe.ingredients ?? [];
  const steps = recipe.steps ?? [];
  const doneCount = Object.values(checked).filter(Boolean).length;

  const tags = [
    recipe.isVegan && "Vegan",
    recipe.isVegetarian && "Vegetarian",
    recipe.isGlutenFree && "Gluten-free",
    recipe.isLactoseFree && "Lactose-free",
  ].filter(Boolean);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View
          style={[styles.hero, { backgroundColor: categoryTone(category) }]}
        >
          {recipe.imageUrl ? (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name={category?.icon ?? "restaurant-outline"}
              size={56}
              color={BROWN}
            />
          )}
        </View>

        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>
            THE RECIPE EDIT / {category?.title?.toUpperCase() ?? "GOOD FOOD"}
          </Text>
          <Text style={styles.title}>{recipe.title}</Text>

          <Pressable
            style={styles.author}
            disabled={!recipe.authorId}
            onPress={() =>
              navigation.navigate("UserProfile", {
                uid: recipe.authorId,
                name: authorName,
              })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {authorName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.authorText}>
              Recipe by <Text style={styles.authorName}>{authorName}</Text>
              {posted ? ` · ${posted}` : ""}
            </Text>
            {!!recipe.authorId && (
              <Ionicons name="chevron-forward" size={16} color={colors.sage} />
            )}
          </Pressable>

          <View style={styles.pills}>
            <Pill icon="time-outline" text={`${recipe.duration ?? "-"} min`} />
            <Pill icon="flame-outline" text={cap(recipe.complexity)} />
            <Pill icon="wallet-outline" text={cap(recipe.affordability)} />
            {tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tabs}>
          <TabItem
            label={`Ingredients (${ingredients.length})`}
            active={tab === "ingredients"}
            onPress={() => setTab("ingredients")}
          />
          <TabItem
            label={`Steps (${steps.length})`}
            active={tab === "steps"}
            onPress={() => setTab("steps")}
          />
          <TabItem
            label={`Comments (${commentCount})`}
            active={tab === "comments"}
            onPress={() => setTab("comments")}
          />
        </View>

        <View style={styles.content}>
          {tab === "ingredients" && (
            <View>
              {ingredients.length > 0 && (
                <PrepProgress ready={doneCount} total={ingredients.length} />
              )}
              {ingredients.map((item, i) => (
                <IngredientRow
                  key={i}
                  item={item}
                  checked={!!checked[i]}
                  onToggle={() =>
                    setChecked((current) => ({ ...current, [i]: !current[i] }))
                  }
                />
              ))}
            </View>
          )}

          {tab === "steps" &&
            steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.body, { flex: 1 }]}>{step}</Text>
              </View>
            ))}

          {tab === "comments" && <CommentsSection recipeId={recipe.id} />}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.roundBtn, { top: insets.top + 8, left: 14 }]}
        onPress={() => navigation.goBack()}
        hitSlop={8}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={20} color={BROWN} />
      </Pressable>
      <Pressable
        style={[styles.roundBtn, { top: insets.top + 8, right: 14 }]}
        onPress={toggleFavorite}
        onPressIn={() => {
          heartScale.set(
            withTiming(0.9, {
              duration: reducedMotion ? 0 : 120,
              easing: EASE_OUT,
            }),
          );
        }}
        onPressOut={() => {
          heartScale.set(
            withTiming(1, {
              duration: reducedMotion ? 0 : 120,
              easing: EASE_OUT,
            }),
          );
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          isFavorite ? "Remove from favorites" : "Add to favorites"
        }
        accessibilityState={{ selected: isFavorite }}
      >
        <Animated.View style={heartMotion}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={23}
            color={isFavorite ? CORAL : BROWN}
          />
        </Animated.View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: { height: 330, alignItems: "center", justifyContent: "center" },
  heroImage: { width: "100%", height: "100%" },
  roundBtn: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    backgroundColor: colors.forest,
    marginTop: -46,
    marginHorizontal: 14,
    borderRadius: 27,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 24,
  },
  eyebrow: {
    color: colors.sage,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.white,
    lineHeight: 35,
    letterSpacing: -0.6,
  },
  author: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.ink, fontWeight: "800", fontSize: 12 },
  authorText: { fontSize: 13, color: colors.sage, flex: 1 },
  authorName: { color: colors.white, fontWeight: "800" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { fontSize: 12, color: BROWN },
  tag: {
    backgroundColor: "#245849",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, color: colors.white, fontWeight: "700" },
  tabs: {
    flexDirection: "row",
    marginTop: 21,
    marginHorizontal: 14,
    padding: 4,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    gap: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 14,
  },
  tabActive: { backgroundColor: colors.forest },
  tabText: { fontSize: 11, color: MUTED, fontWeight: "700" },
  tabTextActive: { color: colors.white, fontWeight: "900" },
  content: { paddingHorizontal: 20, paddingTop: 20, minHeight: 200 },
  progressWrap: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  progressHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: { color: BROWN, fontSize: 14, fontWeight: "800" },
  progressCount: { color: CORAL, fontSize: 12, fontWeight: "800" },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 12,
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: CORAL,
  },
  hint: { fontSize: 11, color: MUTED, marginTop: 8 },
  completeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  completeText: { fontSize: 11, fontWeight: "800", color: CORAL },
  ingredient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  ingredientPressed: { backgroundColor: colors.surfaceAlt },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  done: { textDecorationLine: "line-through", color: MUTED },
  body: { fontSize: 15, color: BROWN, lineHeight: 23 },
  step: { flexDirection: "row", gap: 12, paddingVertical: 8 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumText: { fontSize: 12, color: colors.white, fontWeight: "600" },
});
