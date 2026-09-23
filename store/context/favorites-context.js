import { createContext, useState, useEffect } from "react";
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
} from "firebase/firestore";
import { db } from "../../data/firebase";
import { useAuth } from "./AuthContext"; // ปรับ path ให้ตรงกับที่คุณเก็บ AuthContext

export const FavoritesContext = createContext({
  ids: [],
  addFavorite: (id) => {},
  removeFavorite: (id) => {},
});

function FavoritesContextProvider({ children }) {
  const { user } = useAuth();
  const [favoriteMealIds, setFavoriteMealIds] = useState([]);

  useEffect(() => {
    // ถ้ายังไม่ login ให้เคลียร์รายการโปรด
    if (!user) {
      setFavoriteMealIds([]);
      return;
    }

    // ฟังการเปลี่ยนแปลงแบบ real-time เฉพาะของ user คนนี้
    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
      const ids = snapshot.docs.map((d) => d.id);
      setFavoriteMealIds(ids);
    });

    return unsubscribe;
  }, [user]);

  async function addFavorite(id) {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "favorites", id), {
      mealId: id,
      addedAt: Date.now(),
    });
    // ไม่ต้อง setFavoriteMealIds เอง เพราะ onSnapshot จะอัปเดตให้อัตโนมัติ
  }

  async function removeFavorite(id) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "favorites", id));
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