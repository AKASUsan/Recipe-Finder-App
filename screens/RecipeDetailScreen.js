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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import CommentsSection from "../components/CommentsSection";
import { FavoritesContext } from "../store/context/favorites-context";
import { incrementViewCount } from "../data/recipes";
import { subscribeComments } from "../data/comments";

const CORAL = "#E08E79";
const BROWN = "#4A3728";
const MUTED = "#8A7A6E";

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

export default function RecipeDetailScreen({ route }) {
  const { recipe, category } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const favoritesCtx = useContext(FavoritesContext);

  const [tab, setTab] = useState("ingredients");
  const [checked, setChecked] = useState({});
  const [commentCount, setCommentCount] = useState(0);

  const isFavorite = favoritesCtx.ids.includes(recipe.id);

  useEffect(() => {
    incrementViewCount(recipe.id).catch(() => {});
  }, [recipe.id]);

  useEffect(() => {
    const unsub = subscribeComments(
      recipe.id,
      (list) => setCommentCount(list.length),
      () => {},
    );
    return unsub;
  }, [recipe.id]);

  function toggleFavorite() {
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
          style={[
            styles.hero,
            { backgroundColor: category?.color ?? "#EBDDD0" },
          ]}
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
              <Ionicons name="chevron-forward" size={16} color={MUTED} />
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
                <Text style={styles.hint}>
                  {doneCount} of {ingredients.length} ready · tap to check off
                </Text>
              )}
              {ingredients.map((item, i) => {
                const on = !!checked[i];
                return (
                  <Pressable
                    key={i}
                    style={styles.ingredient}
                    onPress={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                  >
                    <View style={[styles.box, on && styles.boxOn]}>
                      {on && (
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.body, on && styles.done]}>{item}</Text>
                  </Pressable>
                );
              })}
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
        hitSlop={8}
        accessibilityLabel="Save recipe"
      >
        <Ionicons
          name={isFavorite ? "bookmark" : "bookmark-outline"}
          size={20}
          color={isFavorite ? CORAL : BROWN}
        />
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF8F2" },
  hero: { height: 240, alignItems: "center", justifyContent: "center" },
  heroImage: { width: "100%", height: "100%" },
  roundBtn: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    backgroundColor: "#FFF8F2",
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  title: { fontSize: 24, fontWeight: "600", color: BROWN, lineHeight: 30 },
  author: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3D5C3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: CORAL, fontWeight: "600", fontSize: 12 },
  authorText: { fontSize: 13, color: MUTED, flex: 1 },
  authorName: { color: BROWN, fontWeight: "600" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { fontSize: 12, color: BROWN },
  tag: {
    backgroundColor: "#FFF1E6",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, color: "#A9553F" },
  tabs: {
    flexDirection: "row",
    marginTop: 12,
    marginHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E6E0DA",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: CORAL },
  tabText: { fontSize: 12, color: MUTED },
  tabTextActive: { color: CORAL, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 14, minHeight: 200 },
  hint: { fontSize: 12, color: MUTED, marginBottom: 6 },
  ingredient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: CORAL },
  done: { textDecorationLine: "line-through", color: MUTED },
  body: { fontSize: 14, color: BROWN, lineHeight: 21 },
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
  stepNumText: { fontSize: 12, color: "#FFFFFF", fontWeight: "600" },
});
