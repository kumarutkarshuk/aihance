INSERT OR IGNORE INTO tags (slug, display_name) VALUES
  ('anime', 'Anime'),
  ('watercolor', 'Watercolor'),
  ('cinematic', 'Cinematic'),
  ('portrait', 'Portrait'),
  ('landscape', 'Landscape'),
  ('cyberpunk', 'Cyberpunk'),
  ('vintage', 'Vintage'),
  ('minimalist', 'Minimalist'),
  ('fantasy', 'Fantasy'),
  ('sketch', 'Sketch'),
  ('3d-render', '3D Render'),
  ('neon', 'Neon'),
  ('film-noir', 'Film Noir'),
  ('pop-art', 'Pop Art'),
  ('abstract', 'Abstract');

INSERT OR IGNORE INTO posts (id, image_key, prompt, created_at) VALUES
  ('post-001', 'post-001.jpg', 'A serene anime portrait with soft lighting and pastel colors', '2026-01-15T10:00:00.000Z'),
  ('post-002', 'post-002.jpg', NULL, '2026-01-14T10:00:00.000Z'),
  ('post-003', 'post-003.jpg', 'Watercolor landscape of misty mountains at dawn', '2026-01-13T10:00:00.000Z'),
  ('post-004', 'post-004.jpg', 'Cyberpunk city street at night, neon reflections on wet pavement', '2026-01-12T10:00:00.000Z'),
  ('post-005', 'post-005.jpg', 'Minimalist portrait, single subject on white background', '2026-01-11T10:00:00.000Z'),
  ('post-006', 'post-006.jpg', 'Fantasy forest with glowing mushrooms and fireflies', '2026-01-10T10:00:00.000Z');

INSERT OR IGNORE INTO post_tags (post_id, tag_slug) VALUES
  ('post-001', 'anime'),
  ('post-001', 'portrait'),
  ('post-002', 'abstract'),
  ('post-003', 'watercolor'),
  ('post-003', 'landscape'),
  ('post-004', 'cyberpunk'),
  ('post-004', 'neon'),
  ('post-005', 'minimalist'),
  ('post-005', 'portrait'),
  ('post-006', 'fantasy'),
  ('post-006', 'landscape');
