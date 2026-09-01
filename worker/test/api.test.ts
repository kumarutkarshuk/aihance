import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it, beforeEach } from "vitest";
import worker from "../src/index";

const TEST_BASE_URL = "http://example.com";

async function request(path: string, init?: RequestInit) {
  const request = new Request(`${TEST_BASE_URL}${path}`, init);
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

async function applySchema() {
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, image_key TEXT NOT NULL, prompt TEXT, created_at TEXT NOT NULL, report_count INTEGER NOT NULL DEFAULT 0)",
  );
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS tags (slug TEXT PRIMARY KEY, display_name TEXT NOT NULL)",
  );
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS post_tags (post_id TEXT NOT NULL, tag_slug TEXT NOT NULL, PRIMARY KEY (post_id, tag_slug))",
  );
}

async function seedFixtures() {
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO tags (slug, display_name) VALUES (?1, ?2)",
    ).bind("anime", "Anime"),
    env.DB.prepare(
      "INSERT INTO tags (slug, display_name) VALUES (?1, ?2)",
    ).bind("watercolor", "Watercolor"),
    env.DB.prepare(
      "INSERT INTO posts (id, image_key, prompt, created_at) VALUES (?1, ?2, ?3, ?4)",
    ).bind(
      "post-001",
      "post-001.jpg",
      "Soft anime portrait",
      "2026-01-15T10:00:00.000Z",
    ),
    env.DB.prepare(
      "INSERT INTO posts (id, image_key, prompt, created_at) VALUES (?1, ?2, ?3, ?4)",
    ).bind("post-002", "post-002.jpg", null, "2026-01-14T10:00:00.000Z"),
    env.DB.prepare(
      "INSERT INTO post_tags (post_id, tag_slug) VALUES (?1, ?2)",
    ).bind("post-001", "anime"),
    env.DB.prepare(
      "INSERT INTO post_tags (post_id, tag_slug) VALUES (?1, ?2)",
    ).bind("post-002", "watercolor"),
  ]);
}

beforeEach(async () => {
  await env.DB.exec("DROP TABLE IF EXISTS post_tags");
  await env.DB.exec("DROP TABLE IF EXISTS posts");
  await env.DB.exec("DROP TABLE IF EXISTS tags");
  await applySchema();
  await seedFixtures();
});

describe("GET /tags", () => {
  it("returns curated tags with slug and display name", async () => {
    const response = await request("/tags");
    expect(response.status).toBe(200);

    const body = (await response.json()) as Array<{
      slug: string;
      displayName: string;
    }>;

    expect(body).toEqual([
      { slug: "anime", displayName: "Anime" },
      { slug: "watercolor", displayName: "Watercolor" },
    ]);
  });
});

describe("GET /posts", () => {
  it("returns post summaries without prompt", async () => {
    const response = await request("/posts");
    expect(response.status).toBe(200);

    const body = (await response.json()) as Array<Record<string, unknown>>;

    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      id: "post-001",
      imageUrl: `${TEST_BASE_URL}/images/post-001.jpg`,
      tagSlugs: ["anime"],
      createdAt: "2026-01-15T10:00:00.000Z",
    });
    expect(body[0]).not.toHaveProperty("prompt");
    expect(body[1]).toMatchObject({
      id: "post-002",
      tagSlugs: ["watercolor"],
    });
  });
});

describe("GET /posts/:id", () => {
  it("returns post detail with prompt when present", async () => {
    const response = await request("/posts/post-001");
    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;

    expect(body).toEqual({
      id: "post-001",
      imageUrl: `${TEST_BASE_URL}/images/post-001.jpg`,
      prompt: "Soft anime portrait",
      tagSlugs: ["anime"],
      createdAt: "2026-01-15T10:00:00.000Z",
    });
  });

  it("returns post detail with null prompt when absent", async () => {
    const response = await request("/posts/post-002");
    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.prompt).toBeNull();
  });

  it("returns 404 for unknown post", async () => {
    const response = await request("/posts/missing");
    expect(response.status).toBe(404);
  });
});

describe("GET /images/:key", () => {
  it("returns image bytes from R2", async () => {
    const imageBytes = new Uint8Array([137, 80, 78, 71]);
    await env.IMAGES.put("post-001.jpg", imageBytes, {
      httpMetadata: { contentType: "image/jpeg" },
    });

    const response = await request("/images/post-001.jpg");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");

    const body = new Uint8Array(await response.arrayBuffer());
    expect(body).toEqual(imageBytes);
  });

  it("returns 404 when image is missing", async () => {
    const response = await request("/images/missing.jpg");
    expect(response.status).toBe(404);
  });
});
