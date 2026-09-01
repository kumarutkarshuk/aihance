# AIhance Feed API

Cloudflare Worker that serves Post metadata from D1 and images from R2.

## Local development

```bash
bun install
bun run db:migrate   # or: bun run api:seed from repo root (migrate + seed + images)
bun run dev          # http://localhost:8787
bun run test
```

From the repo root:

```bash
bun run api:seed   # apply migrations, seed D1, upload placeholder images
bun run api:dev    # start the Worker
```

## Endpoints

- `GET /tags` — curated Tag list
- `GET /posts` — Post summaries for the Feed
- `GET /posts/:id` — Post detail
- `GET /images/:key` — image proxy from R2

## Mobile app config

Set `EXPO_PUBLIC_FEED_API_URL` to the Worker URL. Defaults to `http://localhost:8787`.

On Android emulator use `http://10.0.2.2:8787`.
