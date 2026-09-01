import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it, beforeEach } from "vitest";
import worker from "../src/index";

const TEST_BASE_URL = "http://example.com";
const TEST_ADMIN_TOKEN = "test-admin-token";
const TEST_ADMIN_PASSWORD = "secret-password";

type TestEnv = typeof env & {
  ADMIN_TOKEN?: string;
  ADMIN_PASSWORD?: string;
};

function authEnv(): TestEnv {
  return { ...env, ADMIN_TOKEN: TEST_ADMIN_TOKEN, ADMIN_PASSWORD: TEST_ADMIN_PASSWORD };
}

function publicEnv(): TestEnv {
  return { ...env, ADMIN_TOKEN: undefined, ADMIN_PASSWORD: undefined };
}

async function request(
  path: string,
  init?: RequestInit,
  testEnv: TestEnv = env,
) {
  const request = new Request(`${TEST_BASE_URL}${path}`, init);
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, testEnv, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

function bearerHeaders(token = TEST_ADMIN_TOKEN): HeadersInit {
  return { Authorization: `Bearer ${token}` };
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
  await env.DB.exec(
    "CREATE TABLE IF NOT EXISTS reports (post_id TEXT NOT NULL, reporter_id TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (post_id, reporter_id))",
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

  it("returns only posts tagged with the requested tag slug", async () => {
    const response = await request("/posts?tag=anime");
    expect(response.status).toBe(200);

    const body = (await response.json()) as Array<{ id: string; tagSlugs: string[] }>;

    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      id: "post-001",
      tagSlugs: ["anime"],
    });
  });

  it("returns an empty list for an unknown tag slug", async () => {
    const response = await request("/posts?tag=not-a-tag");
    expect(response.status).toBe(200);

    const body = (await response.json()) as unknown[];
    expect(body).toEqual([]);
  });

  it("returns an empty list when no posts match the tag", async () => {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM post_tags WHERE post_id = ?1").bind("post-001"),
    ]);

    const response = await request("/posts?tag=anime");
    expect(response.status).toBe(200);

    const body = (await response.json()) as unknown[];
    expect(body).toEqual([]);
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

describe("POST /posts", () => {
  it("creates a post with image, prompt, and tags", async () => {
    const imageBytes = new Uint8Array([255, 216, 255, 217]);
    const formData = new FormData();
    formData.append(
      "image",
      new File([imageBytes], "style.jpg", { type: "image/jpeg" }),
    );
    formData.append("prompt", "Neon cityscape at night");
    formData.append("tagSlugs", "anime");
    formData.append("tagSlugs", "watercolor");

    const response = await request("/posts", {
      method: "POST",
      body: formData,
    }, publicEnv());

    expect(response.status).toBe(201);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.prompt).toBe("Neon cityscape at night");
    expect(body.tagSlugs).toEqual(["anime", "watercolor"]);
    expect(typeof body.id).toBe("string");
    expect(typeof body.imageUrl).toBe("string");
    expect(typeof body.createdAt).toBe("string");

    const listResponse = await request("/posts");
    const posts = (await listResponse.json()) as Array<{ id: string }>;
    expect(posts.some((post) => post.id === body.id)).toBe(true);

    const imageKey = decodeURIComponent(
      (body.imageUrl as string).split("/images/")[1],
    );
    const imageResponse = await request(`/images/${imageKey}`);
    expect(imageResponse.status).toBe(200);
    expect(new Uint8Array(await imageResponse.arrayBuffer())).toEqual(imageBytes);
  });

  it("creates a post without a prompt", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new File([new Uint8Array([255, 216, 255, 217])], "style.jpg", {
        type: "image/jpeg",
      }),
    );
    formData.append("tagSlugs", "watercolor");

    const response = await request("/posts", {
      method: "POST",
      body: formData,
    }, publicEnv());

    expect(response.status).toBe(201);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.prompt).toBeNull();
  });

  it("rejects requests without an image", async () => {
    const formData = new FormData();
    formData.append("tagSlugs", "anime");

    const response = await request("/posts", {
      method: "POST",
      body: formData,
    }, publicEnv());

    expect(response.status).toBe(400);
  });

  it("rejects unknown tag slugs", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new File([new Uint8Array([255, 216, 255, 217])], "style.jpg", {
        type: "image/jpeg",
      }),
    );
    formData.append("tagSlugs", "not-a-tag");

    const response = await request("/posts", {
      method: "POST",
      body: formData,
    }, publicEnv());

    expect(response.status).toBe(400);
  });
});

