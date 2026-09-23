import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Category from "../models/category";

export const CATEGORIES = [
  new Category("c1", "Italian", "#f5428d", "pizza-outline"),
  new Category("c2", "Quick & Easy", "#f54242", "flash-outline"),
  new Category("c3", "Hamburgers", "#f5a442", "fast-food-outline"),
  new Category("c4", "German", "#f5d142", "beer-outline"),
  new Category("c5", "Light & Lovely", "#368dff", "leaf-outline"),
  new Category("c6", "Exotic", "#41d95d", "earth-outline"),
  new Category("c7", "Breakfast", "#9eecff", "cafe-outline"),
  new Category("c8", "Asian", "#b9ffb0", "restaurant-outline"),
  new Category("c9", "French", "#ffc7ff", "wine-outline"),
  new Category("c10", "Summer", "#47fced", "sunny-outline"),
];

export async function seedCategories() {
  for (const { id, ...data } of CATEGORIES) {
    await setDoc(doc(db, "categories", id), data);
  }
}

export async function getCategories() {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
