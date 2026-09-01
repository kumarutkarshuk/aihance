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
- `GET /posts?admin=1` — admin list with prompt preview and report count (requires auth)
- `GET /posts/:id` — Post detail
- `GET /images/:key` — image proxy from R2
- `POST /posts` — create a Post (multipart form upload)
- `DELETE /posts/:id` — delete a Post and its image
- `POST /admin/login` — password login, returns Bearer token
- `GET /admin` — password-protected admin web page

## Launch seed dataset

The checked-in manifest at `seed/posts.json` defines **64 launch Posts** across all curated Tags. Tests in `test/seed-manifest.test.ts` verify the manifest meets launch criteria (50+ Posts, every Tag covered, mix of prompt and inspiration-only Posts).

### One-time dev setup

```bash
bun run db:migrate
bun run db:seed          # curated Tags only
bun run dev              # in another terminal
bun run seed:posts -- --offline --force
```

From the repo root:

```bash
bun run api:seed         # migrations + tags
bun run api:dev          # start Worker
bun run api:seed:posts -- --offline --force
```

### Seed options

```bash
bun run seed:posts -- [options]
```

- `--offline` — use tiny generated JPEG placeholders (no network). Good for local dev.
- `--images-dir <path>` — use your own files named `<imageSeed>.jpg` (or `.png`/`.webp`) instead of picsum.
- `--force` — delete existing Posts and re-upload the full manifest.
- `--dry-run` — validate the manifest without uploading.
- `--api-url <url>` — default `http://127.0.0.1:8787` (or `FEED_API_URL`).
- `--token <token>` — admin Bearer token when auth is enabled (`ADMIN_TOKEN` env var).

Without `--offline`, the script fetches deterministic images from [picsum.photos](https://picsum.photos) using each entry's `imageSeed`.

### Replace or extend Posts before launch

1. Edit `seed/posts.json` (each entry: `tagSlugs`, optional `prompt`, unique `imageSeed`).
2. Optionally add real images under `seed/images/` as `<imageSeed>.jpg`.
3. Run `bun run test` — manifest validation must pass.
4. Run `bun run seed:posts -- --force --images-dir seed/images` against your deployed Worker.

You can also add Posts one at a time via the admin page at `/admin` (see **Admin** below).

## Admin

Set both secrets in Wrangler (or `.dev.vars` locally):

```
ADMIN_TOKEN=your-bearer-token
ADMIN_PASSWORD=your-login-password
```

Open `http://localhost:8787/admin`, log in with the password, then create or delete Posts.

For local dev without auth, leave `ADMIN_TOKEN` unset to allow unauthenticated uploads.

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

## Delete a Post

```bash
curl -X DELETE http://localhost:8787/posts/<post-id> \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Admin login

```bash
curl -X POST http://localhost:8787/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-login-password"}'
```

## Mobile app config

Set `EXPO_PUBLIC_FEED_API_URL` to override the Worker URL in dev.

The app auto-detects the right host:
- Android emulator → `http://10.0.2.2:8787`
- iOS simulator / physical device → your Mac's LAN IP from Expo

On Android emulator use `http://10.0.2.2:8787`.
