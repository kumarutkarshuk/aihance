import { getFeedApiUrl } from "./config";

export interface Tag {
  slug: string;
  displayName: string;
}

export interface PostSummary {
  id: string;
  imageUrl: string;
  tagSlugs: string[];
  createdAt: string;
}

export interface PostDetail extends PostSummary {
  prompt: string | null;
}

class FeedApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "FeedApiError";
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getFeedApiUrl()}${path}`);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // Response body was not JSON.
    }
    throw new FeedApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function fetchPosts(): Promise<PostSummary[]> {
  return fetchJson<PostSummary[]>("/posts");
}

export async function fetchPost(id: string): Promise<PostDetail> {
  return fetchJson<PostDetail>(`/posts/${encodeURIComponent(id)}`);
}

export async function fetchTags(): Promise<Tag[]> {
  return fetchJson<Tag[]>("/tags");
}

export { FeedApiError };
