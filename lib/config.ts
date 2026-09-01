const DEFAULT_FEED_API_URL = "http://localhost:8787";

export function getFeedApiUrl(): string {
  return process.env.EXPO_PUBLIC_FEED_API_URL ?? DEFAULT_FEED_API_URL;
}
