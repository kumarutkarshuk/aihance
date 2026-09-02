import { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassFrame } from "@/components/ui/glass-frame";
import { ShimmerBox } from "@/components/ui/shimmer-box";
import {
  distributeToColumns,
  estimateCellHeight,
  MASONRY_COLUMN_COUNT,
  MASONRY_GAP,
  skeletonAspectRatio,
} from "@/lib/masonry-layout";
import { colors } from "@/lib/theme";

const SKELETON_CELL_COUNT = 8;
const BOTTOM_FADE_HEIGHT = 150;

interface FeedSkeletonGridProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function FeedSkeletonGrid({
  refreshing = false,
  onRefresh,
}: FeedSkeletonGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const columnWidth =
    (screenWidth - MASONRY_GAP * (MASONRY_COLUMN_COUNT + 1)) /
    MASONRY_COLUMN_COUNT;

  const columns = useMemo(() => {
    const placeholders = Array.from({ length: SKELETON_CELL_COUNT }, (_, index) => ({
      id: `skeleton-${index}`,
      aspectRatio: skeletonAspectRatio(index),
    }));

    return distributeToColumns(
      placeholders,
      MASONRY_COLUMN_COUNT,
      (item) => estimateCellHeight(columnWidth, item.aspectRatio),
    );
  }, [columnWidth]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.foreground}
              colors={[colors.foreground]}
            />
          ) : undefined
        }
      >
        <View style={styles.row}>
          {columns.map((column, columnIndex) => (
            <View key={`skeleton-column-${columnIndex}`} style={styles.column}>
              {column.map((item) => (
                <GlassFrame
                  key={item.id}
                  style={[styles.cell, { aspectRatio: item.aspectRatio }]}
                >
                  <ShimmerBox style={styles.shimmerFill} />
                </GlassFrame>
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
  shimmerFill: {
    flex: 1,
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
