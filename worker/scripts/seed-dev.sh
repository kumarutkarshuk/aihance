#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Applying D1 migrations..."
bunx wrangler d1 migrations apply aihance --local

echo "Seeding curated tags..."
bun run scripts/generate-seed-sql.ts
bunx wrangler d1 execute aihance --local --file=seed/seed.sql

echo "Dev setup complete."
echo "Start the API (bun run dev), then seed launch Posts:"
echo "  bun run seed:posts -- --offline"
