import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { categoryTone, colors } from "../theme";
import { getCategories, seedCategories } from "../data/categories";
import {
  backfillRecipeCounts,
  getLatestRecipes,
  getPopularRecipes,
  getTrendingRecipes,
  seedRecipes,
} from "../data/recipes";
import CategoryStrip from "../components/CategoryStrip";
import RecipeCard from "../components/RecipeCard";

const HERO_IMAGE = require("../assets/editorial-hero.png");
const RUN_SEED = false;
const compact = (n = 0) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

function SectionHeading({ number, label, title, onSeeAll }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionEyebrow}>
          {number} / {label}
        </Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {!!onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          hitSlop={10}
          accessibilityRole="button"
          style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-forward" size={19} color={colors.ink} />
        </Pressable>
      )}
    </View>
  );
}

function CoverCard({ recipe, category, index, onPress }) {
  const [failed, setFailed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${recipe.title}`}
      style={({ pressed }) => [styles.coverCard, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.coverImageWrap,
          { backgroundColor: categoryTone(category) },
        ]}
      >
        {!!recipe.imageUrl && !failed ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            onError={() => setFailed(true)}
            style={styles.coverImage}
          />
        ) : (
          <Ionicons
            name={category?.icon ?? "restaurant-outline"}
            size={55}
            color={colors.ink}
          />
        )}
        <Text style={styles.coverIndex}>0{index + 1}</Text>
        <View style={styles.coverArrow}>
          <Ionicons
            name="arrow-up-outline"
            size={17}
            color={colors.ink}
            style={{ transform: [{ rotate: "45deg" }] }}
          />
        </View>
      </View>
      <View style={styles.coverBody}>
        <Text style={styles.coverCategory}>
          {category?.title?.toUpperCase() ?? "THE DAILY TABLE"}
        </Text>
        <Text style={styles.coverTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.coverMeta}>
          {recipe.duration ?? "—"} MIN · {compact(recipe.viewCount)} VIEWS
        </Text>
      </View>
    </Pressable>
  );
}

function FreshRow({ recipe, category, index, onPress }) {
  const [failed, setFailed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${recipe.title}`}
      style={({ pressed }) => [styles.freshRow, pressed && styles.pressed]}
    >
      <Text style={styles.freshNumber}>
        {String(index + 1).padStart(2, "0")}
      </Text>
      <View
        style={[
          styles.freshImageWrap,
          { backgroundColor: categoryTone(category) },
        ]}
      >
        {!!recipe.imageUrl && !failed ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.freshImage}
            onError={() => setFailed(true)}
          />
        ) : (
          <Ionicons
            name={category?.icon ?? "restaurant-outline"}
            size={25}
            color={colors.ink}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.freshTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.freshMeta}>
          {recipe.duration ?? "—"} min · {category?.title ?? "Fresh recipe"}
        </Text>
      </View>
      <Ionicons name="arrow-forward" size={17} color={colors.accent} />
    </Pressable>
  );
}

