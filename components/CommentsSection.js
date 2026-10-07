import { colors } from "../theme";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../data/firebase";
import { useToast } from "./Toast";
import { subscribeComments, addComment, deleteComment } from "../data/comments";

function timeAgo(ts) {
  if (!ts?.toDate) return "Just now";
  const sec = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export default function CommentsSection({ recipeId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const unsub = subscribeComments(
      recipeId,
      (list) => {
        setComments(list);
        setLoading(false);
      },
      (e) => {
        console.warn("comments error:", e);
        setLoading(false);
      },
    );
    return unsub;
  }, [recipeId]);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addComment(recipeId, text);
      setText("");
    } catch (e) {
      toast.error("Couldn't post your comment", {
        message: "Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  function confirmDelete(id) {
    Alert.alert("Delete comment", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteComment(recipeId, id).catch(() => {}),
      },
    ]);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Comments ({comments.length})</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Add a comment…"
          placeholderTextColor={colors.subtle}
          multiline
        />
        <Pressable
          onPress={send}
          disabled={!text.trim() || sending}
          style={[styles.send, (!text.trim() || sending) && { opacity: 0.4 }]}
        >
          {sending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Ionicons name="send" size={18} color="#FFF" />
          )}
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />
      ) : comments.length === 0 ? (
        <Text style={styles.empty}>
          No comments yet. Be the first to share your thoughts.
        </Text>
      ) : (
        comments.map((c) => (
          <View key={c.id} style={styles.item}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(c.authorName || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.metaRow}>
                <Text style={styles.name}>{c.authorName}</Text>
                <Text style={styles.time}>{timeAgo(c.createdAt)}</Text>
              </View>
              <Text style={styles.body}>{c.text}</Text>
            </View>
            {c.authorId === uid && (
              <Pressable hitSlop={8} onPress={() => confirmDelete(c.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.subtle} />
              </Pressable>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 0 },
  heading: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.ink,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    maxHeight: 100,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 16,
  },
  item: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.accent, fontWeight: "500" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 13, fontWeight: "500", color: colors.ink },
  time: { fontSize: 11, color: colors.muted },
  body: { fontSize: 14, color: colors.ink, lineHeight: 20, marginTop: 2 },
});
