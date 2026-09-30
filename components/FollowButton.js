import { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { auth } from "../data/firebase";
import { isFollowing, followUser, unfollowUser } from "../data/users";
import { useToast } from "./Toast";

// Renders nothing for your own account or when signed out.
export default function FollowButton({ uid, onChange, large }) {
  const toast = useToast();
  const me = auth.currentUser?.uid;
  const [following, setFollowing] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (me && uid && uid !== me) {
      isFollowing(uid)
        .then((v) => alive && setFollowing(v))
        .catch(() => alive && setFollowing(false));
    }
    return () => {
      alive = false;
    };
  }, [uid, me]);

  if (!me || !uid || me === uid) return null;

  async function toggle() {
    if (busy || following === null) return;
    setBusy(true);
    const next = !following;
    setFollowing(next); // optimistic
    try {
      if (next) await followUser(uid);
      else await unfollowUser(uid);
      onChange?.(next);
    } catch (e) {
      console.warn("follow error:", e);
      setFollowing(!next);
      toast.error("Couldn't update follow", { message: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      onPress={toggle}
      style={[
        styles.btn,
        large && styles.large,
        following && styles.on,
        following === null && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.text, large && styles.textLarge, following && styles.textOn]}>
        {following ? "Following" : "Follow"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    backgroundColor: "#E08E79",
  },
  large: { paddingHorizontal: 44, paddingVertical: 10, borderRadius: 20 },
  on: { backgroundColor: "#FFF1E6" },
  text: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  textLarge: { fontSize: 14 },
  textOn: { color: "#A9553F" },
});
