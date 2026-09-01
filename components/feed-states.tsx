import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GradientPill } from "@/components/ui/gradient-pill";
import { PlainBorderPill } from "@/components/ui/plain-border-pill";
import { colors, fonts } from "@/lib/theme";

interface FeedErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
}

export function FeedLoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.foreground} />
      <Text style={styles.message}>Loading Feed…</Text>
    </View>
  );
}

export function FeedErrorState({
  title = "Could not load Feed",
  message,
  onRetry,
}: FeedErrorStateProps) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <GradientPill label="Retry" onPress={onRetry} />
    </View>
  );
}

interface FeedEmptyStateProps {
  tagDisplayName?: string;
  onClearFilter?: () => void;
}

export function FeedEmptyState({
  tagDisplayName,
  onClearFilter,
}: FeedEmptyStateProps) {
  const filtered = Boolean(tagDisplayName);

  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>
        {filtered ? `No Posts for ${tagDisplayName}` : "No Posts yet"}
      </Text>
      <Text style={styles.message}>
        {filtered
          ? "Try another Tag or clear the filter to browse the full Feed."
          : "Pull down to refresh, or check back soon for new styles."}
      </Text>
      {filtered && onClearFilter ? (
        <PlainBorderPill label="Clear filter" onPress={onClearFilter} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: colors.background,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
  },
  errorTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 20,
    color: colors.foreground,
  },
});
