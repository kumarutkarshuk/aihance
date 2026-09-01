export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
}

export interface TagRow {
  slug: string;
  display_name: string;
}

export interface PostRow {
  id: string;
  image_key: string;
  prompt: string | null;
  created_at: string;
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

function imageUrl(baseUrl: string, imageKey: string): string {
  return `${baseUrl.replace(/\/$/, "")}/images/${encodeURIComponent(imageKey)}`;
}

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  const headers = new Headers({
    "content-type": "application/json",
    ...extraHeaders,
  });
  return Response.json(data, { status, headers });
}

function errorResponse(
  message: string,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return jsonResponse({ error: message }, status, extraHeaders);
}

async function getTagSlugsForPosts(
  db: D1Database,
  postIds: string[],
): Promise<Map<string, string[]>> {
  const tagMap = new Map<string, string[]>();
  for (const postId of postIds) {
    tagMap.set(postId, []);
  }

  if (postIds.length === 0) {
    return tagMap;
  }

  const placeholders = postIds.map((_, index) => `?${index + 1}`).join(", ");
  const { results } = await db
    .prepare(
      `SELECT post_id, tag_slug FROM post_tags WHERE post_id IN (${placeholders}) ORDER BY tag_slug ASC`,
    )
    .bind(...postIds)
    .all<{ post_id: string; tag_slug: string }>();

  for (const row of results ?? []) {
    const tags = tagMap.get(row.post_id) ?? [];
    tags.push(row.tag_slug);
    tagMap.set(row.post_id, tags);
  }

  return tagMap;
}

async function listTags(db: D1Database) {
  const { results } = await db
    .prepare("SELECT slug, display_name FROM tags ORDER BY display_name ASC")
    .all<TagRow>();

  return (results ?? []).map((tag) => ({
    slug: tag.slug,
    displayName: tag.display_name,
  }));
}

async function listPosts(baseUrl: string, env: Env): Promise<PostSummary[]> {
  const { results } = await env.DB.prepare(
    "SELECT id, image_key, created_at FROM posts ORDER BY created_at DESC",
  ).all<Pick<PostRow, "id" | "image_key" | "created_at">>();

  const posts = results ?? [];
  const tagMap = await getTagSlugsForPosts(
    env.DB,
    posts.map((post) => post.id),
  );

  return posts.map((post) => ({
    id: post.id,
    imageUrl: imageUrl(baseUrl, post.image_key),
    tagSlugs: tagMap.get(post.id) ?? [],
    createdAt: post.created_at,
  }));
}

async function getPost(
  baseUrl: string,
  env: Env,
  id: string,
): Promise<PostDetail | null> {
  const post = await env.DB.prepare(
    "SELECT id, image_key, prompt, created_at FROM posts WHERE id = ?1",
  )
    .bind(id)
    .first<PostRow>();

  if (!post) {
    return null;
  }

  const tagMap = await getTagSlugsForPosts(env.DB, [post.id]);

  return {
    id: post.id,
    imageUrl: imageUrl(baseUrl, post.image_key),
    prompt: post.prompt,
    tagSlugs: tagMap.get(post.id) ?? [],
    createdAt: post.created_at,
  };
}

async function serveImage(env: Env, key: string): Promise<Response> {
  const object = await env.IMAGES.get(key);
  if (!object) {
    return errorResponse("Image not found", 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000");

  return new Response(object.body, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const baseUrl = url.origin;
    const corsHeaders = { "access-control-allow-origin": "*" };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          ...corsHeaders,
          "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
          "access-control-allow-headers": "Content-Type, Authorization",
        },
      });
    }

    try {
      if (request.method === "GET" && pathname === "/tags") {
        const tags = await listTags(env.DB);
        return jsonResponse(tags, 200, corsHeaders);
      }

      if (request.method === "GET" && pathname === "/posts") {
        const posts = await listPosts(baseUrl, env);
        return jsonResponse(posts, 200, corsHeaders);
      }

      const postMatch = pathname.match(/^\/posts\/([^/]+)$/);
      if (request.method === "GET" && postMatch) {
        const post = await getPost(baseUrl, env, decodeURIComponent(postMatch[1]));
        if (!post) {
          return errorResponse("Post not found", 404, corsHeaders);
        }
        return jsonResponse(post, 200, corsHeaders);
      }

      const imageMatch = pathname.match(/^\/images\/(.+)$/);
      if (request.method === "GET" && imageMatch) {
        const response = await serveImage(
          env,
          decodeURIComponent(imageMatch[1]),
        );
        for (const [key, value] of Object.entries(corsHeaders)) {
          response.headers.set(key, value);
        }
        return response;
      }

      return errorResponse("Not found", 404, corsHeaders);
    } catch (error) {
      console.error(error);
      return errorResponse("Internal server error", 500, corsHeaders);
    }
  },
};
