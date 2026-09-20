import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_CATEGORIES = [
  { id: "c1", title: "Italian", color: "#f5428d", icon: "pizza-outline" },
  { id: "c2", title: "Quick & Easy", color: "#f54242", icon: "flash-outline" },
  { id: "c3", title: "Hamburgers", color: "#f5a442", icon: "fast-food-outline" },
  { id: "c4", title: "German", color: "#f5d142", icon: "beer-outline" },
  { id: "c5", title: "Light & Lovely", color: "#368dff", icon: "leaf-outline" },
  { id: "c6", title: "Exotic", color: "#41d95d", icon: "earth-outline" },
  { id: "c7", title: "Breakfast", color: "#9eecff", icon: "cafe-outline" },
  { id: "c8", title: "Asian", color: "#b9ffb0", icon: "restaurant-outline" },
  { id: "c9", title: "French", color: "#ffc7ff", icon: "wine-outline" },
  { id: "c10", title: "Summer", color: "#47fced", icon: "sunny-outline" },
];

export async function seedCategories() {
  for (const { id, ...data } of DEFAULT_CATEGORIES) {
    await setDoc(doc(db, "categories", id), data);
  }
}

export async function getCategories() {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}