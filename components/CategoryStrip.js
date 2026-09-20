import { useRef, useState } from "react";
import { View, Text, FlatList, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TRACK = 64; 
export default function CategoryStrip({ categories, selectedId, onSelect }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [layoutW, setLayoutW] = useState(0);
  const [contentW, setContentW] = useState(0);

  const scrollable = contentW > layoutW && layoutW > 0;
  const thumbW = scrollable ? Math.max(20, (layoutW / contentW) * TRACK) : TRACK;
  const maxScroll = Math.max(1, contentW - layoutW);

  const thumbX = scrollX.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, TRACK - thumbW],
    extrapolate: "clamp",
  });

  return (
    <View>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onLayout={(e) => setLayoutW(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentW(w)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const active = item.id === selectedId;
          return (
            <Pressable onPress={() => onSelect(item.id)} style={styles.item}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: item.color },
                  active && styles.dotActive,
                ]}
              >
                <Ionicons name={item.icon ?? "restaurant-outline"} size={23} color="#4A3728" />
              </View>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          );
        }}
      />

      {scrollable && (
        <View style={styles.track}>
          <Animated.View
            style={[styles.thumb, { width: thumbW, transform: [{ translateX: thumbX }] }]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 14 },
  item: { width: 64, alignItems: "center", gap: 6 },
  dot: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: "center", justifyContent: "center",
  },
  dotActive: { borderWidth: 2, borderColor: "#E08E79" },
  label: { fontSize: 11, color: "#4A3728" },
  labelActive: { color: "#E08E79", fontWeight: "500" },
  track: {
    width: TRACK, height: 4, borderRadius: 2,
    backgroundColor: "#EBDDD0", alignSelf: "center", marginTop: 12,
  },
  thumb: { height: 4, borderRadius: 2, backgroundColor: "#E08E79" },
});