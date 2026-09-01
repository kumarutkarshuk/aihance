import { Image } from "expo-image";
import { FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import type { PostSummary } from "@/lib/feed-api";

interface FeedGridProps {
  posts: PostSummary[];
  refreshing: boolean;
  onRefresh: () => void;
  onPressPost: (postId: string) => void;
}

const NUM_COLUMNS = 2;

export function FeedGrid({
  posts,
  refreshing,
  onRefresh,
  onPressPost,
}: FeedGridProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  row: {
    gap: GAP,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});