export default function Homepage() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 40 - 12) / 2;
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const seeded = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        try {
          if (RUN_SEED && !seeded.current) {
            seeded.current = true;
            await seedCategories();
            await seedRecipes();
            await backfillRecipeCounts();
          }
          const [cats, t, p, l] = await Promise.all([
            getCategories(),
            getTrendingRecipes(),
            getPopularRecipes(),
            getLatestRecipes(),
          ]);
          if (active) {
            setCategories(cats);
            setTrending(t);
            setPopular(p);
            setLatest(l);
          }
        } catch (error) {
          console.warn("Failed to load data:", error);
        } finally {
          if (active) setLoading(false);
        }
      }
      load();
      return () => {
        active = false;
      };
    }, []),
  );

  const categoryById = Object.fromEntries(
    categories.map((category) => [category.id, category]),
  );
  const catOf = (recipe) => categoryById[recipe.categoryIds?.[0]];
  const openRecipe = (recipe) =>
    navigation.navigate("RecipeDetail", { recipe, category: catOf(recipe) });
  const openCategory = (id) => {
    const category = categoryById[id];
    if (category) navigation.navigate("CategoryRecipes", { category });
  };
  const openCollection = (title, type) =>
    navigation.navigate("AllRecipes", { title, type });
  const surpriseMe = () => {
    const pool = [...trending, ...popular, ...latest];
    if (pool.length) openRecipe(pool[Math.floor(Math.random() * pool.length)]);
    else navigation.navigate("Search");
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: tabBarHeight + 44,
      }}
    >
      <View style={styles.masthead}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Ionicons name="restaurant" size={18} color={colors.white} />
          </View>
          <Text style={styles.brandName}>
            the daily table<Text style={{ color: colors.accent }}>.</Text>
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.mastheadSearch,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate("Search")}
          accessibilityRole="button"
          accessibilityLabel="Search recipes"
        >
          <Ionicons name="search" size={21} color={colors.ink} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Search")}
        accessibilityRole="button"
        accessibilityLabel="Explore recipes"
        style={({ pressed }) => [styles.heroShell, pressed && styles.pressed]}
      >
        <ImageBackground
          source={HERO_IMAGE}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroTopText}>FOOD / PEOPLE / IDEAS</Text>
            <View style={styles.heroStar}>
              <Ionicons name="sparkles" size={17} color={colors.white} />
            </View>
          </View>
          <View style={styles.heroBottom}>
            <View style={styles.heroRule} />
            <Text style={styles.heroKicker}>
              A FRESH TAKE ON EVERYDAY COOKING
            </Text>
            <Text style={styles.heroTitle}>
              Cook something{"\n"}worth sharing.
            </Text>
            <View style={styles.heroFooter}>
              <Text style={styles.heroCaption}>
                Find the recipe that feels like you.
              </Text>
              <View style={styles.heroButton}>
                <Ionicons name="arrow-forward" size={22} color={colors.ink} />
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
      <View style={styles.issueRow}>
        <Text style={styles.issueText}>YOUR DAILY DOSE OF DELICIOUS</Text>
        <Text style={styles.issueText}>VOL. 01 / EST. TODAY</Text>
      </View>

      <Pressable
        onPress={surpriseMe}
        accessibilityRole="button"
        accessibilityLabel="Surprise me with a recipe"
        style={({ pressed }) => [styles.surprise, pressed && styles.pressed]}
      >
        <View>
          <Text style={styles.surpriseEyebrow}>CAN'T DECIDE?</Text>
          <Text style={styles.surpriseTitle}>
            Let fate pick{"\n"}your plate.
          </Text>
          <Text style={styles.surpriseSub}>
            A random recipe is one tap away.
          </Text>
        </View>
        <View style={styles.surpriseIcon}>
          <Ionicons name="shuffle" size={28} color={colors.white} />
        </View>
      </Pressable>

      <View style={styles.categorySection}>
        <SectionHeading
          number="01"
          label="FIND YOUR FLAVOR"
          title="Explore by mood"
        />
        <CategoryStrip
          categories={categories}
          selectedId={null}
          onSelect={openCategory}
        />
      </View>
      <View style={styles.trendingSection}>
        <SectionHeading
          number="02"
          label="WHAT'S COOKING"
          title="The good stuff"
          onSeeAll={() => openCollection("Trending now", "trending")}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingRail}
        >
          {trending.map((recipe, index) => (
            <CoverCard
              key={recipe.id}
              recipe={recipe}
              category={catOf(recipe)}
              index={index}
              onPress={() => openRecipe(recipe)}
            />
          ))}
          {!trending.length && (
            <Text style={styles.emptyText}>Fresh picks are on their way.</Text>
          )}
        </ScrollView>
      </View>
      <View style={styles.popularSection}>
        <SectionHeading
          number="03"
          label="COMMUNITY FAVORITES"
          title="Loved by everyone"
          onSeeAll={() => openCollection("Popular recipes", "popular")}
        />
        <View style={styles.popularGrid}>
          {popular.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              category={catOf(recipe)}
              width={cardWidth}
              subtitle={`♥ ${compact(recipe.favoriteCount)}  ·  ${recipe.duration ?? "—"} min`}
              onPress={() => openRecipe(recipe)}
            />
          ))}
          {!popular.length && (
            <Text style={styles.emptyText}>Recipes will appear here soon.</Text>
          )}
        </View>
      </View>
      <View style={styles.freshSection}>
        <SectionHeading
          number="04"
          label="JUST ADDED"
          title="Hot off the stove"
          onSeeAll={() => openCollection("Fresh recipes", "latest")}
        />
        {latest.map((recipe, index) => (
          <FreshRow
            key={recipe.id}
            recipe={recipe}
            category={catOf(recipe)}
            index={index}
            onPress={() => openRecipe(recipe)}
          />
        ))}
        {!latest.length && (
          <Text style={styles.emptyText}>The kitchen is warming up.</Text>
        )}
      </View>
      <Pressable
        onPress={() => navigation.navigate("AddRecipe")}
        accessibilityRole="button"
        accessibilityLabel="Add your own recipe"
        style={({ pressed }) => [styles.createPanel, pressed && styles.pressed]}
      >
        <Ionicons name="add-circle-outline" size={28} color={colors.sage} />
        <Text style={styles.createKicker}>FROM YOUR KITCHEN TO OURS</Text>
        <Text style={styles.createTitle}>Got a recipe{"\n"}worth sharing?</Text>
        <View style={styles.createAction}>
          <Text style={styles.createActionText}>Add your recipe</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.ink} />
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  pressed: { opacity: 0.87, transform: [{ scale: 0.98 }] },
  masthead: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: {
    width: 33,
    height: 33,
    backgroundColor: colors.forest,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.7,
  },
  mastheadSearch: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroShell: { marginHorizontal: 16, borderRadius: 27, overflow: "hidden" },
  hero: { height: 445, justifyContent: "space-between" },
  heroImage: { borderRadius: 27 },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 22,
  },
  heroTopText: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.white,
    fontWeight: "800",
  },
  heroStar: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottom: { paddingHorizontal: 23, paddingBottom: 23 },
  heroRule: {
    width: 36,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginBottom: 13,
  },
  heroKicker: {
    color: colors.sage,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 39,
    fontWeight: "900",
    lineHeight: 41,
    letterSpacing: -1.3,
    marginTop: 10,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 21,
  },
  heroCaption: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  heroButton: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  issueRow: {
    marginHorizontal: 20,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  issueText: {
    color: colors.muted,
    fontSize: 8,
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  surprise: {
    backgroundColor: colors.accent,
    borderRadius: 25,
    marginHorizontal: 16,
    marginTop: 28,
    padding: 23,
    minHeight: 160,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  surpriseEyebrow: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  surpriseTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 28,
    letterSpacing: -0.5,
    marginTop: 11,
  },
  surpriseSub: {
    color: colors.white,
    fontSize: 11,
    marginTop: 12,
    opacity: 0.9,
  },
  surpriseIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  categorySection: { marginTop: 43 },
  sectionHeading: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sectionEyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 5,
  },
  seeAll: {
    width: 37,
    height: 37,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  trendingSection: { marginTop: 44 },
  trendingRail: { paddingHorizontal: 20, gap: 13 },
  coverCard: {
    width: 235,
    backgroundColor: colors.white,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
  },
  coverImageWrap: {
    height: 175,
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: { width: "100%", height: "100%" },
  coverIndex: {
    position: "absolute",
    left: 12,
    top: 10,
    color: colors.white,
    fontSize: 31,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowRadius: 6,
  },
  coverArrow: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  coverBody: { padding: 14, minHeight: 109 },
  coverCategory: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.accent,
    letterSpacing: 1,
  },
  coverTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 20,
    marginTop: 5,
  },
  coverMeta: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 0.5,
    fontWeight: "700",
    marginTop: 8,
  },
  popularSection: { marginTop: 44 },
  popularGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  freshSection: { marginTop: 44 },
  freshRow: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  freshNumber: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    width: 22,
  },
  freshImageWrap: {
    width: 62,
    height: 62,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  freshImage: { width: "100%", height: "100%" },
  freshTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  freshMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  emptyText: { marginHorizontal: 20, color: colors.muted, fontSize: 13 },
  createPanel: {
    backgroundColor: colors.forest,
    borderRadius: 26,
    marginHorizontal: 16,
    marginTop: 45,
    padding: 25,
  },
  createKicker: {
    color: colors.sage,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginTop: 18,
  },
  createTitle: {
    color: colors.white,
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 32,
    letterSpacing: -0.6,
    marginTop: 9,
  },
  createAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: colors.sage,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginTop: 20,
  },
  createActionText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
});
