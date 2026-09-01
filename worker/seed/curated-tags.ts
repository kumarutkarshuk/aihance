export const CURATED_TAGS = [
  { slug: "anime", displayName: "Anime" },
  { slug: "watercolor", displayName: "Watercolor" },
  { slug: "cinematic", displayName: "Cinematic" },
  { slug: "portrait", displayName: "Portrait" },
  { slug: "landscape", displayName: "Landscape" },
  { slug: "cyberpunk", displayName: "Cyberpunk" },
  { slug: "vintage", displayName: "Vintage" },
  { slug: "minimalist", displayName: "Minimalist" },
  { slug: "fantasy", displayName: "Fantasy" },
  { slug: "sketch", displayName: "Sketch" },
  { slug: "3d-render", displayName: "3D Render" },
  { slug: "neon", displayName: "Neon" },
  { slug: "film-noir", displayName: "Film Noir" },
  { slug: "pop-art", displayName: "Pop Art" },
  { slug: "abstract", displayName: "Abstract" },
] as const;

export const CURATED_TAG_SLUGS = CURATED_TAGS.map((tag) => tag.slug);

export const MIN_LAUNCH_POST_COUNT = 50;
