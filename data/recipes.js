import {
  collection, addDoc, getDocs, query, where, orderBy, limit, doc, setDoc, updateDoc, increment,
} from "firebase/firestore";
import { db } from "./firebase";

async function fetchList(q) {
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function getAllRecipes() {
  return fetchList(collection(db, "recipes"));
}

export function incrementSearchCount(id) {
  return updateDoc(doc(db, "recipes", id), { searchCount: increment(1) });
}

export async function addRecipe(recipe) {
  await addDoc(collection(db, "recipes"), {
    searchCount: 0,
    rating: 0,
    ...recipe,
    createdAt: Date.now(),
  });
}

export function getRecipesByCategory(categoryId) {
  return fetchList(
    query(collection(db, "recipes"), where("categoryIds", "array-contains", categoryId))
  );
}

export function getTrendingRecipes(n = 4) {
  return fetchList(
    query(collection(db, "recipes"), orderBy("searchCount", "desc"), limit(n))
  );
}

export function getPopularRecipes(n = 4) {
  return fetchList(
    query(collection(db, "recipes"), orderBy("rating", "desc"), limit(n))
  );
}

export function getLatestRecipes(n = 4) {
  return fetchList(
    query(collection(db, "recipes"), orderBy("createdAt", "desc"), limit(n))
  );
}

export async function seedRecipes() {
  const samples = [
    {
      id: "m1",
      categoryIds: ["c1", "c2"],
      title: "Spaghetti with Tomato Sauce",
      affordability: "affordable",
      complexity: "simple",
      imageUrl:
        "https://www.allrecipes.com/thmb/iZmE8xvusvYu16RIMZLdG1HX3OM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/254517-spaghetti-sauce-with-fresh-tomatoes-3x2-79-609ce4edcafb4191b609180163fed92b.jpg",
      duration: 20,
      ingredients: [
        "4 Tomatoes",
        "1 Tablespoon of Olive Oil",
        "1 Onion",
        "250g Spaghetti",
        "Spices",
        "Cheese (optional)",
      ],
      steps: [
        "Cut the tomatoes and the onion into small pieces.",
        "Boil some water - add salt to it once it boils.",
        "Put the spaghetti into the boiling water - they should be done in about 10 to 12 minutes.",
        "In the meantime, heaten up some olive oil and add the cut onion.",
        "After 2 minutes, add the tomato pieces, salt, pepper and your other spices.",
        "The sauce will be done once the spaghetti are.",
        "Feel free to add some cheese on top of the finished dish.",
      ],
      isGlutenFree: false,
      isVegan: true,
      isVegetarian: true,
      isLactoseFree: true,
      rating: 4.6,
      searchCount: 2100,
    },
    {
      id: "m2",
      categoryIds: ["c2"],
      title: "Toast Hawaii",
      affordability: "affordable",
      complexity: "simple",
      imageUrl: "https://cdn.pixabay.com/photo/2018/07/11/21/51/toast-3532016_1280.jpg",
      duration: 10,
      ingredients: [
        "1 Slice White Bread",
        "1 Slice Ham",
        "1 Slice Pineapple",
        "1-2 Slices of Cheese",
        "Butter",
      ],
      steps: [
        "Butter one side of the white bread",
        "Layer ham, the pineapple and cheese on the white bread",
        "Bake the toast for round about 10 minutes in the oven at 200°C",
      ],
      isGlutenFree: false,
      isVegan: false,
      isVegetarian: false,
      isLactoseFree: false,
      rating: 4.2,
      searchCount: 900,
    },
    {
      id: "m3",
      categoryIds: ["c3"],
      title: "Classic Hamburger",
      affordability: "pricey",
      complexity: "simple",
      imageUrl: "https://cdn.pixabay.com/photo/2014/10/23/18/05/burger-500054_1280.jpg",
      duration: 45,
      ingredients: [
        "300g Cattle Hack",
        "1 Tomato",
        "1 Cucumber",
        "1 Onion",
        "Ketchup",
        "2 Burger Buns",
      ],
      steps: [
        "Form 2 patties",
        "Fry the patties for c. 4 minutes on each side",
        "Quickly fry the buns for c. 1 minute on each side",
        "Bruch buns with ketchup",
        "Serve burger with tomato, cucumber and onion",
      ],
      isGlutenFree: false,
      isVegan: false,
      isVegetarian: false,
      isLactoseFree: true,
      rating: 4.7,
      searchCount: 1800,
    },
    {
      id: "m4",
      categoryIds: ["c4"],
      title: "Wiener Schnitzel",
      affordability: "luxurious",
      complexity: "challenging",
      imageUrl: "https://cdn.pixabay.com/photo/2018/03/31/19/29/schnitzel-3279045_1280.jpg",
      duration: 60,
      ingredients: [
        "8 Veal Cutlets",
        "4 Eggs",
        "200g Bread Crumbs",
        "100g Flour",
        "300ml Butter",
        "100g Vegetable Oil",
        "Salt",
        "Lemon Slices",
      ],
      steps: [
        "Tenderize the veal to about 2–4mm, and salt on both sides.",
        "On a flat plate, stir the eggs briefly with a fork.",
        "Lightly coat the cutlets in flour then dip into the egg, and finally, coat in breadcrumbs.",
        "Heat the butter and oil in a large pan (allow the fat to get very hot) and fry the schnitzels until golden brown on both sides.",
        "Make sure to toss the pan regularly so that the schnitzels are surrounded by oil and the crumbing becomes ‘fluffy’.",
        "Remove, and drain on kitchen paper. Fry the parsley in the remaining oil and drain.",
        "Place the schnitzels on awarmed plate and serve garnishedwith parsley and slices of lemon.",
      ],
      isGlutenFree: false,
      isVegan: false,
      isVegetarian: false,
      isLactoseFree: false,
      rating: 4.4,
      searchCount: 600,
    },
    {
      id: "m5",
      categoryIds: ["c2", "c5", "c10"],
      title: "Salad with Smoked Salmon",
      affordability: "luxurious",
      complexity: "simple",
      imageUrl:
        "https://cdn.pixabay.com/photo/2016/10/25/13/29/smoked-salmon-salad-1768890_1280.jpg",
      duration: 15,
      ingredients: [
        "Arugula",
        "Lamb's Lettuce",
        "Parsley",
        "Fennel",
        "200g Smoked Salmon",
        "Mustard",
        "Balsamic Vinegar",
        "Olive Oil",
        "Salt and Pepper",
      ],
      steps: [
        "Wash and cut salad and herbs",
        "Dice the salmon",
        "Process mustard, vinegar and olive oil into a dessing",
        "Prepare the salad",
        "Add salmon cubes and dressing",
      ],
      isGlutenFree: true,
      isVegan: false,
      isVegetarian: true,
      isLactoseFree: true,
      rating: 4.8,
      searchCount: 1200,
    },
    {
      id: "m6",
      categoryIds: ["c6", "c10"],
      title: "Delicious Orange Mousse",
      affordability: "affordable",
      complexity: "hard",
      imageUrl: "https://cdn.pixabay.com/photo/2017/05/01/05/18/pastry-2274750_1280.jpg",
      duration: 240,
      ingredients: [
        "4 Sheets of Gelatine",
        "150ml Orange Juice",
        "80g Sugar",
        "300g Yoghurt",
        "200g Cream",
        "Orange Peel",
      ],
      steps: [
        "Dissolve gelatine in pot",
        "Add orange juice and sugar",
        "Take pot off the stove",
        "Add 2 tablespoons of yoghurt",
        "Stir gelatin under remaining yoghurt",
        "Cool everything down in the refrigerator",
        "Whip the cream and lift it under die orange mass",
        "Cool down again for at least 4 hours",
        "Serve with orange peel",
      ],
      isGlutenFree: true,
      isVegan: false,
      isVegetarian: true,
      isLactoseFree: false,
      rating: 4.5,
      searchCount: 500,
    },
  ];

  for (let i = 0; i < samples.length; i++) {
    const { id, ...data } = samples[i];
    await setDoc(doc(db, "recipes", id), {
      ...data,
      createdAt: Date.now() + i,
    });
  }
}