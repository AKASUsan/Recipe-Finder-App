import {
  collection, doc, getDoc, getDocs, setDoc, query, where, limit,
  writeBatch, increment,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const displayNameOf = (u) =>
  u?.displayName || u?.email?.split("@")[0] || "User";

/* ---------- Profiles ---------- */

// Creates users/{uid} the first time someone signs in. Safe to call repeatedly.
export async function ensureUserDoc(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const name = displayNameOf(user);
  await setDoc(ref, {
    displayName: name,
    displayNameLower: name.toLowerCase(),
    followersCount: 0,
    followingCount: 0,
    createdAt: Date.now(),
  });
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getUsersByIds(ids) {
  const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, "users", id))));
  return snaps.filter((s) => s.exists()).map((s) => ({ id: s.id, ...s.data() }));
}

// Prefix search on displayNameLower ("sal" finds "Sally").
export async function searchUsers(text) {
  const q = text.trim().toLowerCase();
  if (!q) return [];
  const snap = await getDocs(
    query(
      collection(db, "users"),
      where("displayNameLower", ">=", q),
      where("displayNameLower", "<=", q + "\uf8ff"),
      limit(20)
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRecipesByAuthor(uid) {
  const snap = await getDocs(
    query(collection(db, "recipes"), where("authorId", "==", uid))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/* ---------- Follow ---------- */

export async function isFollowing(targetUid) {
  const me = auth.currentUser?.uid;
  if (!me) return false;
  const snap = await getDoc(doc(db, "users", me, "following", targetUid));
  return snap.exists();
}

export async function followUser(targetUid) {
  const me = auth.currentUser?.uid;
  if (!me || me === targetUid) return;
  if (await isFollowing(targetUid)) return;
  const batch = writeBatch(db);
  const now = Date.now();
  batch.set(doc(db, "users", me, "following", targetUid), { createdAt: now });
  batch.set(doc(db, "users", targetUid, "followers", me), { createdAt: now });
  batch.set(doc(db, "users", me), { followingCount: increment(1) }, { merge: true });
  batch.set(doc(db, "users", targetUid), { followersCount: increment(1) }, { merge: true });
  await batch.commit();
}

export async function unfollowUser(targetUid) {
  const me = auth.currentUser?.uid;
  if (!me || me === targetUid) return;
  if (!(await isFollowing(targetUid))) return;
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", me, "following", targetUid));
  batch.delete(doc(db, "users", targetUid, "followers", me));
  batch.set(doc(db, "users", me), { followingCount: increment(-1) }, { merge: true });
  batch.set(doc(db, "users", targetUid), { followersCount: increment(-1) }, { merge: true });
  await batch.commit();
}

async function listUsers(uid, sub) {
  const snap = await getDocs(collection(db, "users", uid, sub));
  return getUsersByIds(snap.docs.map((d) => d.id));
}

export const getFollowers = (uid) => listUsers(uid, "followers");
export const getFollowing = (uid) => listUsers(uid, "following");
