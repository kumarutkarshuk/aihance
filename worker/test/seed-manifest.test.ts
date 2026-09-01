import { describe, expect, it } from "vitest";
import launchManifest from "../seed/posts.json";
import { CURATED_TAG_SLUGS, MIN_LAUNCH_POST_COUNT } from "../seed/curated-tags";
import {
  validateSeedManifest,
  type SeedManifest,
  type SeedPostEntry,
} from "../seed/validate-manifest";

function makePost(
  tagSlugs: string[],
  prompt: string | null,
  imageSeed: string,
): SeedPostEntry {
  return { tagSlugs, prompt, imageSeed };
}

describe("launch seed manifest", () => {
  it("passes validation for the checked-in launch dataset", () => {
    const result = validateSeedManifest(launchManifest as SeedManifest);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});

describe("validateSeedManifest", () => {
  it("accepts a valid manifest", () => {
    const posts: SeedPostEntry[] = CURATED_TAG_SLUGS.flatMap((tagSlug, index) =>
      Array.from({ length: 4 }, (_, slot) =>
        makePost(
          [tagSlug],
          slot === 3 ? null : `Prompt for ${tagSlug} ${slot + 1}`,
          `${tagSlug}-${slot + 1}`,
        ),
      ),
    );

    const result = validateSeedManifest({ posts });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects manifests below the launch minimum", () => {
    const result = validateSeedManifest({
      posts: [makePost(["anime"], "Anime prompt", "anime-1")],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("at least"))).toBe(
      true,
    );
  });

  it("rejects unknown tag slugs", () => {
    const posts = CURATED_TAG_SLUGS.flatMap((tagSlug, index) =>
      Array.from({ length: 4 }, (_, slot) =>
        makePost(
          [tagSlug],
          `Prompt ${index}-${slot}`,
          `${tagSlug}-${slot}`,
        ),
      ),
    );
    posts[0] = makePost(["not-a-tag"], "Bad tag", "bad-1");

    const result = validateSeedManifest({ posts });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("unknown tag"))).toBe(
      true,
    );
  });

  it("rejects manifests that omit a curated tag", () => {
    const posts = CURATED_TAG_SLUGS.filter((slug) => slug !== "abstract")
      .flatMap((tagSlug) =>
        Array.from({ length: 4 }, (_, slot) =>
          makePost([tagSlug], `Prompt for ${tagSlug}`, `${tagSlug}-${slot}`),
        ),
      );

    const result = validateSeedManifest({ posts });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('"abstract"'))).toBe(
      true,
    );
  });
});
