CREATE TABLE IF NOT EXISTS reports (
  post_id TEXT NOT NULL REFERENCES posts(id),
  reporter_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (post_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_post_id ON reports(post_id);
