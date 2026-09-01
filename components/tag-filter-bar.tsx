import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Tag } from "@/lib/feed-api";
import { colors, fonts } from "@/lib/theme";

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
    borderBottomColor: colors.glassBorder,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.foreground,
  },
  chipTextSelected: {
    color: colors.background,
  },
  clearChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  clearChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.muted,
  },
});
