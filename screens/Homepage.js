import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { getCategories } from "../data/categories";
import {
  getTrendingRecipes,
  getPopularRecipes,
  getLatestRecipes,
} from "../data/recipes";
import { seedCategories } from "../data/categories";
import { seedRecipes } from "../data/recipes";
import CategoryStrip from "../components/CategoryStrip";
import RecipeCard from "../components/RecipeCard";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatCount(n = 0) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function Section({ title, icon, onSeeAll, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {icon && <Ionicons name={icon} size={18} color="#E08E79" />}
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

export default function Homepage() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 10) / 2;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [cats, t, p, l] = await Promise.all([
          getCategories(),
          getTrendingRecipes(),
          getPopularRecipes(),
          getLatestRecipes(),
        ]);
        setCategories(cats);
        setTrending(t);
        setPopular(p);
        setLatest(l);
      } catch (e) {
        console.warn("Failed to load data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  useEffect(() => {
    async function seed() {
      await seedCategories();
      await seedRecipes();
      console.log("seed done");
    }
    seed();
  }, []);
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const catOf = (recipe) => categoryById[recipe.categoryIds?.[0]];

  function renderCards(list, makeSubtitle) {
    return list.map((r) => (
      <RecipeCard
        key={r.id}
        recipe={r}
        category={catOf(r)}
        width={cardWidth}
        subtitle={makeSubtitle(r)}
        onPress={() => {}} // TODO: เปิดหน้ารายละเอียดสูตร
      />
    ));
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E08E79" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: tabBarHeight + 32,
      }}
    >
      <View style={styles.pad}>
        <Text style={styles.hello}>{greeting()}</Text>
        <Text style={styles.headline}>What should we cook today?</Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <CategoryStrip
          categories={categories}
          selectedId={selectedId}
          onSelect={setSelectedId} 
        />
      </View>

      <Section title="Trending now" icon="flame">
        {renderCards(trending, (r) => `${formatCount(r.searchCount)} searches`)}
      </Section>

      <Section title="Popular recipes" onSeeAll={() => {}}>
        {renderCards(
          popular,
          (r) => `${r.duration ?? "-"} min · ${r.rating?.toFixed?.(1) ?? "-"}`,
        )}
      </Section>

      <Section title="Recommended for you" onSeeAll={() => {}}>
        {renderCards(latest, (r) => `${r.duration ?? "-"} min · New`)}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF8F2" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8F2",
  },
  pad: { paddingHorizontal: 16 },
  hello: { fontSize: 12, color: "#8A7A6E" },
  headline: { fontSize: 22, fontWeight: "500", color: "#4A3728", marginTop: 2 },
  section: { marginTop: 22, paddingHorizontal: 16 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "500", color: "#4A3728", flex: 1 },
  seeAll: { fontSize: 12, fontWeight: "500", color: "#E08E79" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
});
