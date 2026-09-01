#!/usr/bin/env bun

import launchManifest from "../seed/posts.json";
import { MIN_LAUNCH_POST_COUNT } from "../seed/curated-tags";
import { loadSeedImage } from "../seed/seed-image";
import {
  validateSeedManifest,
  type SeedManifest,
  type SeedPostEntry,
} from "../seed/validate-manifest";

interface SeedOptions {
  apiUrl: string;
  token?: string;
  force: boolean;
  dryRun: boolean;
  offline: boolean;
  imagesDir?: string;
}

interface AdminPostRow {
  id: string;
}

function parseArgs(argv: string[]): SeedOptions {
  const options: SeedOptions = {
    apiUrl: process.env.FEED_API_URL ?? "http://127.0.0.1:8787",
    token: process.env.ADMIN_TOKEN,
    force: false,
    dryRun: false,
    offline: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--offline") {
      options.offline = true;
      continue;
    }
    if (arg === "--api-url") {
      options.apiUrl = argv[index + 1] ?? options.apiUrl;
      index += 1;
      continue;
    }
    if (arg === "--token") {
      options.token = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--images-dir") {
      options.imagesDir = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: bun run scripts/seed-posts.ts [options]

Uploads the launch seed dataset from seed/posts.json via POST /posts.

Options:
  --api-url <url>      Feed API base URL (default: http://127.0.0.1:8787)
  --token <token>      Admin Bearer token (default: ADMIN_TOKEN env var)
  --images-dir <path>  Use local image files named <imageSeed>.jpg/png/webp
  --offline            Use generated placeholder JPEGs (no network)
  --force              Delete existing posts before seeding
  --dry-run            Validate manifest and print actions only
  --help               Show this help

Environment:
  FEED_API_URL         Default API URL
  ADMIN_TOKEN          Bearer token when auth is enabled
`);
}

async function apiFetch(
  options: SeedOptions,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  return fetch(`${options.apiUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
  });
}

async function listPosts(options: SeedOptions): Promise<AdminPostRow[]> {
  const response = await apiFetch(options, "/posts?admin=1");
  if (response.status === 401) {
    throw new Error(
      "Unauthorized. Set ADMIN_TOKEN or pass --token when admin auth is enabled.",
    );
  }
  if (!response.ok) {
    throw new Error(`Failed to list posts: ${response.status}`);
  }

  return (await response.json()) as AdminPostRow[];
}

async function deleteAllPosts(
  options: SeedOptions,
  posts: AdminPostRow[],
): Promise<void> {
  for (const post of posts) {
    const response = await apiFetch(options, `/posts/${encodeURIComponent(post.id)}`, {
      method: "DELETE",
    });
    if (response.status !== 204) {
      throw new Error(`Failed to delete post ${post.id}: ${response.status}`);
    }
  }
}

async function createPost(
  options: SeedOptions,
  entry: SeedPostEntry,
): Promise<void> {
  const image = await loadSeedImage(entry.imageSeed, {
    imagesDir: options.imagesDir,
    offline: options.offline,
  });

  const formData = new FormData();
  formData.append(
    "image",
    new Blob([image.bytes], { type: image.contentType }),
    image.filename,
  );
  if (entry.prompt) {
    formData.append("prompt", entry.prompt);
  }
  for (const tagSlug of entry.tagSlugs) {
    formData.append("tagSlugs", tagSlug);
  }

  const response = await apiFetch(options, "/posts", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to create ${entry.imageSeed}: ${response.status} ${body}`,
    );
  }
}

export async function seedPosts(
  manifest: SeedManifest,
  options: SeedOptions,
): Promise<{ created: number; skipped: boolean }> {
  const validation = validateSeedManifest(manifest);
  if (!validation.valid) {
    throw new Error(`Invalid seed manifest:\n- ${validation.errors.join("\n- ")}`);
  }

  if (options.dryRun) {
    console.log(
      `Dry run: would upload ${manifest.posts.length} posts to ${options.apiUrl}`,
    );
    return { created: 0, skipped: true };
  }

  const existing = await listPosts(options);
  if (existing.length >= MIN_LAUNCH_POST_COUNT && !options.force) {
    console.log(
      `Skipping seed: ${existing.length} posts already exist (use --force to replace).`,
    );
    return { created: 0, skipped: true };
  }

  if (existing.length > 0) {
    console.log(`Removing ${existing.length} existing posts...`);
    await deleteAllPosts(options, existing);
  }

  let created = 0;
  for (const [index, entry] of manifest.posts.entries()) {
    await createPost(options, entry);
    created += 1;
    if ((index + 1) % 10 === 0 || index + 1 === manifest.posts.length) {
      console.log(`Uploaded ${index + 1}/${manifest.posts.length} posts`);
    }
  }

  return { created, skipped: false };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await seedPosts(launchManifest as SeedManifest, options);

  if (!result.skipped) {
    console.log(`Seed complete: ${result.created} posts created.`);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
