import {
  CURATED_TAG_SLUGS,
  MIN_LAUNCH_POST_COUNT,
} from "./curated-tags";

export interface SeedPostEntry {
  tagSlugs: string[];
  prompt: string | null;
  imageSeed: string;
}

export interface SeedManifest {
  posts: SeedPostEntry[];
}

export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSeedManifest(
  manifest: SeedManifest,
): ManifestValidationResult {
  const errors: string[] = [];
  const curatedSet = new Set<string>(CURATED_TAG_SLUGS);

  if (manifest.posts.length < MIN_LAUNCH_POST_COUNT) {
    errors.push(
      `Expected at least ${MIN_LAUNCH_POST_COUNT} posts, got ${manifest.posts.length}`,
    );
  }

  const coveredTags = new Set<string>();
  let withPrompt = 0;
  let withoutPrompt = 0;
  const imageSeeds = new Set<string>();

  for (const [index, post] of manifest.posts.entries()) {
    if (post.tagSlugs.length === 0) {
      errors.push(`Post ${index + 1} must have at least one tag`);
    }

    for (const tagSlug of post.tagSlugs) {
      if (!curatedSet.has(tagSlug)) {
        errors.push(`Post ${index + 1} uses unknown tag slug: ${tagSlug}`);
      } else {
        coveredTags.add(tagSlug);
      }
    }

    if (post.prompt === null) {
      withoutPrompt += 1;
    } else if (post.prompt.trim().length === 0) {
      errors.push(`Post ${index + 1} has an empty prompt string; use null instead`);
    } else {
      withPrompt += 1;
    }

    if (!post.imageSeed.trim()) {
      errors.push(`Post ${index + 1} must have an imageSeed`);
    } else if (imageSeeds.has(post.imageSeed)) {
      errors.push(`Duplicate imageSeed: ${post.imageSeed}`);
    } else {
      imageSeeds.add(post.imageSeed);
    }
  }

  for (const tagSlug of CURATED_TAG_SLUGS) {
    if (!coveredTags.has(tagSlug)) {
      errors.push(`No posts tagged with "${tagSlug}"`);
    }
  }

  if (withPrompt === 0) {
    errors.push("At least one post must include a prompt");
  }

  if (withoutPrompt === 0) {
    errors.push("At least one inspiration-only post must have no prompt");
  }

  const promptRatio = withPrompt / manifest.posts.length;
  if (manifest.posts.length > 0 && promptRatio < 0.5) {
    errors.push("Most posts should include a prompt (expected at least 50%)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
