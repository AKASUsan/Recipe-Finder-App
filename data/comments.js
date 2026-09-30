import {
  collection, addDoc, deleteDoc, doc, query, orderBy,
  onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const commentsRef = (recipeId) => collection(db, "recipes", recipeId, "comments");

// Listens to comments in real time. Returns an unsubscribe function.
export function subscribeComments(recipeId, onData, onError) {
  const q = query(commentsRef(recipeId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function addComment(recipeId, text) {
  const user = auth.currentUser;
  if (!user) throw new Error("not-signed-in");
  return addDoc(commentsRef(recipeId), {
    text: text.trim(),
    authorId: user.uid,
    authorName: user.displayName || user.email?.split("@")[0] || "User",
    createdAt: serverTimestamp(),
  });
}

export function deleteComment(recipeId, commentId) {
  return deleteDoc(doc(db, "recipes", recipeId, "comments", commentId));
}
