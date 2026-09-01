export const MASONRY_COLUMN_COUNT = 2;
export const MASONRY_GAP = 8;
export const DEFAULT_THUMBNAIL_ASPECT_RATIO = 0.75;

const SKELETON_ASPECT_RATIOS = [0.65, 0.85, 0.72, 0.95, 0.68, 0.8];

export function estimateCellHeight(
  columnWidth: number,
  aspectRatio: number,
): number {
  return columnWidth / aspectRatio;
}

export function distributeToColumns<T>(
  items: T[],
  columnCount: number,
  estimateHeight: (item: T, index: number) => number,
): T[][] {
  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  const heights = Array.from({ length: columnCount }, () => 0);

  items.forEach((item, index) => {
    const shortestColumn = heights.indexOf(Math.min(...heights));
    columns[shortestColumn].push(item);
    heights[shortestColumn] += estimateHeight(item, index);
  });

  return columns;
}

export function skeletonAspectRatio(index: number): number {
  return SKELETON_ASPECT_RATIOS[index % SKELETON_ASPECT_RATIOS.length];
}
