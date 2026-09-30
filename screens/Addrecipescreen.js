import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getCategories } from "../data/categories";
import { addRecipe } from "../data/recipes";
import { useToast } from "../components/Toast";

const AFFORDABILITY = ["affordable", "pricey", "luxurious"];
const COMPLEXITY = ["simple", "challenging", "hard"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => (
        <Pressable
          key={o}
          onPress={() => onChange(o)}
          style={[styles.segItem, value === o && styles.segActive]}
        >
          <Text style={[styles.segText, value === o && styles.segTextActive]}>
            {cap(o)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// หัวข้อที่กดพับ/กางได้ summary คือข้อความสรุปตอนพับอยู่
function Section({ title, summary, open, onToggle, children }) {
  return (
    <View style={[styles.section, open && styles.sectionOpen]}>
      <Pressable style={styles.sectionHead} onPress={onToggle}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{title}</Text>
          {!open && !!summary && (
            <Text style={styles.summary} numberOfLines={1}>
              {summary}
            </Text>
          )}
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8A7A6E"
        />
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

function ListEditor({ values, setValues, placeholder, multiline, addLabel }) {
  return (
    <View>
      {values.map((v, i) => (
        <View key={i} style={styles.listRow}>
          <Text style={styles.index}>{i + 1}</Text>
          <TextInput
            style={[styles.input, styles.flex, multiline && styles.multiline]}
            value={v}
            onChangeText={(t) =>
              setValues(values.map((x, j) => (j === i ? t : x)))
            }
            placeholder={placeholder}
            placeholderTextColor="#B5A79B"
            multiline={multiline}
          />
          {values.length > 1 && (
            <Pressable
              hitSlop={8}
              onPress={() => setValues(values.filter((_, j) => j !== i))}
            >
              <Ionicons name="close-circle" size={22} color="#B5A79B" />
            </Pressable>
          )}
        </View>
      ))}
      <Pressable
        style={styles.addRow}
        onPress={() => setValues([...values, ""])}
      >
        <Ionicons name="add-circle-outline" size={20} color="#E08E79" />
        <Text style={styles.addRowText}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function AddRecipeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [affordability, setAffordability] = useState("affordable");
  const [complexity, setComplexity] = useState("simple");
  const [categoryIds, setCategoryIds] = useState([]);
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [flags, setFlags] = useState({
    isGlutenFree: false,
    isVegan: false,
    isVegetarian: false,
    isLactoseFree: false,
  });
  const [saving, setSaving] = useState(false);
  const [openKey, setOpenKey] = useState("categories"); // เปิดทีละหัวข้อ

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => console.warn("Failed to load categories:", e));
  }, []);

  const toggleSection = (key) => setOpenKey((k) => (k === key ? null : key));
  const toggleCategory = (id) =>
    setCategoryIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  const toggleFlag = (key) => setFlags((f) => ({ ...f, [key]: !f[key] }));

  const filledIngredients = ingredients.filter((s) => s.trim()).length;
  const filledSteps = steps.filter((s) => s.trim()).length;
  const selectedCats = categories
    .filter((c) => categoryIds.includes(c.id))
    .map((c) => c.title);
  const activeFlags = Object.values(flags).filter(Boolean).length;

  async function handleSave() {
    const cleanIngredients = ingredients.map((s) => s.trim()).filter(Boolean);
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    const minutes = Number(duration);

    if (!title.trim())
      return toast.error("Add a title", {
        message: "Give your recipe a name first.",
      });
    if (categoryIds.length === 0) {
      setOpenKey("categories");
      return toast.error("Pick a category", {
        message: "Choose at least one category.",
      });
    }
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setOpenKey("details");
      return toast.error("Check the duration", {
        message: "Enter the cooking time in minutes.",
      });
    }
    if (imageUrl.trim() && !/^https?:\/\//i.test(imageUrl.trim())) {
      setOpenKey("details");
      return toast.error("Invalid image link", {
        message: "It should start with http:// or https://",
      });
    }
    if (cleanIngredients.length === 0) {
      setOpenKey("ingredients");
      return toast.error("Add an ingredient", {
        message: "List at least one ingredient.",
      });
    }
    if (cleanSteps.length === 0) {
      setOpenKey("steps");
      return toast.error("Add a step", {
        message: "Describe at least one step.",
      });
    }

    setSaving(true);
    try {
      await addRecipe({
        title: title.trim(),
        categoryIds,
        affordability,
        complexity,
        imageUrl: imageUrl.trim(),
        duration: Math.round(minutes),
        ingredients: cleanIngredients,
        steps: cleanSteps,
        ...flags,
      });
      toast.success("Recipe published", {
        message: "Find it under Profile \u2192 My recipes.",
        action: {
          label: "View",
          onPress: () => navigation.navigate("Main", { screen: "User" }),
        },
      });
      navigation.goBack();
    } catch (e) {
      console.warn("Failed to add recipe:", e);
      toast.error("Couldn't save your recipe", {
        message: "Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="เช่น Pad Kra Pao"
            placeholderTextColor="#B5A79B"
          />
        </View>

        <Section
          title="Categories"
          summary={
            selectedCats.length ? selectedCats.join(", ") : "ยังไม่ได้เลือก"
          }
          open={openKey === "categories"}
          onToggle={() => toggleSection("categories")}
        >
          <View style={styles.chips}>
            {categories.map((c) => {
              const on = categoryIds.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggleCategory(c.id)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <View style={[styles.dot, { backgroundColor: c.color }]} />
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {c.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section
          title="Details"
          summary={`${duration || "-"} min · ${cap(affordability)} · ${cap(complexity)}`}
          open={openKey === "details"}
          onToggle={() => toggleSection("details")}
        >
          <Text style={styles.sub}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={(t) => setDuration(t.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            placeholder="เช่น 30"
            placeholderTextColor="#B5A79B"
          />
          <Text style={styles.sub}>Affordability</Text>
          <Segmented
            options={AFFORDABILITY}
            value={affordability}
            onChange={setAffordability}
          />
          <Text style={styles.sub}>Complexity</Text>
          <Segmented
            options={COMPLEXITY}
            value={complexity}
            onChange={setComplexity}
          />
          <Text style={styles.sub}>Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://..."
            placeholderTextColor="#B5A79B"
          />
        </Section>

        <Section
          title="Ingredients"
          summary={`${filledIngredients} รายการ`}
          open={openKey === "ingredients"}
          onToggle={() => toggleSection("ingredients")}
        >
          <ListEditor
            values={ingredients}
            setValues={setIngredients}
            placeholder="เช่น 2 Eggs"
            addLabel="Add ingredient"
          />
        </Section>

        <Section
          title="Steps"
          summary={`${filledSteps} ขั้นตอน`}
          open={openKey === "steps"}
          onToggle={() => toggleSection("steps")}
        >
          <ListEditor
            values={steps}
            setValues={setSteps}
            placeholder="อธิบายขั้นตอน"
            multiline
            addLabel="Add step"
          />
        </Section>

        <Section
          title="Dietary"
          summary={activeFlags ? `${activeFlags} รายการ` : "ไม่ระบุ"}
          open={openKey === "dietary"}
          onToggle={() => toggleSection("dietary")}
        >
          {[
            ["isVegan", "Vegan"],
            ["isVegetarian", "Vegetarian"],
            ["isGlutenFree", "Gluten-free"],
            ["isLactoseFree", "Lactose-free"],
          ].map(([key, text]) => (
            <View key={key} style={styles.switchRow}>
              <Text style={styles.switchText}>{text}</Text>
              <Switch
                value={flags[key]}
                onValueChange={() => toggleFlag(key)}
                trackColor={{ false: "#E6E0DA", true: "#F2C4B8" }}
                thumbColor={flags[key] ? "#E08E79" : "#FFFFFF"}
              />
            </View>
          ))}
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[styles.save, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Save recipe</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: "#FFF8F2" },
  titleBlock: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "500", color: "#4A3728", marginBottom: 6 },
  sub: { fontSize: 12, color: "#8A7A6E", marginTop: 12, marginBottom: 6 },
  summary: { fontSize: 12, color: "#8A7A6E", marginTop: -2 },
  section: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  sectionOpen: { borderColor: "#E08E79" },
  sectionHead: { flexDirection: "row", alignItems: "center", padding: 14 },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14 },
  input: {
    backgroundColor: "#FFF8F2",
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#4A3728",
  },
  multiline: { minHeight: 64, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: {
    backgroundColor: "#FFF1E6",
    borderColor: "#E08E79",
    borderWidth: 1,
  },
  chipText: { fontSize: 12, color: "#4A3728" },
  chipTextOn: { color: "#E08E79", fontWeight: "500" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#FFF8F2",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#E6E0DA",
    padding: 3,
  },
  segItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  segActive: { backgroundColor: "#FFF1E6" },
  segText: { fontSize: 12, color: "#8A7A6E" },
  segTextActive: { color: "#E08E79", fontWeight: "500" },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  index: {
    width: 18,
    marginTop: 11,
    fontSize: 12,
    color: "#8A7A6E",
    textAlign: "center",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  addRowText: { fontSize: 13, color: "#E08E79", fontWeight: "500" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  switchText: { fontSize: 14, color: "#4A3728" },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFF8F2",
    borderTopWidth: 0.5,
    borderTopColor: "#E6E0DA",
  },
  save: {
    backgroundColor: "#E08E79",
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
});