describe("POST /posts/:id/report", () => {
  it("increments the post report count", async () => {
    const first = await request("/posts/post-001/report", { method: "POST" });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ reportCount: 1, alreadyReported: false });

    const second = await request("/posts/post-001/report", { method: "POST" });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ reportCount: 2, alreadyReported: false });
  });

  it("does not increment again for the same reporter id", async () => {
    const headers = { "X-Reporter-Id": "device-abc" };

    const first = await request("/posts/post-001/report", {
      method: "POST",
      headers,
    });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ reportCount: 1, alreadyReported: false });

    const second = await request("/posts/post-001/report", {
      method: "POST",
      headers,
    });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ reportCount: 1, alreadyReported: true });
  });

  it("counts different reporters separately", async () => {
    const first = await request("/posts/post-001/report", {
      method: "POST",
      headers: { "X-Reporter-Id": "device-a" },
    });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ reportCount: 1, alreadyReported: false });

    const second = await request("/posts/post-001/report", {
      method: "POST",
      headers: { "X-Reporter-Id": "device-b" },
    });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ reportCount: 2, alreadyReported: false });
  });

  it("returns 404 for an unknown post", async () => {
    const response = await request("/posts/missing/report", { method: "POST" });
    expect(response.status).toBe(404);
  });

  it("keeps the reported post in the feed", async () => {
    const reportResponse = await request("/posts/post-001/report", {
      method: "POST",
    });
    expect(reportResponse.status).toBe(200);

    const feedResponse = await request("/posts");
    expect(feedResponse.status).toBe(200);

    const posts = (await feedResponse.json()) as Array<{ id: string }>;
    expect(posts.some((post) => post.id === "post-001")).toBe(true);

    const detailResponse = await request("/posts/post-001");
    expect(detailResponse.status).toBe(200);
  });
});

describe("admin auth", () => {
  it("rejects POST /posts without Bearer token when ADMIN_TOKEN is set", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new File([new Uint8Array([255, 216, 255, 217])], "style.jpg", {
        type: "image/jpeg",
      }),
    );
    formData.append("tagSlugs", "anime");

    const response = await request(
      "/posts",
      { method: "POST", body: formData },
      authEnv(),
    );
    expect(response.status).toBe(401);
  });

  it("allows POST /posts with valid Bearer token", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new File([new Uint8Array([255, 216, 255, 217])], "style.jpg", {
        type: "image/jpeg",
      }),
    );
    formData.append("tagSlugs", "anime");

    const response = await request(
      "/posts",
      {
        method: "POST",
        body: formData,
        headers: bearerHeaders(),
      },
      authEnv(),
    );
    expect(response.status).toBe(201);
  });

  it("rejects DELETE /posts/:id without Bearer token", async () => {
    const response = await request(
      "/posts/post-001",
      { method: "DELETE" },
      authEnv(),
    );
    expect(response.status).toBe(401);
  });

  it("rejects GET /posts?admin=1 without Bearer token", async () => {
    const response = await request("/posts?admin=1", undefined, authEnv());
    expect(response.status).toBe(401);
  });
});

describe("POST /admin/login", () => {
  it("returns a token for the correct password", async () => {
    const response = await request(
      "/admin/login",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: TEST_ADMIN_PASSWORD }),
      },
      authEnv(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ token: TEST_ADMIN_TOKEN });
  });

  it("rejects an incorrect password", async () => {
    const response = await request(
      "/admin/login",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "wrong" }),
      },
      authEnv(),
    );

    expect(response.status).toBe(401);
  });
});

describe("GET /posts?admin=1", () => {
  it("returns posts with prompt preview and report count", async () => {
    await env.DB.prepare(
      "UPDATE posts SET report_count = ?1 WHERE id = ?2",
    )
      .bind(3, "post-001")
      .run();

    const response = await request(
      "/posts?admin=1",
      { headers: bearerHeaders() },
      authEnv(),
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as Array<Record<string, unknown>>;
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      id: "post-001",
      prompt: "Soft anime portrait",
      reportCount: 3,
      tagSlugs: ["anime"],
    });
    expect(body[1]).toMatchObject({
      id: "post-002",
      prompt: null,
      reportCount: 0,
    });
  });
});

describe("DELETE /posts/:id", () => {
  it("removes the post from D1 and R2", async () => {
    const imageBytes = new Uint8Array([255, 216, 255, 217]);
    await env.IMAGES.put("post-001.jpg", imageBytes, {
      httpMetadata: { contentType: "image/jpeg" },
    });

    const response = await request(
      "/posts/post-001",
      { method: "DELETE", headers: bearerHeaders() },
      authEnv(),
    );
    expect(response.status).toBe(204);

    const feedResponse = await request("/posts");
    const posts = (await feedResponse.json()) as Array<{ id: string }>;
    expect(posts.some((post) => post.id === "post-001")).toBe(false);

    const detailResponse = await request("/posts/post-001");
    expect(detailResponse.status).toBe(404);

    const imageResponse = await request("/images/post-001.jpg");
    expect(imageResponse.status).toBe(404);
  });

  it("removes the post when it has reports", async () => {
    await request("/posts/post-001/report", {
      method: "POST",
      headers: { "X-Reporter-Id": "device-abc" },
    });

    const response = await request(
      "/posts/post-001",
      { method: "DELETE", headers: bearerHeaders() },
      authEnv(),
    );
    expect(response.status).toBe(204);

    const detailResponse = await request("/posts/post-001");
    expect(detailResponse.status).toBe(404);
  });

  it("returns 404 for an unknown post", async () => {
    const response = await request(
      "/posts/missing",
      { method: "DELETE", headers: bearerHeaders() },
      authEnv(),
    );
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
