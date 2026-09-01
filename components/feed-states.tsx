import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

interface FeedErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
}

export function FeedLoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
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
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonLabel}>Retry</Text>
      </Pressable>
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
        <Pressable style={styles.button} onPress={onClearFilter}>
          <Text style={styles.buttonLabel}>Clear filter</Text>
        </Pressable>
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
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
