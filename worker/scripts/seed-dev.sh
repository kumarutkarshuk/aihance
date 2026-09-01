#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Applying D1 migrations..."
bunx wrangler d1 migrations apply aihance --local

echo "Seeding D1..."
bunx wrangler d1 execute aihance --local --file=seed/seed.sql

echo "Uploading placeholder images to local R2..."
for key in post-001 post-002 post-003 post-004 post-005 post-006; do
  bunx wrangler r2 object put "aihance-images/${key}.jpg" \
    --file=seed/placeholder.jpg \
    --content-type=image/jpeg \
    --local
done

echo "Dev seed complete."
