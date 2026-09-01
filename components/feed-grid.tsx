import { Image, type ImageLoadEventData } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState, type ReactElement } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { GlassFrame } from "@/components/ui/glass-frame";
import type { PostSummary } from "@/lib/feed-api";
import {
  DEFAULT_THUMBNAIL_ASPECT_RATIO,
  distributeToColumns,
  estimateCellHeight,
  MASONRY_COLUMN_COUNT,
  MASONRY_GAP,
} from "@/lib/masonry-layout";
import { colors } from "@/lib/theme";

interface FeedGridProps {
  posts: PostSummary[];
  refreshing: boolean;
  onRefresh: () => void;
  onPressPost: (postId: string) => void;
  emptyComponent?: ReactElement;
}

interface MasonryCellProps {
  post: PostSummary;
  columnWidth: number;
  onPressPost: (postId: string) => void;
}

function MasonryCell({ post, columnWidth, onPressPost }: MasonryCellProps) {
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_THUMBNAIL_ASPECT_RATIO);

  const handleLoad = useCallback((event: ImageLoadEventData) => {
    const { width, height } = event.source;
    if (width > 0 && height > 0) {
      setAspectRatio(width / height);
    }
  }, []);

  return (
    <Pressable
      onPress={() => onPressPost(post.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open post ${post.id}`}
    >
      <GlassFrame style={[styles.cell, { width: columnWidth, aspectRatio }]}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={250}
          onLoad={handleLoad}
        />
      </GlassFrame>
    </Pressable>
  );
}

export function FeedGrid({
  posts,
  refreshing,
  onRefresh,
  onPressPost,
  emptyComponent,
}: FeedGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const columnWidth =
    (screenWidth - MASONRY_GAP * (MASONRY_COLUMN_COUNT + 1)) /
    MASONRY_COLUMN_COUNT;

  const columns = useMemo(
    () =>
      distributeToColumns(
        posts,
        MASONRY_COLUMN_COUNT,
        () => estimateCellHeight(columnWidth, DEFAULT_THUMBNAIL_ASPECT_RATIO),
      ),
    [posts, columnWidth],
  );

  if (posts.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.emptyContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.foreground}
              colors={[colors.foreground]}
            />
          }
        >
          {emptyComponent}
        </ScrollView>
        <LinearGradient
          colors={["transparent", colors.background]}
          style={styles.bottomFade}
          pointerEvents="none"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.foreground}
            colors={[colors.foreground]}
          />
        }
      >
        <View style={styles.row}>
          {columns.map((column, columnIndex) => (
            <View key={`column-${columnIndex}`} style={styles.column}>
              {column.map((post) => (
                <MasonryCell
                  key={post.id}
                  post={post}
                  columnWidth={columnWidth}
                  onPressPost={onPressPost}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <LinearGradient
        colors={["transparent", colors.background]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const BOTTOM_FADE_HEIGHT = 150;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: MASONRY_GAP,
    paddingBottom: MASONRY_GAP + BOTTOM_FADE_HEIGHT / 2,
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: BOTTOM_FADE_HEIGHT / 2,
  },
  row: {
    flexDirection: "row",
    gap: MASONRY_GAP,
  },
  column: {
    flex: 1,
    gap: MASONRY_GAP,
  },
  cell: {
    width: "100%",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_FADE_HEIGHT,
  },
});
