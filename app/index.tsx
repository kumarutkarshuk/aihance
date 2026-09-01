import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Href, router, useLocalSearchParams } from "expo-router";
import { FeedGrid } from "@/components/feed-grid";
import {
  FeedEmptyState,
  FeedErrorState,
  FeedLoadingState,
} from "@/components/feed-states";
import { TagFilterBar } from "@/components/tag-filter-bar";
import {
  fetchPosts,
  fetchTags,
  type PostSummary,
  type Tag,
} from "@/lib/feed-api";

function normalizeTagParam(tag: string | string[] | undefined): string | undefined {
  if (typeof tag !== "string" || tag.trim().length === 0) {
    return undefined;
  }
  return tag.trim();
}

export default function FeedScreen() {
  const { tag: tagParam } = useLocalSearchParams<{ tag?: string | string[] }>();
  const selectedTagSlug = useMemo(
    () => normalizeTagParam(tagParam),
    [tagParam],
  );

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setPosts([]);
    }
    setError(null);

    try {
      const [postsResult, tagsResult] = await Promise.allSettled([
        fetchPosts(selectedTagSlug),
        fetchTags(),
      ]);

      if (tagsResult.status === "fulfilled") {
        setTags(tagsResult.value);
      }

      if (postsResult.status === "fulfilled") {
        setPosts(postsResult.value);
      } else {
        throw postsResult.reason;
      }
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
  }, [selectedTagSlug]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const handleSelectTag = useCallback((slug: string | undefined) => {
    if (slug) {
      router.setParams({ tag: slug });
      return;
    }

    router.setParams({ tag: "" });
  }, []);

  const selectedTagDisplayName = useMemo(() => {
    if (!selectedTagSlug) {
      return undefined;
    }
    return tags.find((tag) => tag.slug === selectedTagSlug)?.displayName;
  }, [selectedTagSlug, tags]);

  if (loading && posts.length === 0) {
    return (
      <View style={styles.container}>
        {tags.length > 0 ? (
          <TagFilterBar
            tags={tags}
            selectedTagSlug={selectedTagSlug}
            onSelectTag={handleSelectTag}
          />
        ) : null}
        <FeedLoadingState />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={styles.container}>
        {tags.length > 0 ? (
          <TagFilterBar
            tags={tags}
            selectedTagSlug={selectedTagSlug}
            onSelectTag={handleSelectTag}
          />
        ) : null}
        <FeedErrorState message={error} onRetry={() => void loadFeed()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TagFilterBar
        tags={tags}
        selectedTagSlug={selectedTagSlug}
        onSelectTag={handleSelectTag}
      />
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <Text
            style={styles.errorBannerAction}
            onPress={() => void loadFeed()}
          >
            Retry
          </Text>
        </View>
      ) : null}
      <FeedGrid
        posts={posts}
        refreshing={refreshing}
        onRefresh={() => void loadFeed(true)}
        onPressPost={(postId) =>
          router.push(`/post/${postId}` as Href)
        }
        emptyComponent={
          <FeedEmptyState
            tagDisplayName={selectedTagDisplayName}
            onClearFilter={
              selectedTagSlug ? () => handleSelectTag(undefined) : undefined
            }
          />
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
