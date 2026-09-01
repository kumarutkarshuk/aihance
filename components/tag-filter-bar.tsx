import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Tag } from "@/lib/feed-api";

interface TagFilterBarProps {
  tags: Tag[];
  selectedTagSlug?: string;
  onSelectTag: (slug: string | undefined) => void;
}

export function TagFilterBar({
  tags,
  selectedTagSlug,
  onSelectTag,
}: TagFilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTagSlug ? (
          <Pressable
            style={styles.clearChip}
            onPress={() => onSelectTag(undefined)}
            accessibilityRole="button"
            accessibilityLabel="Clear tag filter"
          >
            <Text style={styles.clearChipText}>Clear</Text>
          </Pressable>
        ) : null}
        {tags.map((tag) => {
          const selected = tag.slug === selectedTagSlug;
          return (
            <Pressable
              key={tag.slug}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() =>
                onSelectTag(selected ? undefined : tag.slug)
              }
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${tag.displayName}`}
              accessibilityState={{ selected }}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {tag.displayName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: "#111",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
  },
  clearChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  clearChipText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
});
