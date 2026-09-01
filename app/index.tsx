import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Href, router } from "expo-router";
import { FeedGrid } from "@/components/feed-grid";
import { FeedErrorState, FeedLoadingState } from "@/components/feed-states";
import { fetchPosts, type PostSummary } from "@/lib/feed-api";

export default function FeedScreen() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const nextPosts = await fetchPosts();
      setPosts(nextPosts);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  if (loading && posts.length === 0) {
    return <FeedLoadingState />;
  }

  if (error && posts.length === 0) {
    return (
      <FeedErrorState message={error} onRetry={() => void loadPosts()} />
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <Text style={styles.errorBannerAction} onPress={() => void loadPosts()}>
            Retry
          </Text>
        </View>
      ) : null}
      <FeedGrid
        posts={posts}
        refreshing={refreshing}
        onRefresh={() => void loadPosts(true)}
        onPressPost={(postId) =>
          router.push(`/post/${postId}` as Href)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#fdecea",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorBannerText: {
    flex: 1,
    color: "#611a15",
    fontSize: 14,
  },
  errorBannerAction: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
  },
});
