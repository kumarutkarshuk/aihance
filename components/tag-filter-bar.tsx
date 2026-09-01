import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Tag } from "@/lib/feed-api";
import { colors, fonts, gradients, radii } from "@/lib/theme";
import { PlainBorderPill } from "@/components/ui/plain-border-pill";

interface TagFilterBarProps {
  tags: Tag[];
  selectedTagSlug?: string;
  onSelectTag: (slug: string | undefined) => void;
}

interface TagChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

function TagChip({ label, selected, onPress, accessibilityLabel }: TagChipProps) {
  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: true }}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <LinearGradient
          colors={[...gradients.selectedPill]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.selectedChip}
        >
          <Text style={styles.selectedChipText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <PlainBorderPill
      label={label}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={styles.unselectedChip}
    />
  );
}

export function TagFilterBar({
  tags,
  selectedTagSlug,
  onSelectTag,
}: TagFilterBarProps) {
  const allSelected = !selectedTagSlug;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TagChip
          label="All"
          selected={allSelected}
          onPress={() => onSelectTag(undefined)}
          accessibilityLabel="Show all Posts"
        />
        {tags.map((tag) => {
          const selected = tag.slug === selectedTagSlug;
          return (
            <TagChip
              key={tag.slug}
              label={tag.displayName}
              selected={selected}
              onPress={() => onSelectTag(selected ? undefined : tag.slug)}
              accessibilityLabel={`Filter by ${tag.displayName}`}
            />
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
  selectedChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectedChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.foreground,
  },
  unselectedChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
});
