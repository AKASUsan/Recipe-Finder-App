import { createContext, useState, useEffect } from "react";
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
} from "firebase/firestore";
import { db } from "../../data/firebase";
import { adjustFavoriteCount } from "../../data/recipes";
import { useAuth } from "./AuthContext"; 

export const FavoritesContext = createContext({
  ids: [],
  addFavorite: (id) => {},
  removeFavorite: (id) => {},
});

function FavoritesContextProvider({ children }) {
  const { user } = useAuth();
  const [favoriteMealIds, setFavoriteMealIds] = useState([]);

  useEffect(() => {
    if (!user) {
      setFavoriteMealIds([]);
      return;
    }

    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
      const ids = snapshot.docs.map((d) => d.id);
      setFavoriteMealIds(ids);
    });

    return unsubscribe;
  }, [user]);

  async function addFavorite(id) {
    if (!user) return;
    if (favoriteMealIds.includes(id)) return; 

    await setDoc(doc(db, "users", user.uid, "favorites", id), {
      mealId: id,
      addedAt: Date.now(),
    });

    adjustFavoriteCount(id, 1).catch((e) =>
      console.warn("Failed to increment favorite count:", e)
    );
  }

  async function removeFavorite(id) {
    if (!user) return;
    if (!favoriteMealIds.includes(id)) return; 

    await deleteDoc(doc(db, "users", user.uid, "favorites", id));

    adjustFavoriteCount(id, -1).catch((e) =>
      console.warn("Failed to decrement favorite count:", e)
    );
  }

  const value = {
    ids: favoriteMealIds,
    addFavorite,
    removeFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesContextProvider;