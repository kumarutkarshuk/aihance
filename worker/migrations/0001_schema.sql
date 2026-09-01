CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  image_key TEXT NOT NULL,
  prompt TEXT,
  created_at TEXT NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  slug TEXT PRIMARY KEY,
  display_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id),
  tag_slug TEXT NOT NULL REFERENCES tags(slug),
  PRIMARY KEY (post_id, tag_slug)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_tag_slug ON post_tags(tag_slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
