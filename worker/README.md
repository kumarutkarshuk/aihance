# AIhance Feed API

Cloudflare Worker that serves Post metadata from D1 and images from R2.

## Local development

```bash
bun install
bun run db:migrate
bun run dev          # http://localhost:8787
bun run test
```

From the repo root:

```bash
bun run api:seed   # apply migrations and seed curated tags
bun run api:dev    # start the Worker
```

## Endpoints

- `GET /tags` — curated Tag list
- `GET /posts` — Post summaries for the Feed
- `GET /posts/:id` — Post detail
- `GET /images/:key` — image proxy from R2
- `POST /posts` — create a Post (multipart form upload)

## Create a Post

```bash
curl -X POST http://localhost:8787/posts \
  -F "image=@/path/to/style.jpg" \
  -F "prompt=A neon cyberpunk portrait" \
  -F "tagSlugs=cyberpunk" \
  -F "tagSlugs=portrait"
```

Fields:

- `image` — required image file (`jpeg`, `png`, or `webp`)
- `prompt` — optional text
- `tagSlugs` — one or more curated tag slugs (repeat the field or comma-separate)

If `ADMIN_TOKEN` is set in Wrangler, send:

```bash
-H "Authorization: Bearer $ADMIN_TOKEN"
```

For local dev, leave `ADMIN_TOKEN` unset to allow unauthenticated uploads.

## Mobile app config

Set `EXPO_PUBLIC_FEED_API_URL` to override the Worker URL in dev.

The app auto-detects the right host:
- Android emulator → `http://10.0.2.2:8787`
- iOS simulator / physical device → your Mac's LAN IP from Expo

On Android emulator use `http://10.0.2.2:8787`.
