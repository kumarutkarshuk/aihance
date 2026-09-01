import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { FeedErrorState } from "@/components/feed-states";
import { fetchPost, fetchTags, type PostDetail, type Tag } from "@/lib/feed-api";

function formatPublishedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tagLabels = useMemo(() => {
    const bySlug = new Map(tags.map((tag) => [tag.slug, tag.displayName]));
    return (post?.tagSlugs ?? []).map((slug) => ({
      slug,
      label: bySlug.get(slug) ?? slug.replace(/-/g, " "),
    }));
  }, [post?.tagSlugs, tags]);

  const loadPost = useCallback(async () => {
    if (!id) {
      setError("Post not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextPost, nextTags] = await Promise.all([
        fetchPost(id),
        fetchTags(),
      ]);
      setPost(nextPost);
      setTags(nextTags);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Something went wrong";
      setError(message);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <FeedErrorState
        title="Could not load Post"
        message={error ?? "Post not found"}
        onRetry={loadPost}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Image
        source={{ uri: post.imageUrl }}
        style={styles.image}
        contentFit="contain"
        transition={200}
      />

      <View style={styles.meta}>
        <Text style={styles.date}>{formatPublishedDate(post.createdAt)}</Text>

        {tagLabels.length > 0 ? (
          <View style={styles.tagRow}>
            {tagLabels.map(({ slug, label }) => (
              <Pressable
                key={slug}
                style={styles.tagChip}
                onPress={() =>
                  router.navigate({ pathname: "/", params: { tag: slug } })
                }
                accessibilityRole="button"
                accessibilityLabel={`Filter Feed by ${label}`}
              >
                <Text style={styles.tagText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {post.prompt ? (
          <View style={styles.promptSection}>
            <Text style={styles.sectionLabel}>Prompt</Text>
            <Text style={styles.prompt}>{post.prompt}</Text>
          </View>
        ) : (
          <Text style={styles.noPrompt}>No prompt for this Post.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingBottom: 32,
  },
  image: {
    width: "100%",
    minHeight: 280,
    backgroundColor: "#eee",
  },
  meta: {
    padding: 16,
    gap: 16,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  promptSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  prompt: {
    fontSize: 16,
    lineHeight: 24,
    color: "#222",
  },
  noPrompt: {
    fontSize: 15,
    color: "#777",
    fontStyle: "italic",
  },
});
