import { Image } from "expo-image";
import type { ReactElement } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";
import type { PostSummary } from "@/lib/feed-api";
import { colors } from "@/lib/theme";

interface FeedGridProps {
  posts: PostSummary[];
  refreshing: boolean;
  onRefresh: () => void;
  onPressPost: (postId: string) => void;
  emptyComponent?: ReactElement;
}

const NUM_COLUMNS = 2;

export function FeedGrid({
  posts,
  refreshing,
  onRefresh,
  onPressPost,
  emptyComponent,
}: FeedGridProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={[
        styles.listContent,
        posts.length === 0 && styles.listContentEmpty,
      ]}
      columnWrapperStyle={posts.length > 0 ? styles.row : undefined}
      ListEmptyComponent={emptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.foreground}
          colors={[colors.foreground]}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.cell}
          onPress={() => onPressPost(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Open post ${item.id}`}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        </Pressable>
      )}
    />
  );
}

const GAP = 8;

const styles = StyleSheet.create({
  listContent: {
    padding: GAP,
    gap: GAP,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  row: {
    gap: GAP,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.placeholder,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});
