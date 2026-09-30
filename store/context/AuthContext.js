import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../../data/firebase";
import { ensureUserDoc } from "../../data/users";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Make sure every signed-in account has a users/{uid} profile document.
      if (u) ensureUserDoc(u).catch((e) => console.warn("ensureUserDoc:", e));
    });
    return unsub;
  }, []);

  const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const register = (email, pw) =>
    createUserWithEmailAndPassword(auth, email, pw);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
