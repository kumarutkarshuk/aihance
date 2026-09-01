import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedErrorState } from "@/components/feed-states";
import { PostActions } from "@/components/post-actions";
import { PostDetailBackButton } from "@/components/post-detail-back-button";
import { PlainBorderPill } from "@/components/ui/plain-border-pill";
import { fetchPost, fetchTags, type PostDetail, type Tag } from "@/lib/feed-api";
import { colors, fonts } from "@/lib/theme";

function formatPublishedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const snapPoints = useMemo(() => ["15%", "50%", "92%"], []);
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
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.foreground} />
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <FeedErrorState
          title="Could not load Post"
          message={error ?? "Post not found"}
          onRetry={loadPost}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <Image
        source={{ uri: post.imageUrl }}
        style={styles.heroImage}
        contentFit="contain"
        transition={200}
      />

      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.date}>{formatPublishedDate(post.createdAt)}</Text>

          {tagLabels.length > 0 ? (
            <View style={styles.tagRow}>
              {tagLabels.map(({ slug, label }) => (
                <PlainBorderPill
                  key={slug}
                  label={label}
                  onPress={() =>
                    router.navigate({ pathname: "/", params: { tag: slug } })
                  }
                  accessibilityLabel={`Filter Feed by ${label}`}
                />
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

          <PostActions
            postId={post.id}
            prompt={post.prompt}
            imageUrl={post.imageUrl}
          />
        </BottomSheetScrollView>
      </BottomSheet>

      <PostDetailBackButton onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  sheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHandle: {
    backgroundColor: colors.muted,
    width: 40,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  promptSection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.foreground,
  },
  prompt: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.foreground,
  },
  noPrompt: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    fontStyle: "italic",
  },
});
