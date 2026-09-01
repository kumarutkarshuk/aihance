export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  ADMIN_TOKEN?: string;
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

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.ADMIN_TOKEN) {
    return true;
  }

  const authorization = request.headers.get("Authorization");
  return authorization === `Bearer ${env.ADMIN_TOKEN}`;
}

function parseTagSlugs(formData: FormData): string[] {
  const tagSlugs = formData
    .getAll("tagSlugs")
    .flatMap((value) => {
      if (typeof value !== "string") {
        return [];
      }

      return value
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean);
    });

  return [...new Set(tagSlugs)];
}

function imageExtension(contentType: string, filename: string): string | null {
  const fromType = IMAGE_EXTENSIONS[contentType.toLowerCase()];
  if (fromType) {
    return fromType;
  }

  const match = filename.toLowerCase().match(/\.(jpe?g|png|webp)$/);
  if (!match) {
    return null;
  }

  if (match[1] === "jpeg" || match[1] === "jpg") {
    return "jpg";
  }

  return match[1];
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

async function listPosts(
  baseUrl: string,
  env: Env,
  tagSlug?: string,
): Promise<PostSummary[]> {
  let results: Pick<PostRow, "id" | "image_key" | "created_at">[] | undefined;

  if (tagSlug) {
    const filtered = await env.DB.prepare(
      `SELECT p.id, p.image_key, p.created_at
       FROM posts p
       INNER JOIN post_tags pt ON pt.post_id = p.id AND pt.tag_slug = ?1
       ORDER BY p.created_at DESC`,
    )
      .bind(tagSlug)
      .all<Pick<PostRow, "id" | "image_key" | "created_at">>();
    results = filtered.results ?? [];
  } else {
    const all = await env.DB.prepare(
      "SELECT id, image_key, created_at FROM posts ORDER BY created_at DESC",
    ).all<Pick<PostRow, "id" | "image_key" | "created_at">>();
    results = all.results ?? [];
  }

  const posts = results;
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

async function validateTagSlugs(
  db: D1Database,
  tagSlugs: string[],
): Promise<string | null> {
  if (tagSlugs.length === 0) {
    return "At least one tag slug is required";
  }

  const placeholders = tagSlugs.map((_, index) => `?${index + 1}`).join(", ");
  const { results } = await db
    .prepare(`SELECT slug FROM tags WHERE slug IN (${placeholders})`)
    .bind(...tagSlugs)
    .all<{ slug: string }>();

  const knownSlugs = new Set((results ?? []).map((row) => row.slug));
  const unknownSlugs = tagSlugs.filter((slug) => !knownSlugs.has(slug));

  if (unknownSlugs.length > 0) {
    return `Unknown tag slugs: ${unknownSlugs.join(", ")}`;
  }

  return null;
}

async function createPost(
  baseUrl: string,
  env: Env,
  request: Request,
): Promise<Response> {
  const formData = await request.formData();
  const imageField = formData.get("image");
  const promptField = formData.get("prompt");
  const tagSlugs = parseTagSlugs(formData);

  if (!(imageField instanceof File)) {
    return errorResponse("Image file is required", 400);
  }

  if (!imageField.type.startsWith("image/")) {
    return errorResponse("Image must be an image file", 400);
  }

  const extension = imageExtension(imageField.type, imageField.name);
  if (!extension) {
    return errorResponse("Unsupported image type", 400);
  }

  const tagError = await validateTagSlugs(env.DB, tagSlugs);
  if (tagError) {
    return errorResponse(tagError, 400);
  }

  const prompt =
    typeof promptField === "string" && promptField.trim().length > 0
      ? promptField.trim()
      : null;
  const postId = crypto.randomUUID();
  const imageKey = `${postId}.${extension}`;
  const createdAt = new Date().toISOString();

  await env.IMAGES.put(imageKey, imageField.stream(), {
    httpMetadata: {
      contentType: imageField.type,
    },
  });

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO posts (id, image_key, prompt, created_at) VALUES (?1, ?2, ?3, ?4)",
    ).bind(postId, imageKey, prompt, createdAt),
    ...tagSlugs.map((tagSlug) =>
      env.DB.prepare(
        "INSERT INTO post_tags (post_id, tag_slug) VALUES (?1, ?2)",
      ).bind(postId, tagSlug),
    ),
  ]);

  const post = await getPost(baseUrl, env, postId);
  if (!post) {
    return errorResponse("Failed to create post", 500);
  }

  return jsonResponse(post, 201);
}

async function reportPost(
  env: Env,
  id: string,
): Promise<{ reportCount: number } | null> {
  const updated = await env.DB.prepare(
    "UPDATE posts SET report_count = report_count + 1 WHERE id = ?1 RETURNING report_count",
  )
    .bind(id)
    .first<{ report_count: number }>();

  if (!updated) {
    return null;
  }

  return { reportCount: updated.report_count };
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
        const tagSlug = url.searchParams.get("tag")?.trim() || undefined;
        const posts = await listPosts(baseUrl, env, tagSlug);
        return jsonResponse(posts, 200, corsHeaders);
      }

      if (request.method === "POST" && pathname === "/posts") {
        if (!isAuthorized(request, env)) {
          return errorResponse("Unauthorized", 401, corsHeaders);
        }

        const response = await createPost(baseUrl, env, request);
        for (const [key, value] of Object.entries(corsHeaders)) {
          response.headers.set(key, value);
        }
        return response;
      }

      const reportMatch = pathname.match(/^\/posts\/([^/]+)\/report$/);
      if (request.method === "POST" && reportMatch) {
        const reported = await reportPost(
          env,
          decodeURIComponent(reportMatch[1]),
        );
        if (!reported) {
          return errorResponse("Post not found", 404, corsHeaders);
        }
        return jsonResponse(reported, 200, corsHeaders);
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
